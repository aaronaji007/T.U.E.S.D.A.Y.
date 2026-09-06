# TUESDAY

**Threat Unification Engine for Security Defense And Your SOC** — an autonomous, multi-agent security operations center.

TUESDAY simulates a full SOC orchestration pipeline: it ingests alerts, decomposes them with a swarm of specialized AI agents, runs real threat-intel tool calls, reaches a weighted consensus, and autonomously (or human-gated) executes containment — all while streaming its live reasoning to the web UI.

**1st place, Cyber Security — Neurobots National Hackathon 2026.**

---

## 🌟 What Makes TUESDAY Stand Out?

1. **100% Local & Air-Gapped Privacy**
   Every agent is a real Large Language Model (Qwen 2.5) running locally via Ollama. No cloud APIs, no API keys, and no telemetry leaves your machine. This is a deliberate and critical requirement for handling sensitive security workloads without risking data exfiltration.

2. **True Agentic AI with ReAct Loop (Zero Hallucinations)**
   These aren't canned scripts. Agents use a genuine ReAct (Reason → Act) loop. They read an alert, decide to call a real tool (like Sigma rule scans, YARA malware scans, or IOC lookups), and wait for the tool's authoritative response before reaching a verdict. Fabricated detections are structurally impossible because tool evidence overrides AI assumptions.

3. **Weighted Consensus & Human-in-the-Loop Governance**
   Four different specialist agents investigate in parallel and vote with a confidence score. If the calculated risk is high and targets critical infrastructure, TUESDAY **hard-forces an escalation to a human**. The AI can never autonomously take down a core domain controller, ensuring safety and compliance.

4. **Adaptive Episodic Memory**
   The swarm learns from its history. Every incident's alert, root cause, and outcome is stored. On future alerts, agents search this memory to synthesize new, adaptive playbooks based on past successes, creating a self-improving defense mechanism.

5. **Sub-Second MTTR & Graceful Fallback**
   TUESDAY slashes Mean Time To Respond (MTTR) from 40+ minutes (human tier-1) to ~46 seconds (LLM agentic). If the LLM goes offline, the system gracefully degrades to a deterministic rule engine (completing in ~1.1s), ensuring the SOC pipeline never breaks during a live attack.

---

## 🚀 Core Features

- **Multi-Agent Orchestration**: An 8-agent pipeline including a Coordinator, Log Analysis, Threat Intel, Malware Sandbox, Cloud Security, Incident Response, Compliance, and Human Governance.
- **6 Integrated Security Tools**: Exposes real tools to models via native `tool_calls` (`sigma_scan`, `yara_scan`, `ioc_lookup`, `asset_lookup`, `episodic_search`, `ttp_lookup`).
- **Autonomous Containment**: Automatically executes playbooks like Host Isolation, Firewall IP Block, Credential Revocation, and Shadow Copy Restore.
- **7 Interactive UI Modules**: Includes a Command Center with a live streaming agent-bus, a digital SOC twin with interactive network canvases, MITRE ATT&CK heatmaps, and a human approval queue.
- **Purple Team Simulator**: Comes with built-in attack drills (LockBit Ransomware, AWS S3 Exfiltration, APT Supply Chain) to stress-test the swarm.
- **Zero-Dependency Architecture**: Runs on a pure Node.js HTTP + SSE backend. No heavy `node_modules` required for the core server.

---

## 🏗️ How to Build Upon This (Future Roadmap)

TUESDAY is built to scale from a hackathon MVP to a production-grade enterprise SOC tool. Here is how you can expand and improve it:

### 1. Direct Integrations (The Adapter Layer)
Currently, ingestion and containment use simulated adapter stubs (`lib/connectors/`). You can wire real tools with zero pipeline rewrites:
- **Live Threat-Intel APIs**: Replace offline datasets with real VirusTotal, AbuseIPDB, and Shodan API keys for live enrichment.
- **Native SIEM Connectors**: Add webhooks for Splunk, Elastic, and Microsoft Sentinel to ingest real enterprise alerts.
- **Real Containment Actions**: Hook up the Incident Response agent to real CrowdStrike/SentinelOne EDR APIs for host isolation, or Palo Alto APIs for firewall blocking.

### 2. Advanced AI Capabilities
- **RAG & Long-Term Memory**: Implement a vector database (e.g., ChromaDB, Milvus) for semantic retrieval over millions of past enterprise incidents, allowing proactive threat hunting.
- **Federated Swarms**: Enable privacy-preserving threat-intel sharing across different organizations or MSSP tenants without exposing raw logs.
- **Team-of-Experts Debate**: Introduce cross-examination rounds where agents debate conflicting evidence before reaching a final consensus.
- **Multi-GPU Inference**: Implement Ollama instance sharding to support massive alert throughput in enterprise environments.

### 3. Productization & Enterprise Readiness
- **Auto-Remediation for Cloud**: Expand the Cloud Security agent to natively mutate AWS/Azure IAM policies and security groups.
- **Jupyter/SOAR Export**: Allow agents to hand off generated adaptive playbooks directly to Jira, ServiceNow, or existing SOAR platforms.
- **Hardened Packaging**: Wrap the ecosystem in Docker Compose with TLS/HTTPS, authentication, and Role-Based Access Control (RBAC) for multi-tenant support.

---

## ☁️ Cloud APIs vs Local Models (Vercel Support)

TUESDAY is built to run 100% locally with Ollama for data privacy, but you can dynamically switch it to use **OpenAI** or **Google Gemini** APIs. This is especially useful if you want to deploy the dashboard to Vercel for public demos.

You can switch the engine dynamically right from the **dropdown menu in the UI's top Command Center**.

To use Cloud APIs, simply set the following environment variables (either in your terminal before running, or in your Vercel Dashboard):

**For OpenAI:**
- `OPENAI_API_KEY`: Your OpenAI API key.
- `OPENAI_MODEL`: (Optional) Defaults to `gpt-4o-mini`.

**For Google Gemini:**
- `GEMINI_API_KEY`: Your Gemini API key.
- `GEMINI_MODEL`: (Optional) Defaults to `gemini-1.5-flash`.

*Note: If deployed to Vercel, TUESDAY automatically detects the cloud environment and defaults to API mode (prioritizing Gemini if `GEMINI_API_KEY` is found, otherwise OpenAI).*

---

## 💻 Quick Start & Setup

**Requirements:** Node.js 20+ and [Ollama](https://ollama.com/download)

1. **Pull the model:**
   ```bat
   ollama pull qwen2.5:7b
   ```
   *(For lower-spec machines, pull `qwen2.5:3b` and update `config.json`)*

2. **Run setup:**
   ```bat
   setup.bat
   ```

3. **Verify environment:**
   ```bat
   verify.bat
   ```

4. **Start the swarm:**
   ```bat
   start.bat
   ```
   The UI will be available at `http://localhost:8090`.

---

## 📁 Documentation & Project Structure

- `server.js` & `lib/`: Zero-dependency Node HTTP server and the backend multi-agent engine.
- `index.html` & `app.js`: Web UI, dashboards, and agent visualization.
- **[CONTEXT.md](CONTEXT.md)**: Deep dive into the problem, solution, and architecture.
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Detailed breakdown of agent roles, consensus models, and the ReAct pipeline.
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**: REST + SSE endpoint references.
- **[BENCHMARK_REPORT.md](BENCHMARK_REPORT.md)**: Performance metrics and MTTR reproducibility.
