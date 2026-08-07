/* ==========================================================================
   AETHER // MATRIX SOC: Main Application Controller v2
   Wires up all UI panels, consensus voting, RCA timeline, Kill Chain,
   IOC Search, Threat Predictions, Playbook Generator, SVG Agent Lines,
   Enhanced Terminal Formatting, and Metrics Chart.
   ========================================================================== */

class AetherSOCApp {
    constructor() {
        this.activeAlerts = [];
        this.approvalQueue = [];
        this.auditLogs = [];
        this.selectedAgentKey = 'coordinator';
        this.chartInstance = null;
        this.autoThreshold = 80;

        this.initUI();
    }

    getAutoThreshold() {
        return this.autoThreshold;
    }

    initUI() {
        this.bindTabNavigation();
        this.initChart();
        this.initDigitalTwin();
        this.drawAgentSVGConnections();
        this.renderAgentSidebar();
        this.renderAgentDetails('coordinator');
        this.renderMemoryView('episodic');
        this.bindIOCSearch();
        this.bindSliderThreshold();
        this.bindKillChainClicks();
        MitreEngine.renderMatrix('mitre-matrix-container');

        // Bind Agent Bus Logs (enhanced formatting)
        SwarmEngine.onLogMessage((agentKey, logText, type) => {
            this.appendTerminalLog(agentKey, logText, type);
            this.pulseAgentNode(agentKey);
            this.pulseAgentSVGLine(agentKey);
        });

        // Agent node clicks → swarm tab
        document.querySelectorAll('.agent-node').forEach(node => {
            node.addEventListener('click', () => {
                const key = node.getAttribute('data-agent');
                document.querySelector('[data-tab="tab-swarm"]')?.click();
                this.renderAgentDetails(key);
            });
        });

        // Header Buttons
        document.getElementById('btn-trigger-attack')?.addEventListener('click', () => {
            document.querySelector('[data-tab="tab-simulator"]')?.click();
        });
        document.getElementById('btn-ingest-custom')?.addEventListener('click', () => {
            document.querySelector('[data-tab="tab-simulator"]')?.click();
        });
        document.getElementById('btn-export-report')?.addEventListener('click', () => {
            this.openExecutiveReportModal();
        });
        document.getElementById('btn-close-report')?.addEventListener('click', () => {
            document.getElementById('modal-report')?.classList.remove('active');
        });
        document.getElementById('btn-download-md')?.addEventListener('click', () => {
            this.downloadReportMarkdown();
        });
        document.getElementById('btn-print-report')?.addEventListener('click', () => {
            window.print();
        });

        // Scenario Buttons
        document.querySelectorAll('.btn-run-scenario').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.currentTarget.getAttribute('data-scenario');
                document.querySelector('[data-tab="tab-dashboard"]')?.click();
                AttackSimulator.executeScenario(scenario);
            });
        });

        // Custom Alert Form
        document.getElementById('form-custom-alert')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const source = document.getElementById('alert-source').value;
            const target = document.getElementById('alert-target').value;
            const ioc = document.getElementById('alert-ioc').value;
            const payload = document.getElementById('alert-payload').value;

            document.querySelector('[data-tab="tab-dashboard"]')?.click();
            this.handleIncomingAlert({
                id: `ALERT-${Math.floor(1000 + Math.random() * 9000)}`,
                title: `Custom Threat: ${ioc.split(' ')[0]}`,
                source, targetHost: target, ioc, payload,
                timestamp: new Date().toLocaleTimeString()
            });
        });

        // Seed initial alerts
        this.seedInitialAlerts();
    }

    // =====================================================
    // TAB NAVIGATION
    // =====================================================
    bindTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-tab'))?.classList.add('active');
            });
        });

        document.querySelectorAll('.memory-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.memory-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderMemoryView(tab.getAttribute('data-mem'));
            });
        });
    }

    // =====================================================
    // SVG CONNECTIONS BETWEEN AGENT NODES
    // =====================================================
    drawAgentSVGConnections() {
        const svg = document.getElementById('swarm-svg-connections');
        const container = document.getElementById('agent-swarm-nodes');
        if (!svg || !container) return;

        const connections = [
            ['coordinator', 'log'],
            ['coordinator', 'threatintel'],
            ['coordinator', 'malware'],
            ['coordinator', 'cloud'],
            ['coordinator', 'response'],
            ['coordinator', 'compliance'],
            ['coordinator', 'approval'],
            ['log', 'response'],
            ['threatintel', 'response'],
            ['malware', 'response']
        ];

        const getCenter = (agentKey) => {
            const node = container.querySelector(`.agent-node[data-agent="${agentKey}"]`);
            if (!node) return { x: 0, y: 0 };
            const cRect = container.getBoundingClientRect();
            const nRect = node.getBoundingClientRect();
            return {
                x: nRect.left - cRect.left + nRect.width / 2,
                y: nRect.top - cRect.top + nRect.height / 2
            };
        };

        // Delay to let DOM settle
        setTimeout(() => {
            svg.innerHTML = '';
            connections.forEach(([from, to]) => {
                const a = getCenter(from);
                const b = getCenter(to);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', a.x);
                line.setAttribute('y1', a.y);
                line.setAttribute('x2', b.x);
                line.setAttribute('y2', b.y);
                line.classList.add('swarm-connection-line');
                line.setAttribute('data-from', from);
                line.setAttribute('data-to', to);
                svg.appendChild(line);
            });
        }, 500);
    }

    pulseAgentSVGLine(agentKey) {
        const svg = document.getElementById('swarm-svg-connections');
        if (!svg) return;
        svg.querySelectorAll(`.swarm-connection-line[data-from="${agentKey}"], .swarm-connection-line[data-to="${agentKey}"]`).forEach(line => {
            line.classList.add('active');
            setTimeout(() => line.classList.remove('active'), 1200);
        });
    }

    pulseAgentNode(agentKey) {
        const node = document.querySelector(`.agent-node[data-agent="${agentKey}"]`);
        if (!node) return;
        node.style.filter = 'brightness(1.8) drop-shadow(0 0 8px rgba(0,255,102,0.8))';
        setTimeout(() => { node.style.filter = ''; }, 1200);
    }

    // =====================================================
    // SEED INITIAL ALERTS
    // =====================================================
    seedInitialAlerts() {
        [
            { id: 'ALERT-8891', title: 'LockBit 3.0 Ransomware Execution Attempt', source: 'CrowdStrike EDR', targetHost: 'FIN-SERVER-04 (192.168.10.45)', ioc: '185.220.101.5', payload: 'powershell.exe -enc SQBFAFgAKABOAGUAdw... vssadmin delete shadows', timestamp: '15:28:10' },
            { id: 'ALERT-8892', title: 'AWS S3 Cloud Exfiltration via STS AssumeRole', source: 'AWS GuardDuty', targetHost: 'AWS-S3-PROD-LOGS', ioc: '193.142.146.35', payload: 'sts:AssumeRole -> S3 ListBuckets bulk access', timestamp: '15:15:02' }
        ].forEach(a => this.renderAlertFeedItem(a));
    }

    renderAlertFeedItem(alert) {
        const feed = document.getElementById('alert-feed-list');
        if (!feed) return;

        const item = document.createElement('div');
        item.className = 'alert-item';
        item.innerHTML = `
            <div class="alert-item-header">
                <span class="alert-source">${alert.source}</span>
                <span class="alert-time">${alert.timestamp}</span>
            </div>
            <div class="alert-item-title">${alert.title}</div>
            <div class="alert-item-meta">
                <span>Target: ${alert.targetHost}</span>
                <span class="badge badge-matrix-red">CRITICAL</span>
            </div>`;
        item.addEventListener('click', () => this.handleIncomingAlert(alert));
        feed.prepend(item);
    }

    // =====================================================
    // HANDLE INCOMING ALERT — Full Pipeline Trigger
    // =====================================================
    async handleIncomingAlert(alert) {
        const banner = document.getElementById('active-threat-banner');
        const titleEl = document.getElementById('threat-title');
        const descEl = document.getElementById('threat-desc');
        const scoreEl = document.getElementById('threat-score-val');

        if (banner) {
            banner.className = 'matrix-banner alert-critical';
            titleEl.innerText = `> CRITICAL THREAT: ${alert.title}`;
            descEl.innerText = `Multi-agent swarm executing parallel investigation on target ${alert.targetHost}.`;
            scoreEl.innerText = '??/100';
            scoreEl.style.color = '#ff3b3b';
        }

        this.addAuditLog('ALERT_INGEST', `SIEM alert [${alert.id}] received from ${alert.source} targeting ${alert.targetHost}.`);

        // Execute full agent swarm pipeline
        const result = await SwarmEngine.processIncidentAlert(alert);

        // Update top metrics
        if (scoreEl) scoreEl.innerText = `${result.riskScore}/100`;
        const countEl = document.getElementById('top-metric-alerts');
        if (countEl) countEl.innerText = (parseInt(countEl.innerText.replace(',', '')) + 1).toLocaleString();
        const latEl = document.getElementById('top-metric-latency');
        if (latEl) latEl.innerText = `${result.latencySec}s`;

        // Render all new panels
        this.renderConsensusPanel(result);
        this.renderRCATimeline();
        this.renderKillChain();
        this.renderPredictions();
        this.renderPlaybook();
    }

    // =====================================================
    // CONSENSUS PANEL — Agent Voting & Confidence
    // =====================================================
    renderConsensusPanel(result) {
        const panel = document.getElementById('consensus-panel');
        if (!panel) return;

        let html = `<div style="margin-bottom:0.75rem;font-size:0.8rem;">
            <strong>CONSENSUS:</strong> ${result.maliciousVotes}/${result.totalVotes} agents voted MALICIOUS (${result.consensusPct}% agreement)
            <br><strong>WEIGHTED CONFIDENCE:</strong> ${result.weightedConfidence}%
        </div>`;

        SwarmEngine.consensusRecord.forEach(v => {
            const pct = v.confidence;
            const color = pct > 80 ? 'var(--matrix-red)' : pct > 50 ? 'var(--matrix-amber)' : 'var(--matrix-green)';
            html += `
                <div style="margin-bottom:0.5rem;">
                    <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.2rem;">
                        <span style="color:${v.color};font-weight:700;">${v.agent}</span>
                        <span>${v.vote} (${v.confidence}%)</span>
                    </div>
                    <div class="confidence-meter">
                        <div class="confidence-fill" style="width:${pct}%;background:${color};"></div>
                    </div>
                </div>`;
        });
        panel.innerHTML = html;
    }

    // =====================================================
    // RCA TIMELINE — Root Cause Analysis Visualization
    // =====================================================
    renderRCATimeline() {
        const container = document.getElementById('rca-timeline-container');
        if (!container) return;

        if (SwarmEngine.rcaTimeline.length === 0) {
            container.innerHTML = '<div class="empty-state">No RCA data available.</div>';
            return;
        }

        let html = '<div class="rca-timeline">';
        SwarmEngine.rcaTimeline.forEach(ev => {
            html += `
                <div class="rca-item ${ev.severity === 'critical' ? 'critical' : ''}">
                    <div class="rca-time">${ev.time}</div>
                    <div class="rca-title">${ev.title}</div>
                    <div class="rca-desc">${ev.description}</div>
                </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // =====================================================
    // KILL CHAIN STEPPER — Attack Progression Stages
    // =====================================================
    renderKillChain() {
        document.querySelectorAll('#killchain-stepper .kc-step').forEach(step => {
            const stageName = step.getAttribute('data-kc');
            if (SwarmEngine.killChainState[stageName]) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    bindKillChainClicks() {
        document.querySelectorAll('#killchain-stepper .kc-step').forEach(step => {
            step.addEventListener('click', () => {
                const stageName = step.getAttribute('data-kc');
                const details = document.getElementById('killchain-details-box');
                if (!details) return;

                const kcData = SwarmEngine.killChainState[stageName];
                if (kcData) {
                    details.innerHTML = `
                        <p><strong style="color:var(--matrix-red);">${stageName} — DETECTED</strong></p>
                        <p><strong>Evidence:</strong> ${kcData.evidence}</p>
                        <p><strong>Detected At:</strong> ${kcData.timestamp}</p>`;
                } else {
                    details.innerHTML = `<p style="color:var(--text-muted);">${stageName}: No evidence detected in current investigation.</p>`;
                }
            });
        });
    }

    // =====================================================
    // THREAT PREDICTION PANEL (Bonus Feature)
    // =====================================================
    renderPredictions() {
        const panel = document.getElementById('prediction-panel');
        if (!panel) return;

        const preds = SwarmEngine.predictedTTPs;
        if (preds.length === 0) {
            panel.innerHTML = '<div class="empty-state">No predictions generated.</div>';
            return;
        }

        let html = '';
        preds.forEach(p => {
            html += `
                <div class="prediction-card">
                    <div class="prediction-header">
                        <i class="fa-solid fa-brain"></i>
                        <span class="prediction-ttp">${p.id}</span>
                        <span style="margin-left:auto;color:var(--matrix-amber);font-weight:700;">${p.probability}% Likely</span>
                    </div>
                    <div style="font-size:0.8rem;font-weight:700;margin:0.4rem 0;color:var(--matrix-green);">${p.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.4rem;">${p.reasoning}</div>
                    <div style="font-size:0.75rem;color:var(--matrix-cyan);"><i class="fa-solid fa-shield-halved"></i> Pre-emptive: ${p.preemptive}</div>
                </div>`;
        });
        panel.innerHTML = html;
    }

    // =====================================================
    // AUTONOMOUS PLAYBOOK GENERATOR PANEL (Bonus Feature)
    // =====================================================
    renderPlaybook() {
        const panel = document.getElementById('playbook-panel');
        if (!panel) return;

        const pb = SwarmEngine.generatedPlaybook;
        if (!pb) {
            panel.innerHTML = '<div class="empty-state">No playbook generated.</div>';
            return;
        }

        let html = `
            <div class="playbook-generated">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                    <div>
                        <div style="font-size:0.9rem;font-weight:700;color:var(--matrix-green);">${pb.name}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">Generated: ${pb.generatedAt} | Based on: ${pb.basedOn} | Confidence: ${pb.confidence}%</div>
                    </div>
                </div>`;

        pb.steps.forEach((step, i) => {
            html += `<div class="playbook-step">${step}</div>`;
        });

        html += '</div>';
        panel.innerHTML = html;
    }

    // =====================================================
    // ENHANCED TERMINAL LOG — Color-coded + IOC highlights
    // =====================================================
    appendTerminalLog(agentKey, logText, type) {
        const bus = document.getElementById('agent-bus-logs');
        if (!bus) return;

        const agent = SwarmEngine.agents[agentKey];
        const line = document.createElement('div');

        let severityClass = 'severity-info';
        if (type === 'warning') severityClass = 'severity-warning';
        if (type === 'danger') severityClass = 'severity-critical';
        if (type === 'success') severityClass = 'severity-success';
        line.className = `log-line ${severityClass}`;

        // Highlight IPs and hashes inline
        let text = logText.replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, '<span class="log-ioc-highlight">$1</span>');
        text = text.replace(/(T\d{4}(?:\.\d{3})?)/g, '<span class="log-ioc-highlight">$1</span>');

        line.innerHTML = `<span class="agent-tag" style="color:${agent ? agent.color : '#00ff66'}">[${agent ? agent.name : 'SYSTEM'}]</span> ${text}`;
        bus.appendChild(line);
        bus.scrollTop = bus.scrollHeight;
    }

    // =====================================================
    // IOC SEARCH BAR — Quick Threat Intelligence Lookup
    // =====================================================
    bindIOCSearch() {
        const input = document.getElementById('ioc-search-input');
        const results = document.getElementById('ioc-search-results');
        if (!input || !results) return;

        input.addEventListener('keydown', async (e) => {
            if (e.key !== 'Enter') return;
            const query = input.value.trim();
            if (!query) return;

            results.innerHTML = '<div style="font-size:0.75rem;color:var(--text-muted);">Querying threat intelligence platforms...</div>';

            const vt = await SOCTools.virusTotal.queryIp(query);
            const abuse = await SOCTools.abuseIPDB.checkIp(query);
            const shodan = await SOCTools.shodan.scanHost(query);

            results.innerHTML = `
                <div class="ioc-result-card">
                    <div style="font-size:0.8rem;font-weight:700;color:var(--matrix-green);margin-bottom:0.4rem;">IOC: ${query}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">
                        <strong>VirusTotal:</strong> ${vt.positives}/${vt.total} detections | Rep: ${vt.reputation} | AS: ${vt.as_owner}<br>
                        <strong>AbuseIPDB:</strong> ${abuse.abuseConfidenceScore}% confidence | ${abuse.totalReports} reports | Country: ${abuse.countryCode}<br>
                        <strong>Shodan:</strong> Ports: [${shodan.ports.join(', ')}] | Tags: [${shodan.tags.join(', ')}] | CVEs: ${shodan.openVulnerabilities.length > 0 ? shodan.openVulnerabilities.join(', ') : 'None'}
                    </div>
                </div>`;
        });
    }

    // =====================================================
    // SLIDER THRESHOLD — Actually Controls Agent Logic
    // =====================================================
    bindSliderThreshold() {
        const slider = document.getElementById('slider-auto-threshold');
        const label = document.getElementById('val-auto-threshold');
        if (!slider) return;

        slider.addEventListener('input', () => {
            this.autoThreshold = parseInt(slider.value);
            if (label) label.innerText = `Risk < ${this.autoThreshold}/100 (Auto Execute)`;
        });
    }

    // =====================================================
    // AGENT SWARM SIDEBAR & DETAIL PANELS
    // =====================================================
    renderAgentSidebar() {
        const container = document.getElementById('agent-selector-list');
        if (!container) return;

        let html = '';
        Object.keys(SwarmEngine.agents).forEach(k => {
            const agent = SwarmEngine.agents[k];
            html += `
                <div class="agent-nav-item ${k === this.selectedAgentKey ? 'active' : ''}" data-agent="${k}">
                    <div class="node-icon" style="width:32px;height:32px;font-size:0.9rem;background:${agent.color};color:#000;">
                        <i class="fa-solid ${agent.icon}"></i>
                    </div>
                    <div>
                        <div style="font-size:0.78rem;font-weight:700;">${agent.name}</div>
                        <div style="font-size:0.62rem;color:var(--text-muted);">${agent.role}</div>
                    </div>
                </div>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.agent-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                container.querySelectorAll('.agent-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.renderAgentDetails(item.getAttribute('data-agent'));
            });
        });
    }

    renderAgentDetails(agentKey) {
        this.selectedAgentKey = agentKey;
        const agent = SwarmEngine.agents[agentKey];
        const panel = document.getElementById('agent-details-panel');
        if (!panel || !agent) return;

        const confPct = agent.confidence;
        const confColor = confPct > 80 ? 'var(--matrix-red)' : confPct > 50 ? 'var(--matrix-amber)' : 'var(--matrix-green)';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--matrix-card-border);padding-bottom:1rem;margin-bottom:1rem;">
                <div style="display:flex;align-items:center;gap:1rem;">
                    <div class="node-icon" style="width:48px;height:48px;font-size:1.3rem;background:${agent.color};color:#000;">
                        <i class="fa-solid ${agent.icon}"></i>
                    </div>
                    <div>
                        <h2 style="font-size:1.1rem;">${agent.name}</h2>
                        <div style="font-size:0.75rem;color:var(--text-muted);">${agent.role}</div>
                    </div>
                </div>
                <div>
                    <span class="matrix-pill">STATUS: ${agent.status}</span>
                    <span class="matrix-pill" style="margin-left:0.5rem;">VOTE: ${agent.vote || 'N/A'}</span>
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <div style="font-size:0.75rem;margin-bottom:0.3rem;">CONFIDENCE SCORE: ${confPct}%</div>
                <div class="confidence-meter">
                    <div class="confidence-fill" style="width:${confPct}%;background:${confColor};"></div>
                </div>
            </div>

            <div class="matrix-card" style="margin-bottom:1rem;">
                <div class="card-header"><h3><i class="fa-solid fa-terminal"></i> DECISION REASONING LOG</h3></div>
                <div class="card-body scrollable" style="max-height:300px;font-size:0.72rem;">
                    ${agent.logs.length === 0
                        ? '<div class="empty-state">No execution logs for this agent turn.</div>'
                        : agent.logs.map(l => {
                            let cls = 'severity-info';
                            if (l.type === 'warning') cls = 'severity-warning';
                            if (l.type === 'danger') cls = 'severity-critical';
                            if (l.type === 'success') cls = 'severity-success';
                            return `<div class="log-line ${cls}" style="margin-bottom:0.3rem;"><span style="color:var(--matrix-green)">[${l.timestamp}]</span> ${l.message}</div>`;
                        }).join('')
                    }
                </div>
            </div>`;
    }

    // =====================================================
    // HUMAN APPROVAL QUEUE
    // =====================================================
    addApprovalRequest(req) {
        this.approvalQueue.push(req);
        this.renderApprovalQueueUI();
        const badge = document.getElementById('badge-pending-approvals');
        if (badge) {
            badge.innerText = `${this.approvalQueue.length} PENDING`;
            badge.className = 'badge badge-matrix-amber';
        }
    }

    renderApprovalQueueUI() {
        const container = document.getElementById('approval-queue-list');
        if (!container) return;

        if (this.approvalQueue.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending actions requiring human authorization.</div>';
            return;
        }

        let html = '';
        this.approvalQueue.forEach((req, idx) => {
            html += `
                <div style="background:rgba(0,15,7,0.7);border:1px solid var(--matrix-amber);border-radius:6px;padding:1rem;margin-bottom:1rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <h4 style="color:var(--matrix-amber);font-size:0.9rem;"><i class="fa-solid fa-triangle-exclamation"></i> ${req.title}</h4>
                        <span class="badge badge-matrix-red">RISK: ${req.riskScore}/100</span>
                    </div>
                    <p style="font-size:0.78rem;color:var(--text-muted);"><strong>Target:</strong> ${req.target} | <strong>Consensus:</strong> ${req.consensus || 'N/A'}</p>
                    <p style="font-size:0.78rem;color:var(--text-main);"><strong>Proposed:</strong> ${req.proposedAction}</p>
                    <p style="font-size:0.72rem;color:var(--text-muted);">${req.reasoning}</p>
                    <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
                        <button class="btn btn-matrix-green btn-sm btn-approve" data-idx="${idx}"><i class="fa-solid fa-check"></i> APPROVE & EXECUTE</button>
                        <button class="btn btn-matrix-red btn-sm btn-reject" data-idx="${idx}"><i class="fa-solid fa-xmark"></i> REJECT & OVERRIDE</button>
                    </div>
                </div>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.btn-approve').forEach(b => {
            b.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                const item = this.approvalQueue.splice(idx, 1)[0];
                this.addAuditLog('HUMAN_APPROVED', `Approved containment for ${item.target}`);
                this.renderApprovalQueueUI();
                SwarmEngine.emitLog('response', `HUMAN APPROVAL GRANTED: Executing containment on ${item.target}.`, 'success');
            });
        });

        container.querySelectorAll('.btn-reject').forEach(b => {
            b.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                const item = this.approvalQueue.splice(idx, 1)[0];
                this.addAuditLog('HUMAN_OVERRIDE', `Rejected containment for ${item.target}`);
                this.renderApprovalQueueUI();
                SwarmEngine.emitLog('approval', `HUMAN OVERRIDE: Action rejected by analyst.`, 'warning');
            });
        });
    }

    // =====================================================
    // AUDIT LOG
    // =====================================================
    addAuditLog(type, details) {
        this.auditLogs.unshift({ timestamp: new Date().toLocaleTimeString(), type, details });
        const container = document.getElementById('audit-log-container');
        if (!container) return;

        container.innerHTML = this.auditLogs.map(l => `
            <div style="font-size:0.68rem;margin-bottom:0.3rem;border-bottom:1px solid rgba(0,255,102,0.1);padding-bottom:0.2rem;">
                <span style="color:var(--matrix-green)">[${l.timestamp}]</span> <strong style="color:var(--matrix-amber)">${l.type}</strong>: ${l.details}
            </div>`).join('');
    }

    // =====================================================
    // MEMORY TAB VIEWS
    // =====================================================
    renderMemoryView(memType) {
        const headerTitle = document.getElementById('memory-view-header')?.querySelector('h3');
        const badge = document.getElementById('memory-count-badge');
        const body = document.getElementById('memory-view-body');
        if (!body) return;

        if (memType === 'episodic') {
            if (headerTitle) headerTitle.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> EPISODIC MEMORY STORE';
            if (badge) badge.innerText = `${SOCMemory.episodicMemory.length} Records`;

            body.innerHTML = SOCMemory.episodicMemory.map(item => `
                <div class="memory-card">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
                        <strong style="font-size:0.85rem;">${item.title}</strong>
                        <span class="matrix-pill">${item.id}</span>
                    </div>
                    <p style="font-size:0.78rem;color:var(--text-muted);"><strong>Root Cause:</strong> ${item.rootCause}</p>
                    <p style="font-size:0.78rem;color:var(--text-muted);"><strong>Actions:</strong> ${item.actionsTaken.join(', ')}</p>
                    <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--matrix-green);margin-top:0.3rem;">
                        <span>${item.resolutionOutcome}</span>
                        <span>MTTR: ${item.mttrSeconds}s</span>
                    </div>
                </div>`).join('');
        } else if (memType === 'semantic') {
            if (headerTitle) headerTitle.innerHTML = '<i class="fa-solid fa-network-wired"></i> SEMANTIC ASSET GRAPH';
            if (badge) badge.innerText = `${SOCMemory.semanticMemory.assetRegistry.length} Assets`;

            body.innerHTML = SOCMemory.semanticMemory.assetRegistry.map(a => `
                <div class="memory-card">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>${a.id} (${a.ip})</strong>
                        <span class="badge badge-matrix-${a.criticality === 'CRITICAL' ? 'red' : 'amber'}">${a.criticality}</span>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.3rem;">Type: ${a.type} | Enclave: ${a.enclave}</div>
                </div>`).join('');
        } else if (memType === 'rules') {
            if (headerTitle) headerTitle.innerHTML = '<i class="fa-solid fa-code"></i> YARA & SIGMA RULES';
            if (badge) badge.innerText = `${SOCTools.sigmaEngine.rules.length} Sigma / ${SOCTools.yaraEngine.rulesets.length} YARA`;

            body.innerHTML = SOCTools.sigmaEngine.rules.map(r => `
                <div class="memory-card">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>[${r.id}] ${r.title}</strong>
                        <span class="badge badge-matrix-red">${r.severity}</span>
                    </div>
                    <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.3rem;">${r.description}</p>
                    <div style="font-size:0.72rem;color:var(--matrix-cyan);margin-top:0.3rem;">MITRE: ${r.mitre_ttp}</div>
                </div>`).join('');
        } else {
            body.innerHTML = '<div class="empty-state">Knowledge base synced across all agent nodes.</div>';
        }
    }

    // =====================================================
    // DOUGHNUT CHART — Incident Type Distribution
    // =====================================================
    initChart() {
        const ctx = document.getElementById('chart-incident-types')?.getContext('2d');
        if (!ctx) return;

        Chart.defaults.color = '#6ba876';
        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ransomware', 'Cloud IAM Breach', 'APT Supply Chain', 'Phishing'],
                datasets: [{
                    data: [42, 28, 18, 12],
                    backgroundColor: ['#ff3b3b', '#b55fe6', '#00e6b8', '#ffb700'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#6ba876', font: { size: 10, family: 'Share Tech Mono' } } }
                }
            }
        });
    }

    // =====================================================
    // DIGITAL SOC TWIN
    // =====================================================
    initDigitalTwin() {
        window.SOCTwinInstance = new DigitalSOCTwin('digital-twin-canvas');
        document.getElementById('btn-twin-reset-view')?.addEventListener('click', () => window.SOCTwinInstance.resetTopology());
        document.getElementById('btn-twin-isolate-all')?.addEventListener('click', () => {
            window.SOCTwinInstance.setNodeStatus('FIN-SERVER-04', 'isolated');
            window.SOCTwinInstance.setNodeStatus('DC-PRIMARY-01', 'isolated');
        });
    }

    // =====================================================
    // EXECUTIVE REPORT MODAL
    // =====================================================
    openExecutiveReportModal() {
        const modal = document.getElementById('modal-report');
        const body = document.getElementById('report-modal-body');
        if (!modal || !body) return;

        const cr = SwarmEngine.consensusRecord;
        const consensusRows = cr.length > 0
            ? cr.map(v => `<tr><td style="padding:0.4rem;border:1px solid var(--matrix-card-border);color:${v.color};">${v.agent}</td><td style="padding:0.4rem;border:1px solid var(--matrix-card-border);">${v.vote}</td><td style="padding:0.4rem;border:1px solid var(--matrix-card-border);">${v.confidence}%</td></tr>`).join('')
            : '<tr><td colspan="3" style="padding:0.4rem;border:1px solid var(--matrix-card-border);">No consensus data. Run a simulation first.</td></tr>';

        body.innerHTML = `
            <div style="color:var(--text-main);line-height:1.6;">
                <h2 style="color:var(--matrix-green);border-bottom:2px solid var(--matrix-green);padding-bottom:0.5rem;">EXECUTIVE INCIDENT REPORT</h2>
                <p style="font-size:0.8rem;color:var(--text-muted);">Generated by AETHER//SOC Multi-Agent Intelligence Platform | ${new Date().toLocaleString()}</p>

                <h3 style="margin-top:1.5rem;">1. Executive Summary</h3>
                <p style="font-size:0.85rem;">The AETHER//SOC platform detected and autonomously investigated a critical security incident using ${Object.keys(SwarmEngine.agents).length} specialized agents with consensus-based decision making.</p>

                <h3 style="margin-top:1rem;">2. Multi-Agent Consensus Voting</h3>
                <table style="width:100%;border-collapse:collapse;font-size:0.8rem;margin:0.5rem 0;">
                    <thead><tr style="background:rgba(0,255,102,0.1);"><th style="padding:0.4rem;border:1px solid var(--matrix-card-border);text-align:left;">Agent</th><th style="padding:0.4rem;border:1px solid var(--matrix-card-border);">Vote</th><th style="padding:0.4rem;border:1px solid var(--matrix-card-border);">Confidence</th></tr></thead>
                    <tbody>${consensusRows}</tbody>
                </table>

                <h3 style="margin-top:1rem;">3. Root Cause Analysis Timeline</h3>
                ${SwarmEngine.rcaTimeline.map(ev => `<p style="font-size:0.8rem;"><strong style="color:var(--matrix-green);">${ev.time}:</strong> ${ev.title} — ${ev.description}</p>`).join('')}

                <h3 style="margin-top:1rem;">4. Regulatory Compliance</h3>
                <p style="font-size:0.85rem;">GDPR Article 33 72-hour breach notification SLA met. Complete immutable audit trail sealed.</p>
            </div>`;

        modal.classList.add('active');
    }

    downloadReportMarkdown() {
        const cr = SwarmEngine.consensusRecord;
        let text = `# EXECUTIVE INCIDENT REPORT\nGenerated: ${new Date().toISOString()}\n\n## Agent Consensus\n`;
        cr.forEach(v => { text += `- ${v.agent}: ${v.vote} (${v.confidence}%)\n`; });
        text += `\n## Root Cause Analysis\n`;
        SwarmEngine.rcaTimeline.forEach(ev => { text += `- ${ev.time}: ${ev.title} — ${ev.description}\n`; });

        const blob = new Blob([text], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `AETHER_SOC_Report_${Date.now()}.md`;
        a.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppController = new AetherSOCApp();
});
