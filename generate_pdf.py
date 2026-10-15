#!/usr/bin/env python3
import re
import subprocess
import markdown

def build_html():
    with open('/home/twilight/Projects/TUESDAY/PROJECT_REPORT.md', 'r') as f:
        md_text = f.read()

    # Pre-process Mermaid blocks: replace ```mermaid ... ``` with <div class="mermaid">...</div>
    def repl_mermaid(match):
        content = match.group(1).strip()
        return f'<div class="mermaid">\n{content}\n</div>'

    md_text = re.sub(r'```mermaid\s*([\s\S]*?)```', repl_mermaid, md_text)

    # Convert Markdown to HTML
    html_content = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'nl2br']
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TUESDAY - Project Report</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<script>
    mermaid.initialize({{
        startOnLoad: true,
        theme: 'neutral',
        securityLevel: 'loose'
    }});
</script>
<style>
    @page {{
        size: A4;
        margin: 20mm 15mm 20mm 15mm;
        @bottom-right {{
            content: counter(page);
        }}
    }}
    
    body {{
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
        color: #1a202c;
        line-height: 1.6;
        font-size: 11pt;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }}

    /* Cover Page Styling */
    .cover-page {{
        page-break-after: always;
        height: 90vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;
        border: 2px solid #2d3748;
        padding: 30px 20px;
        box-sizing: border-box;
    }}

    .cover-header h1 {{
        font-size: 22pt;
        font-weight: 800;
        color: #1a365d;
        margin-bottom: 4px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }}

    .cover-header h3 {{
        font-size: 12pt;
        font-weight: 600;
        color: #4a5568;
        margin-top: 0;
        text-transform: uppercase;
        border-bottom: 2px solid #3182ce;
        display: inline-block;
        padding-bottom: 6px;
    }}

    .cover-title {{
        margin: 40px 0;
    }}

    .cover-title h2 {{
        font-size: 14pt;
        font-weight: 600;
        color: #718096;
        margin-bottom: 5px;
        letter-spacing: 1px;
    }}

    .cover-title .main-title {{
        font-size: 32pt;
        font-weight: 900;
        color: #2b6cb0;
        margin: 5px 0 10px 0;
        letter-spacing: 2px;
    }}

    .cover-title .subtitle {{
        font-size: 13pt;
        font-weight: 500;
        color: #2d3748;
        max-width: 650px;
        margin: 0 auto 15px auto;
        font-style: italic;
    }}

    .cover-award {{
        background: #ebf8ff;
        border: 1px solid #bee3f8;
        color: #2b6cb0;
        display: inline-block;
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 10.5pt;
        font-weight: 700;
        margin-top: 10px;
    }}

    .cover-team {{
        margin: 30px auto;
        width: 90%;
    }}

    .cover-team table {{
        width: 100%;
        border-collapse: collapse;
        font-size: 10pt;
    }}

    .cover-team th {{
        background: #2b6cb0;
        color: #ffffff;
        font-weight: 600;
        padding: 8px 12px;
        text-align: left;
    }}

    .cover-team td {{
        padding: 6px 12px;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
    }}

    .cover-team tr:nth-child(even) {{
        background: #f7fafc;
    }}

    .cover-footer {{
        font-size: 11pt;
        font-weight: 600;
        color: #4a5568;
    }}

    /* Main Content Typography */
    h1, h2, h3, h4 {{
        color: #1a365d;
        font-weight: 700;
        page-break-after: avoid;
    }}

    h1 {{
        font-size: 18pt;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 6px;
        margin-top: 24pt;
    }}

    h2 {{
        font-size: 14pt;
        margin-top: 18pt;
        color: #2b6cb0;
    }}

    h3 {{
        font-size: 12pt;
        margin-top: 14pt;
    }}

    p, li {{
        font-size: 10.5pt;
        color: #2d3748;
        text-align: justify;
    }}

    ul, ol {{
        padding-left: 20px;
    }}

    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        font-size: 9.5pt;
        page-break-inside: avoid;
    }}

    table, th, td {{
        border: 1px solid #cbd5e0;
    }}

    th {{
        background: #edf2f7;
        color: #2d3748;
        padding: 8px 10px;
        font-weight: 700;
        text-align: left;
    }}

    td {{
        padding: 7px 10px;
        vertical-align: top;
    }}

    tr:nth-child(even) td {{
        background-color: #f7fafc;
    }}

    pre, code {{
        font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
    }}

    pre {{
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #3182ce;
        padding: 10px 14px;
        border-radius: 4px;
        font-size: 9pt;
        overflow-x: auto;
        page-break-inside: avoid;
        line-height: 1.45;
    }}

    code {{
        background: #edf2f7;
        color: #805ad5;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 9pt;
    }}

    pre code {{
        background: none;
        color: #2d3748;
        padding: 0;
    }}

    .mermaid {{
        margin: 20px auto;
        text-align: center;
        page-break-inside: avoid;
        background: #ffffff;
        padding: 10px;
        border-radius: 6px;
    }}

    hr {{
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 24px 0;
    }}

    /* Table of contents styling */
    ul li a {{
        color: #3182ce;
        text-decoration: none;
    }}
    
    ul li a:hover {{
        text-decoration: underline;
    }}
