# ỨNG DỤNG XEM PHIM - HƯỚNG DẪN CHẠY

## 📁 Cấu trúc dự án
```
├── Backend/
│   ├── UngDungXemPhim.API/      # .NET 8 Web API
│   ├── Asset/                    # Static files (posters, videos)
│   └── Sql Server/              # SQL scripts
├── Fontend/
│   └── UngDungXemPhimApp/       # React Native (Expo)
├── docker-compose.yml           # Base compose config
├── docker-compose.override.yml  # Dev overrides
├── docker-compose.prod.yml      # Production config
├── .env.development             # Dev environment variables
└── start-dev.ps1                # Script tự động chạy dev
```

## 🚀 Cách chạy nhanh nhất (Development)

### Lần đầu tiên chạy:
```powershell
# Mở PowerShell tại thư mục dự án, chạy:
.\start-dev.ps1
```
Script sẽ tự động:
1. ✅ Kiểm tra Docker
2. ✅ Khởi động SQL Server
3. ✅ Khởi tạo database (16 phim, 8 thể loại)
4. ✅ Chạy backend API

⏱️ **Thời gian:** ~2-3 phút lần đầu

### Lần sau (đã có database và images):
```powershell
# Khởi động nhanh (KHÔNG cần build lại)
.\start-dev-quick.ps1
# hoặc:
docker compose up -d
```

⏱️ **Thời gian:** ~10 giây (nhanh gấp 10-20 lần!)

### Khi nghỉ / tắt máy:
```powershell
# Dừng containers NHƯNG GIỮ LẠI database và images
.\stop-dev-keep-data.ps1
# hoặc:
docker compose stop
```

**📖 Xem chi tiết:** [QUAN_LY_DEV_ENVIRONMENT.md](./QUAN_LY_DEV_ENVIRONMENT.md)

### Chạy thủ công từng bước:
Xem hướng dẫn chi tiết trong file: **[HUONG_DAN_CHAY_DEV.md](./HUONG_DAN_CHAY_DEV.md)**

## 🧪 Test API sau khi chạy

### Cách 1: Dùng script test
```powershell
.\test-api.ps1
```

### Cách 2: Mở Swagger UI
```
http://localhost:5016/swagger/index.html
```

### Cách 3: Test bằng PowerShell
```powershell
# Lấy danh sách genres
Invoke-RestMethod -Uri "http://localhost:5016/api/Genres"

# Lấy danh sách movies
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies"
```

## 📱 Chạy Frontend App (sau khi backend OK)

### Chạy bằng Docker:
```powershell
docker compose up frontend
```
Sau đó mở: http://localhost:19000

### Chạy local (không Docker):
```powershell
cd Fontend\UngdungXemPhimApp
npm install
npm start
```

## 🔧 Lệnh Docker Compose hữu ích

```powershell
# Xem logs
docker compose logs -f backend
docker compose logs -f sqlserver

# Restart service
docker compose restart backend

# Dừng tất cả
docker compose down

# Dừng và xóa data (reset database)
docker compose down -v

# Rebuild image
docker compose build backend --no-cache
```

## 🌐 Các URL quan trọng

| Service | URL | Ghi chú |
|---------|-----|---------|
| Backend API | http://localhost:5016 | REST API |
| Swagger UI | http://localhost:5016/swagger | Chỉ có trong Dev |
| SQL Server | localhost,1433 | sa/YourStrong@Password123 |
| Assets | http://localhost:5016/Assets | Static files |
| Expo DevTools | http://localhost:19000 | Khi chạy frontend |

## ⚙️ Cấu hình môi trường

File `.env.development` chứa các biến quan trọng:
- `DB_SERVER=sqlserver` - Tên service SQL Server
- `DB_PASSWORD=YourStrong@Password123` - Password SA (phải mạnh!)
- `API_PORT=5016` - Port backend
- `EXPO_PUBLIC_API_URL` - URL API cho frontend

## 🚨 Xử lý lỗi thường gặp

### SQL Server không khởi động
```powershell
# Xem logs để biết lỗi
docker compose logs sqlserver

# Thường do password yếu hoặc thiếu RAM
# Giải pháp: Dùng password mạnh + cấp >= 4GB RAM cho Docker
```

### Backend không kết nối database
```powershell
# Kiểm tra SQL Server chạy chưa
docker compose ps

# Đợi thêm 20 giây rồi restart backend
docker compose restart backend
```

### Port bị chiếm (1433 hoặc 5016)
```powershell
# Kiểm tra process nào đang dùng
netstat -ano | findstr :5016
netstat -ano | findstr :1433

# Tắt process đó hoặc đổi port trong .env.development
```

## 📚 Tài liệu chi tiết

- **[HUONG_DAN_CHAY_DEV.md](./HUONG_DAN_CHAY_DEV.md)** - Hướng dẫn từng bước chi tiết
- **Backend API:** .NET 8 + Entity Framework Core + SQL Server
- **Frontend:** React Native (Expo) + React Navigation

## 📞 Liên hệ / Báo lỗi

Nếu gặp lỗi, hãy:
1. Xem logs: `docker compose logs -f`
2. Kiểm tra file `.env.development`
3. Đọc phần "Xử lý lỗi" trong `HUONG_DAN_CHAY_DEV.md`

---

**Chúc bạn code vui vẻ! 🎬🚀**
