# Setup Development Environment Script
# Run this script to setup your development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ung Dung Xem Phim - Dev Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] Creating .env from .env.development..." -ForegroundColor Yellow
    Copy-Item ".env.development" ".env"
    Write-Host "[SUCCESS] .env created!" -ForegroundColor Green
} else {
    Write-Host "[INFO] .env already exists, skipping..." -ForegroundColor Gray
}

# Check if secrets directory exists
if (-not (Test-Path "secrets")) {
    Write-Host "[INFO] Creating secrets directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "secrets" -Force | Out-Null
    Write-Host "[SUCCESS] secrets/ directory created!" -ForegroundColor Green
}

# Check if configs directory exists
if (-not (Test-Path "configs")) {
    Write-Host "[INFO] Creating configs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "configs" -Force | Out-Null
    Write-Host "[SUCCESS] configs/ directory created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update .env file if needed"
Write-Host "2. Run: docker compose up --build"
Write-Host "   OR"
Write-Host "   cd Backend/UngDungXemPhim.API && dotnet run"
Write-Host ""
