# TUESDAY System Architecture & Technical Specification

## 1. System Overview
**TUESDAY** (Autonomous Multi-Agent Security Operations Center Intelligence Platform) is a production-grade, collaborative multi-agent cybersecurity ecosystem. It autonomously ingests SIEM security alerts, decomposes investigation workflows across specialized intelligent agents, performs multi-source threat intelligence enrichment, generates root cause analysis, maps MITRE ATT&CK TTPs, and executes automated containment playbooks with human-in-the-loop governance.

---

## 2. Multi-Agent Swarm Architecture

```
                               ┌─────────────────────────────┐
                               │  SIEM / EDR / Cloud Alerts  │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │     SOC Coordinator Agent   │
                               │  (Task Decomposition Engine)│
                               └──────────────┬──────────────┘
                                              │
         ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
         │                  │                 │                  │                  │
         ▼                  ▼                 ▼                  ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌────────────────┐
│  Log Analysis   │ │ Threat Intel  │ │Malware Sandbox│ │ Cloud Security  │ │  Compliance    │
│  Agent (Sigma)  │ │ Agent (VT/Ab) │ │ Agent (YARA)  │ │ Agent (AWS STS) │ │ Agent (GDPR)   │
└────────┬────────┘ └───────┬───────┘ └───────┬───────┘ └────────┬────────┘ └───────┬────────┘
         │                  │                 │                  │                  │
         └──────────────────┴─────────────────┼──────────────────┴──────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │ Human Approval / Governance │
                               │  (Risk Threshold Evaluator) │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │  Incident Response Agent    │
                               │(EDR Isolation & FW Block)   │
                               └─────────────────────────────┘
```

---

## 3. Specialized Agent Roles & Capabilities

1. **SOC Coordinator Agent (`agent-coord`)**
   - **Role:** Central orchestrator and task decomposition manager.
   - **Functions:** Decomposes incoming security alerts into sub-tasks, assigns roles across specialized agents, synthesizes agent consensus, computes global confidence scores.

2. **Threat Intelligence Agent (`agent-intel`)**
   - **Role:** Deep enrichment of Indicators of Compromise (IOCs).
   - **Integrations:** VirusTotal v3 REST API, AbuseIPDB v2 Reputation, Shodan Host Scanner, MISP Threat Feed.
   - **Memory:** Queries and populates Semantic Threat Memory and IOC Cache.

3. **Log Analysis Agent (`agent-log`)**
   - **Role:** Log correlation, time-series anomaly detection, and rule evaluation.
   - **Engine:** Evaluates Sigma Rule patterns against raw EDR/SIEM event logs.

4. **Malware Analysis Agent (`agent-malware`)**
   - **Role:** Binary payload inspection and behavioral sandbox analysis.
   - **Engine:** YARA pattern scanner matching malware families (LockBit, SUNBURST, Cobalt Strike).

5. **Cloud Security Agent (`agent-cloud`)**
   - **Role:** Audits cloud security posture and IAM anomalies.
   - **Scope:** AWS CloudTrail, GuardDuty, STS AssumeRole exfiltration, S3 KMS data access auditing.

6. **Incident Response Agent (`agent-response`)**
   - **Role:** Executes automated containment actions and SOAR playbooks.
   - **Actions:** Host network interface isolation via EDR API, perimeter firewall IP block, active session revoking, rollback tracking.

7. **Compliance & Audit Agent (`agent-compliance`)**
   - **Role:** Regulatory compliance assessment and immutable audit logging.
   - **Scope:** GDPR Article 33 72-hour breach SLA, HIPAA PHI protection, PCI-DSS enclave safety.

8. **Human Approval & Governance Agent (`agent-approval`)**
   - **Role:** Safety threshold gate and human override controller.
   - **Logic:** Evaluates risk score vs policy thresholds (e.g. Risk > 80/100 auto-execute, unless target asset is a core Domain Controller).

---

## 4. Multi-Tier Agent Memory Architecture

- **Episodic Memory:** Records past incident resolution histories, MTTR metrics, and playbook outcomes to accelerate future investigations.
- **Semantic Memory:** Graph of enterprise assets, criticality ranks, threat actor TTP mappings, and zero-day threat intelligence.
- **IOC Cache:** In-memory high-speed cache for external threat lookup responses.
- **Organizational Knowledge Base:** Security policies, escalation trees, and dynamic playbook templates.

---

## 5. Security & Non-Functional Features

- **Low Response Latency:** Sub-1.5s average end-to-end incident investigation and containment.
- **Human-in-the-Loop Safety:** Automatic escalation for high-impact infrastructure changes.
- **Explainability:** Complete step-by-step decision reasoning, MITRE ATT&CK mapping, and confidence scores for every action.
- **Auditability:** Complete cryptographic timestamped audit log.
