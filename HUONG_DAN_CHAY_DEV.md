# HƯỚNG DẪN CHẠY MÔI TRƯỜNG DEVELOPMENT

## Mục tiêu
Chạy backend API và test qua Swagger/API trước, sau đó mới chạy app frontend.

---

## ✅ Bước 1: Chuẩn bị môi trường

### Yêu cầu:
- ✅ Docker Desktop đang chạy (Linux containers mode)
- ✅ Docker Desktop cấp ít nhất 4GB RAM
- ✅ PowerShell (Windows)

### Kiểm tra Docker:
```powershell
docker --version
docker compose version
```

---

## ✅ Bước 2: Chạy SQL Server container

### 2.1. Vào thư mục dự án:
```powershell
cd "c:\Users\Asus\Downloads\Ungdungxemphim\Ungdungxemphim"
```

### 2.2. Chỉ chạy SQL Server (không chạy backend/frontend):
```powershell
docker compose up sqlserver -d
```

**Giải thích:**
- `sqlserver` = tên service trong docker-compose.yml
- `-d` = chạy detached (background)

### 2.3. Kiểm tra SQL Server đã chạy:
```powershell
docker compose ps
docker compose logs sqlserver
```

**Chờ khoảng 15-30 giây** cho SQL Server khởi động hoàn toàn. Bạn sẽ thấy log:
```
SQL Server is now ready for client connections.
```

---

## ✅ Bước 3: Khởi tạo database

### 3.1. Kiểm tra file SQL script:
Dự án có 2 file:
- `Backend/Sql Server/Sql.sql` (script chính)
- `Backend/Sql Server/sqlungdungxemphim.sql` (backup hoặc alternative)

### 3.2. Cách 1 - Dùng Docker để chạy script (KHUYẾN NGHỊ):

```powershell
# Copy file SQL vào container
docker cp "Backend/Sql Server/Sql.sql" ungdungxemphim-sqlserver:/tmp/init.sql

# Chạy script bằng sqlcmd trong container
docker exec -it ungdungxemphim-sqlserver /opt/mssql-tools/bin/sqlcmd `
  -S localhost -U sa -P 'YourStrong@Password123' `
  -i /tmp/init.sql
```

### 3.3. Cách 2 - Dùng Azure Data Studio / SQL Server Management Studio:
- **Server:** `localhost,1433`
- **Login:** `sa`
- **Password:** `YourStrong@Password123`
- **Encryption:** Trust Server Certificate

Sau đó mở file `Backend/Sql Server/Sql.sql` và Execute.

### 3.4. Kiểm tra database đã tạo:
```powershell
docker exec -it ungdungxemphim-sqlserver /opt/mssql-tools/bin/sqlcmd `
  -S localhost -U sa -P 'YourStrong@Password123' `
  -Q "SELECT name FROM sys.databases"
```

Bạn phải thấy `UngDungXemPhim_v2` trong danh sách.

---

## ✅ Bước 4: Chạy Backend API (không chạy frontend)

### 4.1. Build và chạy backend:
```powershell
# Chỉ build và chạy backend service
docker compose up backend --build
```

**LƯU Ý:** Không dùng `-d` để xem logs realtime.

### 4.2. Chờ backend khởi động (khoảng 10-20 giây):
Bạn sẽ thấy log:
```
Now listening on: http://0.0.0.0:5016
Application started. Press Ctrl+C to shut down.
```

---

## ✅ Bước 5: Test API qua Swagger

### 5.1. Mở Swagger UI:
```
http://localhost:5016/swagger/index.html
```

### 5.2. Test các endpoints:
**Kiểm tra Genres (thể loại):**
- Endpoint: `GET /api/Genres`
- Click "Try it out" → "Execute"
- Kỳ vọng: Trả về danh sách genres (Action, Drama, Comedy,...)

**Kiểm tra Movies (phim):**
- Endpoint: `GET /api/Movies`
- Click "Try it out" → "Execute"
- Kỳ vọng: Trả về danh sách phim

**Kiểm tra lấy 1 movie:**
- Endpoint: `GET /api/Movies/{id}`
- Nhập id = 1
- Click "Execute"
- Kỳ vọng: Trả về thông tin chi tiết phim

---

## ✅ Bước 6: Test API qua PowerShell (curl/Invoke-WebRequest)

### 6.1. Test với PowerShell:
```powershell
# Lấy danh sách genres
Invoke-RestMethod -Uri "http://localhost:5016/api/Genres" -Method GET

# Lấy danh sách movies
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies" -Method GET

# Lấy 1 movie
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies/1" -Method GET
```

### 6.2. Test với curl (nếu có):
```powershell
curl http://localhost:5016/api/Genres
curl http://localhost:5016/api/Movies
```

---

