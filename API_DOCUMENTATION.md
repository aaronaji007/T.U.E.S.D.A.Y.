# AETHER-SOC API & Integration Specifications

## 1. External Threat Intelligence Tool APIs

### 1.1 VirusTotal v3 REST API Integration
- **Endpoint:** `POST /api/v3/ip_addresses/{ip}`
- **Response Format:**
```json
{
  "tool": "VirusTotal v3 API",
  "positives": 68,
  "total": 92,
  "reputation": -85,
  "as_owner": "AS20860 Tor Exit Router Enclave",
  "categories": ["Command & Control", "Botnet"]
}
```

### 1.2 AbuseIPDB v2 API Integration
- **Endpoint:** `GET /api/v2/check?ipAddress={ip}`
- **Response Format:**
```json
{
  "tool": "AbuseIPDB v2 API",
  "abuseConfidenceScore": 98,
  "countryCode": "RU",
  "totalReports": 1420
}
```

### 1.3 Sigma Rules Correlation Engine API
- **Method:** `SOCTools.sigmaEngine.scanLog(rawLogPayload)`
- **Response Format:**
```json
{
  "scanned": true,
  "matchesFound": 1,
  "matchedRules": [
    {
      "id": "SIGMA-2026-001",
      "title": "Suspicious Encoded PowerShell Execution",
      "severity": "Critical",
      "mitre_ttp": "T1059.001"
    }
  ]
}
```

---

## 2. Multi-Agent Swarm Bus API

### 2.1 Ingest Alert Endpoint
- **Method:** `SwarmEngine.processIncidentAlert(alertObject)`
- **Payload:**
```json
{
  "id": "ALERT-8891",
  "title": "LockBit 3.0 Ransomware Execution Attempt",
  "source": "CrowdStrike EDR",
  "targetHost": "FIN-SERVER-04 (192.168.10.45)",
  "ioc": "185.220.101.5",
  "payload": "powershell.exe -enc ... vssadmin delete shadows"
}
```

### 2.2 Event Stream Subscriber
- **Method:** `SwarmEngine.onLogMessage((agentKey, logText, type) => { ... })`
