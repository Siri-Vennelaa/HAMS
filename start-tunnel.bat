@echo off
echo ====================================================
echo Starting HAMS Public External Cloudflare Tunnel
echo ====================================================
echo.
echo Make sure the server is running on port 5000 (via start-hams.bat).
echo Generating secure public HTTPS link...
echo.
npx.cmd --yes cloudflared tunnel --url http://localhost:5000
pause
