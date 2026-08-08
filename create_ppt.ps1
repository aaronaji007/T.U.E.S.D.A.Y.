# Create PowerPoint Presentation for TUESDAY Hackathon Round 2
$ErrorActionPreference = "Stop"

$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

# Create Presentation
$pres = $pptApp.Presentations.Add()
$pres.PageSetup.SlideWidth = 960  # 13.33 inches (16:9)
$pres.PageSetup.SlideHeight = 540 # 7.5 inches

# Colors (BGR integer values for PowerPoint COM)
$bgColor = 1379850      # RGB(10, 14, 21)
$cardColor = 2628628    # RGB(20, 28, 40)
$greenColor = 6684672   # RGB(0, 255, 102)
$amberColor = 46847     # RGB(255, 183, 0)
$whiteColor = 16446960  # RGB(240, 245, 250)
$mutedColor = 11839884  # RGB(140, 170, 180)
$borderColor = 5288960  # RGB(0, 180, 80)

function Set-SlideBg ($slide) {
    $slide.FollowMasterBackground = [Microsoft.Office.Core.MsoTriState]::msoFalse
    $slide.Background.Fill.Solid()
    $slide.Background.Fill.ForeColor.RGB = $bgColor
}

function Add-Header ($slide, $titleText, $slideNum) {
    $headerBox = $slide.Shapes.AddTextbox(1, 40, 25, 780, 50)
    $tf = $headerBox.TextFrame
    $tf.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $p = $tf.TextRange.Paragraphs(1)
    $p.Text = "SLIDE $slideNum : $titleText"
    $p.Font.Name = "Segoe UI"
    $p.Font.Size = 22
    $p.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $p.Font.Color.RGB = $greenColor

    $brandBox = $slide.Shapes.AddTextbox(1, 750, 25, 170, 30)
    $btf = $brandBox.TextFrame
    $bp = $btf.TextRange.Paragraphs(1)
    $bp.Text = "TUESDAY AI SOC"
    $bp.Font.Name = "Consolas"
    $bp.Font.Size = 12
    $bp.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $bp.Font.Color.RGB = $amberColor

    $line = $slide.Shapes.AddLine(40, 78, 920, 78)
    $line.Line.ForeColor.RGB = $borderColor
    $line.Line.Weight = 1.5
}

function Add-Card ($slide, $left, $top, $width, $height, $title, $items, $accentColor = $greenColor) {
    $rect = $slide.Shapes.AddShape(1, $left, $top, $width, $height)
    $rect.Fill.Solid()
    $rect.Fill.ForeColor.RGB = $cardColor
    $rect.Line.ForeColor.RGB = $borderColor
    $rect.Line.Weight = 1.0

    if ($title) {
        $titleBox = $slide.Shapes.AddTextbox(1, $left + 15, $top + 10, $width - 30, 35)
        $ttf = $titleBox.TextFrame
        $ttf.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tp = $ttf.TextRange.Paragraphs(1)
        $tp.Text = $title
        $tp.Font.Name = "Segoe UI"
        $tp.Font.Size = 15
        $tp.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tp.Font.Color.RGB = $accentColor
    }

    if ($items -and $items.Count -gt 0) {
        $bodyTop = if ($title) { $top + 45 } else { $top + 10 }
        $bodyBox = $slide.Shapes.AddTextbox(1, $left + 15, $bodyTop, $width - 30, $height - ($bodyTop - $top) - 10)
        $btf = $bodyBox.TextFrame
        $btf.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
        
        $textRange = $btf.TextRange
        $fullText = $items -join "`n"
        $textRange.Text = $fullText
        $textRange.Font.Name = "Segoe UI"
        $textRange.Font.Size = 12
        $textRange.Font.Color.RGB = $whiteColor
    }
}

# ==============================================================================
# SLIDE 1: Team Introduction
# ==============================================================================
$slide1 = $pres.Slides.Add(1, 12)
Set-SlideBg $slide1
Add-Header $slide1 "TEAM INTRODUCTION" 1

$heroBox = $slide1.Shapes.AddTextbox(1, 40, 90, 880, 70)
$htf = $heroBox.TextFrame
$hp = $htf.TextRange.Paragraphs(1)
$hp.Text = "TUESDAY - Autonomous Multi-Agent AI SOC"
$hp.Font.Name = "Segoe UI"
$hp.Font.Size = 24
$hp.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
$hp.Font.Color.RGB = $whiteColor

