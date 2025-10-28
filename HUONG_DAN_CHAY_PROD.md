# HƯỚNG DẪN CHẠY MÔI TRƯỜNG PRODUCTION

## 🎯 Khác biệt giữa Dev và Production

| Tính năng | Development | Production |
|-----------|------------|------------|
| Environment | `Development` | `Production` |
| Dockerfile | `Dockerfile.dev` | `Dockerfile.prod` |
| Build mode | Debug, hot-reload | Release, optimized |
| Swagger | ✅ Bật | ❌ Tắt |
| Detailed Errors | ✅ Hiện | ❌ Ẩn |
| Logs | Debug/Info | Warning/Error |
| Security | Thấp | Cao (TLS, secrets) |
| Resource limits | Không | Có (CPU, RAM) |
| User trong container | root | non-root (appuser) |

---

## 📋 CHUẨN BỊ

### 1. Kiểm tra secrets đã có đúng password
```powershell
Get-Content secrets\db_password.txt
```
Password phải MẠNH và KHỚP với password trong `.env.production`

### 2. Tạo file .env.production nếu chưa có
Đảm bảo file có cấu hình đúng cho production.

### 3. Kiểm tra configs/app.conf
File này sẽ được mount vào backend container.

---

## 🚀 CÁCH 1: CHẠY PRODUCTION ĐƠN GIẢN

### Bước 1: Dừng môi trường dev (nếu đang chạy)
```powershell
docker compose stop
```

### Bước 2: Tạo file .env từ .env.production
```powershell
Copy-Item .env.production .env -Force
```

### Bước 3: Chạy production
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Giải thích lệnh:**
- `-f docker-compose.yml` - File base
- `-f docker-compose.prod.yml` - Override với config production
- `up -d` - Chạy background
- `--build` - Build lại images với config production

### Bước 4: Kiểm tra
```powershell
# Xem containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Xem logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
```

### Bước 5: Test API
```powershell
# Production KHÔNG có Swagger, test bằng curl
Invoke-RestMethod -Uri "http://localhost:5016/api/Genres"
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies"
```

---

## 🔒 CÁCH 2: CHẠY PRODUCTION VỚI SECRETS (BẢO MẬT CAO)

Production sử dụng Docker secrets thay vì environment variables.

### Đã có sẵn:
- ✅ `secrets/db_password.txt` - Password SQL Server
- ✅ `secrets/api_secrets.txt` - API secrets
- ✅ `configs/app.conf` - App configuration

### Chạy:
```powershell
# Dừng dev
docker compose stop

# Chạy production với secrets
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Docker sẽ tự động:
- Mount secrets vào `/run/secrets/` trong container
- Backend đọc password từ secrets
- Bảo mật hơn vì secrets không xuất hiện trong env vars

---

## 📊 QUẢN LÝ PRODUCTION

### Xem logs
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f sqlserver
```

### Xem trạng thái
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

### Restart service
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### Dừng production
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop
```

### Xóa production (GIỮ database)
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Xóa production (XÓA database)
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

---

## 🔄 CHUYỂN ĐỔI GIỮA DEV VÀ PROD

### Từ Dev → Production
```powershell
# 1. Dừng dev
docker compose stop

# 2. Copy env production
Copy-Item .env.production .env -Force

# 3. Chạy production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Từ Production → Dev
```powershell
# 1. Dừng production
docker compose -f docker-compose.yml -f docker-compose.prod.yml stop

# 2. Copy env development
Copy-Item .env.development .env -Force

# 3. Chạy dev
docker compose up -d
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Database được share giữa dev và prod
- ✅ Dev và prod CÓ THỂ dùng chung volume database
- ⚠️ Hoặc tạo volume riêng bằng cách đổi tên trong docker-compose

### Swagger không có trong production
- ❌ Production không bật Swagger (bảo mật)
- ✅ Test API bằng: `curl`, `Postman`, hoặc `Invoke-RestMethod`

### Resource limits
Production có giới hạn CPU và RAM:
- Backend: 0.5-1 CPU, 1-2GB RAM
- SQL Server: 1-2 CPU, 2-4GB RAM

### Security
Production có:
- ✅ Non-root user trong container
- ✅ TrustServerCertificate = False
- ✅ Secrets thay vì env vars
- ✅ Minimal logs (Warning/Error)

---

## 🧪 TEST PRODUCTION

### Test API
```powershell
# Genres
Invoke-RestMethod -Uri "http://localhost:5016/api/Genres" | Select-Object -First 3

# Movies
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies" | Select-Object -First 3

# Movie detail
Invoke-RestMethod -Uri "http://localhost:5016/api/Movies/1"
```

### Test Assets
```
http://localhost:5016/Assets/
```

---

## 📈 MONITORING PRODUCTION

### Xem resource usage
```powershell
docker stats
```

### Xem logs theo thời gian
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --since 1h backend
```

### Xem logs có error
```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs backend | Select-String "error|exception" -CaseSensitive:$false
```

---

## 🆘 XỬ LÝ SỰ CỐ PRODUCTION

### Backend không khởi động
```powershell
# Xem logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs backend --tail 100

# Kiểm tra secrets
docker exec ungdungxemphim-backend ls -la /run/secrets/

# Restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### Database connection lỗi
```powershell
# Kiểm tra SQL Server
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs sqlserver

# Kiểm tra password trong secrets
Get-Content secrets\db_password.txt

# Restart SQL Server
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart sqlserver
```

---

## 📋 CHECKLIST PRODUCTION

- [ ] File `secrets/db_password.txt` có password mạnh
- [ ] File `.env.production` có cấu hình đúng
- [ ] Đã dừng môi trường dev
- [ ] Copy `.env.production` → `.env`
- [ ] Chạy: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
- [ ] Kiểm tra containers: `docker compose -f docker-compose.yml -f docker-compose.prod.yml ps`
- [ ] Test API: `Invoke-RestMethod http://localhost:5016/api/Genres`
- [ ] Xem logs: `docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f`

---

## 🔐 BẢO MẬT

### Đổi password production
1. Sửa `secrets/db_password.txt`
2. Sửa password trong `.env.production` (nếu không dùng secrets)
3. Restart: `docker compose -f docker-compose.yml -f docker-compose.prod.yml restart`

### Không commit secrets vào Git
```bash
# .gitignore đã có:
secrets/db_password.txt
secrets/api_secrets.txt
.env
.env.production
```

---

**Được tạo: 28/10/2025**