</style>
</head>
<body>

<!-- Custom Formatted Cover Page -->
<div class="cover-page">
    <div class="cover-header">
        <h1>Christ College of Engineering</h1>
        <h3 style="letter-spacing: 1px;">Irinjalakuda, Thrissur, Kerala</h3><br>
        <h3 style="margin-top: 5px; font-size: 11pt; color: #4a5568;">Department of Computer Science & Engineering</h3>
    </div>

    <div class="cover-title">
        <h2>TECHNICAL PROJECT REPORT</h2>
        <div class="main-title">T.U.E.S.D.A.Y.</div>
        <div class="subtitle">Threat Unification Engine for Security Defense And Your SOC</div>
        <p style="text-align: center; font-size: 10pt; color: #718096; max-width: 580px; margin: 0 auto;">
            An Autonomous, Multi-Agent Artificial Intelligence Ecosystem for Air-Gapped and Cloud-Augmented Security Operations Centers
        </p>
        <div style="margin-top: 15px;">
            <span class="cover-award">🏆 1st Place Winner — Cyber Security Track (Neurobots National Hackathon 2026)</span>
        </div>
    </div>

    <div class="cover-team">
        <h4 style="margin-bottom: 8px; text-transform: uppercase; color: #2d3748; letter-spacing: 0.5px;">Project Team Members</h4>
        <table>
            <thead>
                <tr>
                    <th style="width: 8%; text-align: center;">#</th>
                    <th style="width: 32%;">Student Name</th>
                    <th style="width: 60%;">Role / Area of Specialization</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center;">1</td>
                    <td><strong>Aaron Aji</strong></td>
                    <td>Team Lead & Multi-Agent Architecture</td>
                </tr>
                <tr>
                    <td style="text-align: center;">2</td>
                    <td><strong>Joseph John</strong></td>
                    <td>Backend Systems & Tool Integration</td>
                </tr>
                <tr>
                    <td style="text-align: center;">3</td>
                    <td><strong>Kevin Benny</strong></td>
                    <td>SIEM / EDR Telemetry & Log Analysis</td>
                </tr>
                <tr>
                    <td style="text-align: center;">4</td>
                    <td><strong>Harigovind</strong></td>
                    <td>Malware Detonation & YARA Scanning Engine</td>
                </tr>
                <tr>
                    <td style="text-align: center;">5</td>
                    <td><strong>Savio Prince</strong></td>
                    <td>Frontend Visualization & Digital SOC Twin</td>
                </tr>
                <tr>
                    <td style="text-align: center;">6</td>
                    <td><strong>Mohammed Sabith</strong></td>
                    <td>Consensus Algorithms & Risk Scoring</td>
                </tr>
                <tr>
                    <td style="text-align: center;">7</td>
                    <td><strong>Aditya Menon</strong></td>
                    <td>Threat Intelligence & IOC Enrichment</td>
                </tr>
                <tr>
                    <td style="text-align: center;">8</td>
                    <td><strong>Abhijith Suresh</strong></td>
                    <td>Governance, Safety Gates & Compliance Auditing</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="cover-footer">
        <div>Academic Year: 2025 – 2026</div>
    </div>
</div>

<div class="content-body">
{html_content}
</div>

<script>
    // Remove duplicate title markdown if present in html_content
    document.addEventListener("DOMContentLoaded", function() {{
        const firstDiv = document.querySelector('.content-body div[align="center"]');
        if (firstDiv) {{
            firstDiv.remove();
        }}
        const firstH1 = document.querySelector('.content-body h1');
        if (firstH1 && firstH1.innerText.includes("PROJECT REPORT")) {{
            firstH1.remove();
        }}
        const firstHr = document.querySelector('.content-body hr');
        if (firstHr) {{
            firstHr.remove();
        }}
    }});
</script>

</body>
</html>
"""

    with open('/home/twilight/Projects/TUESDAY/report_styled.html', 'w') as f:
        f.write(full_html)
    print("HTML written successfully.")

if __name__ == '__main__':
    build_html()
