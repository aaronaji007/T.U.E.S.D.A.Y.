@echo off
title AETHER-SOC One-Time Setup
echo ==================================================================
echo   AETHER // MATRIX SOC - One-Time Setup
echo ==================================================================

echo.
echo [STEP 1/3] Checking Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Node.js installed: 
    node --version
) else (
    echo   [X] Node.js NOT installed.
    echo       Download and install LTS from: https://nodejs.org
    echo       Then run this script again.
    pause
    exit /b 1
)

echo.
echo [STEP 2/3] Checking Ollama...
where ollama >nul 2>nul
if %errorlevel% equ 0 (
    echo   [OK] Ollama installed.
) else (
    echo   [ ] Ollama not found on PATH.
    echo       Download and install from: https://ollama.com/download
    echo       (You can skip this - demo still runs on rule-engine fallback)
)

echo.
echo [STEP 3/3] Pulling the local reasoning model (qwen2.5:7b, ~4.7GB)...
echo       On an RTX 4060 this runs at good speed with tool calling.
echo.
set /p DO_PULL="Download model now? (y/n): "
if /i "%DO_PULL%"=="y" (
    ollama pull qwen2.5:7b
    if %errorlevel% neq 0 (
        echo   [X] Model pull failed. Ensure Ollama is running first.
    ) else (
        echo   [OK] Model ready.
    )
)

echo.
echo ==================================================================
echo   Setup complete. Run start.bat to launch.
echo   Tip: for faster runs use: ollama pull qwen2.5:3b (2GB) and set
echo   "model": "qwen2.5:3b" in config.json
echo ==================================================================
pause
