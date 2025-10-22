# 🎬 ỨNG DỤNG XEM PHIM

## 📖 TÀI LIỆU HƯỚNG DẪN

Dự án đã được thiết lập với môi trường Dev/Prod tách biệt hoàn chỉnh.

### 📚 Các File Hướng Dẫn:

1. **HUONG_DAN_CHAY.md** - Hướng dẫn chi tiết đầy đủ
2. **ENVIRONMENT_SETUP.md** - Tài liệu về môi trường và cấu hình
3. **QUICK_START.md** - Tóm tắt nhanh các bước

### 🚀 CÁCH CHẠY NHANH NHẤT

#### Bước 1: Mở Docker Desktop
```
Đảm bảo Docker Desktop đang chạy!
```

#### Bước 2: Chạy Development
```powershell
docker compose up
```

#### Bước 3: Mở trình duyệt
```
http://localhost:5016/swagger
```

### 📂 Cấu Trúc Dự Án

```
Ungdungxemphim/
├── Backend/                 # .NET 8 API
│   └── UngDungXemPhim.API/
├── Fontend/                 # React Native/Expo
│   └── UngDungXemPhimApp/
├── docker-compose.yml       # Docker config chính
├── docker-compose.override.yml  # Config Development (auto-load)
├── docker-compose.prod.yml  # Config Production
├── .env.development         # Biến môi trường Dev
├── .env.production          # Biến môi trường Prod
├── secrets/                 # Thông tin nhạy cảm (không commit)
└── configs/                 # Cấu hình không nhạy cảm
```

### 🔑 Scripts Hỗ Trợ

```powershell
# Hướng dẫn nhanh
.\start.ps1

# Setup Development
.\setup-dev.ps1

# Setup Production  
.\setup-prod.ps1

# Kiểm tra cấu hình
.\check-env.ps1

# Demo Development (có hướng dẫn từng bước)
.\demo-dev.ps1

# Demo Production (có hướng dẫn từng bước)
.\demo-prod.ps1
```

### 🌐 Endpoints (Development)

- **API**: http://localhost:5016
- **Swagger UI**: http://localhost:5016/swagger
- **SQL Server**: localhost:1433
- **Assets**: http://localhost:5016/Assets

### 💡 Các Lệnh Thường Dùng

```powershell
# Development
docker compose up              # Khởi động
docker compose up -d           # Chạy background
docker compose down            # Dừng
docker compose logs -f         # Xem logs
docker compose ps              # Xem status

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### 📱 Frontend (React Native/Expo)

```powershell
cd Fontend\UngDungXemPhimApp
npm install
npm start
```

### 🔧 Backend (Chạy trực tiếp)

```powershell
cd Backend\UngDungXemPhim.API
dotnet run
# Hoặc
dotnet watch run  # Với hot reload
```

### 🛡️ Bảo Mật

- ✅ File `.env` không được commit (đã có trong .gitignore)
- ✅ Secrets được quản lý trong thư mục `secrets/`
- ✅ Có file `.example` để tham khảo
- ✅ Production sử dụng Docker secrets

### 📊 Kiểm Tra Hệ Thống

```powershell
# Kiểm tra Docker
docker --version
docker compose version
docker ps

# Kiểm tra .NET
dotnet --version
dotnet --list-sdks

# Kiểm tra Node.js
node --version
npm --version

# Kiểm tra môi trường project
.\check-env.ps1
```

### 🆘 Troubleshooting

#### Vấn đề: Docker Desktop không chạy
```powershell
# Mở Docker Desktop
# Đợi Docker khởi động xong (icon màu xanh)
# Chạy lại: docker compose up
```

#### Vấn đề: Port 5016 đã được sử dụng
```powershell
# Tìm process
netstat -ano | findstr :5016

# Kill process
taskkill /PID <PID> /F
```

#### Vấn đề: Database lỗi
```powershell
# Xóa và tạo lại
docker compose down -v
docker compose up
```

### 📖 Đọc Thêm

Xem **HUONG_DAN_CHAY.md** để biết hướng dẫn chi tiết!

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** October 2025  
**Version:** 1.0
