@echo off
title Smart AI Fraud Detection - FastAPI Backend (Port 8000)
cd /d "%~dp0backend"
echo ========================================================
echo Starting FastAPI Fraud Detection Engine on Port 8000...
echo ========================================================
set OPENBLAS_NUM_THREADS=1
set OMP_NUM_THREADS=1
set MKL_NUM_THREADS=1
set VECLIB_MAXIMUM_THREADS=1
set NUMEXPR_NUM_THREADS=1

if exist "..\venv\Scripts\python.exe" (
    "..\venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)
pause
