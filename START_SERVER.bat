@echo off
echo ==========================================
echo    ZENCA GAMERS - DEVELOPMENT SERVER
echo ==========================================
echo.
echo [1] Starting Node.js Server on http://localhost:3000
echo [2] Opening login.html in your default browser...
echo.
echo Press Ctrl+C to stop the server when you are done.
echo.

:: Open browser
start http://localhost:3000/login.html

:: Start Node.js Server
node server.js
