@echo off
echo ==========================================
echo    PACIFIC GAMERS - DEVELOPMENT SERVER
echo ==========================================
echo.
echo [1] Starting Node.js Server (Port 3000) with Live Watch...
echo [2] Opening index.html in your default browser...
echo.
echo Press Ctrl+C to stop the server when you are done.
echo.

:: Open browser (with a small delay to ensure server started)
timeout /t 2 /nobreak > nul
start http://localhost:3000/index.html

:: Start Node.js Server in Watch Mode
node --watch server.js
