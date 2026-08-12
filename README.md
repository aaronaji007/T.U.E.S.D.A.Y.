# TUESDAY

**Threat Unification Engine for Security Defense And Your SOC** — an autonomous, multi-agent security operations center.

TUESDAY simulates a full SOC orchestration pipeline: it ingests alerts, decomposes them with a swarm of specialized AI agents, runs real threat-intel tool calls, reaches a weighted consensus, and autonomously (or human-gated) executes containment — all while streaming its live reasoning to the web UI.

**1st place, Cyber Security — Neurobots National Hackathon 2026.**

---

## The project in depth

### The problem

Modern Security Operations Centers are drowning in three structural failures:

1. **Alert overload.** A typical SOC ingests 10,000+ alerts per day; more than 65% are false positives, so real threats get buried.
2. **Slow manual triage.** Tier-1 analysts spend 15–45 minutes per alert correlating indicators across 5+ disconnected tools (VirusTotal, AbuseIPDB, MISP, Shodan, internal asset DBs). Context-switching causes "investigation fatigue" and delays response.
3. **Speed of attack vs. speed of response.** Ransomware and APT supply-chain attacks reach their destructive payload in under 15 minutes, and breach cost scales directly with Mean Time to Respond (MTTR).

Commercial SOAR platforms solve parts of this — at $100k+/year in licensing, which puts them out of reach for SMBs, schools, MSSPs, and public-sector or air-gapped organizations.

### The solution

**TUESDAY is an autonomous, local-first, multi-agent AI SOC.** It ingests a raw alert, decomposes it into sub-tasks across a swarm of specialized AI agents, runs real security tool calls, reaches a weighted consensus, and either executes autonomous containment or routes the decision to a human — all in ~46 seconds (LLM agentic) or ~1.1 seconds (rule fallback), 100% on the local machine.

### How an alert is handled (the pipeline)

```
RAW ALERT (SIEM/EDR/cloud)
   │  HTTP + Server-Sent Events → /api/incident/stream
   ▼
SOC COORDINATOR agent — decomposes alert, dispatches in parallel
   ├── Log Analysis      (Sigma correlation)      ─┐
   ├── Malware Sandbox   (YARA scan)              ├── 4 investigation
   ├── Threat Intelligence (IOC enrichment)       ├── agents run a ReAct loop
   └── Cloud Security    (IAM/CSPM posture)       ┘   on LOCAL Ollama (Qwen 2.5)
   │     (automatic fallback to a deterministic rule engine if the LLM is offline)
   ▼
CONSENSUS — weighted confidence + risk score (max of weighted-confidence, agreement%)
   ▼
APPROVAL GATE — Human Governance agent:
   risk > threshold AND critical asset → ESCALATE TO HUMAN (hard rule, always)
   risk ≤ threshold AND non-critical   → AUTONOMOUS EXECUTE (always)
   otherwise → LLM decides
   ▼
INCIDENT RESPONSE — executes containment (HOST_ISOLATION, FW_BLOCK,
   CREDENTIAL_REVOKE, SESSION_TERMINATE, SHADOW_COPY_RESTORE)
   ▼
COMPLIANCE — audit trail (GDPR Art 33, PCI-DSS)
   ▼
COORDINATOR SYNTHESIS — predicts next TTPs + writes an adaptive playbook to episodic memory
```

### The 8 agents

