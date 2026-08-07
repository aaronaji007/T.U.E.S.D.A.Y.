@echo off
title AETHER-SOC Agentic AI Swarm
setlocal

echo ==================================================================
echo   AETHER // MATRIX SOC - AGENTIC AI SWARM v3.0
echo ==================================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found.
    echo     Install it from https://nodejs.org (LTS 20+ recommended)
    echo     then run this script again.
    pause
    exit /b 1
)

echo [*] Node.js found.
echo [*] Checking Ollama (local LLM runtime)...
curl -s -o nul -w "%%{http_code}" http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Ollama detected at localhost:11434
) else (
    echo [!] Ollama not detected.
    echo     Install it from https://ollama.com then run: ollama pull qwen2.5:7b
    echo     The demo will run on the rule-engine fallback until then.
)

echo [*] Starting agentic swarm server on http://localhost:8090
echo     (Keep this window open. Browser will auto-open shortly.)
echo.
node server.js
pause