$hp2 = $htf.TextRange.InsertAfter("`nThreat Unification Engine for Security Defense And Your SOC")
$hp2.Font.Name = "Segoe UI"
$hp2.Font.Size = 14
$hp2.Font.Color.RGB = $mutedColor

$metaItems = @(
    "Team Name : TUESDAY",
    "Domain    : AI-Driven Cybersecurity and Autonomous SOC Operations",
    "Event     : Neurobots National Level Hackathon 2026 (Round 2)",
    "College   : [Your College / Institution Name]"
)
Add-Card $slide1 40 175 420 330 "EVENT AND DOMAIN METADATA" $metaItems $amberColor

$memberItems = @(
    "1. Abhijith Suresh  - Project Lead and Full-Stack Integration",
    "2. Aaron Aji        - Backend Engineering and API Server",
    "3. Mohammed Sabith  - AI/LLM Engineering and ReAct Loops",
    "4. Savio Prince     - Frontend/UI and Terminal Experience",
    "5. Aditya Menon     - Network Twin and Data Visualization",
    "6. Joseph John      - Security Research and Attack Vectors",
    "7. Kevin Benny      - Threat Intel and Rule Engine",
    "8. Harigovind       - DevOps, Benchmarking and Testing"
)
Add-Card $slide1 480 175 440 330 "TEAM MEMBERS (8-MEMBER SWARM)" $memberItems $greenColor

# ==============================================================================
# SLIDE 2: Problem Statement
# ==============================================================================
$slide2 = $pres.Slides.Add(2, 12)
Set-SlideBg $slide2
Add-Header $slide2 "PROBLEM STATEMENT" 2

$probItems1 = @(
    "- Modern SOCs ingest 10,000+ alerts daily from EDR, SIEM, Firewall and Cloud logs.",
    "- Tier-1 analysts spend 15-45 minutes per alert manually correlating indicators.",
    "- Context switching across 5+ disconnected threat intel tools creates investigation fatigue.",
    "- High false-positive rates (>65%) mask real threats until encryption or exfiltration starts."
)
Add-Card $slide2 40 100 880 125 "1. WHAT PROBLEM ARE WE SOLVING?" $probItems1 $greenColor

$probItems2 = @(
    "- Mean Time to Respond (MTTR) directly dictates breach cost (IBM Cost of Breach Report).",
    "- Ransomware and APT supply chain attacks execute payload stages in under 15 minutes.",
    "- Manual triage is too slow; small/medium enterprises cannot afford $100k+ annual SOAR tool licenses."
)
Add-Card $slide2 40 240 880 120 "2. WHY IS IT IMPORTANT?" $probItems2 $amberColor

$probItems3 = @(
    "- Tier-1 and Tier-2 SOC Security Analysts seeking automated threat triage.",
    "- Managed Security Service Providers (MSSPs) managing multi-tenant customer enclaves.",
    "- Enterprise Security Incident Response Teams (CSIRTs) and Air-Gapped Defense SOCs."
)
Add-Card $slide2 40 375 880 125 "3. TARGET USERS" $probItems3 $greenColor

# ==============================================================================
# SLIDE 3: Proposed Solution
# ==============================================================================
$slide3 = $pres.Slides.Add(3, 12)
Set-SlideBg $slide3
Add-Header $slide3 "PROPOSED SOLUTION & INNOVATION" 3

$solItems = @(
    "TUESDAY is an autonomous, local-first multi-agent AI SOC platform.",
    "",
    "It ingests raw SIEM alerts, breaks them into specialized sub-tasks across an 8-agent AI swarm, executes real tool calling (Sigma/YARA/IOC lookups), reaches weighted consensus, and executes autonomous or human-gated containment."
)
Add-Card $slide3 40 100 420 405 "CORE SOLUTION OVERVIEW" $solItems $amberColor

$featItems = @(
    "1. 100% Local and Air-Gapped Privacy: Runs on local Ollama + Qwen 2.5; zero telemetry leaks to cloud.",
    "2. Tool-Grounded ReAct Loop: Agents must call Sigma/YARA/IOC tools before voting - zero hallucinations.",
    "3. Weighted Consensus and Safety Gate: 8 agents vote with confidence; risk > 80 auto-escalates to human queue.",
    "4. Adaptive Episodic Memory: Remembers past incidents and synthesizes self-learning playbooks.",
    "5. ~98% MTTR Reduction: Investigation and response in ~46 seconds vs 40+ mins manually."
)
Add-Card $slide3 480 100 440 405 "KEY FEATURES AND MARKET INNOVATION" $featItems $greenColor