| Agent | Role | Tools |
|---|---|---|
| **SOC Coordinator** | Decomposes alerts, dispatches tasks, final synthesis + playbook prediction | all tools |
| **Log Analysis** | SIEM correlation & Sigma rule engine | `sigma_scan`, `ttp_lookup`, `asset_lookup`, `episodic_search` |
| **Threat Intelligence** | IOC enrichment across VirusTotal / AbuseIPDB / Shodan / MISP | `ioc_lookup`, `episodic_search`, `ttp_lookup` |
| **Malware Sandbox** | YARA + behavioral sandbox analysis | `yara_scan`, `ttp_lookup` |
| **Cloud Security** | AWS/Azure IAM & CSPM posture audit | `asset_lookup`, `sigma_scan`, `ttp_lookup` |
| **Incident Response** | Autonomous containment & SOAR playbooks | `asset_lookup`, `ttp_lookup`, `episodic_search` |
| **Compliance Audit** | Regulatory impact (GDPR Art 33, PCI-DSS) & audit trail | `asset_lookup`, `ttp_lookup`, `episodic_search` |
| **Human Governance** | Risk-threshold gate & human-override control | `asset_lookup`, `episodic_search` |

### Why this design matters

- **100% local and air-gapped private.** Every agent is a real LLM (Qwen 2.5) running on local Ollama. No cloud APIs, no keys, no telemetry leaves the machine — a deliberate requirement for security workloads.
- **Tool-grounded ReAct loop (zero hallucinations).** Agents cannot render a verdict until they call a real tool and read the evidence. Tool results are authoritative; fabricated detections are structurally impossible.
- **Weighted consensus + safety gate.** Four investigation agents vote with confidence. Weighted confidence and agreement feed a risk score. Risk above the threshold on critical infrastructure **hard-forces escalation to a human** — the AI can never autonomously destroy a domain controller.
- **Adaptive episodic memory.** Each incident (alert, actions, outcome) is stored and searched on the next alert, so the swarm learns from its history and synthesizes new playbooks.
- **Honest engine status.** The UI labels `ENGINE: LLM AGENTIC` or `ENGINE: RULE FALLBACK`; the pipeline works either way, so demos never break.

### Measured performance

| Metric | Human Tier-1/2 | TUESDAY (measured) | Improvement |
|---|---|---|---|
| MTTR | 42 min | **~46 s** (LLM agentic) / **~1.1 s** (rule path) | **~98%** (~52x) |
| MTTD | 14.5 min | **~0.12 s** | ~98.6% |

Reproducible via `node benchmark.js` and the live Command-Center stopwatch. Full details in [BENCHMARK_REPORT.md](BENCHMARK_REPORT.md).

### Attack scenarios (purple team)

| ID | Attack | Source | Target | MITRE chain |
|---|---|---|---|---|
| SIM-001 | **LockBit 3.0 Ransomware** — spearphish → LSASS dump → shadow-copy delete → encryption | CrowdStrike EDR | FIN-SERVER-04 | T1566 → T1059 → T1003 → T1490 → T1486 |
| SIM-002 | **AWS S3 Cloud Exfiltration** — leaked IAM key assumes DataAdmin, bulk S3 download | AWS GuardDuty | AWS-S3-PROD-LOGS | T1078 → T1530 → T1567 |
| SIM-003 | **APT Supply Chain (SUNBURST)** — trojanized update binary, DNS-tunnel C2 beaconing | Entra ID / SIEM | DC-PRIMARY-01 (CRITICAL) | T1204 → T1027 → T1071 → T1558 |

SIM-003 is the flagship safety-gate demo: it targets a **CRITICAL domain controller**, so the governance hard rule forces human escalation even when every agent votes MALICIOUS.

### Path to production

Everything in this repo already works end-to-end on local LLMs. The inputs and containment are simulated today; `lib/connectors/` ships typed adapter stubs (ingestion, enrichment, containment) so a pilot can wire real Syslog/EDR ingestion, live VirusTotal/AbuseIPDB enrichment, and real firewall-block + EDR-isolation containment as one-file changes — zero pipeline rewrites. See [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) for the phased plan.

---

## Why Ollama?

Every agent you see in the UI is a **real large language model** running locally on your machine. TUESDAY uses **Ollama** as its local LLM runtime because:

1. **True AI reasoning, not canned scripts.** Each agent (Log Analysis, Threat Intel, Malware Sandbox, Cloud Security, Incident Response, Compliance, Human Approval) gets a system prompt and live alert context, and performs a ReAct-style loop: think → call tools → read results → conclude. Without a local LLM, the same pipeline falls back to a deterministic rule engine — functional, but not "real model reasoning."

