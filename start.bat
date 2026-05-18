@echo off
title Omni Swim Matrix
echo ===================================================
echo [ OMNI SWIM MATRIX INITIALIZATION ]
echo ===================================================

node -v >nul 2>&1
if errorlevel 1 goto missing_node
echo [OK] Node.js is installed.

if not exist "node_modules\" (
    echo [!] Installing JavaScript dependencies...
    call npm install
)

python --version >nul 2>&1
if errorlevel 1 goto missing_python
echo [OK] Python is installed.

if not exist "venv\" (
    echo [!] Creating Python virtual environment...
    python -m venv venv
)
echo [OK] Virtual environment ready.

echo ===================================================
echo [!] CLEANING UP STALE SERVER PROCESSES...
echo ===================================================
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ===================================================
echo [!] STARTING OMNI SWIM APP...
echo [!] A browser tab will open automatically.
echo [!] KEEP THIS WINDOW OPEN to maintain the server.
echo ===================================================

start "" cmd /c "timeout /t 5 /nobreak > nul & start http://localhost:3000"
cmd /k npm run dev
pause
exit /b

:missing_node
echo [!] Node.js is not installed. Please install Node.js from https://nodejs.org/
pause
exit /b

:missing_python
echo [!] Python is not installed. Please install Python from https://www.python.org/
pause
exit /b
