# DEMO: Chạy Production Environment
# Script này sẽ hướng dẫn từng bước để deploy production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMO CHẠY ỨNG DỤNG - PRODUCTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CẢNH BÁO: Đây là môi trường PRODUCTION!" -ForegroundColor Red
Write-Host ""

Write-Host "Bước 1: Kiểm tra Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Docker chưa chạy!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  ✓ Docker đang chạy" -ForegroundColor Green
}

Write-Host ""
Write-Host "Bước 2: Kiểm tra Secrets (QUAN TRỌNG!)..." -ForegroundColor Yellow

$secretsReady = $true

if (-not (Test-Path "secrets\db_password.txt")) {
    Write-Host "  ✗ Thiếu secrets/db_password.txt" -ForegroundColor Red
    $secretsReady = $false
} else {
    Write-Host "  ✓ secrets/db_password.txt có" -ForegroundColor Green
}

if (-not (Test-Path "secrets\api_secrets.txt")) {
    Write-Host "  ✗ Thiếu secrets/api_secrets.txt" -ForegroundColor Red
    $secretsReady = $false
} else {
    Write-Host "  ✓ secrets/api_secrets.txt có" -ForegroundColor Green
}

if (-not $secretsReady) {
    Write-Host ""
    Write-Host "LỖI: Chưa setup secrets!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Hãy chạy trước:" -ForegroundColor Yellow
    Write-Host "  .\setup-prod.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sau đó cập nhật:" -ForegroundColor Yellow
    Write-Host "  notepad secrets\db_password.txt" -ForegroundColor Cyan
    Write-Host "  notepad secrets\api_secrets.txt" -ForegroundColor Cyan
    Write-Host "  notepad .env.production" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Bước 3: Kiểm tra .env.production..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
    Write-Host "  ✓ .env.production có" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nội dung (một số dòng):" -ForegroundColor Gray
    Get-Content .env.production | Select-Object -First 5 | ForEach-Object {
        Write-Host "    $_" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  ✗ Thiếu .env.production" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SẴN SÀNG DEPLOY PRODUCTION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CẢNH BÁO: Bạn có chắc muốn deploy PRODUCTION không?" -ForegroundColor Red
Write-Host "Điều này sẽ:" -ForegroundColor Yellow
Write-Host "- Build production images" -ForegroundColor Gray
Write-Host "- Khởi động database với production password" -ForegroundColor Gray
Write-Host "- Deploy backend với production config" -ForegroundColor Gray
Write-Host ""
Write-Host "Tiếp tục? (yes/no): " -ForegroundColor Yellow -NoNewline
$choice = Read-Host

if ($choice -eq 'yes') {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ĐANG DEPLOY PRODUCTION..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Lệnh: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build" -ForegroundColor Gray
    Write-Host ""
    
    # Deploy
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  DEPLOYMENT HOÀN TẤT!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Kiểm tra:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Xem logs:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test API:" -ForegroundColor Yellow
    Write-Host "  Invoke-WebRequest -Uri 'http://localhost:5016/api/Movies'" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Deployment đã bị hủy." -ForegroundColor Yellow
    Write-Host ""
}
