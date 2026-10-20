@echo off
cd /d "%~dp0\.."
echo ===============================================================
echo Running ApexOps Automated Test Suite
echo ===============================================================

echo 1. Running Unit and Integration Tests...
python -m pytest tests/unit tests/integration -v
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Test suite failed!
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Running Repeatable Performance Benchmarks...
python -m tests.performance.test_benchmarks

echo.
echo [SUCCESS] All automated tests and benchmarks passed cleanly!
pause
