# TUESDAY — Round 2 Presentation Script
**Presenter:** Abhijith Suresh (Project Lead) · Team TUESDAY
**Deck:** `TUESDAY_Round2_Presentation.pptx` (8 slides) · **Live demo:** `http://localhost:8090`

This script follows the deck slide-by-slide, then adds a live-demo walkthrough and Q&A prep. Bold lines are the key phrases — if time runs short, say the bold parts only.

---

## SLIDE 1 — Team Introduction

> Good morning / good afternoon, judges. We are **Team TUESDAY** — that's not a day of the week, it stands for **Threat Unification Engine for Security Defense And Your SOC**.

**"We built an autonomous, multi-agent AI Security Operations Center — a full SOC brain that runs 100% locally, investigates threats by actually calling security tools, reaches a consensus between 8 AI agents, and either contains the attack itself or escalates it to a human — all in about one second."**

- We're a team of 8 engineers from **[Your College / Institution Name]**, competing in the Cybersecurity domain of Neurobots National Level Hackathon 2026.
- **Our division of labor:** I lead the project and full-stack integration. Aaron owns the backend and API server. Mohammed drives the AI/LLM engineering and the ReAct reasoning loops. Savio built the entire frontend and terminal experience. Aditya made the network twin and data visualizations. Joseph handled security research and attack vectors. Kevin built the threat-intel data and the rule engine. Harigovind owns DevOps, benchmarking, and testing.
- Everything you'll see today is a working prototype — running on this machine — not a mockup.

---

## SLIDE 2 — Problem Statement

**"Cybersecurity operations today have a speed problem, a scale problem, and a cost problem."**

1. **What we're solving:** A modern SOC ingests **10,000+ alerts per day** from EDRs, SIEMs, firewalls, and cloud logs. A Tier-1 analyst spends **15 to 45 minutes per alert** manually correlating indicators across five or more disconnected tools — VirusTotal, AbuseIPDB, MISP, Shodan, the internal asset database. That context-switching is investigation fatigue, and it hides real threats.

2. **Why it matters:** Mean Time to Respond directly drives breach cost — the IBM Cost of a Data Breach report shows every minute of delay is money and data. Ransomware and APT supply-chain attacks reach their destructive payload stage in **under 15 minutes**. If your response takes 45 minutes, you've already lost. And small and mid-size organizations simply can't afford the $100k+ annual licensing for commercial SOAR platforms.

3. **Who needs this:** Tier-1 and Tier-2 SOC analysts who triage alerts all day; MSSPs managing multi-tenant customer environments; and enterprise CSIRTs — even air-gapped defense SOCs, because our solution never needs to touch the internet.

---

## SLIDE 3 — Proposed Solution & Innovation

**"TUESDAY is the answer to all three problems — it's an autonomous, local-first, multi-agent AI SOC."**

**Core solution:** It ingests raw SIEM alerts, breaks each alert into specialized sub-tasks across an **8-agent AI swarm**, executes **real tool calls** — Sigma rules, YARA scans, IOC enrichment, asset lookups — reaches a **weighted consensus**, and then either executes autonomous containment or puts the decision behind a human approval gate.

**What makes it innovative — five points:**

1. **100% local and air-gapped private.** Every agent is a real LLM running on local Ollama with Qwen 2.5. No cloud API keys, no telemetry leaving the machine. That's a first-class requirement for security workloads.
2. **Tool-grounded ReAct loop — zero hallucinations.** Each agent can only render a verdict *after* it calls a real tool and reads the evidence. Tool results are authoritative. If tools say clean, the agent must say clean.
3. **Weighted consensus plus a safety gate.** Four investigation agents vote with confidence scores. We compute a weighted confidence, and any risk score above the 80% threshold on critical infrastructure **hard-forces escalation to a human**. The model never gets to autonomously destroy a domain controller.
4. **Adaptive episodic memory.** After every incident the swarm stores the full episode — alert, actions, outcome — and searches that memory on the next alert, so it literally learns from its own history and synthesizes new playbooks.
5. **A measured 99.9% MTTR reduction** — investigation and response in about 1.1 seconds versus 40+ minutes manually. Those are real numbers from our benchmark harness, which I'll show you.

