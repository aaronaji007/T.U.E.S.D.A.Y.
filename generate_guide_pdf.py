import os
import sys
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class TuesdayGuidePDF(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        # Register Arial fonts from Windows
        self.add_font('ArialCustom', '', r'C:\Windows\Fonts\arial.ttf')
        self.add_font('ArialCustom', 'B', r'C:\Windows\Fonts\arialbd.ttf')
        self.add_font('ArialCustom', 'I', r'C:\Windows\Fonts\ariali.ttf')
        self.add_font('ArialCustom', 'BI', r'C:\Windows\Fonts\arialbi.ttf')
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(15, 18, 15)

    def header(self):
        if self.page_no() == 1:
            return  # Skip header on cover page
        self.set_font('ArialCustom', 'B', 8)
        self.set_text_color(100, 116, 139) # slate-500
        self.cell(0, 6, 'PROJECT T.U.E.S.D.A.Y.  |  TACTICAL AUTONOMOUS MULTI-AGENT CYBER DEFENSE', border=0, align='L')
        self.set_font('ArialCustom', '', 8)
        self.cell(0, 6, 'TECHNICAL & PRESENTATION GUIDE', border=0, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.3)
        self.line(15, 14, 195, 14)
        self.ln(3)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.3)
        self.line(15, 283, 195, 283)
        self.set_font('ArialCustom', '', 8)
        self.set_text_color(148, 163, 184) # slate-400
        self.cell(0, 8, 'Confidential & Proprietary  —  Project Guide: Ajeesh S', border=0, align='L')
        self.cell(0, 8, f'Page {self.page_no()}', border=0, align='R')

    def chapter_title(self, num, title):
        self.ln(4)
        self.set_fill_color(15, 23, 42) # slate-900
        self.set_text_color(255, 255, 255)
        self.set_font('ArialCustom', 'B', 12)
        full_title = f"  SECTION {num}: {title.upper()}"
        self.cell(0, 9, full_title, fill=True, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(4)

    def section_heading(self, title):
        self.ln(2)
        self.set_font('ArialCustom', 'B', 11)
        self.set_text_color(14, 116, 144) # cyan-700
        self.cell(0, 7, title, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1)

    def subheading(self, title):
        self.set_font('ArialCustom', 'B', 9.5)
        self.set_text_color(30, 41, 59) # slate-800
        self.cell(0, 6, title, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1)

    def body_p(self, text):
        self.set_font('ArialCustom', '', 9)
        self.set_text_color(51, 65, 85) # slate-700
        self.multi_cell(0, 4.6, text)
        self.ln(2)

    def bullet(self, bold_prefix, text):
        self.set_font('ArialCustom', 'B', 9)
        self.set_text_color(30, 41, 59)
        self.cell(6, 4.6, "•", border=0, align='L')
        self.cell(self.get_string_width(bold_prefix) + 1, 4.6, bold_prefix, border=0)
        self.set_font('ArialCustom', '', 9)
        self.set_text_color(51, 65, 85)
        rem_width = 180 - self.get_string_width(bold_prefix) - 7
        self.multi_cell(rem_width, 4.6, text)
        self.ln(1.5)

    def callout_box(self, title, text, kind='info'):
        self.ln(2)
        # Choose colors based on kind
        if kind == 'alert':
            border_c = (239, 68, 68)   # red-500
            bg_c = (254, 242, 242)     # red-50
            title_c = (185, 28, 28)    # red-700
        elif kind == 'success':
            border_c = (16, 185, 129)  # emerald-500
            bg_c = (236, 253, 245)     # emerald-50
            title_c = (4, 120, 87)     # emerald-700
        elif kind == 'warning':
            border_c = (245, 158, 11)  # amber-500
            bg_c = (255, 251, 235)     # amber-50
            title_c = (180, 83, 9)     # amber-700
        else: # info / cyan
            border_c = (6, 182, 212)   # cyan-500
            bg_c = (240, 253, 250)     # cyan-50
            title_c = (14, 116, 144)   # cyan-700

        self.set_fill_color(*bg_c)
        self.set_draw_color(*border_c)
        self.set_line_width(0.6)

        x = self.get_x()
        y = self.get_y()
        w = 180
        # Calculate height roughly
        self.set_font('ArialCustom', 'B', 9)
        # Draw box rect
        # We can write title and multi_cell inside
        self.rect(x, y, w, 16, style='DF')
        self.set_xy(x + 4, y + 2)
        self.set_text_color(*title_c)
        self.cell(w - 8, 4.5, title, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_xy(x + 4, y + 7.5)
        self.set_font('ArialCustom', '', 8.5)
        self.set_text_color(51, 65, 85)
        self.multi_cell(w - 8, 4, text)
        self.set_y(y + 19)

    def draw_cover_page(self):
        self.add_page()
        # Dark Hero Top Box
        self.set_fill_color(15, 23, 42) # slate-900
        self.rect(0, 0, 210, 100, style='F')

        # Top tag
        self.set_xy(15, 20)
        self.set_font('ArialCustom', 'B', 10)
        self.set_text_color(34, 211, 238) # cyan-400
        self.cell(0, 6, "AUTONOMOUS CYBER DEFENSE & ADVERSARY INTELLIGENCE PLATFORM", border=0, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Title
        self.set_xy(15, 30)
        self.set_font('ArialCustom', 'B', 26)
        self.set_text_color(255, 255, 255)
        self.cell(0, 12, "PROJECT T.U.E.S.D.A.Y.", border=0, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Subtitle
        self.set_xy(15, 44)
        self.set_font('ArialCustom', 'I', 12)
        self.set_text_color(148, 163, 184) # slate-400
        self.cell(0, 7, "Tactical Unified Edge System for Defense & Autonomous Yield", border=0, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Badge pill
        self.set_xy(15, 56)
        self.set_font('ArialCustom', 'B', 9)
        self.set_fill_color(30, 41, 59)
        self.set_text_color(52, 211, 153) # emerald-400
        self.cell(90, 7, "  9-AGENT SWARM  |  3-TIER INFERENCE  |  SUB-3s MTTR  ", fill=True, border=0, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Guide & Meta Bar
        self.set_xy(15, 75)
        self.set_font('ArialCustom', 'B', 9.5)
        self.set_text_color(226, 232, 240)
        self.cell(50, 6, "Project Guide:", border=0)
        self.cell(0, 6, "Ajeesh S", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.set_xy(15, 82)
        self.set_font('ArialCustom', '', 8.5)
        self.set_text_color(148, 163, 184)
        self.cell(50, 5, "Deployment Target:", border=0)
        self.cell(0, 5, "Live Vercel Cloud Serverless + Edge Sovereign Standalone", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.set_xy(15, 88)
        self.cell(50, 5, "Document Purpose:", border=0)
        self.cell(0, 5, "Complete Architecture, Working Features, Teammate Training & Expo Guide", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Main Body on Cover
        self.set_y(112)
        self.set_font('ArialCustom', 'B', 14)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, "EXECUTIVE SUMMARY", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_draw_color(14, 116, 144)
        self.set_line_width(0.8)
        self.line(15, 122, 60, 122)
        self.ln(4)

        self.body_p(
            "Project T.U.E.S.D.A.Y. represents an unprecedented shift from passive, alert-fatigued Security Operations "
            "Centers (SOCs) to fully autonomous, multi-agent cybernetic defense. Traditional enterprise SOCs suffer from a "
            "crippling Mean Time to Remediation (MTTR) of 16 to 24 hours, overwhelmed by thousands of fragmented SIEM alerts. "
            "T.U.E.S.D.A.Y. automates the complete SOC lifecycle — from initial telemetry ingestion and threat intelligence "
            "enrichment to memory disassembly, adversarial hypothesis challenging, and SOAR containment — executing in under 3 seconds."
        )

        self.body_p(
            "Designed with dual-sector parity, the platform pairs an autonomous Blue Team Sentinel Defense SOC with a built-in "
            "Red Team Adversary Attack Suite. The application incorporates a 3-Tier Resilient Inference Architecture: "
            "streaming real-time LLM reasoning from Google Gemini API on Vercel Serverless, running air-gapped Small Language "
            "Models (SLMs) locally, or executing 100% on-device via the In-Browser Sovereign Swarm with zero external backend dependencies."
        )

        self.ln(2)
        # Quick Facts Grid
        self.set_fill_color(248, 250, 252) # slate-50
        self.set_draw_color(226, 232, 240)
        self.rect(15, 168, 180, 48, style='DF')

        self.set_xy(20, 172)
        self.set_font('ArialCustom', 'B', 10)
        self.set_text_color(14, 116, 144)
        self.cell(0, 6, "CORE METRICS & PLATFORM CAPABILITIES AT A GLANCE", border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        metrics = [
            ("Autonomous Agents:", "9 Specialized LLM / Heuristic Roles operating concurrently with ACH deliberation"),
            ("Mean Time to Remediation:", "Sub-3.0 seconds (MTTR) vs. Industry Average of 16.2 hours (99.8% reduction)"),
            ("Inference Architecture:", "3-Tier: Cloud Gemini API -> Local Air-Gap SLM -> In-Browser Sovereign Swarm"),
            ("Built-in Tooling:", "Sigma Rules Engine, YARA Scanner, VirusTotal v3, AbuseIPDB, Shodan, MISP Threat Sharing"),
            ("Safety Guardrails:", "Human-in-the-Loop (HITL) Governance Gate for Tier-0 Core Infrastructure"),
            ("Visualization:", "Live Digital SOC Twin 2D Canvas & Real-time PCAP Wireshark Packet Inspection")
        ]
        self.set_xy(20, 180)
        for label, val in metrics:
            self.set_font('ArialCustom', 'B', 8.5)
            self.set_text_color(30, 41, 59)
            self.cell(46, 5, label, border=0)
            self.set_font('ArialCustom', '', 8.5)
            self.set_text_color(71, 85, 105)
            self.cell(0, 5, val, border=0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_x(20)

        # Footer badge on cover
        self.set_xy(15, 235)
        self.callout_box(
            "EXPO READINESS ASSURANCE (ZERO-BACKEND GUARANTEE)",
            "During live project expos, conferences, or judging sessions where a local Python server is not installed, "
            "T.U.E.S.D.A.Y. automatically activates the In-Browser Sovereign Swarm. All 9 agents, Sigma scans, YARA analyses, "
            "digital twin updates, audio speech, and containment actions run smoothly in any modern web browser.",
            kind='success'
        )

def build_pdf():
    pdf = TuesdayGuidePDF()
    pdf.draw_cover_page()

    # =========================================================================
    # PAGE 2: SYSTEM ARCHITECTURE & DUAL SECTORS
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(1, "Dual-Sector System Architecture")

    pdf.body_p(
        "Project T.U.E.S.D.A.Y. is architected into two seamlessly integrated operational sectors accessible from a unified "
        "mission-control interface:"
    )

    pdf.section_heading("1.1 Blue Team Defense SOC (Sentinel)")
    pdf.body_p(
        "The Sentinel Defense SOC represents the primary operational theater. It visualizes the live defense posture, streams real-time "
        "forensic logs from the multi-agent bus, tracks the live MTTR stopwatch, renders the Digital SOC Twin topology, and presents the "
        "consensus confidence meters, MITRE ATT&CK kill chain progression, and Human-in-the-Loop (HITL) approval queue."
    )
    pdf.bullet("Live Event Feed: ", "SIEM telemetry ingestion from CrowdStrike EDR, AWS CloudTrail, Zeek IDS, and Windows Event Logs.")
    pdf.bullet("Digital SOC Twin: ", "Interactive canvas depicting internal networks (Tier-0 Domain Controllers, Finance Servers, Workstations, and Cloud Enclaves).")
    pdf.bullet("Forensic Matrix: ", "Real-time Root Cause Analysis (RCA) timeline, predicted upcoming MITRE TTPs, and auto-synthesized SOAR playbooks.")

    pdf.section_heading("1.2 Red Team Offense Attack Suite")
    pdf.body_p(
        "The Red Team sector serves as the adversary simulation ground. It allows security analysts, penetration testers, and judges "
        "to trigger weaponized threat simulations across 5 real-world attack vectors. When an attack is launched from this sector, "
        "the synthetic payload is transmitted across the internal event bus to Sentinel, demonstrating immediate real-time detection, "
        "deliberation, and autonomous containment."
    )

    pdf.section_heading("1.3 High-Level Data Flow Pipeline")
    pdf.body_p(
        "The lifecycle of a security event follows a rigorous 6-phase pipeline from initial intrusion to cryptographic closure:"
    )

    pipeline_steps = [
        ("Phase 1: Alert Ingestion & Decomposition", "The SOC Coordinator receives the raw SIEM event, parses indicators, initializes the MTTR timer, and broadcasts task specifications to specialized investigation agents."),
        ("Phase 2: Parallel Multi-Vector Investigation", "Four specialized agents (Log, ThreatIntel, Malware, Cloud) query deterministic tool engines (Sigma, YARA, VT, AbuseIPDB, Shodan) in parallel."),
        ("Phase 3: Weighted Consensus & Risk Evaluation", "Agent votes (MALICIOUS vs. CLEAN) are evaluated against Bayesian confidence weights to produce an authoritative Risk Score (0-100)."),
        ("Phase 4: Adversarial Critic Verification", "The Adversarial Critic challenges the consensus against benign administrative hypotheses (scheduled backup, pen-test) using Analysis of Competing Hypotheses (ACH)."),
        ("Phase 5: Human Governance Gate & SOAR Response", "If risk exceeds threshold on core assets (DC, FinServer), the action escalates to the HITL Queue; otherwise, 4 automated SOAR actions execute autonomously."),
        ("Phase 6: Compliance Audit & Playbook Synthesis", "GDPR Art 33 breach SLAs are logged, audit logs are sealed with SHA-256 HMAC, and a dynamic 6-step incident remediation playbook is generated.")
    ]

    for p_title, p_desc in pipeline_steps:
        pdf.bullet(f"{p_title}: ", p_desc)

    # =========================================================================
    # PAGE 3 & 4: THE 9-AGENT SWARM
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(2, "The 9-Agent Autonomous Swarm")

    pdf.body_p(
        "Rather than relying on a single monolithic LLM that is prone to hallucinations and reasoning blindspots, T.U.E.S.D.A.Y. "
        "deploys a heterogeneous multi-agent swarm where each agent is bound to a specific domain, toolset, and behavioral objective:"
    )

    agents = [
        ("1. SOC Coordinator", "#3E7A84", "Swarm Orchestration & Task Decomposition",
         "Ingests SIEM alerts, decomposes the incident into targeted investigative sub-tasks, dispatches parallel agents, calculates the consensus weighted risk score, and synthesizes dynamic response playbooks and future TTP predictions."),

        ("2. Log Analysis Agent", "#4A8CA8", "SIEM Correlation & Sigma Rules Engine",
         "Parses process execution telemetry, command-line arguments, and Windows Security Event logs. Evaluates telemetry against the embedded Sigma rule engine to identify encoded PowerShell, LSASS dumping, or credential harvesting."),

        ("3. Threat Intelligence Agent", "#B08C9E", "IOC Enrichment & External OSINT",
         "Extracts network Indicators of Compromise (IPs, domains, hashes) and cross-references them against global threat feeds: VirusTotal (vendor detection ratio), AbuseIPDB (confidence score & reports), Shodan (open ports & banners), and MISP."),

        ("4. Malware Sandbox Agent", "#EEA4A5", "YARA Disassembly & Heuristics",
         "Performs static and behavioral inspection of payloads and process memory. Executes pattern-matching rulesets across memory dumps to identify known ransomware strains (LockBit 3.0), wiper scripts, and supply-chain backdoors (SUNBURST)."),

        ("5. Cloud Security Agent", "#7FB3BB", "AWS/Azure IAM & CSPM Posture Audit",
         "Audits cloud-native events across AWS CloudTrail and Azure Activity logs. Detects STS AssumeRole anomalies, unauthorized cross-account role assumption, privilege escalation, and bulk S3 data siphoning."),

        ("6. Adversarial Critic", "#D97706", "Hypothesis Verification & FP Disprover",
         "Acts as the swarm's internal 'devil's advocate' utilizing Analysis of Competing Hypotheses (ACH). Formulates counter-hypotheses (e.g., 'Is this an authorized sysadmin backup?') and audits evidence before certifying malicious intent."),

        ("7. Human Governance Gate", "#3E7A84", "Risk Threshold & Override Control",
         "Enforces safety guardrails. Evaluates the consensus risk score against the organizational threshold (default 80/100). On Tier-0 assets (Domain Controllers, core databases), it halts automated destruction and escalates to human approval."),

        ("8. Incident Response Agent", "#FD4040", "Autonomous Containment & SOAR Playbooks",
         "Executes verified mitigation actions: host network adapter isolation via EDR API, perimeter firewall IP drop (Palo Alto PAN-OS), domain credential session revocation, and Volume Shadow Copy rollback dry-runs."),

        ("9. Compliance Audit Agent", "#C97A7C", "Regulatory Impact & Cryptographic Audit",
         "Evaluates incident severity against regulatory standards: GDPR Article 33 (72-hour supervisory authority breach notification), PCI-DSS Requirement 10, and HIPAA. Generates immutable SHA-256 HMAC cryptographic audit logs.")
    ]

    for name, col, role, desc in agents[:5]:
        pdf.subheading(f"{name} — {role}")
        pdf.body_p(desc)

    pdf.add_page()
    for name, col, role, desc in agents[5:]:
        pdf.subheading(f"{name} — {role}")
        pdf.body_p(desc)

    pdf.section_heading("2.1 Deliberation & Analysis of Competing Hypotheses (ACH)")
    pdf.body_p(
        "A critical innovation in T.U.E.S.D.A.Y. is ACH deliberation. In conventional AI systems, confirmation bias leads to high "
        "false-positive rates. In T.U.E.S.D.A.Y., each agent maintains dual competing hypotheses:\n"
        "• Hypothesis 1 (H1 - Malicious): The activity represents an active adversary intrusion attempt.\n"
        "• Hypothesis 2 (H2 - Benign): The activity represents authorized administrative automation or scheduled diagnostic testing.\n"
        "The Adversarial Critic verifies whether specific counter-evidence (such as an approved Change Management ticket or valid code "
        "signing certificate) exists. Only when H2 is conclusively refuted does the critic certify the threat as CONFIRMED_THREAT."
    )

    pdf.callout_box(
        "CONFIDENCE WEIGHTING FORMULA",
        "RiskScore = max( WeightedConfidence, ConsensusPercentage )\n"
        "WeightedConfidence = Sum(AgentConfidence_i * AgentWeight_i) / Sum(AgentWeight_i)\n"
        "Agents that uncover verified forensic evidence (e.g., YARA or VirusTotal positive hits) receive higher Bayesian weights.",
        kind='info'
    )

    # =========================================================================
    # PAGE 5: 3-TIER INFERENCE ARCHITECTURE
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(3, "3-Tier Resilient Inference Architecture")

    pdf.body_p(
        "One of the greatest challenges with AI applications is reliance on continuous cloud connectivity or heavy local GPU hardware. "
        "T.U.E.S.D.A.Y. solves this through a robust 3-Tier Inference Architecture with automatic dynamic fallback:"
    )

    tiers = [
        ("Tier 1: Cloud Online (Google Gemini 2.5 Flash via Vercel Serverless)",
         "Designed for production cloud deployments. The browser connects via Server-Sent Events (SSE) to /api/incident/stream hosted on Vercel. "
         "The serverless Node backend invokes Google Gemini 2.5 Flash for rapid, multi-turn reasoning and tool invocation, streaming agent "
         "logs with sub-second latency back to the client."),

        ("Tier 2: Local Air-Gap SLM (Ollama / vLLM / Local Native Server)",
         "Designed for secure, classified, or air-gapped enterprise environments. Connects to a locally hosted Small Language Model "
         "(e.g., Llama 3 8B, Mistral 7B, or DeepSeek R1) running via Ollama on port 11434. Telemetry and logs never exit the on-premise network."),

        ("Tier 3: In-Browser Sovereign Swarm (Zero Backend Dependency — Expo Mode)",
         "Designed specifically for project expos, offline kiosks, and client-side demonstrations. If neither Gemini nor a local Python "
         "server is reachable, the frontend transparently executes the entire 9-agent swarm directly in the browser's JavaScript V8 runtime. "
         "All Sigma rules, YARA signatures, OSINT mock databases, and SOAR containment playbooks execute locally with zero latency.")
    ]

    for t_title, t_desc in tiers:
        pdf.subheading(t_title)
        pdf.body_p(t_desc)

    pdf.callout_box(
        "AUTOMATIC FAILOVER LOGIC",
        "When an incident alert is triggered, SwarmEngine.processIncidentAlert() immediately tests backend health (/api/status). "
        "If the backend fails or disconnects mid-stream, the engine logs: 'CLOUD BACKEND DISCONNECTED: Activating On-Device Sovereign Swarm.' "
        "The investigation continues without interruption — judges will never see an error message or broken screen.",
        kind='success'
    )

    # =========================================================================
    # PAGE 6: SECURITY TOOLS & DIGITAL TWIN
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(4, "Built-In Security Tools & Digital SOC Twin")

    pdf.body_p(
        "T.U.E.S.D.A.Y. integrates standard cybersecurity forensic engines directly into its multi-agent workflow:"
    )

    tools = [
        ("Sigma Rules Engine (SIEM Correlation)",
         "Implements standard Sigma rule matching over event logs. Built-in rules include SIGMA-2026-001 (Suspicious Encoded PowerShell Execution), "
         "SIGMA-2026-002 (LSASS Memory Dumping via Mimikatz / ProcDump), and SIGMA-2026-003 (AWS STS AssumeRole Exfiltration Anomaly)."),

        ("YARA Behavioral Sandbox Scanner",
         "Scans process memory and file streams against compiled binary signatures. Pre-configured for win_lockbit3_ransomware and "
         "apt29_sunburst_dll, detecting malicious string artifacts, shadow copy deletion commands, and C2 beaconing routines."),

        ("Threat Intelligence Repositories (VT, AbuseIPDB, Shodan, MISP)",
         "Cross-references extracted IOCs against simulated production APIs: VirusTotal v3 (vendor malicious ratio), AbuseIPDB v2 "
         "(abuse confidence percentage and incident report history), Shodan (open ports and CVE banners), and MISP (threat actor attribution)."),

        ("Live Digital SOC Twin Topology (HTML5 Canvas)",
         "A real-time network topology visualizer rendering enterprise infrastructure: Domain Controllers (DC-PRIMARY-01), Finance Servers "
         "(FIN-SERVER-04), Developer Workstations, and Cloud S3 Enclaves. When an attack is ingested, compromised nodes pulse crimson with "
         "dynamic packet animations; when contained, a glowing cobalt firewall shield isolates the asset."),

        ("Wireshark-Style Live PCAP Packet Generator",
         "Generates synchronous packet captures (DNS queries, TCP handshakes, TLS Cobalt Strike client/server hellos, SMB2 tree connect requests, "
         "and Kerberos TGS ticket requests) corresponding to the exact attack vector being investigated.")
    ]

    for tool_name, tool_desc in tools:
        pdf.bullet(f"{tool_name}: ", tool_desc)

    # =========================================================================
    # PAGE 7: HITL GOVERNANCE & 5 ATTACK SCENARIOS
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(5, "HITL Governance & The 5 Attack Scenarios")

    pdf.section_heading("5.1 Human-in-the-Loop (HITL) Governance Safeguards")
    pdf.body_p(
        "Fully autonomous containment carries significant operational risk: if an AI system abruptly isolates a primary Domain Controller, "
        "entire enterprise operations can collapse. T.U.E.S.D.A.Y. solves this through policy-based escalation:\n"
        "• Standard Workstations (e.g., DEV-WORKSTATION-09): The system executes containment autonomously.\n"
        "• Core Infrastructure (e.g., DC-PRIMARY-01, FIN-SERVER-04): If risk exceeds the auto-approval threshold (80%), autonomous termination "
        "is halted. The action is placed into the Human Approval Queue, requiring explicit analyst confirmation before host isolation."
    )

    pdf.section_heading("5.2 The 5 Pre-Engineered Attack Scenarios")
    pdf.body_p(
        "The Red Team sector features 5 pre-configured adversary attack drills mapped directly to MITRE ATT&CK:"
    )

    scenarios = [
        ("SIM-001: LockBit 3.0 Ransomware Outbreak Attempt",
         "Target: FIN-SERVER-04 (192.168.10.45) | IOC: 185.220.101.5\n"
         "Payload initiates LSASS credential dumping, deletes volume shadow copies (vssadmin), and stages AES-256 file encryption. "
         "Demonstrates autonomous multi-agent containment: YARA detection, EDR host isolation, and perimeter C2 firewall blocking."),

        ("SIM-002: AWS Cloud Credential Compromise & S3 Mass-Download",
         "Target: AWS-S3-PROD-LOGS (cloud-aws) | IOC: 193.142.146.35\n"
         "Stolen AWS IAM credentials used for unauthorized STS AssumeRole followed by bulk S3 data exfiltration. Demonstrates Cloud Security "
         "agent detection, IAM DenyAll attachment, active session revocation, and S3 Object Lock."),

        ("SIM-003: APT SUNBURST Supply Chain Trojan (Domain Controller)",
         "Target: DC-PRIMARY-01 (192.168.1.10) | IOC: 45.154.255.87\n"
         "Backdoored Orion update binary injected into Domain Controller memory requesting a Kerberos Golden Ticket. Demonstrates Human-in-the-Loop "
         "governance: High risk on Tier-0 infrastructure triggers human approval escalation instead of blind termination."),

        ("SIM-004: Covert Telemetry Harvester & Browser Credential Spyware",
         "Target: DEV-WORKSTATION-09 (192.168.20.14) | IOC: 185.220.101.99\n"
         "Adversary script harvests local .env API keys, developer SSH tokens, and browser session cookies. Demonstrates endpoint behavioral "
         "EDR detection and C2 exfiltration blocking."),

        ("SIM-005: Stealthy Covert DNS Tunneling & Data Siphon",
         "Target: RND-NODE-02 (192.168.30.18) | IOC: 193.142.146.88\n"
         "Adversary encodes database dumps into base64 subdomains, transmitting chunks via spoofed UDP DNS queries. Demonstrates Zeek IDS "
         "anomaly correlation and core DNS sinkholing.")
    ]

    for s_title, s_desc in scenarios:
        pdf.subheading(s_title)
        pdf.body_p(s_desc)

    # =========================================================================
    # PAGE 8: EXPO PRESENTATION SCRIPT & WINNING PITCH
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(6, "Expo Presentation Playbook & Pitch Script")

    pdf.body_p(
        "This section provides your team with a complete, step-by-step presentation script designed to impress expo judges, "
        "professors, and industry evaluators in under 3 minutes."
    )

    pdf.section_heading("6.1 The 3-Minute Live Demonstration Flow")

    pitch_steps = [
        ("Step 1: Set the Stage (0:00 - 0:45)",
         "\"Good morning evaluators. Today's enterprise SOCs are facing a massive alert crisis: analysts sift through 10,000+ alerts daily, "
         "resulting in an average dwell time of 16 hours. We built Project T.U.E.S.D.A.Y. — an autonomous multi-agent cybernetic platform "
         "that reduces MTTR from 16 hours to under 3 seconds using a swarm of 9 specialized AI agents.\""),

        ("Step 2: Trigger the Red Team Attack (0:45 - 1:15)",
         "Click the RED TEAM tab in the header. Show the judges the adversary attack suite. Select 'LockBit 3.0 Ransomware Outbreak' or "
         "'APT SUNBURST Supply Chain' and click 'LAUNCH SIMULATION ATTACK'. Explain: \"We are now injecting a live adversary attack payload into our enterprise network.\""),

        ("Step 3: Show the Multi-Agent Deliberation (1:15 - 2:00)",
         "Switch back to Sentinel SOC. Point to the live MTTR stopwatch ticking up in milliseconds. Point to the terminal logs:\n"
         "• \"Watch the Coordinator decompose the attack.\"\n"
         "• \"The Log Analysis agent triggers Sigma Rule 001 for encoded PowerShell.\"\n"
         "• \"Threat Intel queries VirusTotal and AbuseIPDB, confirming 68 vendor detections.\"\n"
         "• \"Malware Sandbox runs YARA and identifies LockBit 3.0 in process memory.\"\n"
         "• \"The Adversarial Critic challenges the findings to disprove false positives.\"\n"
         "• \"Notice the consensus confidence meter update in real time.\""),

        ("Step 4: Demonstrate HITL Governance & Containment (2:00 - 2:40)",
         "If presenting SIM-003 on DC-PRIMARY-01, show the Approval Queue:\n"
         "\"Because this target is a primary Domain Controller, T.U.E.S.D.A.Y.'s Human Governance gate prevents accidental downtime. "
         "It escalates to human approval. I will click 'APPROVE & EXECUTE'.\"\n"
         "Point to the Digital SOC Twin: the node turns from flashing red to a protected blue shield. The voice engine announces containment."),

        ("Step 5: Conclude with Architecture & Resilience (2:40 - 3:00)",
         "\"Finally, T.U.E.S.D.A.Y. operates on a 3-Tier Inference Architecture: cloud serverless with Google Gemini, local SLMs for air-gapped "
         "networks, and a 100% on-device sovereign swarm right here in the browser. Thank you, and we welcome your questions.\"")
    ]

    for p_step, p_content in pitch_steps:
        pdf.subheading(p_step)
        pdf.body_p(p_content)

    # =========================================================================
    # PAGE 9: JUDGE QUESTIONS & DEFENSE
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(7, "Judge Q&A Defense Strategy")

    pdf.body_p(
        "Be prepared to answer these common questions from technical evaluators with confidence:"
    )

    qa_list = [
        ("Q1: What happens if your internet connection drops during an incident?",
         "Answer: T.U.E.S.D.A.Y. implements a 3-Tier Inference Architecture. If the cloud connection drops, the system seamlessly transitions "
         "to Tier 3: the On-Device Sovereign Swarm. All Sigma rules, YARA memory checks, OSINT feeds, and SOAR containment scripts run locally "
         "in the browser engine with zero downtime and zero external dependencies."),

        ("Q2: How do you prevent LLM hallucinations from shutting down critical production servers?",
         "Answer: We implement three distinct safety layers: First, tool results are authoritative — agents cannot fabricate detections without tool "
         "evidence. Second, our Adversarial Critic agent uses Analysis of Competing Hypotheses (ACH) to actively challenge consensus against benign "
         "alternatives. Third, our Human Governance gate halts automated containment on Tier-0 assets (Domain Controllers, core databases) whenever "
         "risk exceeds policy thresholds."),

        ("Q3: How does T.U.E.S.D.A.Y. differ from commercial SOAR platforms like Splunk SOAR or Palo Alto XSOAR?",
         "Answer: Commercial SOAR platforms rely on rigid, static playbooks created manually by engineers. When an adversary shifts techniques, "
         "static playbooks break. T.U.E.S.D.A.Y. utilizes autonomous agentic reasoning — agents dynamically synthesize custom playbooks in real "
         "time based on the exact MITRE ATT&CK progression and historical episodic memory."),

        ("Q4: Can this system comply with international data privacy laws like GDPR?",
         "Answer: Yes. Our Compliance Audit agent automatically evaluates incidents against GDPR Article 33, initializing a 72-hour breach SLA "
         "countdown timer and sealing immutable cryptographic audit trails with SHA-256 HMAC for regulatory auditing (PCI-DSS and HIPAA).")
    ]

    for q, a in qa_list:
        pdf.subheading(q)
        pdf.body_p(a)

    # =========================================================================
    # PAGE 10: TEAMMATE QUICKSTART & RUN GUIDE
    # =========================================================================
    pdf.add_page()
    pdf.chapter_title(8, "Teammate Quickstart & Deployment Manual")

    pdf.section_heading("8.1 How to Run and Access the Application")
    pdf.bullet("1. Cloud Web App (Vercel): ", "Visit your live deployment URL (connected to github.com/aaronaji007/T.U.E.S.D.A.Y.). Works immediately on any laptop, tablet, or phone.")
    pdf.bullet("2. Standalone Node Server: ", "Run 'node server.js' from the root directory. Access at http://localhost:8090.")
    pdf.bullet("3. Native Python Swarm: ", "Run 'start.bat' or 'python -m uvicorn engine.server:app --port 8090'. Access Sentinel at http://localhost:8090 and RedTeam at http://localhost:8090/redteam.")

    pdf.section_heading("8.2 Key Shortcuts & Controls")
    pdf.bullet("Inference Selector: ", "Located in the top header. Select 'EXPO SOVEREIGN' for 100% on-device demo resilience, or 'CLOUD ONLINE' for Gemini API.")
    pdf.bullet("Audio Speech Toggle: ", "Click 'AUDIO: ON/OFF' in the header to enable or mute real-time voice speech alerts.")
    pdf.bullet("Twin Controls: ", "Use 'RESET VIEW' to re-center the Digital SOC Twin canvas, or 'ISOLATE ALL' for emergency manual network lockdown.")
    pdf.bullet("Agent Inspector: ", "Click any of the 9 agents in the left sidebar to view their confidence meter, dual competing hypotheses, and thought trace.")

    pdf.ln(4)
    pdf.callout_box(
        "PROJECT GUIDE & MENTOR ACKNOWLEDGMENT",
        "Project T.U.E.S.D.A.Y. was developed under the expert guidance and mentorship of Ajeesh S.\n"
        "All code, multi-agent adapters, and deployment configurations are preserved and maintained in the primary repository:\n"
        "https://github.com/aaronaji007/T.U.E.S.D.A.Y.",
        kind='info'
    )

    output_path = os.path.join(os.getcwd(), "PROJECT_TUESDAY_COMPLETE_GUIDE.pdf")
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path} (Size: {os.path.getsize(output_path)} bytes)")
    return output_path

if __name__ == '__main__':
    build_pdf()
