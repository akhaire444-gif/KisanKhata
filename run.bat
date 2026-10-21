@echo off
echo ========================================================
echo   Starting KisanKhata (Spring Boot 8080 + Vite 3000)
echo ========================================================

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%~dp0backend\maven\apache-maven-3.9.6\bin;%PATH%"

echo [1/2] Starting Spring Boot Backend on http://localhost:8080...
start "KisanKhata Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting React + Vite Frontend on http://localhost:3000...
start "KisanKhata Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo KisanKhata is launching!
echo   Frontend UI : http://localhost:3000
echo   Backend API : http://localhost:8080
echo ========================================================
