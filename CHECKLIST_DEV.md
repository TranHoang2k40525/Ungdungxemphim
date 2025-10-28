# CHECKLIST CHẠY MÔI TRƯỜNG DEV - TEST API

## ✅ CHUẨN BỊ (1 lần duy nhất)
- [ ] Cài Docker Desktop (Windows)
- [ ] Docker Desktop đang chạy (kiểm tra icon trên taskbar)
- [ ] Docker cấp >= 4GB RAM (Settings → Resources → Memory)
- [ ] Clone/tải dự án về máy
- [ ] Kiểm tra file `.env.development` có password mạnh

## ✅ CHẠY LẦN ĐẦU TIÊN

### Bước 1: Mở PowerShell
```powershell
cd "c:\Users\Asus\Downloads\Ungdungxemphim\Ungdungxemphim"
```

### Bước 2: Chạy script tự động
```powershell
.\start-dev.ps1
```

**HOẶC** chạy thủ công:

```powershell
# 2a. Khởi động SQL Server
docker compose up sqlserver -d

# 2b. Đợi 20 giây
Start-Sleep -Seconds 20

# 2c. Chạy SQL script (tạo database)
docker cp "Backend/Sql Server/Sql.sql" ungdungxemphim-sqlserver:/tmp/init.sql
docker exec -it ungdungxemphim-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123' -i /tmp/init.sql

# 2d. Chạy backend
docker compose up backend --build
```

### Bước 3: Đợi backend khởi động
Chờ log hiện:
```
Now listening on: http://0.0.0.0:5016
Application started.
```

## ✅ TEST API (SAU KHI BACKEND CHẠY)

### Test 1: Mở Swagger UI
- Mở browser: http://localhost:5016/swagger/index.html
- [ ] Thấy giao diện Swagger
- [ ] Có các endpoints: `/api/Genres`, `/api/Movies`

### Test 2: Test endpoint Genres
- Trong Swagger, click `GET /api/Genres`
- Click "Try it out" → "Execute"
- [ ] Response code 200
- [ ] Trả về array các genres (Action, Drama, Comedy,...)

### Test 3: Test endpoint Movies
- Click `GET /api/Movies`
- Click "Try it out" → "Execute"
- [ ] Response code 200
- [ ] Trả về array các phim

### Test 4: Test chi tiết 1 phim
- Click `GET /api/Movies/{id}`
- Nhập id = `1`
- Click "Execute"
- [ ] Response code 200
- [ ] Trả về thông tin chi tiết: title, description, duration, rating

### Test 5: Dùng script PowerShell
Mở PowerShell **thứ 2** (để terminal đầu vẫn chạy backend):
```powershell
cd "c:\Users\Asus\Downloads\Ungdungxemphim\Ungdungxemphim"
.\test-api.ps1
```

- [ ] Script chạy thành công
- [ ] Hiện danh sách genres
- [ ] Hiện danh sách movies
- [ ] Hiện chi tiết 1 movie

## ✅ CHẠY LẦN SAU (ĐÃ CÓ DATABASE)

```powershell
# Chỉ cần chạy backend (không cần init database lại)
docker compose up backend
```

## ✅ SAU KHI TEST API XONG → CHẠY FRONTEND (TÙY CHỌN)

### Mở terminal mới:
```powershell
cd "c:\Users\Asus\Downloads\Ungdungxemphim\Ungdungxemphim"
docker compose up frontend
```

### Hoặc chạy tất cả cùng lúc:
```powershell
docker compose up
```

### Test frontend:
- [ ] Mở http://localhost:19000
- [ ] Thấy Expo DevTools
- [ ] Scan QR code bằng Expo Go app
- [ ] App hiển thị danh sách phim từ API

## 🚨 NẾU GẶP LỖI

### Lỗi: SQL Server không khởi động
```powershell
# Xem lỗi cụ thể
docker compose logs sqlserver

# Thường do password yếu → Đổi sang: YourStrong@Password123
# Hoặc thiếu RAM → Tăng RAM Docker lên 4GB
```

### Lỗi: Backend không kết nối database
```powershell
# Kiểm tra SQL Server chạy chưa
docker compose ps

# Xem logs backend
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Lỗi: Port 5016 bị chiếm
```powershell
# Kiểm tra
netstat -ano | findstr :5016

# Dừng ứng dụng đang dùng port
# Hoặc đổi API_PORT trong .env.development
```

### Lỗi: Swagger không hiện
- Đảm bảo `ASPNETCORE_ENVIRONMENT=Development` trong `.env.development`
- Restart backend: `docker compose restart backend`

### Lỗi: Database trống (không có tables/data)
```powershell
# Chạy lại SQL script
docker cp "Backend/Sql Server/Sql.sql" ungdungxemphim-sqlserver:/tmp/init.sql
docker exec -it ungdungxemphim-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123' -i /tmp/init.sql
```

## 📋 TÓM TẮT LỆNH QUAN TRỌNG

```powershell
# Chạy tất cả
docker compose up --build

# Chỉ chạy backend
docker compose up backend --build

# Xem logs
docker compose logs -f backend

# Dừng
docker compose down

# Restart
docker compose restart backend

# Reset toàn bộ (xóa database)
docker compose down -v
docker compose up --build
```

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Docker Desktop chạy
- [ ] SQL Server container chạy OK
- [ ] Database đã được tạo (chạy Sql.sql)
- [ ] Backend API chạy OK
- [ ] Swagger UI mở được: http://localhost:5016/swagger
- [ ] Test GET /api/Genres → Có dữ liệu
- [ ] Test GET /api/Movies → Có dữ liệu
- [ ] Test GET /api/Movies/1 → Có chi tiết
- [ ] (Tùy chọn) Frontend chạy OK

---

**🎯 MỤC TIÊU: Test API qua Swagger thành công trước khi chạy app!**
