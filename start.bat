@echo off
title AETHER-SOC Autonomous Multi-Agent Platform
echo Launching AETHER-SOC Web Server...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