---

## SLIDE 4 — Technical Architecture

**"Here's the pipeline — this is what happens to every alert."**

1. **Ingestion:** A raw alert from SIEM, EDR, or cloud guard enters over our streaming endpoint — REST plus Server-Sent Events, so the UI updates live.
2. **Orchestration:** The **SOC Coordinator** agent decomposes the alert into tasks and dispatches four specialist agents in parallel — **Log Analysis** (Sigma correlation), **Malware Sandbox** (YARA), **Threat Intelligence** (IOC enrichment), and **Cloud Security** (IAM/CSPM posture).
3. **Reasoning engine:** Each agent runs a **ReAct loop** on the local Ollama engine — think, call a tool, read the result, decide. If Ollama is ever offline, every agent **gracefully falls back to our deterministic rule engine**, so the demo never breaks.
4. **Consensus & governance:** Agents vote. We compute weighted confidence and a risk score, run the approval gate, and either auto-contain or queue for a human.
5. **Response & memory:** The Incident Response agent executes the containment playbook, Compliance seals an audit trail, and the Coordinator predicts the adversary's next move and writes a new playbook into episodic memory.

**The stack:** a **zero-dependency Node.js server** — no npm install, nothing — a vanilla-JS frontend with a Matrix-style terminal theme and Chart.js, Ollama for LLM inference, and a JSON store for memory and reinforcement-learning weights. It runs on a standard workstation.

---

## SLIDE 5 — Current Progress (Proof of Work)

**"This is a working product, and here's the proof."**

- The repository is public on GitHub — `github.com/abhijithsura/TUESDAY` — and the full prototype runs locally on port 8090.
- We built **`verify.bat`**, a one-click health check that syntax-checks every JS file, validates config and the memory store, pings Ollama, and confirms the model is loaded — it reports `ENGINE: LLM AGENTIC` with `qwen2.5:7b`.

**Now let me walk you through the seven completed UI modules** *(this is the feature tour — show each tab as you name it)*:

1. **Command Center (Dashboard).** Live SIEM feed, the agent bus terminal where every agent's reasoning streams in real time, the swarm node graph, and a **live MTTR stopwatch** that starts the moment an alert lands and stops when containment completes — that's how we prove the 1.1-second number live.
2. **Agent Swarm Workspace.** All 8 agents as interactive cards with live reasoning, plus **reinforcement-learning weight sliders** — you can literally tune how much each agent's vote counts.
3. **Digital SOC Twin + PCAP.** An interactive network canvas showing your enclaves and assets, an animated attack path, and a Wireshark-style packet inspector.
4. **MITRE ATT&CK Matrix.** A heatmap of detected techniques; click any TTP for a modal with root-cause analysis and kill-chain stages.
5. **Human Approval Queue.** The governance gate — high-risk actions on critical assets land here, with policy risk-threshold sliders, and one click grants or rejects containment.
6. **Agent Memory & Sandbox.** Episodic incident memory, a semantic memory graph, and a **live YARA/Sigma rule editor**.
7. **Purple Team Simulator.** Pre-built attack drills plus a custom alert injector — that's how we stress-test the swarm.

---

## SLIDE 6 — Live Demo & Verification

**"Let's actually run it. I'll trigger a LockBit ransomware outbreak through the purple team simulator, and you'll watch the swarm investigate in real time."**

**Demo flow — what you'll see on screen:**

1. **Attack injection** — the alert lands in the SIEM feed with its full metadata: source CrowdStrike EDR, target host `FIN-SERVER-04`, and the IOC — a Tor exit node IP.
2. **SSE terminal streams live** — watch the Coordinator announce task decomposition and dispatch the four agents in parallel.
3. **Tool execution, visibly real** — the Sigma engine matches *Suspicious Encoded PowerShell Execution* and *LSASS Memory Dumping*; the YARA sandbox detonates the payload and matches the `win_lockbit3_ransomware` ruleset; Threat Intel enriches the C2 IP across VirusTotal, AbuseIPDB, Shodan, and MISP and attributes it to the LockBit gang; Cloud Security checks the IAM posture.
4. **Consensus voting** — the four agents vote MALICIOUS with confidence scores, the weighted confidence bar climbs, and the risk score is computed.
5. **Governance gate** — high risk on a critical asset escalates to the human approval queue. We click **Approve**, and the Incident Response agent executes containment — host isolation, firewall block of the C2, credential revocation, shadow-copy restore.
6. **Report generation** — we open the executive report with the RCA timeline, kill chain, MITRE mappings, and predicted next TTPs, and we can print it to PDF or export Markdown.

