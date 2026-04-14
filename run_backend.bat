@echo off
echo ==================================================
echo Starting Customer Churn Analytics Backend...
echo ==================================================
cd /d "%~dp0"

set VENV_PATH=
if exist "venv\Scripts\activate.bat" (
    set "VENV_PATH=venv"
) else if exist "backend\venv\Scripts\activate.bat" (
    set "VENV_PATH=backend\venv"
)

if "%VENV_PATH%"=="" (
    echo [ERROR] Virtual environment not found! 
    echo Please make sure a 'venv' folder exists in the root or 'backend' folder.
    pause
    exit /b
)

echo [INFO] Found virtual environment at: %VENV_PATH%
call "%VENV_PATH%\Scripts\activate.bat"
echo [INFO] Environment activated. Starting Uvicorn on Port 8005...

python -m uvicorn backend.app:app --reload --port 8005
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The backend failed to start. 
    echo Please check if Port 8005 is blocked or if dependencies are missing.
)
pause
