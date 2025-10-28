# HƯỚNG DẪN QUẢN LÝ MÔI TRƯỜNG DEV - LỆNH THỦ CÔNG

## ✅ Những gì đã được lưu TỰ ĐỘNG

Docker tự động lưu cho bạn:
- ✅ **Database Volume**: `ungdungxemphim_sqlserver-data` (16 phim, 8 thể loại)
  - Đây là nơi lưu TẤT CẢ dữ liệu SQL Server
  - Volume này được lưu vĩnh viễn trên ổ cứng của bạn
  - Không bị mất khi tắt máy, dừng containers, hay `docker compose down`
- ✅ **Backend Image**: `ungdungxemphim-backend:latest` (1.86GB)  
- ✅ **SQL Server Image**: `mcr.microsoft.com/mssql/server:2022-latest`
- ✅ **Cấu hình**: File `.env`

→ **Volume và Images KHÔNG BỊ XÓA khi bạn:**
- Tắt máy
- `docker compose stop`
- `docker compose down`

→ **Volume CHỈ BỊ XÓA khi bạn dùng:**
- `docker compose down -v` (flag `-v` = xóa volumes)
- `docker volume rm ungdungxemphim_sqlserver-data`

---

## 🎯 CÁC LỆNH QUAN TRỌNG

### DỪNG containers (giữ database + images)
```powershell
docker compose stop
```
⏱️ Thời gian: 2-3 giây  
✅ Database giữ nguyên  
✅ Images giữ nguyên

### KHỞI ĐỘNG lại (NHANH - không build)
```powershell
docker compose up -d
```
⏱️ Thời gian: ~10 giây (nhanh gấp 10-20 lần!)  
✅ Sử dụng database có sẵn  
✅ Sử dụng images có sẵn

### XEM logs realtime
```powershell
docker compose logs -f backend
```

### RESTART một service
```powershell
docker compose restart backend
docker compose restart sqlserver
```

### KIỂM TRA trạng thái
```powershell
docker compose ps
```

---

## 🔄 QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### 🌅 Sáng - Bắt đầu làm việc:
```powershell
docker compose up -d
# Mở: http://localhost:5016/swagger
```

### 💻 Trong ngày - Develop:
- Code tự động hot-reload
- Xem logs nếu cần: `docker compose logs -f backend`

### 🌙 Tối - Kết thúc làm việc:
```powershell
docker compose stop
# Database và images vẫn giữ nguyên!
```

---

## ⚠️ KHI NÀO CẦN BUILD LẠI?

Chỉ cần build lại khi:
- Thay đổi Dockerfile
- Thay đổi dependencies (.csproj, package.json)
- Lần đầu tiên chạy

```powershell
# Build lại và chạy
docker compose up --build -d
```

---

## 🔍 KIỂM TRA DỮ LIỆU ĐÃ LƯU

### Xem volumes (chứa database)
```powershell
# Liệt kê tất cả volumes
docker volume ls

# Lọc volumes của dự án
docker volume ls | Select-String "ungdung"

# Xem chi tiết volume database
docker volume inspect ungdungxemphim_sqlserver-data
```

### Xem Docker images
```powershell
docker images | Select-String "ungdung"
```

### Kiểm tra database có dữ liệu
```powershell
docker exec ungdungxemphim-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Password123' -C -Q "USE UngDungXemPhim_v2; SELECT COUNT(*) FROM Movies; SELECT COUNT(*) FROM Genres"
```

### Kiểm tra kích thước volume
```powershell
docker system df -v | Select-String "sqlserver"
```

---

## ⚠️ CÁC LỆNH XÓA (CẢNH BÁO!)

### ⚠️ Xóa containers (GIỮ volume + images)
```powershell
docker compose down
```
✅ **Volume (Database) giữ nguyên**  
✅ Images giữ nguyên  
❌ Containers bị xóa (tạo lại khi up)  
→ Lần sau chạy vẫn nhanh, database còn nguyên

