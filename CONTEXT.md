# TUESDAY — Problem & Solution (Self-Contained Context)

> **Project:** TUESDAY — **Threat Unification Engine for Security Defense And Your SOC**
> A fully working prototype of an autonomous, multi-agent AI Security Operations Center (SOC), built by an 8-member team for the Neurobots National Hackathon 2026.
> This file gives any human or AI enough context to understand the problem, the architecture, every feature, and how to run it — without reading source code.

---

## 1. The Problem

Modern Security Operations Centers (SOCs) defend networks against attacks but are drowning in three structural failures:

1. **Alert overload.** A typical SOC ingests **10,000+ alerts per day** from EDRs, SIEMs, firewalls, and cloud logs. Most are false positives (>65%), so real threats get buried.
2. **Slow manual triage.** Tier-1 analysts spend **15–45 minutes per alert** manually correlating indicators across 5+ disconnected tools (VirusTotal, AbuseIPDB, MISP, Shodan, internal asset DBs). Context-switching causes "investigation fatigue" and delays response.
3. **Speed of attacks vs. speed of response.** Ransomware and APT supply-chain attacks reach their destructive payload in **under 15 minutes**. Meanwhile breach cost scales directly with Mean Time to Respond (MTTR) — every minute costs money and data.

**The cost problem:** commercial SOAR (Security Orchestration, Automation and Response) platforms cost **$100k+/year** in licensing — unaffordable for SMBs, schools, MSSPs with many tenants, and public-sector or air-gapped organizations.

**Users:** Tier-1/Tier-2 SOC analysts, MSSPs, enterprise CSIRTs, and air-gapped defense SOCs.

---

## 2. The Solution

**TUESDAY is an autonomous, local-first, multi-agent AI SOC.** It ingests raw alerts, decomposes each into sub-tasks across a swarm of specialized AI agents, runs **real security tool calls**, reaches a weighted consensus, and then either executes autonomous containment or routes the decision to a human — all in ~1 second, 100% on the local machine.

Five differentiating ideas:

1. **100% local and air-gapped private.** Every agent is a real LLM (Qwen 2.5) running on local Ollama. No cloud APIs, no keys, no telemetry leaves the machine — a deliberate requirement for security workloads.
2. **Tool-grounded ReAct loop (zero hallucinations).** Agents cannot render a verdict until they call a real tool (`sigma_scan`, `yara_scan`, `ioc_lookup`, `asset_lookup`, `episodic_search`, `ttp_lookup`) and read the evidence. Tool results are authoritative; fabricated detections are impossible.
3. **Weighted consensus + safety gate.** 4 investigation agents vote with confidence. Weighted confidence and a risk score are computed; risk above the threshold (default 80) on **critical infrastructure hard-forces escalation to a human** — the AI can never autonomously destroy a domain controller.
4. **Adaptive episodic memory.** Each incident (alert, actions, outcome) is stored as an episode and searched on the next alert, so the swarm learns from its history and synthesizes new playbooks.
5. **~98% MTTR reduction.** Measured ~46 s (full LLM agentic swarm on local Ollama) vs 42+ min manual triage — a ~52x speedup. The rule-engine fallback path runs in ~1.1 s. Reproducible via `benchmark.js`; results in `BENCHMARK_REPORT.md`.

---

## 3. Architecture (how an alert is handled)

```
RAW ALERT (SIEM/EDR/cloud)
   │  HTTP + Server-Sent Events → /api/incident/stream
   ▼
SOC COORDINATOR agent — decomposes alert, dispatches in parallel
   ├── Log Analysis      (Sigma correlation)      ─┐
   ├── Malware Sandbox   (YARA scan)              ├── 4 investigation
   ├── Threat Intelligence (IOC enrichment)       ├── agents run a ReAct loop
   └── Cloud Security    (IAM/CSPM posture)       ┘   on LOCAL Ollama (Qwen 2.5)
   │     (automatic fallback to deterministic rule engine if LLM offline)
   ▼
CONSENSUS — weighted confidence + risk score (max of weighted-confidence, agreement%)
   ▼
APPROVAL GATE — Human Governance agent:
   risk > threshold AND critical asset → ESCALATE TO HUMAN (always)
   risk ≤ threshold AND non-critical   → AUTONOMOUS EXECUTE
   otherwise → LLM decides
   ▼
INCIDENT RESPONSE — executes containment (HOST_ISOLATION, FW_BLOCK,
   CREDENTIAL_REVOKE, SESSION_TERMINATE, SHADOW_COPY_RESTORE)
   ▼
COMPLIANCE — audit trail (GDPR Art 33, PCI-DSS)
   ▼
COORDINATOR SYNTHESIS — predicts next TTPs + writes adaptive playbook to episodic memory
```