2. **Native function/tool calling.** Ollama's `/api/chat` exposes OpenAI-style `tool_calls`. TUESDAY defines real tools (Sigma scan, IOC lookup, YARA scan, memory search, etc.) and lets the model invoke them mid-reasoning, exactly like a production agent loop.

3. **100% local and private.** No cloud, no API keys, no data leaving your machine. Everything stays on localhost — important when the workload is security telemetry.

4. **Free and offline.** Once the model is downloaded, no internet or subscription is needed.

5. **Graceful fallback.** If Ollama isn't installed or the model is missing, the backend detects it (`checkModel`) and every agent gracefully degrades to the built-in rule engine, so the demo still runs — the UI shows you whether the engine is `LLM agentic` or falling back.

---

## Recommended Qwen models

TUESDAY defaults to **Qwen 2.5** because it has strong tool/function calling for its size, runs well locally, and is fully supported by Ollama. Pick based on your hardware:

| Model | Download size | Minimum RAM/VRAM | Recommended for |
|---|---|---|---|
| `qwen2.5:3b` | ~2 GB | ~4 GB (runs on CPU) | Low-spec machines, laptops without a GPU, fastest response times |
| `qwen2.5:7b` ***(default)*** | ~4.7 GB | ~8 GB VRAM (e.g. RTX 4060) / 16 GB RAM | Best balance of reasoning quality and speed |
| `qwen2.5:14b` | ~9 GB | ~12–16 GB VRAM | Highest-quality multi-step reasoning on capable GPUs |
| `phi4-mini` *(fallback)* | ~2.5 GB | ~4–6 GB | Secondary model the backend can use if the primary is unavailable |

> The quantized sizes above are the standard Ollama defaults (q4_K_M / q8). TUESDAY loads the model with `num_ctx 8192` and `maxTokens 900`, so keep an eye on VRAM headroom.

### Changing the model

Edit `config.json`:

```json
{
  "ollamaUrl": "http://localhost:11434",
  "model": "qwen2.5:7b",
  "fallbackModel": "phi4-mini"
}
```

Or override at runtime with environment variables (takes precedence):

- `OLLAMA_URL` — Ollama API base, e.g. `http://localhost:11434`
- `TUESDAY_MODEL` — the primary model, e.g. `qwen2.5:7b`

Pull a model before switching to it:

```bat
ollama pull qwen2.5:7b
```

---

## System requirements

- **Node.js 20+** (LTS recommended)
- **Ollama** (latest, with `/api/chat` tool-calling support) — https://ollama.com/download
- A downloaded Qwen model (see table above)
- GPU (NVIDIA CUDA recommended) for the 7b model; CPU works for 3b

---

## Quick start

**1. Install Node.js** — https://nodejs.org (LTS 20+)

**2. Install Ollama** — https://ollama.com/download, then start the Ollama app/tray once.

**3. Pull the default model** (7b, ~4.7 GB):

```bat
ollama pull qwen2.5:7b
```

On a lower-spec machine pull the 3b instead and set `"model": "qwen2.5:3b"` in `config.json`.

**4. Run one-time setup** (checks Node, Ollama, offers to pull the model):

```bat
setup.bat
```

**5. Verify before a demo** (syntax-checks all JS, validates config + store, pings Ollama):

```bat
verify.bat
```

**6. Start the swarm server**:

```bat
start.bat
```

**7. Open the app** — the server starts on `http://localhost:8090` and the UI shows an `ENGINE` indicator confirming whether the LLM backend is connected (`LLM AGENTIC`) or falling back to the rule engine.

---

## Using the app