### ❌ Xóa containers + volume (MẤT DATABASE!)
```powershell
docker compose down -v
```
❌ **MẤT VOLUME = MẤT DATABASE!** (Flag `-v` = xóa volumes)  
✅ Images giữ nguyên  
❌ Containers bị xóa  
→ Lần sau phải tạo database lại (~2 phút)

### ❌❌ Xóa TẤT CẢ (MẤT HẾT!)
```powershell
docker compose down -v --rmi all
```
❌ **MẤT VOLUME = MẤT DATABASE!**  
❌ **MẤT IMAGES!**  
❌ Containers bị xóa  
→ Lần sau phải build + tạo database lại (~3 phút)

---

### 💡 KHUYẾN NGHỊ
**Chỉ dùng `docker compose stop`!**

Lý do:
- ✅ Giữ mọi thứ: containers, volume (database), images
- ✅ An toàn nhất
- ✅ Khởi động lại cực nhanh (~10 giây)
- ✅ Không cần lo lắng mất dữ liệu

**Chỉ dùng `down -v` khi:**
- Muốn reset database hoàn toàn
- Test từ đầu với database sạch

---

## 📊 SO SÁNH CÁC LỆNH

| Lệnh | Containers | Volume (DB) | Images | Khởi động lại |
|------|-----------|-------------|--------|---------------|
| `docker compose stop` | Dừng (giữ) | ✅ Giữ | ✅ Giữ | ~10 giây |
| `docker compose down` | ❌ Xóa | ✅ Giữ | ✅ Giữ | ~10 giây |
| `docker compose down -v` | ❌ Xóa | ❌ **MẤT!** | ✅ Giữ | ~2 phút (tạo DB lại) |
| `docker compose down -v --rmi all` | ❌ Xóa | ❌ **MẤT!** | ❌ Xóa | ~3 phút (build + DB) |

### 💡 Giải thích:
- **Containers**: Xóa cũng OK, tạo lại rất nhanh
- **Volume (Database)**: ĐÂY LÀ QUAN TRỌNG! Chứa tất cả dữ liệu phim
- **Images**: Xóa cũng OK nhưng build lại lâu (2-3 phút)

### 🎯 KHUYẾN NGHỊ:
**Dùng `docker compose stop`** - An toàn nhất, giữ mọi thứ!

---

## 🧹 DỌN DẸP KHI CẦN

### Xóa build cache (tiết kiệm dung lượng)
```powershell
docker builder prune -f
```

### Xem dung lượng Docker đang dùng
```powershell
docker system df
```

---

## 🆘 XỬ LÝ SỰ CỐ

### Backend không khởi động
```powershell
# Xem logs
docker compose logs backend --tail 50

# Restart
docker compose restart backend
```

### Database bị lỗi
```powershell
# Restart SQL Server
docker compose restart sqlserver

# Kiểm tra volume còn không
docker volume ls | Select-String "sqlserver-data"
```

### Port bị chiếm
```powershell
# Kiểm tra port 5016
netstat -ano | findstr :5016

# Dừng containers
docker compose stop
```

---

## 📖 TÀI LIỆU THAM KHẢO

- **QUICK_START.md** - Hướng dẫn nhanh 3 bước
- **HUONG_DAN_CHAY_DEV.md** - Hướng dẫn chi tiết từng bước
- **CHECKLIST_DEV.md** - Checklist kiểm tra

---

## ✅ CHECKLIST NHANH

**Hàng ngày:**
- [ ] Sáng: `docker compose up -d` (10 giây)
- [ ] Test: http://localhost:5016/swagger
- [ ] Develop với hot-reload
- [ ] Tối: `docker compose stop` (3 giây)

**Database và images vẫn giữ nguyên → Ngày mai chạy lại chỉ mất 10 giây!**

---

Được tạo: 28/10/2025
