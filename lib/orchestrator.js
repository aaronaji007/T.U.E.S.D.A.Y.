'use strict';
/* ==========================================================================
   TUESDAY: Orchestrator
   The agentic pipeline. Both the HTTP endpoint and the benchmark harness use
   this. Two reasoning engines:
     - 'llm'   : real LLM agents with tool calling (Ollama)
     - 'rules' : deterministic fallback / baseline
   Events are emitted live (SSE) so the UI terminal streams in real time.
   ========================================================================== */

const config = require('../config.json');
const store = require('./store');
const llm = require('./llm');
const agents = require('./agents');
const rules = require('./rules_engine');
const tools = require('./tools');

const now = () => new Date().toLocaleTimeString();
const delay = ms => new Promise(r => setTimeout(r, ms));

async function resolveEngine(preferred) {
  if (preferred === 'rules') return { engine: 'rules', probe: null };
  const probe = await llm.checkModel();
  if (probe.ok && probe.present) return { engine: 'llm', probe };
  if (probe.ok && probe.available.length > 0) return { engine: 'llm', probe }; // try anyway; per-stage fallback protects us
  return { engine: 'rules', probe };
}

function emitStream(emit, type, payload) {
  if (emit) emit({ event: type, ...payload });
}

// ============================================================================
// MAIN ENTRY: run a full investigation on a raw SIEM alert
// ============================================================================