**Demo reliability — why it won't fail on stage:**
- **Zero dependency startup:** `start.bat` launches the server with no npm install at all.
- **`verify.bat`** confirms the model is loaded before we go live.
- **Automatic fallback:** if the LLM ever hiccups, the pipeline continues on the rule engine — the demo never crashes mid-flow.
- **Model pre-warm:** we load `qwen2.5:7b` into VRAM at boot, so the first alert gets an instant response.
- **`GET /api/health`** reports liveness, uptime, model status, and pending approvals — a live health probe.

---

## SLIDE 7 — Challenges & Next Plan

**"Let's be honest about the hard parts — three engineering challenges we actually hit."**

1. **Model JSON output is messy.** Small local 7B models frequently return sloppy or wrapped JSON. We solved it with a **multi-stage `extractJSON()` fallback parser** that unwraps wrapper keys, regex-extracts verdicts and confidences, and normalizes every field — so a malformed response degrades gracefully instead of crashing.
2. **Inference throughput.** Multi-turn LLM reasoning on a single GPU creates a queue under load. We mitigated it with **parallel agent dispatch** and tight prompt/token limits.
3. **Threat-intel API rate limits.** Public free-tier APIs throttle us. We solved it with a **local semantic memory cache** so we never re-query the same IOC twice.

**Our plan before the final round:**
- Wire **live production Threat-Intel keys** (VirusTotal + AbuseIPDB) instead of the seeded offline dataset.
- Build **native SIEM connector plugins** for Splunk, Elastic, and Microsoft Sentinel ingestion.
- Scale inference across **multiple GPUs / an Ollama instance pool**.
- Expand the purple-team scenario library to **15+ MITRE ATT&CK tactics**.
- Run a final multi-run **benchmark** pass and polish the UI charts.

---

## SLIDE 8 — Impact & Future Scope

**"Here's why this matters, and where it goes."**

1. **Business & social impact.** We reduce MTTR from roughly 42 minutes to **1.11 seconds** — a 99.9% improvement — and eliminate $100k+ in annual SOAR licensing and Tier-1 triage overhead. Socially, we're **democratizing enterprise-grade AI defense** for underfunded schools, public-sector organizations, and SMBs — while keeping sensitive security telemetry 100% local and private.
2. **Architectural scalability.** The orchestrator is **stateless**, so it scales horizontally behind a load balancer. Smart IOC caching removes duplicate external calls. And we can shard model inference across GPU clusters.
3. **Future roadmap.** Multi-cloud native remediation (AWS/Azure/GCP IAM and security groups), **federated swarms** that share threat intelligence across enclave boundaries with privacy preserved, and **proactive automated threat hunting** driven by the swarm's own episodic memory.

> **Close:** Judges — we started with a hard operational truth: defenders are outnumbered and out of time. TUESDAY closes that gap with an autonomous, verifiable, local-first AI swarm that investigates in seconds, explains its reasoning, and never takes a dangerous action without human consent. Thank you — we'd love to show you a live run.

---

# Appendix A — Attack Scenarios Deep Dive

The three built-in purple-team scenarios (`attack_sim.js`). Use these during the demo or Q&A.

