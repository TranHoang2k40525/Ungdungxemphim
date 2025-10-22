# Hướng Dẫn Quản Lý Môi Trường Dev/Prod

Dự án này đã được cấu hình để tách biệt môi trường Development và Production một cách rõ ràng và bảo mật.

## 📁 Cấu Trúc Thư Mục

```
Ungdungxemphim/
├── .env.example              # File mẫu cho environment variables
├── .env.development          # Config cho môi trường Dev (đã tạo sẵn)
├── .env.production           # Config cho môi trường Prod (cần điều chỉnh)
├── docker-compose.yml        # Docker Compose chính
├── docker-compose.override.yml  # Override cho Dev (tự động load)
├── docker-compose.prod.yml   # Config cho Production
├── secrets/                  # Thư mục chứa secrets (KHÔNG commit)
│   ├── README.md
│   ├── db_password.txt.example
│   └── api_secrets.txt.example
├── configs/                  # Thư mục chứa configs không nhạy cảm
│   ├── README.md
│   └── app.conf.example
├── Backend/
│   └── UngDungXemPhim.API/
│       ├── Dockerfile        # Dockerfile cơ bản
│       ├── Dockerfile.dev    # Dockerfile cho Dev
│       ├── Dockerfile.prod   # Dockerfile cho Prod
│       ├── appsettings.json  # Config mặc định
│       ├── appsettings.Development.json  # Config Dev
│       └── appsettings.Production.json   # Config Prod
└── Fontend/
    └── UngDungXemPhimApp/
        └── src/
            ├── config/
            │   └── env.js    # Environment config cho React Native
            └── api/
                └── API.js    # API client với env config
```

## 🚀 Cách Sử Dụng

### 1️⃣ Thiết Lập Ban Đầu

#### Backend (.NET)
```bash
# Không cần làm gì thêm, file .env.development đã sẵn sàng
# Hoặc copy file .env.example để tạo .env tùy chỉnh
cp .env.example .env
```

#### Frontend (React Native/Expo)
```bash
cd Fontend/UngDungXemPhimApp

# Tạo file .env cho frontend (nếu cần)
# Expo sẽ tự động đọc EXPO_PUBLIC_* từ .env ở root project
```

### 2️⃣ Chạy Môi Trường Development

#### Không dùng Docker:
```bash
# Backend
cd Backend/UngDungXemPhim.API
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run

# Frontend
cd Fontend/UngDungXemPhimApp
npm start
```

#### Dùng Docker Compose:
```bash
# Chạy Development (tự động load docker-compose.override.yml)
docker compose up

# Hoặc build lại từ đầu
docker compose up --build

# Chạy ở background
docker compose up -d

# Xem logs
docker compose logs -f backend
```

### 3️⃣ Chạy Môi Trường Production

#### Chuẩn bị Secrets:
```bash
# Tạo file secrets từ examples
cd secrets
copy db_password.txt.example db_password.txt
copy api_secrets.txt.example api_secrets.txt

# Sửa nội dung với thông tin thực tế
notepad db_password.txt
notepad api_secrets.txt

# Tạo file configs
cd ../configs
copy app.conf.example app.conf
notepad app.conf
```

#### Chạy với Docker Compose:
```bash
# Chạy Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Build lại
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Xem logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🔐 Quản Lý Environment Variables

### Backend (.NET)

Environment variables được đọc theo thứ tự ưu tiên:
1. **Environment Variables** (cao nhất)
2. **.env files** (.env.development hoặc .env.production)
3. **appsettings.{Environment}.json**
4. **appsettings.json** (thấp nhất)

#### Các biến quan trọng:

| Biến | Mô tả | Dev | Prod |
|------|-------|-----|------|
| `DB_SERVER` | SQL Server host | MSI | production_server |
| `DB_NAME` | Database name | UngDungXemPhim_v2 | UngDungXemPhim_v2 |
| `DB_USER` | Database user | sa | production_user |
| `DB_PASSWORD` | Database password | 123456789 | **SECRET** |
| `DB_TRUST_CERTIFICATE` | Trust cert | True | False |
| `API_PORT` | API port | 5016 | 5016 |
| `API_HOST` | API host | 0.0.0.0 | 0.0.0.0 |
| `ASSET_BASE_URL` | Asset URL | http://... | https://... |
| `ASPNETCORE_ENVIRONMENT` | Environment | Development | Production |

### Frontend (React Native/Expo)

Expo tự động đọc các biến có prefix `EXPO_PUBLIC_*`:

| Biến | Mô tả | Dev | Prod |
|------|-------|-----|------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | http://10.35.237.105:5016/api | https://yourdomain.com/api |
| `EXPO_PUBLIC_ASSET_URL` | Asset URL | http://10.35.237.105:5016/Assets | https://yourdomain.com/Assets |

## 🛡️ Bảo Mật

### ✅ Nên làm:
- ✅ Commit các file `.example`
- ✅ Commit `docker-compose.yml`, `docker-compose.override.yml`, `docker-compose.prod.yml`
- ✅ Commit `appsettings.json`, `appsettings.Development.json`, `appsettings.Production.json`
- ✅ Sử dụng biến môi trường cho thông tin nhạy cảm
- ✅ Rotate passwords định kỳ
- ✅ Sử dụng HTTPS trong production

### ❌ Không nên làm:
- ❌ Commit file `.env` (đã có trong .gitignore)
- ❌ Commit thư mục `secrets/` với file thật (chỉ commit .example)
- ❌ Hard-code passwords trong code
- ❌ Share credentials qua email/chat
- ❌ Dùng password yếu trong production

## 🔧 Troubleshooting

### Lỗi kết nối Database:
```bash
# Kiểm tra SQL Server container
docker compose ps
docker compose logs sqlserver

# Test connection
docker compose exec backend dotnet ef database update
```

### Lỗi không đọc được .env:
```bash
# Kiểm tra file có tồn tại
ls .env.development

# Kiểm tra format (phải là KEY=VALUE)
cat .env.development
```

### Frontend không kết nối được Backend:
```bash
# Kiểm tra IP và Port
# Với Expo, phải dùng IP thực của máy, không dùng localhost
ipconfig  # Windows
ifconfig  # Linux/Mac

# Cập nhật EXPO_PUBLIC_API_URL với IP đúng
```

## 📝 Checklist Deployment

### Development:
- [ ] Copy `.env.example` thành `.env` (nếu cần)
- [ ] Điều chỉnh IP trong `.env.development`
- [ ] Chạy `docker compose up` hoặc `dotnet run`

### Production:
- [ ] Cập nhật `.env.production` với thông tin thực
- [ ] Tạo file secrets từ `.example`
- [ ] Điền passwords và API keys vào secrets
- [ ] Kiểm tra HTTPS và SSL certificates
- [ ] Chạy `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- [ ] Test kỹ tất cả chức năng
- [ ] Setup monitoring và logging

## 📚 Tài Liệu Tham Khảo

- [ASP.NET Core Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

## 💡 Best Practices

1. **Tách biệt rõ ràng**: Dev và Prod phải có config riêng biệt
2. **Bảo mật**: Không bao giờ commit secrets vào Git
3. **Tài liệu hóa**: Ghi chép rõ ràng các biến cần thiết
4. **Automation**: Sử dụng Docker để đảm bảo môi trường nhất quán
5. **Testing**: Luôn test trước khi deploy production
6. **Monitoring**: Setup logging và monitoring cho production
7. **Backup**: Backup database và secrets định kỳ

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker compose logs`
2. Kiểm tra .gitignore đã đúng chưa
3. Đảm bảo secrets được tạo đúng
4. Verify environment variables
