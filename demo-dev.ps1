# DEMO: Chạy Development Environment
# Script này sẽ hướng dẫn từng bước để chạy ứng dụng

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMO CHẠY ỨNG DỤNG - DEVELOPMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 1: Kiểm tra Docker đang chạy..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Docker chưa chạy! Vui lòng mở Docker Desktop" -ForegroundColor Red
    Write-Host ""
    Write-Host "Hướng dẫn:" -ForegroundColor Yellow
    Write-Host "1. Mở Docker Desktop"
    Write-Host "2. Đợi Docker khởi động xong"
    Write-Host "3. Chạy lại script này"
    exit 1
} else {
    Write-Host "  ✓ Docker đang chạy" -ForegroundColor Green
}

Write-Host ""
Write-Host "Bước 2: Kiểm tra cấu hình..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  ✓ File .env đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "  ! Tạo file .env từ .env.development..." -ForegroundColor Yellow
    Copy-Item .env.development .env
    Write-Host "  ✓ Đã tạo .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "Bước 3: Kiểm tra images đã build chưa..." -ForegroundColor Yellow
$images = docker images --filter=reference="ungdungxemphim*" --format "{{.Repository}}"
if ($images) {
    Write-Host "  ✓ Images đã có sẵn" -ForegroundColor Green
} else {
    Write-Host "  ! Chưa có images, sẽ build khi khởi động" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SẴN SÀNG KHỞI ĐỘNG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bạn muốn khởi động ứng dụng không? (Y/N): " -ForegroundColor Yellow -NoNewline
$choice = Read-Host

if ($choice -eq 'Y' -or $choice -eq 'y') {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ĐANG KHỞI ĐỘNG DEVELOPMENT..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Lệnh: docker compose up" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Lưu ý:" -ForegroundColor Yellow
    Write-Host "- Lần đầu sẽ mất thời gian để download images" -ForegroundColor Gray
    Write-Host "- Để dừng: nhấn Ctrl+C" -ForegroundColor Gray
    Write-Host "- Xem logs: mở terminal mới và chạy 'docker compose logs -f'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Sau khi khởi động thành công:" -ForegroundColor Yellow
    Write-Host "- Backend API: http://localhost:5016" -ForegroundColor Cyan
    Write-Host "- Swagger UI: http://localhost:5016/swagger" -ForegroundColor Cyan
    Write-Host "- SQL Server: localhost:1433" -ForegroundColor Cyan
    Write-Host ""
    
    Start-Sleep -Seconds 3
    
    # Khởi động
    docker compose up
    
} else {
    Write-Host ""
    Write-Host "Được rồi! Để khởi động sau, chạy lệnh:" -ForegroundColor Yellow
    Write-Host "  docker compose up" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Hoặc chạy ở background:" -ForegroundColor Yellow
    Write-Host "  docker compose up -d" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Xem logs:" -ForegroundColor Yellow
    Write-Host "  docker compose logs -f" -ForegroundColor Cyan
    Write-Host ""
}
