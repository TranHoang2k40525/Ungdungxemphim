# API Documentation - Ứng Dụng Xem Phim

## Tổng quan
API này cung cấp các endpoint để quản lý phim, tập phim, bình luận, đánh giá và xác thực người dùng.

## Base URL
```
http://localhost:5016/api
```

## Xác thực
API sử dụng JWT (JSON Web Token) để xác thực. Thêm header sau vào các request cần xác thực:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Xác thực (AuthController)

#### Đăng ký
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Tên người dùng",
  "phone": "0987654321",
  "email": "user@example.com",
  "password": "password123",
  "birthday": "2000-01-01",
  "gender": "Nam",
  "location": "Hà Nội",
  "avatar": null
}
```

#### Đăng nhập
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Phim (MoviesController)

#### Lấy danh sách phim
```
GET /api/movies?filter=series|single|genre_name
```

#### Lấy thông tin phim theo ID
```
GET /api/movies/{id}
```

#### Lấy danh sách tập phim
```
GET /api/movies/{id}/episodes
```

### 3. Bình luận (CommentsController)

#### Lấy bình luận theo phim
```
GET /api/comments/movie/{movieId}?episodeNumber=1
```

#### Thêm bình luận
```
POST /api/comments/movie/{movieId}?episodeNumber=1
Authorization: Bearer <token>
```
**Body:**
```json
{
  "text": "Nội dung bình luận",
  "rating": 5
}
```

#### Cập nhật bình luận
```
PUT /api/comments/{commentId}
Authorization: Bearer <token>
```
**Body:**
```json
{
  "text": "Nội dung bình luận mới",
  "rating": 4
}
```

#### Xóa bình luận
```
DELETE /api/comments/{commentId}
Authorization: Bearer <token>
```

### 4. Đánh giá (RatingsController)

#### Lấy đánh giá theo phim
```
GET /api/ratings/movie/{movieId}?episodeNumber=1
```

#### Thêm/cập nhật đánh giá
```
POST /api/ratings/movie/{movieId}?episodeNumber=1
Authorization: Bearer <token>
```
**Body:**
```json
{
  "value": 5
}
```

#### Cập nhật đánh giá
```
PUT /api/ratings/movie/{movieId}?episodeNumber=1
Authorization: Bearer <token>
```
**Body:**
```json
{
  "value": 4
}
```

#### Xóa đánh giá
```
DELETE /api/ratings/movie/{movieId}?episodeNumber=1
Authorization: Bearer <token>
```

### 5. Người dùng (UsersController)

#### Lấy thông tin profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

#### Cập nhật profile
```
PUT /api/users/profile
Authorization: Bearer <token>
```
**Body:**
```json
{
  "name": "Tên mới",
  "email": "email@example.com",
  "phone": "0987654321",
  "birthday": "2000-01-01",
  "avatar": null
}
```

#### Đổi mật khẩu
```
POST /api/users/change-password
Authorization: Bearer <token>
```
**Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Lấy lịch sử xem phim
```
GET /api/users/WatchHistory
Authorization: Bearer <token>
```

#### Thêm lịch sử xem phim
```
POST /api/users/WatchHistory
Authorization: Bearer <token>
```
**Body:**
```json
{
  "episodeID": 1
}
```

#### Xóa lịch sử xem phim
```
DELETE /api/users/WatchHistory/{historyId}
Authorization: Bearer <token>
```

### 6. Thể loại (GenresController)

#### Lấy danh sách thể loại
```
GET /api/genres
```

#### Lấy thể loại theo ID
```
GET /api/genres/{id}
```

## Cấu trúc dữ liệu

### User
```json
{
  "id": 1,
  "name": "Tên người dùng",
  "email": "user@example.com",
  "phone": "0987654321",
  "birthday": "2000-01-01",
  "avatar": null
}
```

### Movie
```json
{
  "movieID": 1,
  "movieTitle": "Tên phim",
  "movieDescription": "Mô tả phim",
  "imageUrl": "path/to/image.png",
  "videoPath": "path/to/video.mp4",
  "movieType": "Phim lẻ",
  "movieActors": "Diễn viên",
  "movieDirector": "Đạo diễn",
  "movieCountry": "Quốc gia",
  "movieGenre": ["Thể loại 1", "Thể loại 2"]
}
```

### Comment
```json
{
  "id": 1,
  "userId": 1,
  "userName": "Tên người dùng",
  "text": "Nội dung bình luận",
  "rating": 5,
  "date": "2025-01-01T00:00:00Z",
  "episodeNumber": 1,
  "episodeTitle": "Tên tập phim"
}
```

## Lưu ý
- Tất cả thời gian đều sử dụng định dạng ISO 8601
- Rating chỉ chấp nhận giá trị từ 1 đến 5
- Email phải đúng định dạng
- Số điện thoại phải có 10-11 chữ số
- JWT token có thời hạn 7 ngày
