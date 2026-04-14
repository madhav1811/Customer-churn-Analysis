@echo off
echo ==================================================
echo Starting Customer Churn Analytics Frontend...
echo ==================================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] First time setup: Installing dependencies...
    call npm install
)

echo [INFO] Starting Vite development server...
call npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] The frontend failed to start. 
    echo Please make sure Node.js (npm) is installed and in your PATH.
)
pause
