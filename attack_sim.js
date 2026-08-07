/* ==========================================================================
   TUESDAY: Purple Team Attack Simulator Engine
   ========================================================================== */

const AttackSimulator = {
    scenarios: {
        ransomware: {
            id: 'SIM-001',
            title: 'LockBit 3.0 Ransomware Outbreak',
            source: 'CrowdStrike EDR',
            targetHost: 'FIN-SERVER-04 (192.168.10.45)',
            ioc: '185.220.101.5 (Tor C2 Node)',
            payload: 'powershell.exe -enc SQBFAFgAKABOAGUAdw... vssadmin delete shadows /all /quiet & LockBit3.0_Payload.exe',
            description: 'Spearphishing executable launched in Finance Enclave -> Dumping LSASS -> Shadow Copies Deleted -> File Encryption staged.'
        },
        cloud_exfil: {
            id: 'SIM-002',
            title: 'AWS S3 Cloud Exfiltration via Leaked IAM Key',
            source: 'AWS GuardDuty',
            targetHost: 'AWS-S3-PROD-LOGS (10.0.4.12)',
            ioc: '193.142.146.35 (Malicious Proxy)',
            payload: 'sts:AssumeRole arn:aws:iam::123456789012:role/DataAdmin -> S3:ListBuckets -> Bulk KMS GetObject exfiltration',
            description: 'Stolen AWS access key used to assume administrator role, bypass KMS limits, and initiate bulk S3 bucket downloading.'
        },
        apt_supply_chain: {
            id: 'SIM-003',
            title: 'APT Supply Chain Trojan (SUNBURST Variant)',
            source: 'Microsoft Entra ID / SIEM',
            targetHost: 'DC-PRIMARY-01 (192.168.1.10)',
            ioc: '45.154.255.87 (APT C2 Server)',
            payload: 'SolarWinds.Orion.Core.BusinessLayer.dll injected into memory -> DNS Tunneling C2 Beaconing -> Golden Ticket requested.',
            description: 'Trojanized software update binary executes quietly inside Domain Controller enclave and initiates encrypted C2 DNS tunneling.'
        }
    },

    executeScenario(scenarioKey) {
        const scenario = this.scenarios[scenarioKey];
        if (!scenario) return;

        // Ingest into SOC System
        window.AppController.handleIncomingAlert({
            id: scenario.id,
            title: scenario.title,
            source: scenario.source,
            targetHost: scenario.targetHost,
            ioc: scenario.ioc,
            payload: scenario.payload,
            timestamp: new Date().toLocaleTimeString()
        });
    }
};