**Key facts:**
- **Zero-dependency Node.js server** (no `npm install`); starts on `http://localhost:8090` via `start.bat`.
- **Engine status is honest:** UI shows `ENGINE: LLM AGENTIC` or `ENGINE: RULE FALLBACK`; the pipeline works either way, so demos never break.
- **Tool registry** (`lib/tools.js`) exposes real function-calling to the models via Ollama's native `tool_calls`, backed by an offline security dataset (Sigma rules, YARA rulesets, malicious IPs, MITRE TTP encyclopedia, threat-actor profiles).
- **8 agents:** Coordinator, Log Analysis, Threat Intelligence, Malware Sandbox, Cloud Security, Incident Response, Compliance Audit, Human Governance.
- **Config:** `config.json` (model `qwen2.5:7b`, fallback `phi4-mini`, `port 8090`, thresholds). RL weight sliders in the UI tune per-agent vote weight; weights persist in `data/store.json`.

---

## 4. Features (7 UI modules)

| Module | What it does |
|---|---|
| **Command Center** (dashboard) | Live SIEM feed, streaming agent terminal, swarm node graph, **live MTTR stopwatch** (proves the ~46 s response live vs 42 min human baseline). |
| **Agent Swarm Workspace** | 8 agent cards with live reasoning + **reinforcement-learning weight sliders**. |
| **Digital SOC Twin + PCAP** | Interactive network canvas of enclaves/assets, animated attack path, Wireshark-style packet inspector. |
| **MITRE ATT&CK Matrix** | Heatmap of detected techniques; clickable TTP modals with root-cause analysis + kill-chain stages. |
| **Human Approval Queue** | Governance gate; risk-threshold sliders; one-click approve/reject containment. |
| **Agent Memory & Sandbox** | Episodic incident memory, semantic memory graph, live YARA/Sigma rule editor. |
| **Purple Team Simulator** | 3 pre-built attack drills + custom alert injector to stress-test the swarm. |

**Demo reliability:** `start.bat` (zero-dependency boot), `verify.bat` (pre-demo health check — syntax-checks JS, validates config/store, pings Ollama), model pre-warm at boot, and `GET /api/health` (liveness, uptime, model status, pending approvals).

---

## 5. Attack Scenarios (purple team)

| ID | Attack | Source | Target | IOC | MITRE chain |
|---|---|---|---|---|---|
| SIM-001 | **LockBit 3.0 Ransomware Outbreak** — spearphish → LSASS dump → shadow-copy delete → encryption | CrowdStrike EDR | FIN-SERVER-04 | Tor C2 node | T1566 → T1059 → T1003 → T1490 → T1486 |
| SIM-002 | **AWS S3 Cloud Exfiltration** — leaked IAM key assumes DataAdmin, bulk S3 download | AWS GuardDuty | AWS-S3-PROD-LOGS | malicious proxy | T1078 → T1530 → T1567 |
| SIM-003 | **APT Supply Chain (SUNBURST variant)** — trojanized update binary, DNS-tunnel C2 beaconing | Entra ID / SIEM | DC-PRIMARY-01 (CRITICAL) | APT C2 | T1204 → T1027 → T1071 → T1558 |

SIM-003 is the flagship safety-gate demo: it targets a **CRITICAL domain controller**, so the governance hard rule **forces human escalation** even when every agent votes MALICIOUS.

---

## 6. How to run

```bat
setup.bat        # one-time: checks Node + Ollama, offers to pull qwen2.5:7b
verify.bat       # pre-demo health check → reports ENGINE status
start.bat        # starts server on http://localhost:8090
```

Requirements: Node.js 20+, Ollama, and a Qwen 2.5 model (~8 GB VRAM for 7b; `qwen2.5:3b` runs on CPU). Full setup in `README.md`.

---

## 7. Quick reference (repo map)

```
server.js            Zero-dependency Node HTTP server (REST + SSE)
lib/orchestrator.js  Multi-agent pipeline: ingestion → consensus → governance → response → memory
lib/agents.js        8 agent definitions, system prompts, ReAct loops, JSON verdict sanitization
lib/llm.js           Ollama client (tool-calling ReAct loop, robust JSON extraction)
lib/tools.js         Tool implementations + offline security dataset (Sigma/YARA/IOC/TTP)
lib/rules_engine.js  Deterministic fallback engine (keeps the demo alive without an LLM)
lib/store.js         Persistent incident/memory/approval store
attack_sim.js        Purple-team scenario definitions (SIM-001/002/003)
benchmark.js         Reproducible MTTR/consensus measurement harness
index.html/app.js    Web UI (tabs, charts, terminals, MTTR stopwatch)
ARCHITECTURE.md      Deep dive: orchestration, consensus, governance
API_DOCUMENTATION.md Every REST + SSE endpoint
BENCHMARK_REPORT.md  Measured performance numbers
PRESENTATION_SCRIPT.md  Round-2 speaker script (slides + demo + Q&A)
```

---

## 8. Status & roadmap

**Done:** working prototype, all 7 UI modules, 3 attack scenarios, benchmark harness, verification suite, documentation, round-2 deck + script.

**Next:** live VirusTotal/AbuseIPDB API integration, native Splunk/Elastic/Sentinel connectors, multi-GPU inference, 15+ MITRE-tactic scenario library, final benchmark pass.
