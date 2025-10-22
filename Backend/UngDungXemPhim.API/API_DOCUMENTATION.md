# API Documentation - Ứng Dụng Xem Phim (Simplified)# API Documentation - Ứng Dụng Xem Phim



## Tổng quan## Tổng quan

API này cung cấp các endpoint để xem phim và lấy danh sách phim. Không yêu cầu xác thực.API này cung cấp các endpoint để quản lý phim, tập phim, bình luận, đánh giá và xác thực người dùng.



## Base URL## Base URL

``````

http://localhost:5016/apihttp://localhost:5016/api

``````



## Endpoints## Xác thực

API sử dụng JWT (JSON Web Token) để xác thực. Thêm header sau vào các request cần xác thực:

### 1. Phim (MoviesController)```

Authorization: Bearer <your_jwt_token>

#### Lấy danh sách phim```

```

GET /api/movies?filter=series|single|genre_name## Endpoints

```

### 1. Xác thực (AuthController)

**Query Parameters:**

- `filter` (optional): Lọc phim theo loại hoặc thể loại#### Đăng ký

  - `series`: Phim bộ```

  - `single`: Phim lẻPOST /api/auth/register

  - `<genre_name>`: Tên thể loại (ví dụ: "Hành động", "Tình cảm")```

**Body:**

**Response:**```json

```json{

{  "name": "Tên người dùng",

  "movies": [  "phone": "0987654321",

    {  "email": "user@example.com",

      "movieID": 1,  "password": "password123",

      "movieTitle": "Tên phim",  "birthday": "2000-01-01",

      "movieDescription": "Mô tả phim",  "gender": "Nam",

      "imageUrl": "path/to/image.png",  "location": "Hà Nội",

      "videoPath": null,  "avatar": null

      "movieType": "Phim lẻ",}

      "movieActors": "Diễn viên",```

      "movieDirector": "Đạo diễn",

      "movieCountry": "Quốc gia",#### Đăng nhập

      "movieGenre": ["Thể loại 1", "Thể loại 2"]```

    }POST /api/auth/login

  ]```

}**Body:**

``````json

{

#### Lấy thông tin phim theo ID  "email": "user@example.com",

```  "password": "password123"

GET /api/movies/{id}}

``````



**Response:**### 2. Phim (MoviesController)

```json

{#### Lấy danh sách phim

  "movieID": 1,```

  "movieTitle": "Tên phim",GET /api/movies?filter=series|single|genre_name

  "movieDescription": "Mô tả phim",```

  "imageUrl": "path/to/image.png",

  "videoPath": "path/to/video.mp4",#### Lấy thông tin phim theo ID

  "movieType": "Phim lẻ",```

  "movieActors": "Diễn viên",GET /api/movies/{id}

  "movieDirector": "Đạo diễn",```

  "movieCountry": "Quốc gia",

  "movieGenre": ["Thể loại 1", "Thể loại 2"]#### Lấy danh sách tập phim

}```

```GET /api/movies/{id}/episodes

```

#### Lấy danh sách tập phim

```### 3. Bình luận (CommentsController)

GET /api/movies/{id}/episodes

```#### Lấy bình luận theo phim

```

**Response:**GET /api/comments/movie/{movieId}?episodeNumber=1

```json```

{

  "episodes": [#### Thêm bình luận

    {```

      "episodeID": 1,POST /api/comments/movie/{movieId}?episodeNumber=1

      "movieID": 1,Authorization: Bearer <token>

      "episodeNumber": 1,```

      "title": "Tập 1",**Body:**

      "description": "Mô tả tập phim",```json

      "videoPath": "path/to/video.mp4"{

    }  "text": "Nội dung bình luận",

  ]  "rating": 5

}}

``````



### 2. Thể loại (GenresController)#### Cập nhật bình luận

```

#### Lấy danh sách thể loạiPUT /api/comments/{commentId}

```Authorization: Bearer <token>

GET /api/genres```

```**Body:**

```json

#### Lấy thể loại theo ID{

```  "text": "Nội dung bình luận mới",

GET /api/genres/{id}  "rating": 4

```}

```

## Cấu trúc dữ liệu

#### Xóa bình luận

### Movie```

```jsonDELETE /api/comments/{commentId}

{Authorization: Bearer <token>

  "movieID": 1,```

  "movieTitle": "Tên phim",

  "movieDescription": "Mô tả phim",### 4. Đánh giá (RatingsController)

  "imageUrl": "path/to/image.png",

  "videoPath": "path/to/video.mp4",#### Lấy đánh giá theo phim

  "movieType": "Phim lẻ",```

  "movieActors": "Diễn viên",GET /api/ratings/movie/{movieId}?episodeNumber=1

  "movieDirector": "Đạo diễn",```

  "movieCountry": "Quốc gia",

  "movieGenre": ["Thể loại 1", "Thể loại 2"]#### Thêm/cập nhật đánh giá

}```

```POST /api/ratings/movie/{movieId}?episodeNumber=1

Authorization: Bearer <token>

### Episode```

```json**Body:**

{```json

  "episodeID": 1,{

  "movieID": 1,  "value": 5

  "episodeNumber": 1,}

  "title": "Tập 1",```

  "description": "Mô tả tập phim",

  "videoPath": "path/to/video.mp4"#### Cập nhật đánh giá

}```

```PUT /api/ratings/movie/{movieId}?episodeNumber=1

Authorization: Bearer <token>

### Genre```

```json**Body:**

{```json

  "genreID": 1,{

  "genreName": "Hành động"  "value": 4

}}

``````



## Lưu ý#### Xóa đánh giá

- API không yêu cầu xác thực```

- Tất cả endpoints đều publicDELETE /api/ratings/movie/{movieId}?episodeNumber=1

- Dữ liệu trả về theo định dạng JSONAuthorization: Bearer <token>

- Movie type chỉ có 2 giá trị: "Phim lẻ" hoặc "Phim bộ"```


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
