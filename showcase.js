/* ==========================================================================
   TUESDAY: VISUAL SHOWCASE
   A self-contained, fully visual guided tour of the platform.
   - No voice model, no network downloads, nothing to fail: it just works.
   - Walks the overview and every feature with a spotlight highlight and an
     on-screen guide card (auto-advancing, with manual controls).
   - Launches a live LockBit ransomware drill in the background so the swarm,
     consensus, prediction, and MITRE panels populate while the tour plays.
   Click SHOWCASE in the header to start; click again (or Esc) to stop.
   ========================================================================== */

const Showcase = {
    active: false,
    idx: 0,
    autoPlay: true,
    autoTimer: null,
    demoLaunched: false,
    currentEl: null,
    btn: null,
    lbl: null,
    root: null,
    spotlight: null,
    cardTitle: null,
    cardDesc: null,
    kicker: null,
    counter: null,
    progressFill: null,
    autoplayLbl: null,
    nextBtn: null,

    steps: [
        { tab: null, target: '.matrix-navbar', kicker: 'OVERVIEW', title: 'Command Deck',
          desc: 'Welcome to TUESDAY — an autonomous, multi-agent security operations center. The command deck keeps swarm health, ingested alerts, auto-containment rate, and response latency one glance away. Every agent you are about to see is a real local LLM.' },
        { tab: null, target: '.matrix-telemetry', kicker: 'OVERVIEW', title: 'Live Telemetry',
          desc: 'Operational KPIs stream straight from the agent bus: how many alerts were ingested, how many were contained autonomously, and at what latency.' },
        { tab: 'dashboard', target: '#active-threat-banner', kicker: 'COMMAND CENTER', title: 'Threat Posture',
          desc: 'The status banner tracks the live threat. Idle means monitoring every enclave. The moment a drill fires it escalates to active with a real severity score.' },
        { tab: 'dashboard', target: '#alert-feed-list', kicker: 'COMMAND CENTER', title: 'SIEM Ingestion Stream',
          desc: 'Raw alerts pour in from EDR, cloud, firewall, and identity sources. The coordinator picks each one up and decomposes it into a multi-agent task.' },
        { tab: 'dashboard', target: '#agent-swarm-nodes', kicker: 'COMMAND CENTER', title: 'Agent Reasoning Graph',
          desc: 'Eight specialized agents orbit every incident: Coordinator, Log Analysis, Threat Intel, Malware Sandbox, Cloud Security, Incident Response, Compliance, and Human Approval — each with a distinct specialty.' },
        { tab: 'dashboard', target: '#agent-bus-logs', kicker: 'COMMAND CENTER', title: 'Agent Bus Terminal',
          desc: 'This is the swarm thinking out loud. Every line is genuine model reasoning and real tool calls, streamed over the inter-agent message bus.' },
        { tab: 'dashboard', target: '#chart-incident-types', wrap: '.panel-split', kicker: 'COMMAND CENTER', title: 'Incident Distribution',
          desc: 'A live breakdown of incident types across enclaves, so the SOC sees at a glance what the swarm is fighting.' },
        { tab: 'dashboard', target: '#consensus-panel', wrap: '.panel-split', kicker: 'COMMAND CENTER', title: 'Consensus & Confidence',
          desc: 'Agents vote on the verdict. Weighted confidence across the swarm drives whether an action is taken autonomously or escalated to a human.' },
        { tab: 'dashboard', target: '#ioc-search-input', wrap: '.panel-split', kicker: 'COMMAND CENTER', title: 'Threat Intelligence Lookup',
          desc: 'Paste any IP, hash, or domain and the swarm enriches it across VirusTotal, AbuseIPDB, Shodan, and MISP.' },
        { tab: 'dashboard', target: '#prediction-panel', wrap: '.panel-split-2', kicker: 'COMMAND CENTER', title: 'Threat Prediction Engine',
          desc: 'The coordinator projects the adversary\u2019s next move, so defenses are pre-positioned before the attacker acts.' },
        { tab: 'dashboard', target: '#playbook-panel', wrap: '.panel-split-2', kicker: 'COMMAND CENTER', title: 'Autonomous Playbook Generator',
          desc: 'After every investigation a new adaptive playbook is synthesized, learned from this incident and the swarm\u2019s episodic memory.' },
        { tab: 'dashboard', target: '#btn-sim-play', wrap: '.sim-toolbar', kicker: 'COMMAND CENTER', title: 'Simulation Stepper',
          desc: 'Play, pause, step, and speed the simulated telemetry feed — perfect for demos and for studying the swarm\u2019s decisions one by one.' },
        { tab: 'swarm', target: '.agent-nav-list', kicker: 'AGENT SWARM', title: 'Specialized Agents',
          desc: 'The swarm workspace. Select any agent to inspect its role, current state, live reasoning, tool inventory, and confidence weights.' },
        { tab: 'twin', target: '#digital-twin-canvas', kicker: 'NETWORK', title: 'Digital SOC Twin & PCAP',
          desc: 'The network twin renders the live topology — host states, active flows, and compromised assets — beside a Wireshark-style packet inspector.' },
        { tab: 'mitre', target: '#mitre-matrix-container', kicker: 'MITRE', title: 'MITRE ATT&CK Heatmap',
          desc: 'Tactics and techniques the swarm mapped during investigations, with root-cause timelines and kill-chain progression for every incident.' },
        { tab: 'approval', target: '#approval-queue-list', kicker: 'GOVERNANCE', title: 'Human-in-the-Loop Governance',
          desc: 'High-impact actions — like touching a domain controller — escalate here for human authorization. Every decision lands in the audit trail.' },
        { tab: 'memory', target: '#memory-view-body', kicker: 'MEMORY', title: 'Agent Memory & Rule Editor',
          desc: 'Episodic and semantic memory give the swarm institutional knowledge, plus a live sandbox to author and test YARA and Sigma rules.' },
        { tab: 'simulator', target: '.scenario-card', kicker: 'SIMULATION', title: 'Purple Team Sim',
          desc: 'Pre-built attack scenarios (LockBit ransomware, AWS S3 exfiltration, APT supply chain) and a synthetic alert injector to challenge the swarm.' },
        { tab: null, target: '#btn-trigger-attack', kicker: 'WRAP-UP', title: 'Ready When You Are', final: true,
          desc: 'That is TUESDAY — agents that think, fight, and learn. Press LAUNCH SIMULATOR or head to the simulator tab to run a live LockBit ransomware drill right now.' }
    ],

    delay(ms) { return new Promise(r => setTimeout(r, ms)); },

    init() {
        this.btn = document.getElementById('btn-showcase');
        this.lbl = document.getElementById('lbl-showcase');
        if (!this.btn) return;
        this.btn.addEventListener('click', () => this.toggle());
        this.buildOverlay();
    },

    buildOverlay() {
        if (this.root) return;
        const root = document.createElement('div');
        root.id = 'tour-overlay';
        root.innerHTML = `
            <div class="tour-spotlight" id="tour-spotlight"></div>
            <button class="tour-skip" id="tour-skip">Skip tour <i class="fa-solid fa-forward"></i></button>
            <div class="tour-card">
                <button class="tour-close" id="tour-close"><i class="fa-solid fa-xmark"></i></button>
                <div class="tour-step-meta">
                    <span class="tour-kicker" id="tour-kicker">OVERVIEW</span>
                    <span class="tour-counter" id="tour-counter">1 / 19</span>
                </div>
                <h3 class="tour-title" id="tour-title"></h3>
                <p class="tour-desc" id="tour-desc"></p>
                <div class="tour-progress"><div class="tour-progress-fill" id="tour-progress-fill"></div></div>
                <div class="tour-actions">
                    <button class="tour-btn tour-btn-ghost" id="tour-prev"><i class="fa-solid fa-arrow-left"></i> Back</button>
                    <button class="tour-btn tour-btn-ghost" id="tour-autoplay"><i class="fa-solid fa-pause"></i> <span id="tour-autoplay-lbl">Pause</span></button>
                    <button class="tour-btn tour-btn-primary" id="tour-next">Next <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        this.root = root;
        this.cardEl = root.querySelector('.tour-card');
        this.spotlight = document.getElementById('tour-spotlight');
        this.cardTitle = document.getElementById('tour-title');
        this.cardDesc = document.getElementById('tour-desc');
        this.kicker = document.getElementById('tour-kicker');
        this.counter = document.getElementById('tour-counter');
        this.progressFill = document.getElementById('tour-progress-fill');
        this.autoplayLbl = document.getElementById('tour-autoplay-lbl');
        this.nextBtn = document.getElementById('tour-next');

        document.getElementById('tour-close').addEventListener('click', () => this.stop());
        document.getElementById('tour-skip').addEventListener('click', () => this.stop());
        document.getElementById('tour-next').addEventListener('click', () => { this.pauseAuto(); this.next(); });
        document.getElementById('tour-prev').addEventListener('click', () => { this.pauseAuto(); this.prev(); });
        document.getElementById('tour-autoplay').addEventListener('click', () => this.toggleAuto());

        document.addEventListener('keydown', e => {
            if (!this.active) return;
            if (e.key === 'Escape') this.stop();
            else if (e.key === 'ArrowRight' || e.key === 'Enter') { this.pauseAuto(); this.next(); }
            else if (e.key === 'ArrowLeft') { this.pauseAuto(); this.prev(); }
        });
        window.addEventListener('scroll', () => this.position(), { passive: true });
        window.addEventListener('resize', () => this.position());
    },

    toggle() {
        if (this.active) this.stop();
        else this.start();
    },

    async start() {
        this.active = true;
        this.autoPlay = true;
        this.idx = 0;
        this.setBtn('TOUR RUNNING...');
        this.root.classList.add('active');
        await this.render();
        this.scheduleAuto();
        setTimeout(() => this.launchDemo(), 2500);
    },

    stop() {
        this.active = false;
        this.demoLaunched = false;
        clearTimeout(this.autoTimer);
        if (this.root) this.root.classList.remove('active');
        this.setBtn('SHOWCASE');
    },

    next() {
        if (this.idx < this.steps.length - 1) { this.idx++; this.render(); this.scheduleAuto(); }
        else this.stop();
    },

    prev() {
        if (this.idx > 0) { this.idx--; this.render(); this.scheduleAuto(); }
    },

    scheduleAuto() {
        clearTimeout(this.autoTimer);
        if (!this.autoPlay) return;
        const step = this.steps[this.idx];
        const ms = Math.max(5600, Math.min(9500, 3400 + step.desc.length * 14));
        this.autoTimer = setTimeout(() => { if (this.active) this.next(); }, ms);
    },

    pauseAuto() {
        this.autoPlay = false;
        clearTimeout(this.autoTimer);
        if (this.autoplayLbl) this.autoplayLbl.textContent = 'Play';
        const icon = document.querySelector('#tour-autoplay i');
        if (icon) icon.className = 'fa-solid fa-play';
    },

    toggleAuto() {
        this.autoPlay = !this.autoPlay;
        if (this.autoplayLbl) this.autoplayLbl.textContent = this.autoPlay ? 'Pause' : 'Play';
        const icon = document.querySelector('#tour-autoplay i');
        if (icon) icon.className = this.autoPlay ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (this.autoPlay) this.scheduleAuto();
        else clearTimeout(this.autoTimer);
    },

    async render() {
        const step = this.steps[this.idx];
        if (!step) return;

        this.kicker.textContent = step.kicker || 'TUESDAY';
        this.cardTitle.textContent = step.title;
        this.cardDesc.textContent = step.desc;
        this.counter.textContent = (this.idx + 1) + ' / ' + this.steps.length;
        this.progressFill.style.width = ((this.idx + 1) / this.steps.length * 100) + '%';
        this.nextBtn.innerHTML = step.final
            ? 'Finish <i class="fa-solid fa-check"></i>'
            : 'Next <i class="fa-solid fa-arrow-right"></i>';
        this.spotlight.classList.toggle('tour-final', !!step.final);
        this.cardEl.classList.toggle('tour-final-card', !!step.final);

        if (step.tab) {
            const tabBtn = document.querySelector('[data-tab="tab-' + step.tab + '"]');
            if (tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
        }
        await this.delay(80);
        await new Promise(r => requestAnimationFrame(r));

        let el = document.querySelector(step.target);
        if (step.wrap && el) el = el.closest(step.wrap) || el;
        this.currentEl = el;
        if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'nearest' });
            await this.delay(450);
        }
        this.position();
    },

    position() {
        if (!this.active) return;
        const el = this.currentEl;
        if (!el || !this.spotlight) { this.spotlight.style.opacity = 0; return; }
        const rect = el.getBoundingClientRect();
        const pad = 10;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let top = Math.max(rect.top - pad, 8);
        let left = Math.max(rect.left - pad, 8);
        let width = rect.width + pad * 2;
        let height = rect.height + pad * 2;
        if (left + width > vw - 8) width = Math.max(40, vw - left - 8);
        if (top + height > vh - 8) height = Math.max(40, vh - top - 8);
        if (width > vw - 16) { width = vw - 16; left = 8; }
        this.spotlight.style.opacity = 1;
        this.spotlight.style.top = top + 'px';
        this.spotlight.style.left = left + 'px';
        this.spotlight.style.width = width + 'px';
        this.spotlight.style.height = height + 'px';
    },

    // Fire a live LockBit drill in the background so the swarm, consensus,
    // prediction, and MITRE panels populate while the tour plays.
    launchDemo() {
        if (this.demoLaunched) return;
        if (!window.AttackSimulator || !window.AttackSimulator.executeScenario) return;
        this.demoLaunched = true;
        try {
            AttackSimulator.executeScenario('ransomware');
            console.log('[showcase] live LockBit ransomware drill started');
        } catch (e) {
            console.warn('[showcase] demo trigger failed:', e);
        }
    },

    setBtn(t) { if (this.lbl) this.lbl.textContent = t; }
};

Showcase.init();
