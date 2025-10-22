# Check Environment Configuration Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Configuration Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check .env files
Write-Host "CHECK .env files:" -ForegroundColor Yellow
$envFiles = @(".env", ".env.example", ".env.development", ".env.production")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file exists" -ForegroundColor Green
    } else {
        Write-Host "  MISSING $file" -ForegroundColor Red
    }
}

# Check secrets
Write-Host ""
Write-Host "CHECK Secrets:" -ForegroundColor Yellow
if (Test-Path "secrets/db_password.txt") {
    Write-Host "  OK secrets/db_password.txt exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING secrets/db_password.txt (OK for dev)" -ForegroundColor Yellow
}

if (Test-Path "secrets/api_secrets.txt") {
    Write-Host "  OK secrets/api_secrets.txt exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING secrets/api_secrets.txt (OK for dev)" -ForegroundColor Yellow
}

# Check configs
Write-Host ""
Write-Host "CHECK Configs:" -ForegroundColor Yellow
if (Test-Path "configs/app.conf") {
    Write-Host "  OK configs/app.conf exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING configs/app.conf (OK for dev)" -ForegroundColor Yellow
}

# Check Docker files
Write-Host ""
Write-Host "CHECK Docker files:" -ForegroundColor Yellow
$dockerFiles = @("docker-compose.yml", "docker-compose.override.yml", "docker-compose.prod.yml")
foreach ($file in $dockerFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file exists" -ForegroundColor Green
    } else {
        Write-Host "  MISSING $file" -ForegroundColor Red
    }
}

# Check Backend Dockerfiles
Write-Host ""
Write-Host "CHECK Backend Dockerfiles:" -ForegroundColor Yellow
$backendDockerFiles = @(
    "Backend/UngDungXemPhim.API/Dockerfile",
    "Backend/UngDungXemPhim.API/Dockerfile.dev",
    "Backend/UngDungXemPhim.API/Dockerfile.prod"
)
foreach ($file in $backendDockerFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file exists" -ForegroundColor Green
    } else {
        Write-Host "  MISSING $file" -ForegroundColor Red
    }
}

# Check appsettings
Write-Host ""
Write-Host "CHECK Backend appsettings:" -ForegroundColor Yellow
$appSettings = @(
    "Backend/UngDungXemPhim.API/appsettings.json",
    "Backend/UngDungXemPhim.API/appsettings.Development.json",
    "Backend/UngDungXemPhim.API/appsettings.Production.json"
)
foreach ($file in $appSettings) {
    if (Test-Path $file) {
        Write-Host "  OK $file exists" -ForegroundColor Green
    } else {
        Write-Host "  MISSING $file" -ForegroundColor Red
    }
}

# Check Frontend config
Write-Host ""
Write-Host "CHECK Frontend config:" -ForegroundColor Yellow
if (Test-Path "Fontend/UngDungXemPhimApp/src/config/env.js") {
    Write-Host "  OK env.js exists" -ForegroundColor Green
} else {
    Write-Host "  MISSING env.js" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Check Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
