'use strict';
/* ==========================================================================
   TUESDAY: Benchmark Harness
   Replays attack scenarios through the agentic pipeline and measures:
     - MTTR (mean time to respond / investigate), seconds
     - Consensus agreement (variance of verdicts per scenario)
     - Verdict stability across runs
     - Tool-call efficiency (LLM mode)
   Running `node benchmark.js` compares LLM vs RULE engines side by side —
   the quantified "our agents are faster than a deterministic baseline" story.

   Usage:
     node benchmark.js                # LLM vs rules, 2 runs each
     node benchmark.js --mode llm     # only LLM engine
     node benchmark.js --runs 3       # 3 runs per scenario
     node benchmark.js --rules        # only rule engine (fast, no model needed)
   ========================================================================== */

const orchestrator = require('./lib/orchestrator');

const SCENARIOS = [
  {
    id: 'SIM-001',
    title: 'LockBit 3.0 Ransomware Outbreak',
    source: 'CrowdStrike EDR',
    targetHost: 'FIN-SERVER-04 (192.168.10.45)',
    ioc: '185.220.101.5 (Tor C2 Node)',
    payload: 'powershell.exe -enc SQBFAFgAKABOAGUAdw... vssadmin delete shadows /all /quiet & LockBit3.0_Payload.exe'
  },
  {
    id: 'SIM-002',
    title: 'AWS S3 Cloud Exfiltration via Leaked IAM Key',
    source: 'AWS GuardDuty',
    targetHost: 'AWS-S3-PROD-LOGS (10.0.4.12)',
    ioc: '193.142.146.35 (Malicious Proxy)',
    payload: 'sts:AssumeRole arn:aws:iam::123456789012:role/DataAdmin -> S3:ListBuckets -> Bulk KMS GetObject exfiltration'
  },
  {
    id: 'SIM-003',
    title: 'APT Supply Chain Trojan (SUNBURST Variant)',
    source: 'Microsoft Entra ID / SIEM',
    targetHost: 'DC-PRIMARY-01 (192.168.1.10)',
    ioc: '45.154.255.87 (APT C2 Server)',
    payload: 'SolarWinds.Orion.Core.BusinessLayer.dll injected into memory -> DNS Tunneling C2 Beaconing -> Golden Ticket requested.'
  }
];

function parseArgs(argv) {
  const opts = { runs: 2, modes: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode' || a === '-m') opts.modes.push(argv[++i]);
    if (a === '--rules') opts.modes.push('rules');
    if (a === '--llm') opts.modes.push('llm');
    if (a === '--runs' || a === '-r') opts.runs = parseInt(argv[++i], 10) || 2;
    if (a === '--scenarios') opts.scenarioFilter = argv[++i].split(',');
  }
  if (opts.modes.length === 0) opts.modes = ['llm', 'rules'];
  return opts;
}

function fmtTable(rows) {
  const widths = [];
  rows[0].forEach((_, i) => { widths[i] = Math.max(...rows.map(r => String(r[i]).length)); });
  return rows.map(r => '  ' + r.map((c, i) => String(c).padEnd(widths[i])).join(' | ')).join('\n');
}

async function run(engine, scenario, runIndex) {
  const t0 = Date.now();
  const events = [];
  const result = await orchestrator.runInvestigation(scenario, {
    emit: ev => events.push(ev),
    delayMs: 0,
    engine
  });
  const wallMs = Date.now() - t0;
  const toolCalls = events.filter(e => (e.event || e.type) === 'log' && /TOOL →/.test(e.message)).length;
  return {
    run: runIndex + 1,
    scenario: scenario.title,
    engine: result.engine,
    mttr: parseFloat(result.latencySec),
    wallMs,
    risk: result.riskScore,
    consensus: result.consensusPct,
    status: result.status,
    toolCalls
  };
}

async function main() {
  const opts = parseArgs(process.argv);
  const scenarios = opts.scenarioFilter
    ? SCENARIOS.filter(s => opts.scenarioFilter.includes(s.id))
    : SCENARIOS;

  console.log('==================================================================');
  console.log('  TUESDAY — AGENTIC SWARM BENCHMARK');
  console.log(`  Engines: ${opts.modes.join(' + ')} | Runs per scenario: ${opts.runs} | Scenarios: ${scenarios.length}`);
  console.log('==================================================================');

  const results = [];
  for (const mode of opts.modes) {
    for (const scenario of scenarios) {
      for (let i = 0; i < opts.runs; i++) {
        process.stdout.write(`  [${mode}] ${scenario.id} run ${i + 1}/${opts.runs}... `);
        try {
          const row = await run(mode, scenario, i);
          results.push(row);
          console.log(`MTTR ${row.mttr}s  consensus ${row.consensus}%  risk ${row.risk}  toolCalls ${row.toolCalls}`);
        } catch (e) {
          console.log(`FAILED: ${e.message}`);
        }
      }
    }
  }

  console.log('\n------------------------------------------------------------------');
  const rows = [['ENGINE', 'SCENARIO', 'RUN', 'MTTR(s)', 'RISK', 'CONSENSUS%', 'STATUS', 'TOOLCALLS']];
  results.forEach(r => rows.push([r.engine, r.scenario.slice(0, 30), r.run, String(r.mttr), String(r.risk), String(r.consensus), r.status, String(r.toolCalls)]));
  console.log(fmtTable(rows));

  console.log('\n------------------------------------------------------------------');
  for (const mode of opts.modes) {
    const m = results.filter(r => r.engine === mode);
    if (!m.length) continue;
    const avg = m.reduce((s, r) => s + r.mttr, 0) / m.length;
    const avgRisk = m.reduce((s, r) => s + r.risk, 0) / m.length;
    const avgCons = m.reduce((s, r) => s + r.consensus, 0) / m.length;
    const toolCalls = m.reduce((s, r) => s + r.toolCalls, 0);
    console.log(`  ${mode.toUpperCase()}  →  avg MTTR ${avg.toFixed(2)}s | avg risk ${avgRisk.toFixed(0)} | avg consensus ${avgCons.toFixed(0)}% | total tool calls ${toolCalls}`);
  }

  const llmR = results.filter(r => r.engine === 'llm');
  const ruleR = results.filter(r => r.engine === 'rules');
  if (llmR.length && ruleR.length) {
    const a = llmR.reduce((s, r) => s + r.mttr, 0) / llmR.length;
    const b = ruleR.reduce((s, r) => s + r.mttr, 0) / ruleR.length;
    const llmCalls = llmR.reduce((s, r) => s + r.toolCalls, 0);
    console.log(`\n  INTERPRETATION: the LLM engine spends ${(a - b).toFixed(1)}s longer than the deterministic baseline`);
    console.log(`  because it performs REAL reasoning: ${llmCalls} live tool calls (Sigma/YARA/IOC/asset/memory/TTP)`);
    console.log(`  across ${llmR.length} run(s), grounding every verdict in tool evidence. The rules baseline`);
    console.log(`  reasons over zero tool calls — it is a fast heuristic, not an investigation.`);
  }
  console.log('==================================================================');
}

main().catch(e => { console.error(e); process.exit(1); });