# ==============================================================================
# SLIDE 4: Technical Architecture
# ==============================================================================
$slide4 = $pres.Slides.Add(4, 12)
Set-SlideBg $slide4
Add-Header $slide4 "TECHNICAL ARCHITECTURE" 4

$archFlow = @(
    "[RAW SIEM / EDR ALERT] -> HTTP / SSE Stream (/api/incident/stream)",
    "       |",
    "       v",
    "[ORCHESTRATOR] Dispatches 8 Specialized Agents in Parallel",
    "       |",
    "       +---> Log Analysis (Sigma)      +---> Malware Sandbox (YARA)",
    "       +---> Threat Intel (IOC APIs)   +---> Cloud Security (IAM/S3)",
    "       |",
    "       v",
    "[OLLAMA LOCAL REASONING ENGINE] (Qwen 2.5:7b ReAct Tool Loop)",
    "       |  (Automatic Fallback: Rule Engine if LLM offline)",
    "       v",
    "[CONSENSUS & GOVERNANCE] Weighted Confidence -> Auto-Contain OR Human Queue"
)
Add-Card $slide4 40 100 520 405 "ARCHITECTURE FLOW DIAGRAM" $archFlow $greenColor

$stackItems = @(
    "- Backend: Zero-dependency Node.js HTTP Server + SSE Event Bus",
    "- Frontend: Modern Vanilla JS, HTML5, Matrix CSS Theme, Chart.js",
    "- AI LLM Engine: Local Ollama Runtime (qwen2.5:7b / 3b / phi4-mini)",
    "- Tooling: Sigma Rule Engine, YARA Scanner, Asset Graph, IOC Enrichment",
    "- Persistence: JSON Store (data/store.json) for Memory and RL Weights",
    "- Hardware: Standard Workstation / RTX GPU (or CPU via 3B model)"
)
Add-Card $slide4 580 100 340 405 "TECHNOLOGY STACK" $stackItems $amberColor

# ==============================================================================
# SLIDE 5: Current Progress (Proof of Work)
# ==============================================================================
$slide5 = $pres.Slides.Add(5, 12)
Set-SlideBg $slide5
Add-Header $slide5 "CURRENT PROGRESS (PROOF OF WORK)" 5

$pow1 = @(
    "- GitHub Repository: https://github.com/abhijithsura/TUESDAY",
    "- Working Prototype: 100% functional, runnable locally on http://localhost:8090",
    "- Verification Suite: verify.bat automated health check verifies JS syntax, config, store and Ollama model status (ENGINE: LLM AGENTIC qwen2.5:7b)."
)
Add-Card $slide5 40 100 880 120 "1. CODEBASE AND REPOSITORY STATUS" $pow1 $greenColor

$pow2 = @(
    "1. Command Center: Live SIEM Feed, Agent Bus Terminal, Swarm Node Graph, Live MTTR Stopwatch",
    "2. Agent Swarm Workspace: 8 specialized agent cards with Reinforcement Learning weight controls",
    "3. Digital SOC Twin and PCAP: Interactive network canvas topology + Wireshark packet inspector",
    "4. MITRE ATT&CK Matrix: Heatmap with clickable TTP modals, Root Cause Analysis and Kill Chain",
    "5. Human Approval Queue: Escalation governance gate with policy risk threshold sliders",
    "6. Agent Memory and Sandbox: Episodic incident memory, semantic graph, live YARA/Sigma editor",
    "7. Purple Team Simulator: Pre-configured attack drills + custom alert injector form"
)
Add-Card $slide5 40 230 880 275 "2. COMPLETED FUNCTIONAL UI MODULES AND PROTOTYPE SCREENSHOTS" $pow2 $amberColor

# ==============================================================================
# SLIDE 6: Live Demo & Verification
# ==============================================================================
$slide6 = $pres.Slides.Add(6, 12)
Set-SlideBg $slide6
Add-Header $slide6 "LIVE DEMO & VERIFICATION" 6

$demoItems1 = @(
    "- Attack Ingestion: Trigger LockBit Ransomware, AWS S3 Exfil, or APT Supply Chain drill.",
    "- Live SSE Terminal: Observe 8 agents reasoning, calling tools, and emitting live logs.",
    "- Tool Execution: Watch Sigma rules fire, IOC enrichment execute, and YARA scans pass/fail.",
    "- Consensus Voting: Real-time weighted confidence calculation and risk score generation.",
    "- Governance Gate: High-impact actions escalate to human approval queue; auto-execute on lower risk.",
    "- Report Generation: Click EXECUTIVE REPORT for instant print/PDF or Markdown download."
)
Add-Card $slide6 40 100 520 405 "LIVE DEMO WORKFLOW STEPS" $demoItems1 $greenColor

