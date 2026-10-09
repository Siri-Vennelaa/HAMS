@echo off
echo ====================================================
echo Starting Hospital Appointment Management System (HAMS)
echo ====================================================
echo.
echo Launching Backend Server on port 5000...
start "HAMS Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm start"

echo Waiting 3 seconds for backend initialization...
timeout /t 3 /nobreak >nul

echo Launching Frontend Client on port 5173...
start "HAMS Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ====================================================
echo System Running!
echo Browser URL: http://localhost:5173
echo ====================================================
