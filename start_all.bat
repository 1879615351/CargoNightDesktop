@echo off
echo === CargoNight - Starting All Services ===

REM 1. Start PostgreSQL
echo [1/2] Starting PostgreSQL...
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I "postgres.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo   PostgreSQL already running
) else (
    start /B "" "C:\Program Files\PostgreSQL\16\bin\postgres.exe" -D "C:\Program Files\PostgreSQL\16\data" >NUL 2>&1
    echo   PostgreSQL started
    timeout /t 3 /nobreak >NUL
)

REM 2. Start CargoNightServer
echo [2/2] Starting CargoNightServer...
tasklist /FI "IMAGENAME eq cargo-night-server.exe" 2>NUL | find /I "cargo-night-server.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo   Server already running
) else (
    cd /d C:\Users\18796\Desktop\20260429\CargoNightServer
    start /B "" target\debug\cargo-night-server.exe > server.log 2>&1
    echo   Server started
)

echo.
echo === All services started ===
echo PostgreSQL : localhost:5432
echo API Server : http://localhost:8080
echo.
echo Now run: cd CargoNight ^&^& npm run tauri:dev
echo.
pause
