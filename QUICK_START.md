# Tách Môi Trường Dev/Prod - Tóm Tắt

## 🎯 Đã Hoàn Thành

✅ **Cấu trúc Environment Variables**
- `.env.example` - File mẫu cho tham khảo
- `.env.development` - Config cho môi trường Dev (có sẵn giá trị)
- `.env.production` - Config cho môi trường Prod (cần điều chỉnh)

✅ **Backend (.NET 8)**
- `appsettings.json` - Config cơ bản
- `appsettings.Development.json` - Config Dev
- `appsettings.Production.json` - Config Prod
- `Program.cs` - Đã cập nhật để đọc Environment Variables

✅ **Frontend (React Native/Expo)**
- `src/config/env.js` - Environment config
- `src/api/API.js` - API client với env config
- Tự động chọn config dựa vào `__DEV__`

✅ **Docker Support**
- `docker-compose.yml` - Config chính
- `docker-compose.override.yml` - Override cho Dev (auto-load)
- `docker-compose.prod.yml` - Config cho Production
- `Dockerfile`, `Dockerfile.dev`, `Dockerfile.prod`

✅ **Secrets & Configs Management**
- `secrets/` - Thư mục chứa thông tin nhạy cảm (không commit)
- `configs/` - Thư mục chứa configs không nhạy cảm
- Có file `.example` để tham khảo

✅ **Scripts Hỗ Trợ**
- `setup-dev.ps1` - Thiết lập môi trường Dev
- `setup-prod.ps1` - Thiết lập môi trường Prod
- `check-env.ps1` - Kiểm tra cấu hình

✅ **Bảo mật**
- `.gitignore` đã được cập nhật
- Secrets không được commit
- Có file example để hướng dẫn

## 🚀 Cách Sử Dụng Nhanh

### Development (Phát triển)

```powershell
# Cách 1: Chạy script tự động
.\setup-dev.ps1

# Cách 2: Chạy với Docker
docker compose up --build

# Cách 3: Chạy trực tiếp
cd Backend\UngDungXemPhim.API
dotnet run
```

### Production (Sản xuất)

```powershell
# Bước 1: Thiết lập
.\setup-prod.ps1

# Bước 2: Cập nhật secrets (QUAN TRỌNG!)
notepad secrets\db_password.txt
notepad secrets\api_secrets.txt

# Bước 3: Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 📋 Checklist Trước Khi Deploy Production

- [ ] Đã cập nhật `.env.production` với thông tin thực tế
- [ ] Đã tạo và điền `secrets/db_password.txt`
- [ ] Đã tạo và điền `secrets/api_secrets.txt`
- [ ] Đã kiểm tra `configs/app.conf`
- [ ] Database đã sẵn sàng
- [ ] SSL certificates đã được cài đặt (nếu dùng HTTPS)
- [ ] Đã test trên staging environment
- [ ] Đã backup dữ liệu cũ (nếu có)

## 🔑 Environment Variables Quan Trọng

### Backend
- `DB_SERVER` - Database server
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (SECRET!)
- `ASSET_BASE_URL` - URL cho static files

### Frontend
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_ASSET_URL` - Asset URL

## 📖 Tài Liệu Chi Tiết

Xem file `ENVIRONMENT_SETUP.md` để biết thêm chi tiết!

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG BAO GIỜ** commit file `.env` hoặc `secrets/` vào Git
2. Sử dụng **mật khẩu mạnh** cho production
3. **Test kỹ** trước khi deploy production
4. **Backup** thường xuyên
5. Kiểm tra logs thường xuyên: `docker compose logs -f`

## 🆘 Gặp Vấn Đề?

```powershell
# Kiểm tra cấu hình
.\check-env.ps1

# Xem logs
docker compose logs -f backend

# Reset môi trường
docker compose down -v
docker compose up --build
```

---

**Người tạo:** GitHub Copilot  
**Ngày:** October 2025  
**Version:** 1.0
