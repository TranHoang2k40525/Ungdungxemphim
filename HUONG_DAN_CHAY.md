# 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG XEM PHIM

## 📋 Mục Lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chạy môi trường Development](#chạy-môi-trường-development)
3. [Chạy môi trường Production](#chạy-môi-trường-production)
4. [Các lệnh hữu ích](#các-lệnh-hữu-ích)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Yêu cầu Hệ Thống

### Đã cài đặt:
- ✅ Docker Desktop (đã kiểm tra)
- ✅ .NET 8.0 SDK
- ✅ Node.js & npm (cho Frontend)
- ✅ PowerShell

### Kiểm tra:
```powershell
docker --version          # Docker version 28.5.1
docker compose version    # Docker Compose version v2.40.0
dotnet --version          # .NET 8.0
node --version            # Node.js version
```

---

## 🔧 PHẦN 1: CHẠY MÔI TRƯỜNG DEVELOPMENT

### Cách 1: Chạy với Docker Compose (Khuyến nghị cho người mới)

#### Bước 1: Setup môi trường
```powershell
# Chạy script tự động
.\setup-dev.ps1
```

#### Bước 2: Kiểm tra cấu hình
```powershell
# Xem file docker-compose
cat docker-compose.yml
cat docker-compose.override.yml

# Kiểm tra .env
cat .env.development
```

#### Bước 3: Khởi động ứng dụng
```powershell
# Khởi động tất cả services (Backend + Database)
docker compose up

# Hoặc chạy ở background
docker compose up -d

# Xem logs
docker compose logs -f

# Chỉ xem logs của backend
docker compose logs -f backend
```

#### Bước 4: Truy cập ứng dụng
- **Backend API**: http://localhost:5016
- **Swagger UI**: http://localhost:5016/swagger
- **Assets**: http://localhost:5016/Assets
- **SQL Server**: localhost:1433

#### Bước 5: Test API
```powershell
# Test với PowerShell
Invoke-WebRequest -Uri "http://localhost:5016/api/Movies" -Method GET

# Hoặc mở browser
start http://localhost:5016/swagger
```

#### Bước 6: Dừng ứng dụng
```powershell
# Dừng nhưng giữ dữ liệu
docker compose down

# Dừng và xóa tất cả (bao gồm database)
docker compose down -v
```

---

### Cách 2: Chạy Backend trực tiếp (Không dùng Docker)

#### Bước 1: Chuẩn bị Database
```powershell
# Option A: Dùng SQL Server local (nếu đã cài)
# Đảm bảo SQL Server đang chạy và cập nhật connection string trong appsettings.Development.json

# Option B: Chỉ chạy SQL Server trong Docker
docker compose up sqlserver -d
```

#### Bước 2: Chạy Backend
```powershell
cd Backend\UngDungXemPhim.API

# Set environment
$env:ASPNETCORE_ENVIRONMENT="Development"

# Run
dotnet run

# Hoặc với hot reload
dotnet watch run
```

#### Bước 3: Truy cập
- **API**: http://localhost:5016
- **Swagger**: http://localhost:5016/swagger

---

### Cách 3: Chạy Frontend (React Native/Expo)

#### Bước 1: Cài đặt dependencies
```powershell
cd Fontend\UngDungXemPhimApp

# Cài đặt packages
npm install
```

#### Bước 2: Cập nhật API URL
```powershell
# Kiểm tra IP máy của bạn
ipconfig

# Cập nhật trong file .env.development (ở root)
# EXPO_PUBLIC_API_URL=http://YOUR_IP:5016/api
```

#### Bước 3: Chạy Expo
```powershell
# Khởi động Expo
npm start

# Hoặc chỉ định platform
npm run android  # Chạy trên Android
npm run ios      # Chạy trên iOS
npm run web      # Chạy trên Web
```

#### Bước 4: Scan QR code với Expo Go app trên điện thoại

---

## 🏭 PHẦN 2: CHẠY MÔI TRƯỜNG PRODUCTION

### Bước 1: Setup Production

```powershell
# Chạy script setup
.\setup-prod.ps1
```

### Bước 2: Cấu hình Secrets (QUAN TRỌNG!)

```powershell
# Tạo file password cho database
"YourSecurePassword123!" | Out-File -FilePath .\secrets\db_password.txt -NoNewline -Encoding ASCII

# Tạo file API secrets
@"
{
  "ApiKeys": {
    "ThirdPartyService": "your_production_api_key"
  },
  "Secrets": {
    "JwtSecret": "your_production_jwt_secret_key_min_32_chars",
    "EncryptionKey": "your_production_encryption_key"
  }
}
"@ | Out-File -FilePath .\secrets\api_secrets.txt -Encoding UTF8
```

### Bước 3: Cập nhật .env.production

```powershell
# Mở và chỉnh sửa
notepad .env.production
```

Cập nhật các giá trị:
```env
DB_SERVER=your_production_server
DB_NAME=UngDungXemPhim_v2
DB_USER=your_production_user
DB_PASSWORD=your_secure_production_password
ASSET_BASE_URL=https://yourdomain.com/Assets
```

### Bước 4: Tạo configs

```powershell
# Copy và điều chỉnh
copy configs\app.conf.example configs\app.conf
notepad configs\app.conf
```

### Bước 5: Build và Deploy Production

```powershell
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Khởi động
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Xem logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### Bước 6: Verify Production

```powershell
# Kiểm tra containers đang chạy
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Test API
Invoke-WebRequest -Uri "http://localhost:5016/api/Movies" -Method GET

# Kiểm tra database
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourPassword"
```

---

## 🛠️ PHẦN 3: CÁC LỆNH HỮU ÍCH

### Docker Compose Commands

```powershell
# ===== DEVELOPMENT =====
# Khởi động
docker compose up -d

# Dừng
docker compose down

# Xem logs
docker compose logs -f

# Rebuild
docker compose up --build

# Xem status
docker compose ps

# ===== PRODUCTION =====
# Khởi động
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Dừng
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Xem logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Rebuild
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Backend Commands

```powershell
cd Backend\UngDungXemPhim.API

# Build
dotnet build

# Run
dotnet run

# Watch (hot reload)
dotnet watch run

# Restore packages
dotnet restore

# Clean
dotnet clean

# Run migrations
dotnet ef database update
```

### Frontend Commands

```powershell
cd Fontend\UngDungXemPhimApp

# Install
npm install

# Start
npm start

# Clear cache
npm start -- --clear

# Build
npm run build
```

### Database Commands

```powershell
# Connect to SQL Server container
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "123456789"

# Backup database
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "123456789" -Q "BACKUP DATABASE [UngDungXemPhim_v2] TO DISK = '/var/opt/mssql/backup/db.bak'"

# Restore database
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "123456789" -Q "RESTORE DATABASE [UngDungXemPhim_v2] FROM DISK = '/var/opt/mssql/backup/db.bak'"
```

---

## 🔍 PHẦN 4: TROUBLESHOOTING

### Vấn đề 1: Port đã được sử dụng

```powershell
# Tìm process đang dùng port 5016
netstat -ano | findstr :5016

# Kill process
taskkill /PID <PID> /F

# Hoặc thay đổi port trong .env
```

### Vấn đề 2: Docker containers không khởi động

```powershell
# Xem logs chi tiết
docker compose logs

# Xem logs của service cụ thể
docker compose logs backend
docker compose logs sqlserver

# Restart containers
docker compose restart

# Rebuild từ đầu
docker compose down -v
docker compose up --build
```

### Vấn đề 3: Không kết nối được Database

```powershell
# Kiểm tra SQL Server container
docker compose ps sqlserver

# Xem logs SQL Server
docker compose logs sqlserver

# Test connection
docker compose exec backend dotnet ef database update
```

### Vấn đề 4: Frontend không kết nối Backend

```powershell
# Kiểm tra IP của máy
ipconfig

# Ping backend từ điện thoại
# Đảm bảo cùng mạng WiFi

# Cập nhật .env với IP đúng
# EXPO_PUBLIC_API_URL=http://YOUR_ACTUAL_IP:5016/api
```

### Vấn đề 5: IntelliSense báo lỗi nhưng build thành công

```powershell
# Reload OmniSharp trong VS Code
# Ctrl+Shift+P -> "OmniSharp: Restart OmniSharp"

# Hoặc rebuild
dotnet clean
dotnet build
```

---

## 📊 KIỂM TRA HỆ THỐNG

### Script kiểm tra tự động

```powershell
# Chạy script kiểm tra
.\check-env.ps1

# Xem tất cả containers
docker ps -a

# Xem tất cả images
docker images

# Xem disk usage
docker system df
```

---

## 🎯 WORKFLOWS PHỔ BIẾN

### Workflow 1: Development thông thường

```powershell
# 1. Khởi động
docker compose up -d

# 2. Làm việc với code
cd Backend\UngDungXemPhim.API
code .

# 3. Test API
start http://localhost:5016/swagger

# 4. Xem logs khi cần
docker compose logs -f backend

# 5. Dừng khi xong
docker compose down
```

### Workflow 2: Full Development (Backend + Frontend)

```powershell
# Terminal 1: Backend
docker compose up

# Terminal 2: Frontend
cd Fontend\UngDungXemPhimApp
npm start

# Test trên điện thoại với Expo Go
```

### Workflow 3: Deploy Production

```powershell
# 1. Setup
.\setup-prod.ps1

# 2. Cấu hình secrets
notepad secrets\db_password.txt
notepad secrets\api_secrets.txt
notepad .env.production

# 3. Build
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# 4. Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Monitor
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# 6. Verify
Invoke-WebRequest -Uri "http://localhost:5016/api/Movies"
```

---

## 📝 CHECKLIST

### Trước khi Development:
- [ ] Docker Desktop đang chạy
- [ ] Đã chạy `.\setup-dev.ps1`
- [ ] Port 5016 và 1433 available
- [ ] Đã có dữ liệu test (nếu cần)

### Trước khi Production:
- [ ] Đã cập nhật `.env.production`
- [ ] Đã tạo `secrets/db_password.txt`
- [ ] Đã tạo `secrets/api_secrets.txt`
- [ ] Đã cấu hình `configs/app.conf`
- [ ] Đã test trên staging environment
- [ ] Đã backup database (nếu có)
- [ ] SSL certificates sẵn sàng (cho HTTPS)

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker compose logs`
2. Chạy kiểm tra: `.\check-env.ps1`
3. Xem issues trên GitHub
4. Liên hệ team support

---

**Chúc bạn development vui vẻ! 🚀**