$demoItems2 = @(
    "- Zero-Dependency Startup: start.bat launches Node server on port 8090 with zero npm install.",
    "- Pre-Demo Health Check: verify.bat confirms model readiness before presentation.",
    "- Fail-Safe Reliability: Automatic fallback to deterministic Rule Engine if LLM is offline - demo NEVER crashes.",
    "- Model Warm-Up: Pre-loads qwen2.5:7b into VRAM at boot for zero-latency initial response.",
    "- Health Probe API: GET /api/health returns liveness, uptime, model status, and pending approvals."
)
Add-Card $slide6 580 100 340 405 "DEMO RELIABILITY AND OPS" $demoItems2 $amberColor

# ==============================================================================
# SLIDE 7: Challenges & Next Plan
# ==============================================================================
$slide7 = $pres.Slides.Add(7, 12)
Set-SlideBg $slide7
Add-Header $slide7 "CHALLENGES & NEXT DEVELOPMENT PLAN" 7

$chalItems = @(
    "1. Model Response Parsing: Small local models (7B) occasionally produce sloppy JSON output -> Solved via robust multi-stage extractJSON() fallback parser.",
    "2. Inference Throughput Bottleneck: Multi-turn LLM reasoning on a single GPU creates queueing under high load -> Mitigated via agent parallelism and prompt token limits.",
    "3. Threat Intel API Limits: Free-tier rate limits on public APIs -> Solved with local Semantic Memory caching."
)
Add-Card $slide7 40 100 880 190 "CURRENT ENGINEERING CHALLENGES & MITIGATIONS" $chalItems $amberColor

$planItems = @(
    "- Live Enterprise Threat Intel Integration: Connect live production VirusTotal and AbuseIPDB API keys.",
    "- SIEM Connector Plugins: Build native webhook ingestion daemons for Splunk, Elastic, and Sentinel.",
    "- Multi-GPU Inference Sharding: Scale Ollama instance pools across multiple worker nodes.",
    "- Expanded Attack Scenarios: Increase purple-team scenario library to 15+ MITRE ATT&CK tactics.",
    "- Final Round Polish: Conduct multi-run benchmark evaluation (benchmark.js) and refine UI charts."
)
Add-Card $slide7 40 300 880 205 "DEVELOPMENT PLAN BEFORE FINAL ROUND" $planItems $greenColor

# ==============================================================================
# SLIDE 8: Impact & Future Scope
# ==============================================================================
$slide8 = $pres.Slides.Add(8, 12)
Set-SlideBg $slide8
Add-Header $slide8 "IMPACT, SCALABILITY & FUTURE SCOPE" 8

$imp1 = @(
    "- Quantified Business Impact: Reduces MTTR from ~42 mins to ~46 seconds (~98% reduction, ~52x faster). Saves $100k+ annually in SOAR licensing and Tier-1 triage costs.",
    "- Social Impact: Democratizes enterprise-grade AI defense for underfunded public sector orgs, schools and SMBs. Keeps sensitive security telemetry 100% local."
)
Add-Card $slide8 40 100 880 120 "1. BUSINESS AND SOCIAL IMPACT" $imp1 $greenColor

$imp2 = @(
    "- Horizontal Worker Scaling: Stateless orchestrator backend easily scales behind load balancers.",
    "- Smart IOC Caching: Memory layer eliminates duplicate external tool calls across incidents.",
    "- Local Model Sharding: Distributes agent inference across standard GPU clusters."
)
Add-Card $slide8 40 230 880 120 "2. ARCHITECTURAL SCALABILITY" $imp2 $amberColor

$imp3 = @(
    "- Autonomous Multi-Cloud Remediation: Deep AWS, Azure and GCP native IAM/security group execution.",
    "- Cross-Enclave Federated Swarms: Privacy-preserving intelligence sharing across organization boundaries.",
    "- Automated Threat Hunting: Proactive memory-driven hypothesis generation and log scanning."
)
Add-Card $slide8 40 360 880 145 "3. FUTURE SCOPE AND ROADMAP" $imp3 $greenColor

# Save Presentation
$outputPath = Join-Path (Get-Location) "TUESDAY_Round2_Presentation.pptx"
$pres.SaveAs($outputPath)
$pres.Close()
$pptApp.Quit()

Write-Output "SUCCESS: Presentation generated at $outputPath"
