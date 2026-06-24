@echo off
REM Quick local web server start script for testing (Windows)
REM Usage: start-web-server.bat [port]

setlocal enabledelayedexpansion

if "%1"=="" (
    set PORT=8000
) else (
    set PORT=%1
)

echo.
echo Starting web server for Daily Notes web version...
echo.
echo Select your method:
echo.
echo 1) Python 3 (Recommended - if installed)
echo 2) Node.js http-server
echo 3) Node.js live-server (auto-reload)
echo.

set /p method="Choose method (1-3): "

if "!method!"=="1" (
    echo.
    echo Checking for Python 3...
    where python >nul 2>nul
    if !errorlevel! neq 0 (
        echo Python 3 not found. Please install Python or choose another method.
        pause
        exit /b 1
    )
    echo.
    echo Starting Python HTTP server on http://localhost:!PORT!
    echo Press Ctrl+C to stop
    echo.
    cd web
    python -m http.server !PORT!
) else if "!method!"=="2" (
    echo.
    echo Installing http-server...
    call npm install -g http-server
    echo.
    echo Starting http-server on http://localhost:!PORT!
    echo Press Ctrl+C to stop
    echo.
    call http-server web -p !PORT!
) else if "!method!"=="3" (
    echo.
    echo Installing live-server...
    call npm install -g live-server
    echo.
    echo Starting live-server (auto-reload enabled)
    echo Press Ctrl+C to stop
    echo.
    call live-server web
) else (
    echo Invalid choice
    pause
    exit /b 1
)
