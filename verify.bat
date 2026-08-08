@echo off
setlocal
title TUESDAY Pre-Demo Verification
echo ==================================================================
echo   TUESDAY - Pre-Demo Health Check
echo ==================================================================

echo.
echo [1/4] Syntax-checking backend JavaScript...
set FAIL=0
for %%f in (server.js benchmark.js lib\*.js) do node --check "%%f" >nul 2>nul || set FAIL=1
if "%FAIL%"=="1" goto syntax_fail
echo   [OK] All backend JavaScript files parse cleanly.

echo.
echo [2/4] Checking config.json...
node -e "const c=require('./config.json'); if(!c.port||!c.model)process.exit(1); console.log('   [OK] port='+c.port+' model='+c.model+' ollama='+c.ollamaUrl)" 2>nul
if errorlevel 1 goto config_fail

echo.
echo [3/4] Checking data store integrity...
if not exist data\store.json goto no_store
node -e "JSON.parse(require('fs').readFileSync('data/store.json','utf8')); console.log('   [OK] store.json parses')" 2>nul
if errorlevel 1 goto store_fail
goto ollama_check

:no_store
echo   [ ] No store yet - first run will create it.

:ollama_check
echo.
echo [4/4] Checking Ollama connectivity + model...
curl -s -o nul http://localhost:11434/api/tags >nul 2>nul
if errorlevel 1 goto no_ollama
echo   [OK] Ollama reachable at localhost:11434
curl -s http://localhost:11434/api/tags 2>nul | findstr /i "qwen2.5:7b" >nul
if errorlevel 1 goto no_model
echo   [OK] Model qwen2.5:7b present - LLM AGENTIC engine will engage.
goto verdict

:no_ollama
echo   [!] Ollama not reachable - start the Ollama app first.
echo       The demo will use the RULE ENGINE fallback (still works).
goto verdict

:no_model
echo   [!] Model qwen2.5:7b not found - run: ollama pull qwen2.5:7b
echo       The demo will use the RULE ENGINE fallback (still works).

:verdict
echo.
echo ==================================================================
echo   Verdict: READY - run start.bat and open http://localhost:8090
echo ==================================================================
pause
exit /b 0

:syntax_fail
echo.
echo   [X] One or more JavaScript files failed syntax check.
echo       Run the checks above and fix before demoing.
pause
exit /b 1

:config_fail
echo.
echo   [X] config.json is invalid or missing required keys (port, model).
pause
exit /b 1

:store_fail
echo.
echo   [X] data\store.json is corrupt or unreadable.
pause
exit /b 1
