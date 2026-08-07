# TUESDAY API & Integration Specifications

The agentic swarm runs on a zero-dependency Node.js backend (`server.js`). It serves the
frontend and exposes a REST + SSE API. The LLM agents run locally via **Ollama**
(`http://localhost:11434`). All investigation work happens on the backend — the browser is
a live rendering terminal.

Base URL: `http://localhost:8090` (configurable in `config.json`)

---

## 1. Investigation API

### 1.1 Run Investigation (SSE stream) — live demo endpoint
- **Method:** `POST /api/incident/stream`
- **Body:**
```json
{
  "alert": {
    "id": "ALERT-8891",
    "title": "LockBit 3.0 Ransomware Execution Attempt",
    "source": "CrowdStrike EDR",
    "targetHost": "FIN-SERVER-04 (192.168.10.45)",
    "ioc": "185.220.101.5",
    "payload": "powershell.exe -enc ... vssadmin delete shadows"
  },
  "threshold": 80
}
```
- **Response:** `text/event-stream` with events:
  `log`, `rca`, `killchain`, `ttp`, `vote`, `playbook`, `result`, `error`, `done`

### 1.2 Run Investigation (plain JSON)
- **Method:** `POST /api/incident`
- Same body as above; returns the full result object synchronously.

### 1.3 Result shape
```json
{
  "status": "CONTAINED | PENDING_APPROVAL",
  "riskScore": 75,
  "latencySec": "36.43",
  "consensusPct": 75,
  "weightedConfidence": 71,
  "engine": "llm | rules",
  "model": "qwen2.5:7b | rule-engine",
  "consensusRecord": [{ "agent": "...", "vote": "MALICIOUS", "confidence": 92 }],
  "killChainState": { "Execution": { "active": true, "evidence": "..." } },
  "predictedTTPs": [{ "id": "T1059", "probability": 85 }],
  "generatedPlaybook": { "name": "...", "steps": [...] },
  "approvalRequest": null
}
```

---

## 2. Human-in-the-Loop Governance API

When `riskScore > threshold` on CRITICAL infrastructure the swarm escalates instead of
acting. The SOC operator resolves it through the queue below.

### 2.1 List pending approvals
- **Method:** `GET /api/approvals?status=PENDING`

### 2.2 Execute approved containment (SSE stream)
- **Method:** `POST /api/incident/approve`
- **Body:** `{ "id": "APP-XXXX" }`
- Streams the Incident Response agent's real containment actions over the same SSE protocol.

### 2.3 Reject / override
- **Method:** `POST /api/incident/reject`
- **Body:** `{ "id": "APP-XXXX", "reason": "..." }`

---

## 3. Swarm State API

### 3.1 Backend / model status
- **Method:** `GET /api/status`
- Returns backend health, resolved engine (`llm`|`rules`), active model, Ollama probe, stats.

### 3.2 Agent weights & knowledge
- **Method:** `GET /api/agents`
- Returns reinforcement-learning weights per agent plus seeded assets and threat actors.

### 3.3 Persisted memory
- **Method:** `GET /api/memory`
- Returns episodic memory, audit log, agent weights, and engine stats from `data/store.json`.

### 3.4 Audit trail
- **Method:** `GET /api/audit`

### 3.5 Reinforcement-learning feedback
- **Method:** `POST /api/feedback`
- **Body:** `{ "agent": "log", "type": "up" | "down" }`
- Adjusts that agent's weighted-confidence multiplier by ±0.05 (clamp 0.1–3.0).

---

## 4. Benchmark Harness

```bash
node benchmark.js                    # LLM vs rules, 2 runs each
node benchmark.js --mode llm --runs 1
node benchmark.js --rules --runs 3   # deterministic baseline (no model needed)
```

---

## 5. Frontend Swarm API (browser)

The browser is a rendering client. `SwarmEngine` streams the backend over SSE and falls
back to an on-device deterministic pipeline only when the backend is unreachable.

- **Trigger:** `SwarmEngine.processIncidentAlert(alertObject)`
- **Log subscription:** `SwarmEngine.onLogMessage((agentKey, logText, type) => { ... })`
- **Approval execution:** `SwarmEngine.runApprovalExecution(approvalId)`
