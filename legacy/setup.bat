@echo off
echo ========================================
echo   Zenca Gamers Backend Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Running database migrations...
node scripts/migrate.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup completed successfully!
echo ========================================
echo.
echo Default admin credentials:
echo Email: admin@zencagamers.com
echo Password: admin123
echo.
echo To start the server:
echo npm run dev
echo.
echo API will be available at: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
pause