async function runInvestigation(rawAlert, opts = {}) {
  const emit = opts.emit || (() => {});
  const t0 = Date.now();
  const { engine, probe } = await resolveEngine(opts.engine);
  const threshold = opts.threshold ?? config.autoApprovalThreshold ?? 80;
  const rulesDelay = engine === 'rules' ? config.rulesDelayMs || 150 : 0;

  store.addAudit('ALERT_INGEST', `[${rawAlert.id || '?'}] ${rawAlert.title} from ${rawAlert.source}`);

  // ---- PHASE 1: coordinator decomposition ------------------------------------
  emitStream(emit, 'log', { agent: 'coordinator', type: 'info', message: `ALERT RECEIVED: "${rawAlert.title}" from [${rawAlert.source}]. Initiating autonomous multi-agent investigation.` });
  emitStream(emit, 'rca', { time: 'T+0.0s', title: 'Alert Ingested by SOC Coordinator', description: `SIEM event "${rawAlert.title}" received from ${rawAlert.source}. Target: ${rawAlert.targetHost}.`, severity: 'info' });

  let decomposition = {};
  if (engine === 'llm') {
    decomposition = await agents.decompose(rawAlert, emit);
  } else {
    emitStream(emit, 'log', { agent: 'coordinator', type: 'info', message: 'TASK DECOMPOSITION: Dispatching 4 parallel sub-tasks → Log Analysis, Threat Intel, Malware Sandbox, Cloud Audit.' });
  }
  await delay(rulesDelay);

  // ---- PHASE 2: parallel investigation agents -------------------------------
  const verdicts = {};
  const llmToolCalls = { count: 0 };

  if (engine === 'llm') {
    await Promise.all(agents.INVESTIGATION_AGENTS.map(async key => {
      // stagger slightly so the terminal reads naturally
      await delay(Math.floor(Math.random() * 120));
      const v = await agents.investigate(key, rawAlert, emit);
      verdicts[key] = v;
      if (v.toolCalls) llmToolCalls.count += v.toolCalls;
      return v;
    }));
  } else {
    for (const key of agents.INVESTIGATION_AGENTS) {
      const v = rules.investigate(key, rawAlert, 0);
      verdicts[key] = v;
      if (emit) {
        v.logEvents.forEach(l => emit({ event: 'log', agent: key, type: l.type, message: l.message }));
      }
      await delay(rulesDelay);
    }
  }

  // ---- emit per-agent evidence centrally (both engines) ------------------------
  for (const key of agents.INVESTIGATION_AGENTS) {
    const v = verdicts[key];
    (v.killChainStages || []).forEach(ks => {
      if (ks && ks.stage) emitStream(emit, 'killchain', { stage: ks.stage, evidence: ks.evidence || 'Detected by investigation agent' });
    });
    (v.ttpsDetected || []).forEach(t => emitStream(emit, 'ttp', { id: String(t).split('.')[0] }));
    (v.rcaEvents || []).forEach(r => emitStream(emit, 'rca', { time: now(), title: r.title, description: r.description, severity: r.severity || 'info' }));
    emitStream(emit, 'log', { agent: key, type: 'info', message: `${agents.AGENTS[key].name} → ${v.summary || 'Verdict rendered.'}` });
  }

  // ---- PHASE 3: consensus + weighted confidence -------------------------------
  const votes = agents.INVESTIGATION_AGENTS.map(key => ({
    agent: agents.AGENTS[key].name,
    key,
    vote: verdicts[key].verdict,
    confidence: verdicts[key].confidence,
    color: agents.AGENTS[key].color,
    weight: store.getWeight(key)
  }));
  const maliciousVotes = votes.filter(v => v.vote === 'MALICIOUS').length;
  const totalVotes = votes.length;
  const consensusPct = Math.round((maliciousVotes / totalVotes) * 100);
  const weightedConfidence = Math.round(
    votes.reduce((s, v) => s + v.confidence * v.weight, 0) / votes.reduce((s, v) => s + v.weight, 0)
  );
  const riskScore = Math.max(weightedConfidence, consensusPct);

  emitStream(emit, 'log', { agent: 'coordinator', type: 'warning', message: `CONSENSUS RESULT: ${maliciousVotes}/${totalVotes} agents voted MALICIOUS (${consensusPct}% agreement). Weighted confidence: ${weightedConfidence}%.` });
  votes.forEach(v => {
    emitStream(emit, 'vote', { agentName: v.agent, vote: v.vote, confidence: v.confidence, color: v.color, key: v.key });
  });
  emitStream(emit, 'rca', { time: now(), title: 'Multi-Agent Consensus Reached', description: `${maliciousVotes}/${totalVotes} agents confirmed malicious intent. Weighted confidence ${weightedConfidence}%.`, severity: 'critical' });
  await delay(rulesDelay);

  // ---- PHASE 4: approval gate ---------------------------------------------------
  const asset = tools.asset_lookup({ target: rawAlert.targetHost }).asset || null;
  const consensus = { maliciousVotes, totalVotes, consensusPct, weightedConfidence };
  let decision;
  if (engine === 'llm') {
    decision = await agents.approve({ alert: rawAlert, riskScore, threshold, consensus, asset }, emit);
  } else {
    decision = rules.approve(rawAlert, riskScore, threshold, consensus);
  }
  emitStream(emit, 'log', { agent: 'approval', type: decision.decision === 'ESCALATE_HUMAN' ? 'warning' : 'info', message: `RISK ASSESSMENT: ${riskScore}/100 vs threshold ${threshold}/100 → ${decision.decision}. ${decision.rationale}` });

  // ---- PHASE 5: incident response ------------------------------------------------
  let responseResult;
  if (decision.decision === 'ESCALATE_HUMAN') {
    responseResult = { status: 'PENDING_APPROVAL', actions: [], summary: 'Awaiting human authorization.' };
  } else if (engine === 'llm') {
    responseResult = await agents.respond({ alert: rawAlert, decision: decision.decision, votes }, emit);
  } else {
    responseResult = rules.respond(rawAlert, decision);
  }

  if (responseResult.status === 'CONTAINED') {
    responseResult.actions.forEach(a => {
      emitStream(emit, 'log', { agent: 'response', type: 'success', message: `[${a.action}] ${a.detail || a.target} — ${a.status}` });
    });
    emitStream(emit, 'rca', { time: now(), title: 'Autonomous Containment Executed', description: `Host isolated, C2 blocked, credentials revoked. ${consensusPct}% consensus.`, severity: 'critical' });
  } else if (decision.decision === 'ESCALATE_HUMAN') {
    emitStream(emit, 'rca', { time: now(), title: 'Action Escalated to Human Approval', description: `Risk ${riskScore} exceeds threshold ${threshold} on core infrastructure — awaiting authorization.`, severity: 'info' });
  }
  await delay(rulesDelay);

  // ---- PHASE 6: compliance ----------------------------------------------------------
  let complianceResult;
  if (engine === 'llm') {
    complianceResult = await agents.comply({ alert: rawAlert, status: responseResult.status }, emit);
  } else {
    complianceResult = rules.comply(rawAlert);
  }
  emitStream(emit, 'log', { agent: 'compliance', type: 'info', message: complianceResult.summary });

  // ---- PHASE 7: coordinator synthesis (predictions + playbook) ------------------------
  const memoryHits = tools.episodic_search({ query: (rawAlert.title || '').split(' ')[0] }).incidents;
  const wasContained = responseResult.status === 'CONTAINED';
  let synthesis;
  if (engine === 'llm') {
    synthesis = await agents.synthesize({ alert: rawAlert, killChainState: killChainStateOf(verdicts), wasContained, votes, memoryHits }, emit);
  } else {
    const active = Object.values(verdicts).flatMap(v => v.killChainStages).map(k => k.stage);
    synthesis = {
      predictedTTPs: rules.predict(rawAlert, active),
      playbook: rules.playbook(rawAlert, wasContained, votes),
      executiveSummary: 'Investigation complete.'
    };
  }

  synthesis.predictedTTPs.forEach(p => {
    emitStream(emit, 'log', { agent: 'coordinator', type: 'warning', message: `[PREDICTION] Next likely TTP: ${p.id} "${p.name}" — ${p.probability}% — Pre-emptive: ${p.preemptive}` });
  });
  emitStream(emit, 'playbook', { playbook: synthesis.playbook });
  emitStream(emit, 'log', { agent: 'coordinator', type: 'success', message: `PLAYBOOK GENERATOR: "${synthesis.playbook.name}" synthesized ${synthesis.playbook.memoryAugmented ? 'with episodic memory augmentation' : 'from current incident patterns'}.` });

  // ---- PHASE 8: persist + finalize ------------------------------------------------------
  const latencySec = ((Date.now() - t0) / 1000).toFixed(2);
  const status = responseResult.status === 'CONTAINED' ? 'CONTAINED' : 'PENDING_APPROVAL';

  const incident = store.addEpisodic({
    id: `MEM-EP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    title: rawAlert.title,
    enclave: rawAlert.source,
    rootCause: `Detected malicious activity on ${rawAlert.targetHost} (${rawAlert.payload ? rawAlert.payload.slice(0, 80) : 'payload unavailable'}).`,
    actionsTaken: responseResult.actions.length ? responseResult.actions.map(a => a.action) : ['Escalated to Human Approval Queue'],
    resolutionOutcome: wasContained ? 'SUCCESS — Autonomous containment complete' : 'PENDING HUMAN APPROVAL',
    mttrSeconds: latencySec,
    riskScore,
    consensusPct,
    engine,
    model: engine === 'llm' ? llm.MODEL : 'rule-engine',
    mitreTtps: Object.values(verdicts).flatMap(v => v.ttpsDetected)
  });
  store.addAudit('INVESTIGATION', `[${rawAlert.id}] ${status} in ${latencySec}s, risk ${riskScore}, engine=${engine}`);
  store.bumpStats(engine, llmToolCalls.count);

  emitStream(emit, 'rca', { time: `T+${latencySec}s`, title: 'Investigation Pipeline Complete', description: `Full autonomous investigation completed in ${latencySec}s. Status: ${status}.`, severity: 'info' });
  emitStream(emit, 'log', { agent: 'coordinator', type: 'success', message: `INVESTIGATION COMPLETE in ${latencySec}s. Consensus ${consensusPct}%. Weighted confidence ${weightedConfidence}%. Status: ${status}. Engine: ${engine === 'llm' ? 'LLM AGENTIC (' + llm.MODEL + ')' : 'RULE FALLBACK'}.` });

  // emit all remaining state for the UI
  const result = {
    status,
    riskScore,
    latencySec,
    consensusPct,
    weightedConfidence,
    maliciousVotes,
    totalVotes,
    engine,
    model: engine === 'llm' ? llm.MODEL : 'rule-engine',
    consensusRecord: votes.map(v => ({ agent: v.agent, key: v.key, vote: v.vote, confidence: v.confidence, color: v.color, weight: v.weight })),
    rcaTimeline: [],
    killChainState: killChainStateOf(verdicts),
    predictedTTPs: synthesis.predictedTTPs,
    generatedPlaybook: synthesis.playbook,
    executiveSummary: synthesis.executiveSummary,
    incidentId: incident.id,
    agents: agents.INVESTIGATION_AGENTS.reduce((acc, k) => {
      acc[k] = { status: 'COMPLETED', confidence: verdicts[k].confidence, vote: verdicts[k].verdict, reasoning: verdicts[k].reasoning };
      return acc;
    }, {
      coordinator: { status: 'COMPLETED', confidence: 99, vote: null },
      response: { status: wasContained ? 'COMPLETED' : 'WAITING', confidence: wasContained ? 97 : 50, vote: null },
      compliance: { status: 'COMPLETED', confidence: 88, vote: null },
      approval: { status: 'COMPLETED', confidence: 100, vote: decision.decision }
    }),
    approvalRequest: decision.decision === 'ESCALATE_HUMAN' ? {
      id: `APP-${Date.now().toString(36).toUpperCase()}`,
      incidentId: incident.id,
      title: rawAlert.title,
      target: rawAlert.targetHost,
      riskScore,
      consensus: `${maliciousVotes}/${totalVotes} agents (${consensusPct}%)`,
      proposedAction: `Isolate ${rawAlert.targetHost} & revoke credentials`,
      reasoning: decision.rationale
    } : null,
    toolCalls: llmToolCalls.count
  };

  if (result.approvalRequest) {
    store.addApproval({ ...result.approvalRequest, alert: rawAlert, status: 'PENDING', createdAt: new Date().toISOString() });
    store.addAudit('ESCALATION', `[${rawAlert.id}] ${result.approvalRequest.title} escalated to human approval queue (risk ${riskScore}).`);
  }

  emitStream(emit, 'result', { result });
  return result;
}

// ============================================================================
// HUMAN-IN-THE-LOOP: execute the response after a SOC operator approves
// ============================================================================

async function executeApprovedResponse(approvalId, emit = () => {}) {
  const approval = store.getApproval(approvalId);
  if (!approval) throw new Error('approval not found');
  if (approval.status !== 'PENDING') throw new Error(`approval already ${approval.status}`);

  const { engine } = await resolveEngine();
  const alert = approval.alert;

  emitStream(emit, 'log', { agent: 'approval', type: 'success', message: `HUMAN APPROVAL GRANTED for "${alert.title}" by SOC operator. Dispatching Incident Response agent.` });
  emitStream(emit, 'rca', { time: now(), title: 'Human Approval Granted', description: `SOC operator authorized autonomous containment for ${alert.targetHost}.`, severity: 'info' });

  const decision = { decision: 'AUTONOMOUS_EXECUTE', rationale: 'Human approval granted.' };
  const responseResult = engine === 'llm'
    ? await agents.respond({ alert, decision: decision.decision, votes: [] }, emit)
    : rules.respond(alert, decision);

  (responseResult.actions || []).forEach(a => {
    emitStream(emit, 'log', { agent: 'response', type: 'success', message: `[${a.action}] ${a.detail || a.target} — ${a.status}` });
  });
  emitStream(emit, 'rca', { time: now(), title: 'Autonomous Containment Executed (Human Approved)', description: `Approved by SOC operator — ${(responseResult.actions || []).length} containment actions executed.`, severity: 'critical' });

  const compliance = engine === 'llm'
    ? await agents.comply({ alert, status: responseResult.status }, emit)
    : rules.comply(alert);
  emitStream(emit, 'log', { agent: 'compliance', type: 'info', message: compliance.summary });

  store.updateApproval(approvalId, { status: 'APPROVED_EXECUTED', resolvedAt: new Date().toISOString() });
  store.updateEpisodic(approval.incidentId, {
    resolutionOutcome: 'SUCCESS — Human-approved autonomous containment complete',
    actionsTaken: (responseResult.actions || []).map(a => a.action),
    mttrSeconds: ((Date.now() - new Date(approval.createdAt).getTime()) / 1000).toFixed(2)
  });
  store.addAudit('HUMAN_APPROVED', `[${approval.id}] Containment executed for ${alert.title}`);

  emitStream(emit, 'result', { result: { status: responseResult.status, approvalId, actions: (responseResult.actions || []).length, engine } });
  return responseResult;
}

async function rejectApproval(approvalId, reason = 'rejected by SOC operator') {
  const approval = store.getApproval(approvalId);
  if (!approval) throw new Error('approval not found');
  if (approval.status !== 'PENDING') throw new Error(`approval already ${approval.status}`);
  store.updateApproval(approvalId, { status: 'REJECTED', resolvedAt: new Date().toISOString() });
  store.updateEpisodic(approval.incidentId, { resolutionOutcome: 'OVERRIDDEN BY OPERATOR — no autonomous action taken' });
  store.addAudit('HUMAN_OVERRIDE', `[${approvalId}] ${reason}`);
  return approval;
}

function killChainStateOf(verdicts) {
  const state = {};
  Object.values(verdicts).forEach(v => {
    (v.killChainStages || []).forEach(ks => {
      if (ks && ks.stage) state[ks.stage] = { active: true, evidence: ks.evidence || 'Detected by investigation agent', timestamp: now() };
    });
  });
  return state;
}

module.exports = { runInvestigation, executeApprovedResponse, rejectApproval, resolveEngine, killChainStateOf };
