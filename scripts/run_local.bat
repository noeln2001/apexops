@echo off
echo ===============================================================
echo Starting ApexOps - Motorsport Technology & Intelligence Platform
echo ===============================================================
echo Project Anchor Reference Date: 20 October 2026

REM Navigate to project root
cd /d "%~dp0\.."

echo Checking database schema and seeding initial data if needed...
python -m data_engine.etl.seed_initial_data

echo Launching ApexOps Core Backend on http://127.0.0.1:8000 ...
start "ApexOps Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Launching Frontend Development Server on http://localhost:5173 ...
cd frontend
start "ApexOps Frontend" cmd /k "npm run dev"

echo.
echo ApexOps Platform is booting!
echo Frontend UI: http://localhost:5173
echo Backend API & Swagger: http://127.0.0.1:8000/api/v1/docs
echo ===============================================================
pause
