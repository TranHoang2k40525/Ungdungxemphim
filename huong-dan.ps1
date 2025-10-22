# ============================================================
# HUONG DAN NHANH - CHAY UNG DUNG XEM PHIM
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HUONG DAN NHANH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "UNG DUNG XEM PHIM" -ForegroundColor Green
Write-Host "   - Backend: .NET 8 API" -ForegroundColor Gray
Write-Host "   - Frontend: React Native/Expo" -ForegroundColor Gray
Write-Host "   - Database: SQL Server" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEVELOPMENT MODE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cach 1: Chay tat ca voi Docker (De nhat)" -ForegroundColor Green
Write-Host "  docker compose up" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Truy cap:" -ForegroundColor Yellow
Write-Host "    - API: http://localhost:5016" -ForegroundColor Gray
Write-Host "    - Swagger: http://localhost:5016/swagger" -ForegroundColor Gray
Write-Host "    - SQL Server: localhost:1433" -ForegroundColor Gray
Write-Host ""
Write-Host "    Dừng: Ctrl+C" -ForegroundColor Yellow
Write-Host "    Hoặc: docker compose down" -ForegroundColor Gray
Write-Host ""

Write-Host "Cách 1B: Chạy Backend trực tiếp" -ForegroundColor Green
Write-Host "  1. Khởi động SQL Server:" -ForegroundColor Yellow
Write-Host "     ➜ docker compose up sqlserver -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Chạy Backend:" -ForegroundColor Yellow
Write-Host "     ➜ cd Backend\UngDungXemPhim.API" -ForegroundColor Cyan
Write-Host "     ➜ dotnet run" -ForegroundColor Cyan
Write-Host "     Hoặc với hot reload:" -ForegroundColor Gray
Write-Host "     ➜ dotnet watch run" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cách 1C: Chạy cả Backend + Frontend" -ForegroundColor Green
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "     ➜ docker compose up" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "     ➜ cd Fontend\UngDungXemPhimApp" -ForegroundColor Cyan
Write-Host "     ➜ npm install  # lần đầu" -ForegroundColor Cyan
Write-Host "     ➜ npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Sau đó quét QR code với Expo Go app" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPTION 2: PRODUCTION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 1: Setup (chỉ làm 1 lần)" -ForegroundColor Green
Write-Host "  ➜ .\setup-prod.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 2: Cấu hình Secrets" -ForegroundColor Green
Write-Host "  ➜ notepad secrets\db_password.txt" -ForegroundColor Cyan
Write-Host "     Nhập password mạnh, ví dụ: MySecurePass123!" -ForegroundColor Gray
Write-Host ""
Write-Host "  ➜ notepad secrets\api_secrets.txt" -ForegroundColor Cyan
Write-Host "     Nhập API keys và JWT secret" -ForegroundColor Gray
Write-Host ""
Write-Host "  ➜ notepad .env.production" -ForegroundColor Cyan
Write-Host "     Cập nhật DB server, domain, etc." -ForegroundColor Gray
Write-Host ""

Write-Host "Bước 3: Deploy" -ForegroundColor Green
Write-Host "  ➜ docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bước 4: Kiểm tra" -ForegroundColor Green
Write-Host "  ➜ docker compose -f docker-compose.yml -f docker-compose.prod.yml ps" -ForegroundColor Cyan
Write-Host "  ➜ docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CÁC LỆNH HỮU ÍCH" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Kiểm tra môi trường:" -ForegroundColor Green
Write-Host "  ➜ .\check-env.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Xem logs:" -ForegroundColor Green
Write-Host "  ➜ docker compose logs -f" -ForegroundColor Cyan
Write-Host "  ➜ docker compose logs -f backend" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dừng containers:" -ForegroundColor Green
Write-Host "  ➜ docker compose down" -ForegroundColor Cyan
Write-Host "  ➜ docker compose down -v  # Xóa cả volumes" -ForegroundColor Cyan
Write-Host ""

Write-Host "Rebuild:" -ForegroundColor Green
Write-Host "  ➜ docker compose up --build" -ForegroundColor Cyan
Write-Host ""

Write-Host "Xem containers đang chạy:" -ForegroundColor Green
Write-Host "  ➜ docker ps" -ForegroundColor Cyan
Write-Host "  ➜ docker compose ps" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SCRIPTS TỰ ĐỘNG" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Chạy Development (có hướng dẫn):" -ForegroundColor Green
Write-Host "  ➜ .\demo-dev.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Chạy Production (có hướng dẫn):" -ForegroundColor Green
Write-Host "  ➜ .\demo-prod.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setup Development:" -ForegroundColor Green
Write-Host "  ➜ .\setup-dev.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setup Production:" -ForegroundColor Green
Write-Host "  ➜ .\setup-prod.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TÀI LIỆU CHI TIẾT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Xem hướng dẫn đầy đủ:" -ForegroundColor Green
Write-Host "  ➜ notepad HUONG_DAN_CHAY.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Xem tài liệu môi trường:" -ForegroundColor Green
Write-Host "  ➜ notepad ENVIRONMENT_SETUP.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Hướng dẫn nhanh:" -ForegroundColor Green
Write-Host "  ➜ notepad QUICK_START.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BẮT ĐẦU NHANH (QUICKSTART)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Cho người mới bắt đầu, chạy lệnh này:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ➜ docker compose up" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host ""
Write-Host "Sau đó mở trình duyệt:" -ForegroundColor Yellow
Write-Host "  http://localhost:5016/swagger" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
