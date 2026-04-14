@echo off
echo Starting Customer Churn Analytics Backend...
cd "%~dp0"
if not exist "venv" (
    echo Virtual environment not found in root. Trying backend\venv...
    if exist "backend\venv" (
        set VENV_PATH=backend\venv
    ) else (
        echo Error: No virtual environment found. Please let Antigravity set it up.
        pause
        exit /b
    )
) else (
    set VENV_PATH=venv
)

call %VENV_PATH%\Scripts\activate
python -m uvicorn backend.app:app --reload
pause
