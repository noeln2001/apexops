# ApexOps PowerShell Launch Script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Starting ApexOps — Motorsport Technology & Intelligence Platform" -ForegroundColor White
Write-Host "Reference Date Anchor: 20 October 2026" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan

# 1. Initialize DB and Seed
python -m data_engine.etl.seed_initial_data

# 2. Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Frontend
Set-Location "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "ApexOps Services Started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend Docs: http://127.0.0.1:8000/api/v1/docs" -ForegroundColor Yellow