## ✅ Bước 7: Xem Assets (hình ảnh, video)

Backend serve static files tại `/Assets`:
```
http://localhost:5016/Assets/
```

Kiểm tra folder `Backend/Asset` có files không. Nếu có ảnh phim, bạn có thể truy cập trực tiếp:
```
http://localhost:5016/Assets/movies/poster1.jpg
```

---

## ✅ Bước 8 (TÙY CHỌN): Chạy Frontend App

**Chỉ chạy sau khi backend đã test OK qua Swagger!**

### 8.1. Dừng backend tạm (Ctrl+C) hoặc mở terminal mới

### 8.2. Chạy cả 3 services:
```powershell
docker compose up --build
```

Hoặc chỉ thêm frontend:
```powershell
docker compose up frontend --build
```

### 8.3. Mở Expo:
```
http://localhost:19000
```

Scan QR code bằng Expo Go app trên điện thoại.

---

## 🔧 Các lệnh hữu ích

### Xem logs realtime:
```powershell
# Backend
docker compose logs -f backend

# SQL Server
docker compose logs -f sqlserver

# Tất cả
docker compose logs -f
```

### Vào container để debug:
```powershell
# Backend
docker exec -it ungdungxemphim-backend /bin/bash

# SQL Server
docker exec -it ungdungxemphim-sqlserver /bin/bash
```

### Restart 1 service:
```powershell
docker compose restart backend
docker compose restart sqlserver
```

### Dừng tất cả:
```powershell
docker compose down
```

### Dừng và xóa volumes (reset database):
```powershell
docker compose down -v
```

### Rebuild lại image:
```powershell
docker compose build backend --no-cache
docker compose up backend
```

---

## 🚨 Xử lý lỗi thường gặp

### Lỗi: SQL Server không khởi động
**Nguyên nhân:** Password quá yếu hoặc RAM không đủ.

**Giải pháp:**
1. Đảm bảo password trong `.env.development` là `YourStrong@Password123` (chữ hoa, thường, số, ký tự đặc biệt)
2. Tăng RAM cho Docker Desktop lên >= 4GB
3. Xem logs: `docker compose logs sqlserver`

### Lỗi: Backend không kết nối được database
**Nguyên nhân:** SQL Server chưa sẵn sàng hoặc connection string sai.

**Giải pháp:**
1. Kiểm tra SQL Server chạy: `docker compose ps`
2. Kiểm tra connection trong backend logs: `docker compose logs backend`
3. Đảm bảo `DB_SERVER=sqlserver` trong `.env.development` (tên service, không phải localhost)

### Lỗi: Port 5016 hoặc 1433 đã bị chiếm
**Kiểm tra:**
```powershell
netstat -ano | findstr :5016
netstat -ano | findstr :1433
```

**Giải pháp:**
- Tắt ứng dụng đang dùng port đó
- Hoặc đổi port trong `.env.development` và `docker-compose.override.yml`

### Lỗi: Swagger không hiện
**Nguyên nhân:** Chỉ bật trong Development mode.

**Giải pháp:**
Đảm bảo `ASPNETCORE_ENVIRONMENT=Development` trong `.env.development`

### Lỗi: Database trống (không có tables)
**Nguyên nhân:** Chưa chạy SQL scripts.

**Giải pháp:** Quay lại Bước 3 để chạy file `Sql.sql`

---

## 📋 Checklist hoàn chỉnh

- [ ] Docker Desktop đang chạy
- [ ] Đã vào thư mục dự án
- [ ] Đã kiểm tra `.env.development` có password mạnh
- [ ] `docker compose up sqlserver -d` → SQL Server chạy OK
- [ ] Đã chạy script `Sql.sql` → Database có tables
- [ ] `docker compose up backend --build` → Backend chạy OK
- [ ] Mở Swagger `http://localhost:5016/swagger` → Thấy giao diện
- [ ] Test GET /api/Genres → Trả về dữ liệu
- [ ] Test GET /api/Movies → Trả về dữ liệu
- [ ] (Tùy chọn) Chạy frontend: `docker compose up frontend`

---

## 🎯 Tóm tắt lệnh nhanh (copy-paste)

```powershell
# 1. Vào thư mục dự án
cd "c:\Users\Asus\Downloads\Ungdungxemphim\Ungdungxemphim"

# 2. Chạy SQL Server
docker compose up sqlserver -d

# 3. Đợi 20 giây rồi chạy script SQL
docker cp "Backend/Sql Server/Sql.sql" ungdungxemphim-sqlserver:/tmp/init.sql
docker exec -it ungdungxemphim-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123' -i /tmp/init.sql

# 4. Chạy backend
docker compose up backend --build

# 5. Mở browser test Swagger
# http://localhost:5016/swagger/index.html
```

---

**Chúc bạn thành công! 🚀**
