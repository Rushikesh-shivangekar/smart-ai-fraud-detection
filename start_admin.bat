@echo off
title Launch SecurePay UPI - Admin & Database Management Server
echo =======================================================================
echo   Launching SecurePay UPI (Admin Database Server + React + AI Engine)
echo =======================================================================
echo.
echo [1/3] Launching FastAPI Backend with 0.0.0.0 Binding ...
start "FastAPI Backend (8000)" cmd /k "cd /d "%~dp0Capstone Project_1\backend" && if exist "..\venv\Scripts\python.exe" ("..\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload) else (python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload)"

timeout /t 3 /nobreak >nul

echo [2/3] Launching React Frontend on http://localhost:5173 ...
start "React Frontend (5173)" cmd /k "cd /d "%~dp0New_frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 2 /nobreak >nul

echo [3/3] Opening SecurePay Web App (Click Lock icon in header for Admin Panel) ...
start http://localhost:5173

echo.
echo =======================================================================
echo   Admin Database Services Started!
echo   App URL       : http://localhost:5173
echo   Admin Access  : Click the Lock icon in the app header
echo   Swagger Docs  : http://127.0.0.1:8000/docs
echo   Admin Security: Restrict to Localhost (127.0.0.1) with Bearer JWT
echo =======================================================================
timeout /t 5
