# TUESDAY — Scalability & Going Forward (Path to Production)

> **The pitch in one line:** TUESDAY is the **orchestration brain** of an autonomous SOC. Everything in this repo already works end-to-end on local LLMs. This document is the honest, phased plan for turning it into a deployed product — where the simulated inputs, tools, and containment become **real production backends** behind an adapter layer that ships with the code.

---

## 1. Where the prototype is today (what's real vs what's simulated)

| Layer | Today (this repo) | Production target |
| :--- | :--- | :--- |
| **LLM agents** | Real — `qwen2.5:7b` on local Ollama, ReAct tool-calling | Same, + multi-GPU sharding, `qwen2.5:32b`-class reasoning on premium tiers |
| **Orchestration** | Real — decompose → investigate → consensus → governance gate → act → memory | Same, stateless + horizontally scalable |
| **Alert ingestion** | Simulated — SSE feed + purple-team injector | Real Syslog / Splunk / Elastic / Sentinel / GuardDuty / EDR webhooks |
| **Tool backends** | Offline dataset — regex Sigma/YARA, seeded IOC list, static asset registry | Live VirusTotal / AbuseIPDB / Shodan APIs, real YARA files, real SIEM query, CMDB/AD asset lookup |
| **Containment** | Simulated — audit-log records | Real firewall blocks, EDR host isolation, IAM credential revoke, session termination |
| **Memory** | Real episodic + semantic store (`data/store.json`) | Same, backed by a proper store, optionally federated |

Nothing in this table is hidden or faked — the UI even labels the engine honestly (`LLM AGENTIC` vs `RULE FALLBACK`). That honesty is the product foundation.

---

## 2. Phase 0 — Adapter layer (already scaffolded in `lib/connectors/`)

The code ships with **connector stubs** — typed function signatures with the exact contract each production backend must implement. The orchestrator already calls tools by name; replacing a stub is a one-file change, zero pipeline rewrites.

```
lib/connectors/
  ingestion.js    syslog/splunk/elastic/sentinel → normalized RAW ALERT
  enrichment.js   VirusTotal / AbuseIPDB / Shodan / MISP
  sandbox.js      real YARA detonation of the artifact
  siem.js         live Sigma rule queries against the real SIEM
  assets.js       CMDB / AD / LDAP asset criticality lookup
  containment.js  firewall block · EDR isolate · IAM revoke · session kill
```

## 3. Phase 1 — Pilot (weeks 1–2)

- Wire **one** real ingestion source (Syslog or a single EDR webhook) → `/api/incident/stream`. The alert schema already exists.
- Wire **containment for the two highest-value actions**: firewall block + EDR host isolation. These two actually stop a breach.
- Run in **monitoring-only mode**: detect, investigate, recommend — never autonomously execute. Publish an override switch per action.
- Add TLS + auth in front of `server.js` (it is currently an open localhost server — correct for the demo, not for a network).

**Exit criteria:** 100 real alerts/day processed, verdicts benchmarked against the SOC's analysts, zero false autonomously-executed actions.

## 4. Phase 2 — Controlled autonomy (weeks 3–6)

- Split the pipeline into **two speeds** (the latency reality):
  - **Fast path (always-on):** the deterministic rule engine (~1.1s) fires immediate containment on rule-hit + critical asset.
  - **Deep path (parallel):** the LLM swarm (~46s) investigates in the background, refines verdicts, and writes adaptive playbooks.
- Enable autonomous execution **by action type**, throttled and audited: start with `HOST_ISOLATION` and `FW_BLOCK`, hold `CREDENTIAL_REVOKE` behind the human gate.
- Plug real enrichment APIs (VirusTotal/AbuseIPDB) so IOC confidence is grounded in live data.

**Exit criteria:** autonomous actions reviewed weekly, false-positive rate < 1%, governance-gate override rate tracked.

## 5. Phase 3 — Scale-out (months 2–6)

- **Stateless orchestrator** already; add a queue (Kafka/NATS) so alert volume spikes queue instead of dropping.
- **Multi-GPU / multi-node inference** — shard Ollama across GPU clusters (roadmap item in CONTEXT.md).
- **Federated swarms** — privacy-preserving threat-intel sharing across enclaves/tenants (MSSP model).
- **Proactive hunting** — the episodic-memory-driven agents stop waiting for alerts and hunt anomalies continuously.
- **Standard connectors** — Splunk/Elastic/Sentinel/GuardDuty SDKs as first-class integrations.

---

## 6. The honest numbers to stand behind

| Metric | Human Tier-1/2 | TUESDAY (measured) | Improvement |
| :--- | :--- | :--- | :--- |
| MTTR | 42 min | **~46 s** (LLM agentic) / **~1.1 s** (rule path) | **~98%** (~52x) |
| MTTD | 14.5 min | **~0.12 s** | ~98.6% |

These are reproducible via `benchmark.js` and the live Command-Center stopwatch — not slideware.

---

## 7. What we are NOT claiming

- We are not a replacement for a firewall, an EDR, or a SIEM — we orchestrate and reason over them.
- We do not ship cloud keys or telemetry — 100% local is a security requirement, not a limitation.
- We do not claim live breach-catching today — the prototype's inputs and containment are simulated. The adapter layer in this repo is the documented, phased path to making them real.

> **Vision:** the same way a self-driving car needs a car, TUESDAY needs the network's sensors and actuators — and this repo shows the brain that will drive them.
