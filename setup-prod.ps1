# Setup Production Environment Script
# Run this script to setup your production environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ung Dung Xem Phim - Prod Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] Creating .env from .env.production..." -ForegroundColor Yellow
    Copy-Item ".env.production" ".env"
    Write-Host "[WARNING] Please update .env with production values!" -ForegroundColor Red
} else {
    Write-Host "[INFO] .env already exists, skipping..." -ForegroundColor Gray
}

# Setup secrets
Write-Host ""
Write-Host "[INFO] Setting up secrets..." -ForegroundColor Yellow

if (-not (Test-Path "secrets")) {
    New-Item -ItemType Directory -Path "secrets" -Force | Out-Null
}

if (-not (Test-Path "secrets/db_password.txt")) {
    Write-Host "[ACTION REQUIRED] Creating secrets/db_password.txt..." -ForegroundColor Red
    Copy-Item "secrets/db_password.txt.example" "secrets/db_password.txt" -Force
    Write-Host "[WARNING] Please update secrets/db_password.txt with actual password!" -ForegroundColor Red
} else {
    Write-Host "[INFO] secrets/db_password.txt already exists" -ForegroundColor Gray
}

if (-not (Test-Path "secrets/api_secrets.txt")) {
    Write-Host "[ACTION REQUIRED] Creating secrets/api_secrets.txt..." -ForegroundColor Red
    Copy-Item "secrets/api_secrets.txt.example" "secrets/api_secrets.txt" -Force
    Write-Host "[WARNING] Please update secrets/api_secrets.txt with actual secrets!" -ForegroundColor Red
} else {
    Write-Host "[INFO] secrets/api_secrets.txt already exists" -ForegroundColor Gray
}

# Setup configs
Write-Host ""
Write-Host "[INFO] Setting up configs..." -ForegroundColor Yellow

if (-not (Test-Path "configs")) {
    New-Item -ItemType Directory -Path "configs" -Force | Out-Null
}

if (-not (Test-Path "configs/app.conf")) {
    Copy-Item "configs/app.conf.example" "configs/app.conf" -Force
    Write-Host "[INFO] Created configs/app.conf" -ForegroundColor Green
} else {
    Write-Host "[INFO] configs/app.conf already exists" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Production Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT - Before deploying:" -ForegroundColor Red
Write-Host "1. Update .env with production database connection"
Write-Host "2. Update secrets/db_password.txt with strong password"
Write-Host "3. Update secrets/api_secrets.txt with API keys"
Write-Host "4. Review configs/app.conf"
Write-Host "5. Test in staging environment first"
Write-Host ""
Write-Host "To deploy:" -ForegroundColor Yellow
Write-Host "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
Write-Host ""
