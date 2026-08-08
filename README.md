# TUESDAY

**Threat Unification Engine for Security Defense And Your SOC** — an autonomous, multi-agent security operations center.

TUESDAY simulates a full SOC orchestration pipeline: it ingests alerts, decomposes them with a swarm of specialized AI agents, runs real threat-intel tool calls, reaches a weighted consensus, and autonomously (or human-gated) executes containment — all while streaming its live reasoning to the web UI.

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
index.html            Web UI
styles.css            UI theme
app.js                Front-end controller (tabs, charts, terminals)
showcase.js           Visual guided tour
attack_sim.js         Purple-team scenario definitions
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — deep dive into the multi-agent orchestration pipeline, consensus model, and governance flow.
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** — every REST + SSE endpoint, request/response shapes, and the frontend trigger flow.
- **[BENCHMARK_REPORT.md](BENCHMARK_REPORT.md)** — performance evaluation criteria and how to reproduce the numbers with `node benchmark.js`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ENGINE` shows rule-engine fallback | Ollama isn't running, or the model isn't pulled. Start Ollama, run `ollama pull qwen2.5:7b`, and check `http://localhost:11434/api/tags` |
| Model call hangs/times out | Increase `timeoutMs`/`numCtx` in `config.json`, or switch to a smaller model (`qwen2.5:3b`) |
| Out of VRAM on 7b | Use `qwen2.5:3b`, or pull the `q4_0` quant (`ollama pull qwen2.5:7b:q4_0`) and set `"model": "qwen2.5:7b:q4_0"` |
| Agents give weak answers | Try `qwen2.5:14b`, or increase `maxTurns` so agents can make more tool calls |
