# 🎯 HƯỚNG DẪN CHUYỂN ĐỔI MÔI TRƯỜNG DEV / PROD

## ✅ GIẢI PHÁP ĐÃ CẤU HÌNH

Bạn **KHÔNG CẦN** copy file `.env.development` hay `.env.production` nữa!

### 📂 Cấu trúc mới:
```
.env                          # File CHUNG cho cả dev và prod
  ├── Giá trị CHUNG (DB_SERVER, DB_NAME, API_PORT...)
  └── Giá trị MẶC ĐỊNH cho Development

docker-compose.override.yml   # Tự động load khi chạy dev
  └── Override các giá trị Development-specific
  
docker-compose.prod.yml       # Load thủ công khi chạy prod
  └── Override các giá trị Production-specific
```

---

## 🚀 CÁCH CHẠY MÔI TRƯỜNG

### 1️⃣ CHẠY DEVELOPMENT (Mặc định)

```powershell
# Chỉ cần chạy lệnh bình thường
docker compose up -d

# Docker sẽ tự động:
# - Đọc .env (giá trị chung)
# - Đọc docker-compose.override.yml (override dev)
# - Kết quả: môi trường Development
```

**Đặc điểm Development:**
- ✅ Swagger UI enabled
- ✅ Hot reload với `dotnet watch`
- ✅ Logging: Information level
- ✅ DB_TRUST_CERTIFICATE: True
- ✅ ASSET_BASE_URL: `http://localhost:5016/Assets`
- ✅ ASPNETCORE_ENVIRONMENT: Development

---

### 2️⃣ CHẠY PRODUCTION

```powershell
# Bước 1: Stop containers dev (nếu đang chạy)
docker compose down

# Bước 2: Chạy production với file prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Docker sẽ:
# - Đọc .env (giá trị chung)
# - Đọc docker-compose.prod.yml (override prod)
# - Kết quả: môi trường Production
```

**Đặc điểm Production:**
- 🔒 Swagger UI disabled
- 🔒 Logging: Error only
- 🔒 DB_TRUST_CERTIFICATE: False
- 🔒 ASSET_BASE_URL: `https://yourdomain.com/Assets`
- 🔒 ASPNETCORE_ENVIRONMENT: Production
- 🔒 Docker secrets cho password

---

### 3️⃣ QUAY LẠI DEVELOPMENT

```powershell
# Stop production
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Chạy dev bình thường
docker compose up -d
```

---

## 🔑 CÁC LỆNH QUAN TRỌNG

### Kiểm tra môi trường đang chạy:
```powershell
# Xem containers
docker compose ps

# Xem logs backend
docker compose logs backend

# Xem environment variables của backend
docker compose exec backend printenv | Select-String "ASPNETCORE_ENVIRONMENT"
```

### Rebuild khi có thay đổi code:
```powershell
# Dev: rebuild và restart
docker compose up -d --build

# Prod: rebuild và restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 📊 SO SÁNH 2 MÔI TRƯỜNG

| Tính năng | Development | Production |
|-----------|-------------|------------|
| **Lệnh chạy** | `docker compose up -d` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| **File override** | `docker-compose.override.yml` (tự động) | `docker-compose.prod.yml` (thủ công) |
| **ASPNETCORE_ENVIRONMENT** | Development | Production |
| **Swagger UI** | ✅ Enabled | ❌ Disabled |
| **Hot Reload** | ✅ Yes (`dotnet watch`) | ❌ No |
| **Logging Level** | Information | Error |
| **DB Trust Certificate** | True | False |
| **Docker Secrets** | ❌ No | ✅ Yes |
| **Asset URL** | localhost | yourdomain.com |
| **Build Mode** | Debug | Release |
| **Dockerfile** | Dockerfile.dev | Dockerfile.prod |

---

## 💡 LỢI ÍCH CỦA GIẢI PHÁP NÀY

✅ **KHÔNG CẦN copy file .env nữa**
✅ **Chỉ cần thay đổi lệnh docker compose**
✅ **File .env chứa giá trị chung, dễ quản lý**
✅ **Override file chứa giá trị riêng biệt**
✅ **Dễ dàng switch giữa dev/prod**
✅ **Ít lỗi, ít nhầm lẫn**

---

## 🎓 NGUYÊN TẮC HOẠT ĐỘNG

Docker Compose có **thứ tự đọc file**:
1. `docker-compose.yml` (base)
2. `docker-compose.override.yml` (tự động load - dev)
3. `.env` (environment variables)

Khi chạy production:
1. `docker-compose.yml` (base)
2. `docker-compose.prod.yml` (thủ công chỉ định với `-f`)
3. `.env` (environment variables)

**Các giá trị trong file sau sẽ override file trước!**

---

## ❓ TROUBLESHOOTING

### Vẫn thấy Swagger ở Production?
```powershell
# Kiểm tra environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend printenv | Select-String "ASPNETCORE_ENVIRONMENT"

# Nếu không phải "Production", rebuild:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Database không giữ lại dữ liệu?
```powershell
# Kiểm tra volume
docker volume ls | Select-String "sqlserver"

# Volume: ungdungxemphim_sqlserver-data sẽ lưu trữ dữ liệu
```

### Muốn xem environment variables?
```powershell
# Dev
docker compose exec backend printenv

# Prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend printenv
```

---

## 🎉 KẾT LUẬN

Bây giờ bạn có thể:
- ✅ Chạy dev: `docker compose up -d`
- ✅ Chạy prod: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- ✅ Không cần copy file .env nữa!
- ✅ Dễ dàng switch giữa 2 môi trường

**Chúc bạn code vui vẻ! 🚀**