- **SHOWCASE** — auto-playing visual tour of every feature (no voice model needed).
- **LAUNCH SIMULATOR** / **Purple Team Sim** — run a LockBit ransomware, AWS S3 exfiltration, or APT supply-chain drill through the real agent swarm.
- **Agent Swarm** — inspect each agent's live reasoning and tool calls.
- **Approval Queue** — high-impact actions (e.g. domain controllers) are gated behind human approval.
- **Memory** — the swarm stores episodic memories and generates adaptive playbooks after each incident.

---

## Configuration reference

| Key | Default | Purpose |
|---|---|---|
| `port` | `8090` | Web UI + API port |
| `ollamaUrl` | `http://localhost:11434` | Ollama API base URL |
| `model` | `qwen2.5:7b` | Primary agent model |
| `fallbackModel` | `phi4-mini` | Secondary model |
| `maxTokens` | `900` | Max tokens per model reply |
| `timeoutMs` | `120000` | Per-request LLM timeout |
| `numCtx` | `8192` | Context window size |
| `temperature` | `0.2` | Low = deterministic security reasoning |
| `maxTurns` | `4` | Max tool-call turns per agent |
| `maxParallelAgents` | `4` | Concurrent agent threads per incident |

---

## How the swarm works

1. **Alert ingestion** — SIEM/EDR/cloud/identity alerts enter the stream.
2. **Decomposition** — the Coordinator breaks the alert into tasks and dispatches specialist agents in parallel.
3. **Tool calling** — agents run Sigma, VirusTotal/AbuseIPDB/Shodan/MISP lookups, YARA scans, and episodic-memory searches.
4. **Consensus** — agents vote; weighted confidence decides the verdict.
5. **Governance** — if risk exceeds the autonomous threshold, containment escalates to the human approval queue.
6. **Response & memory** — containment executes, an RCA/kill-chain/MITRE mapping is recorded, and a new playbook is synthesized.

If the LLM is unavailable at any step, the same pipeline completes using the deterministic rule engine so the demo never breaks.

---

## Project structure

```
config.json          Backend configuration (model, ports, thresholds)
server.js            Zero-dependency Node HTTP server (REST + SSE endpoints)
lib/                 Backend engine
  orchestrator.js      Multi-agent orchestration + consensus
  agents.js            Agent definitions & system prompts
  llm.js               Ollama client (ReAct tool-call loop, JSON extraction)
  rules_engine.js      Deterministic fallback when no LLM is available
  tools.js             Tool implementations (Sigma, IOC, YARA, memory…)
  store.js             Persistent incident/memory store
  connectors/          Adapter stubs: ingestion, enrichment, containment
benchmark.js         Reproducible MTTR/consensus measurement harness
attack_sim.js        Purple-team scenario definitions
index.html           Web UI
styles.css           UI theme
app.js               Front-end controller (tabs, charts, terminals)
showcase.js          Visual guided tour
```

## Documentation

- **[CONTEXT.md](CONTEXT.md)** — self-contained project context: problem, solution, architecture, features, how to run.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — deep dive into the multi-agent orchestration pipeline, consensus model, and governance flow.
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** — every REST + SSE endpoint, request/response shapes, and the frontend trigger flow.
- **[BENCHMARK_REPORT.md](BENCHMARK_REPORT.md)** — performance evaluation criteria and how to reproduce the numbers with `node benchmark.js`.
- **[PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md)** — phased plan from hackathon MVP to deployed product via the connector adapter layer.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ENGINE` shows rule-engine fallback | Ollama isn't running, or the model isn't pulled. Start Ollama, run `ollama pull qwen2.5:7b`, and check `http://localhost:11434/api/tags` |
| Model call hangs/times out | Increase `timeoutMs`/`numCtx` in `config.json`, or switch to a smaller model (`qwen2.5:3b`) |
| Out of VRAM on 7b | Use `qwen2.5:3b`, or pull the `q4_0` quant (`ollama pull qwen2.5:7b:q4_0`) and set `"model": "qwen2.5:7b:q4_0"` |
| Agents give weak answers | Try `qwen2.5:14b`, or increase `maxTurns` so agents can make more tool calls |
