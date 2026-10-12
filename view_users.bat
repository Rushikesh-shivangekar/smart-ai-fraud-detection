@echo off
title MySQL Users & Database Inspector
color 0A

echo =======================================================================
echo   MySQL Database Viewer - Smart AI Fraud Detection System
echo   Database: fraud_system  ^|  Table: users  ^|  Port: 3306
echo =======================================================================
echo.

if exist "%~dp0Capstone Project_1\venv\Scripts\python.exe" (
    "%~dp0Capstone Project_1\venv\Scripts\python.exe" "%~dp0view_users.py"
) else (
    python "%~dp0view_users.py"
)

pause
