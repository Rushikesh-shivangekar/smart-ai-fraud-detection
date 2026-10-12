@echo off
title Launch Smart AI Fraud Detection Project
echo =======================================================================
echo   Launching Smart AI Fraud Detection System (React + FastAPI + AI Engine)
echo =======================================================================
echo.
echo [1/3] Launching FastAPI Backend on 0.0.0.0:8000 (Accessible to PC and Phone) ...
start "FastAPI Backend (8000)" cmd /k "cd /d "%~dp0Capstone Project_1\backend" && if exist "..\venv\Scripts\python.exe" ("..\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload) else (python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload)"

timeout /t 3 /nobreak >nul

echo [2/3] Launching React Frontend on http://localhost:5173 (Network Shared) ...
start "React Frontend (5173)" cmd /k "cd /d "%~dp0New_frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 2 /nobreak >nul

echo [3/3] Opening SecurePay Web Application in Browser ...
start http://localhost:5173

echo.
echo =======================================================================
echo   Both services started successfully!
echo   Local PC URL    : http://localhost:5173
echo   API Docs URL    : http://127.0.0.1:8000/docs
echo   Android / APK IP: Enter your laptop's IP (e.g. http://172.22.37.151:8000)
echo =======================================================================
timeout /t 4
