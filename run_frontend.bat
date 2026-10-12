@echo off
title Smart AI Fraud Detection - React Frontend (Port 5173)
cd /d "%~dp0New_frontend"
echo ========================================================
echo Starting React Frontend on http://localhost:5173 (Network Shared)...
echo ========================================================
npm run dev -- --host 0.0.0.0
pause
