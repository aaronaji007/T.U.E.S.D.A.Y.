/* ==========================================================================
   AETHER-SOC: MITRE ATT&CK Matrix & Root Cause Analysis Engine
   ========================================================================== */

const MitreEngine = {
    tactics: [
        {
            name: "Initial Access",
            techniques: [
                { id: "T1566", name: "Phishing", desc: "Spearphishing links/attachments" },
                { id: "T1190", name: "Exploit Public App", desc: "Web server zero-day exploit" },
                { id: "T1078", name: "Valid Accounts", desc: "Compromised cloud IAM credentials" }
            ]
        },
        {
            name: "Execution",
            techniques: [
                { id: "T1059", name: "Command Interpreter", desc: "PowerShell / CMD encoded execution" },
                { id: "T1204", name: "User Execution", desc: "Malicious payload launched by user" },
                { id: "T1047", name: "WMI Execution", desc: "Windows Management Instrumentation" }
            ]
        },
        {
            name: "Persistence",
            techniques: [
                { id: "T1547", name: "Boot Autostart", desc: "Registry run keys / startup folder" },
                { id: "T1053", name: "Scheduled Task", desc: "Task Scheduler persistence" }
            ]
        },
        {
            name: "Defense Evasion",
            techniques: [
                { id: "T1027", name: "Obfuscated Files", desc: "Base64 payload encoding / packer" },
                { id: "T1562", name: "Impair Defenses", desc: "Disabling EDR agent / Antivirus" },
                { id: "T1490", name: "Inhibit Recovery", desc: "vssadmin shadow copy deletion" }
            ]
        },
        {
            name: "Credential Access",
            techniques: [
                { id: "T1003", name: "OS Credential Dumping", desc: "LSASS process memory reading" },
                { id: "T1110", name: "Brute Force", desc: "Password spraying against Entra ID" }
            ]
        },
        {
            name: "Lateral Movement",
            techniques: [
                { id: "T1021", name: "Remote Services", desc: "SMB / WinRM / PsExec lateral jump" },
                { id: "T1570", name: "Tool Transfer", desc: "Staging Cobalt Strike beacon DLLs" }
            ]
        },
        {
            name: "Impact / Exfil",
            techniques: [
                { id: "T1486", name: "Data Encrypted", desc: "Ransomware AES/RSA file encryption" },
                { id: "T1567", name: "Exfil to Web Service", desc: "S3 KMS data download & external POST" }
            ]
        }
    ],

    detectedTTPs: new Set(),

    renderMatrix(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        this.tactics.forEach(tactic => {
            html += `<div class="mitre-column">
                <div class="mitre-header">${tactic.name}</div>`;
            
            tactic.techniques.forEach(tech => {
                const isDetected = this.detectedTTPs.has(tech.id);
                html += `
                    <div class="mitre-card ${isDetected ? 'detected' : ''}" data-ttp="${tech.id}" title="${tech.desc}">
                        <div class="ttp-id">${tech.id}</div>
                        <div class="ttp-name">${tech.name}</div>
                    </div>
                `;
            });

            html += `</div>`;
        });

        container.innerHTML = html;

        // Update badge
        const badge = document.getElementById('mitre-active-ttp-count');
        if (badge) {
            badge.innerText = `${this.detectedTTPs.size} Active TTPs Detected`;
        }
    },

    flagTTP(ttpId) {
        this.detectedTTPs.add(ttpId);
        this.renderMatrix('mitre-matrix-container');
    },

    clearTTPs() {
        this.detectedTTPs.clear();
        this.renderMatrix('mitre-matrix-container');
    }
};