### 1. SIM-001 — LockBit 3.0 Ransomware Outbreak (CrowdStrike EDR)
- **Story:** Spearphishing executable launched in the Finance Enclave → LSASS credential dumping → shadow copies deleted → file encryption staged.
- **Target:** `FIN-SERVER-04 (192.168.10.45)` · **IOC:** `185.220.101.5` (Tor C2 node)
- **MITRE chain:** T1566 Phishing → T1059 Encoded PowerShell → T1003 LSASS Dump → T1490 Shadow Copy Deletion → T1486 Data Encrypted.
- **Demo beats:** YARA matches `win_lockbit3_ransomware`; Sigma fires *Encoded PowerShell* + *LSASS Dumping*; IOC enrichment flags a Tor exit router with 68/92 VT positives; risk > threshold on a HIGH asset → possible human escalation.

### 2. SIM-002 — AWS S3 Cloud Exfiltration via Leaked IAM Key (AWS GuardDuty)
- **Story:** Stolen AWS access key assumes `DataAdmin` role, bypasses KMS limits, and bulk-downloads S3 buckets.
- **Target:** `AWS-S3-PROD-LOGS (10.0.4.12)` · **IOC:** `193.142.146.35` (malicious proxy)
- **MITRE chain:** T1078 Valid Accounts → T1530 Data from Cloud Storage → T1567 Exfiltration to Web Service.
- **Demo beats:** Sigma fires *AWS STS AssumeRole Exfiltration Anomaly*; Cloud Security agent audits IAM posture; response revokes credentials and blocks the exfil proxy.

### 3. SIM-003 — APT Supply Chain Trojan, SUNBURST Variant (Microsoft Entra ID / SIEM)
- **Story:** Trojanized software-update binary runs quietly inside the domain-controller enclave and opens encrypted DNS-tunnel C2 beaconing.
- **Target:** `DC-PRIMARY-01 (192.168.1.10)` · **IOC:** `45.154.255.87` (APT C2 server)
- **MITRE chain:** T1204 User Execution → T1027 Obfuscated Files → T1071 DNS Tunneling C2 → T1558 Golden Ticket request.
- **Demo beats:** YARA matches `apt29_sunburst_dll`; Threat Intel attributes to **APT29 / Cozy Bear / UNC2452** and campaign *Operation SolarFlare*; target is a **CRITICAL domain controller** → the governance hard rule **forces human escalation** — perfect to show the safety gate.

---

# Appendix B — Q&A Prep (common judge questions)

**Q: Is the AI really doing anything, or is it scripted?**
A: Every agent is a real Qwen 2.5 model on local Ollama running a ReAct loop — it must call `sigma_scan`, `yara_scan`, `ioc_lookup`, etc., and read tool results before it votes. The UI streams the actual tool calls live. If you pull the LLM plug, you see the honest fallback: a deterministic rule engine, clearly labeled `ENGINE: RULE FALLBACK`.

**Q: How is consensus computed?**
A: Four investigation agents vote (MALICIOUS / SUSPICIOUS / CLEAN / INCONCLUSIVE) with a 0–100 confidence. Weighted confidence = Σ(confidence × agent weight) ÷ Σ(weight), where weights are the RL sliders. Risk score = max(weighted confidence, consensus agreement %). Threshold defaults to 80.

**Q: When does it escalate to a human?**
A: Two hard rules plus a gray zone: risk above threshold **on a CRITICAL asset** → always escalate; risk within threshold on non-critical → always autonomous; otherwise the Human Governance LLM agent decides. A human can always override.

**Q: What about privacy / data exfiltration of the SOC data itself?**
A: Everything runs on localhost. No API keys, no cloud calls, model inference on local Ollama. This is a deliberate architecture choice for security workloads.

**Q: Where did the 1.11-second MTTR number come from?**
A: `benchmark.js` replays the three scenarios through the pipeline and records per-run latency, consensus agreement, and tool calls. Averages from a measured run are recorded in `BENCHMARK_REPORT.md` — reproducible with `node benchmark.js`.

**Q: What if you don't have a GPU?**
A: Switch the model to `qwen2.5:3b` in `config.json` — it runs on CPU. The 7b default needs ~8GB VRAM (e.g. an RTX 4060) or 16GB RAM.

**Q: Real SIEM integration?**
A: The API is connector-agnostic (REST + SSE). Our roadmap adds native Splunk/Elastic/Sentinel webhook connectors; today the alert feed and purple-team injector act as the SIEM surface.
