# KisanKhata Local Development Runner
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Starting KisanKhata (Spring Boot 8080 + Vite 3000)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$PSScriptRoot\backend\maven\apache-maven-3.9.6\bin;$env:Path"

Write-Host "[1/2] Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$PSScriptRoot\backend`" && mvnw.cmd spring-boot:run"

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:3000..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$PSScriptRoot\frontend`" && npm run dev"

Write-Host "`nKisanKhata is launching!" -ForegroundColor Yellow
Write-Host "  Frontend UI : http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API : http://localhost:8080" -ForegroundColor White
