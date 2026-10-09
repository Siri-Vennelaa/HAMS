@echo off
echo ====================================================
echo Installing HAMS Dependencies (Server and Client)
echo ====================================================
echo.
echo [1/2] Installing Server dependencies...
cd /d "%~dp0server"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b %errorlevel%
)
echo [OK] Server dependencies installed successfully.
echo.
echo [2/2] Installing Client dependencies...
cd /d "%~dp0client"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b %errorlevel%
)
echo [OK] Client dependencies installed successfully.
echo.
echo ====================================================
echo Setup Complete! Double-click "start-hams.bat" to launch.
echo ====================================================
pause
