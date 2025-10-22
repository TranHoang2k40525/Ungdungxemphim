# HUONG DAN NHANH - UNG DUNG XEM PHIM
# Run this script to see quick guide

Clear-Host
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HUONG DAN CHAY UNG DUNG" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "DEVELOPMENT MODE - De nhat cho nguoi moi" -ForegroundColor Green
Write-Host ""
Write-Host "Buoc 1: Chay Docker Compose" -ForegroundColor Yellow
Write-Host "  > docker compose up" -ForegroundColor Cyan
Write-Host ""

Write-Host "Buoc 2: Mo trinh duyet" -ForegroundColor Yellow
Write-Host "  http://localhost:5016/swagger" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dung lai: Nhan Ctrl+C" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cac lenh khac:" -ForegroundColor Green
Write-Host "  docker compose up -d         # Chay background" -ForegroundColor Gray
Write-Host "  docker compose logs -f       # Xem logs" -ForegroundColor Gray
Write-Host "  docker compose down          # Dung ung dung" -ForegroundColor Gray
Write-Host "  docker compose ps            # Xem status" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Xem tai lieu day du:" -ForegroundColor Yellow
Write-Host "  notepad HUONG_DAN_CHAY.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ban muon chay Development ngay bay gio? (Y/N): " -ForegroundColor Green -NoNewline
$choice = Read-Host

if ($choice -eq 'Y' -or $choice -eq 'y') {
    Write-Host ""
    Write-Host "Dang khoi dong..." -ForegroundColor Yellow
    Write-Host ""
    docker compose up
}
