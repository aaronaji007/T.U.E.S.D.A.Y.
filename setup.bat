@echo off
setlocal
title TUESDAY One-Time Setup
echo ==================================================================
echo   TUESDAY - Agentic AI Swarm SOC - One-Time Setup
echo ==================================================================

echo.
echo [STEP 1/3] Checking Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Node.js installed:
    node --version
) else (
    echo   [X] Node.js NOT installed.
    echo       Download and install LTS 20+ from: https://nodejs.org
    echo       Then run this script again.
    pause
    exit /b 1
)

echo.
echo [STEP 2/3] Checking Ollama (local LLM runtime)...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Ollama installed.
) else (
    echo   [ ] Ollama not found on PATH.
    echo       Download and install from: https://ollama.com/download
    echo       (You can skip this - the demo still runs on the rule-engine fallback)
)

echo.
echo [STEP 3/3] Checking the local reasoning model (qwen2.5:7b)...
where ollama >nul 2>nul
if errorlevel 1 goto :no_ollama

ollama list >nul 2>nul
if errorlevel 1 (
    echo   [!] Ollama app is not running. Start it once from the tray, then re-run this script.
    echo       Until then the demo uses the rule-engine fallback.
    goto :done
)

set NEED_PULL=0
for /f "tokens=1" %%m in ('ollama list 2^>nul') do if /i "%%m"=="qwen2.5:7b" set FOUND_MODEL=1
if defined FOUND_MODEL (
    echo   [OK] Model qwen2.5:7b already downloaded.
    goto :done
)
echo   [ ] Model qwen2.5:7b not downloaded yet (~4.7 GB).
set NEED_PULL=1

:no_ollama
if not defined NEED_PULL set NEED_PULL=0
if "%NEED_PULL%"=="1" (
    echo.
    set /p DO_PULL="Download qwen2.5:7b now? (y/n): "
    if /i "%DO_PULL%"=="y" (
        ollama pull qwen2.5:7b
        if errorlevel 1 (
            echo   [X] Model pull failed. Ensure Ollama is running first.
        ) else (
            echo   [OK] Model ready.
        )
    )
)

:done
echo.
echo ==================================================================
echo   Setup complete. Run start.bat to launch.
echo   Tip: for faster runs use: ollama pull qwen2.5:3b (2 GB) and set
echo   "model": "qwen2.5:3b" in config.json
echo ==================================================================
pause
