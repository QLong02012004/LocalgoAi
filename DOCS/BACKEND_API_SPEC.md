# Hướng dẫn Kỹ thuật & Đặc tả API Backend (TravelAi)

Tài liệu này cung cấp các yêu cầu chi tiết về các API cần thiết để hoàn thiện hệ thống Backend cho ứng dụng TravelAi.

---

## 1. Cấu trúc phản hồi chuẩn (Standardized Response Wrapper)

Tất cả các API phản hồi (Response) **PHẢI** tuân theo cấu trúc JSON sau:

```json
{
  "status": 200,    // 200/201: Thành công, Các mã khác: Lỗi
  "message": "Thông báo cho người dùng",
  "data": { ... }    // Payload thực tế - Bắt buộc dùng key "data"
}
```

---

## 2. Danh mục API (API Catalog)

Prefix: `/api/v1`

### 2.1. Xác thực (Auth)
- `POST /api/v1/auth/register`: Đăng ký tài khoản.
- `POST /api/v1/auth/login`: Đăng nhập hệ thống.
- `POST /api/v1/auth/google`: Đăng nhập qua Google (ID Token).
- `POST /api/v1/auth/facebook`: Đăng nhập qua Facebook (Access Token).
- `POST /api/v1/auth/send-otp`: Gửi mã OTP qua Email.
- `POST /api/v1/auth/verify-otp`: Xác minh OTP.
- `POST /api/v1/auth/reset-password-otp`: Đặt lại mật khẩu mới.

### 2.2. Hồ sơ & Tiện ích (Profile & Utils)
- `GET /api/v1/profile`: Lấy thông tin cá nhân.
- `PATCH /api/v1/profile`: Cập nhật thông tin cá nhân.
- `POST /api/v1/auth/change-password`: Đổi mật khẩu.
- `GET /api/v1/saved-trips`: Lấy danh sách yêu thích.
- `POST /api/v1/saved-trips`: Thêm vào yêu thích.
- `DELETE /api/v1/saved-trips/:id`: Xóa khỏi yêu thích.

### 2.3. Khám phá & Tài nguyên (Explore & Resources)
- `GET /api/v1/places`: Danh sách các địa điểm tham quan (Landmarks).
- `GET /api/v1/hotels`: Danh sách khách sạn.
- `GET /api/v1/restaurants`: Danh sách nhà hàng.
- `GET /api/v1/sample-itineraries`: Danh sách lịch trình mẫu chuyên nghiệp.

### 2.4. Lịch trình cá nhân & Cập nhật (Travel Plans)
- `GET /api/v1/travel-plans`: Lấy danh sách các bản kế hoạch đã lưu.
- `POST /api/v1/travel-plans`: Lưu một lịch trình mới từ AI gợi ý.
- `GET /api/v1/itineraries/{id}`: Lấy chi tiết một lịch trình (Full Data).
- `PUT /api/v1/itineraries/{id}`: Cập nhật cấu trúc lịch trình sau khi người dùng chỉnh sửa (Sắp xếp, Thêm/Xóa điểm).
- `PUT /api/v1/itineraries/{id}/publish`: Chuyển trạng thái lịch trình sang Công khai.

---

## 3. Chi tiết Request Body (Request Schemas)

Phần này liệt kê chi tiết các trường dữ liệu mà Frontend sẽ gửi lên.

### 3.1. Đăng ký (Register)
**URL:** `/api/v1/auth/register` | **Method:** `POST`
```json
{
  "full_name": "Nguyễn Văn A", // Bắt buộc, min 4 ký tự
  "email": "user@example.com", // Bắt buộc, định dạng email
  "password": "Password123"    // Bắt buộc, 8-32 ký tự, hoa, thường, số
}
```

### 3.2. Đăng nhập (Login)
**URL:** `/api/v1/auth/login` | **Method:** `POST`
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### 3.3. Đăng nhập Google/Facebook
**URL:** `/api/v1/auth/google` | **Method:** `POST` (Tương tự cho Facebook với trường `accessToken`)
```json
{
  "token": "google_id_token_string"
}
```

### 3.4. Quên mật khẩu & OTP
**URL:** `/api/v1/auth/send-otp` | **Method:** `POST`
```json
{
  "email": "user@example.com"
}
```
**URL:** `/api/v1/auth/verify-otp` | **Method:** `POST`
```json
{
  "email": "user@example.com",
  "otp": 123456 // 6 chữ số
}
```

### 3.5. Cập nhật Profile
**URL:** `/api/v1/profile` | **Method:** `PATCH`
```json
{
  "name": "Tên mới",         // Optional
  "phone": "0987654321",     // Optional
  "address": "Địa chỉ mới",  // Optional
  "bio": "Thông tin giới thiệu", // Optional
  "avatar": "url_tới_ảnh"    // Optional
}
```

### 3.6. Tạo lịch trình du lịch (Planner)
**URL:** `/api/v1/travel-plans` | **Method:** `POST`
```json
{
  "destination": "Đà Nẵng",
  "travelDate": "20/05/2026 - 25/05/2026", // Chuỗi định dạng range "dd/mm/yyyy - dd/mm/yyyy"
  "interests": ["Ẩm thực", "Thiên nhiên"],    // Mảng string các sở thích
  "budget": "5 - 10 triệu",                // Các giá trị: "Dưới 5 triệu", "5 - 10 triệu", "10 - 20 triệu", "Trên 20 triệu"
  "peopleGroup": "2",                       // Số người (dưới dạng string)
  "createdAt": "2026-04-07T07:30:00.000Z",  // ISO Date string
  "userId": "nguyenvanan"                   // Hiện tại FE đang gửi username hoặc "Guest"
}
```

### 3.7. Đổi mật khẩu
**URL:** `/api/v1/auth/change-password` | **Method:** `POST`
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

## 4. Quản trị viên (Admin Only)

Các API này yêu cầu quyền `ADMIN`:
- `GET /api/v1/admin/stats`: Trả về dữ liệu thống kê tổng quát.
- `GET /api/v1/admin/users`: Danh sách người dùng hệ thống.
- `DELETE /api/v1/admin/hotels/:id`: Xóa khách sạn khỏi hệ thống.
- `DELETE /api/v1/admin/restaurants/:id`: Xóa nhà hàng khỏi hệ thống.

### 3.8. Quản lý Tài nguyên (Admin)
Các API này dành cho Admin để quản lý dữ liệu hệ thống.

**URL:** `/api/v1/admin/hotels` | **Method:** `POST` (Tương tự `PATCH /admin/hotels/:id`)
```json
{
  "name": "Grand Azure Resort",
  "location": "Đà Nẵng, Việt Nam",
  "rating": 4.9,
  "reviews": "2.4k",
  "type": "RESORT", // RESORT, CỔ ĐIỂN, HIỆN ĐẠI
  "status": "HOẠT ĐỘNG", // HOẠT ĐỘNG, BẢO TRÌ
  "image": "url_ảnh"
}
```

**URL:** `/api/v1/admin/restaurants` | **Method:** `POST` (Tương tự `PATCH /admin/restaurants/:id`)
```json
{
  "name": "The Azure Kitchen",
  "location": "Quận 1, TP. Hồ Chí Minh",
  "rating": 4.8,
  "reviews": "1.2k",
  "cuisine": "VIỆT NAM", // VIỆT NAM, CHÂU Á, CHÂU ÂU
  "status": "ĐANG MỞ", // ĐANG MỞ, TẠM ĐÓNG
  "image": "url_ảnh"
}
```

### 3.9. Tin tức & Cẩm nang (News)
**URL:** `/api/v1/news` | **Method:** `GET`
**Mô tả:** Lấy danh sách các bài viết tin tức, cẩm nang du lịch.
- **Query Params:** `category`, `limit`, `page`.
- **Response Data (Mảng Object):**
```json
[
  {
    "id": 1,
    "title": "Bí kíp săn vé máy bay giá rẻ",
    "excerpt": "Những mẹo hữu ích để bạn có chuyến đi tiết kiệm...",
    "image": "url_anh_thumbnail",
    "category": "tip", // "tip", "news", "guide"
    "date": "2026-04-01T00:00:00Z",
    "readTime": "5", // Phút đọc
    "isFeatured": true
  }
]
```

### 3.10. Đánh giá của người dùng (Reviews)
**URL:** `/api/v1/reviews` | **Method:** `POST`
**Mô tả:** Đăng tải đánh giá mới cho hệ thống hoặc một địa điểm/trải nghiệm cụ thể.
- **Request Body:**
```json
{
  "rating": 5,
  "comment": "Chuyến đi thật tuyệt vời! Lịch trình rất hợp lý...",
  "images": [
    "url_anh_1", "url_anh_2"
  ],
  "targetId": "123" // ID của địa điểm hoặc lịch trình nếu có (tùy chọn)
}
```

**URL:** `/api/v1/reviews` | **Method:** `GET`
**Mô tả:** Lấy danh sách các bài đánh giá để hiển thị trên trang Review hoặc chi tiết địa điểm.
- **Query Params:** `targetId` (nếu lọc theo địa điểm), `limit`.
- **Response Data (Mảng Object):**
```json
[
  {
    "id": 1,
    "userName": "Linh Nguyễn",
    "avatar": "url_avatar",
    "timeAgo": "2 ngày trước",
    "rating": 5,
    "comment": "Chuyến đi thật tuyệt vời!...",
    "images": ["url_anh_1"]
  }
]
```

### 3.11. Chi tiết địa điểm (Destination Detail)
**URL:** `/api/v1/places/:id` | **Method:** `GET`
**Mô tả:** Lấy thông tin chi tiết đầy đủ của một địa điểm cụ thể để hiển thị trang Destination Detail.
- **Response Data (Object):**
```json
{
  "id": "1",
  "title": "Phố cổ Hội An",
  "location": "Quảng Nam",
  "rating": 4.8,
  "reviews": "1.2k",
  "img": "url_anh_chinh",
  "desc": "Hội An nổi tiếng với vẻ đẹp lãng mạn, cổ kính...",
  "type": "pin",
  "category": "culture",
  "previewVideo": "url_video_neu_co",
  "gallery": [ 
    "url_anh_1", "url_anh_2", "url_anh_3"
  ],
  "features": ["Wifi free", "Bể bơi", "Spa"], 
  "mapCoordinates": { 
     "lat": 15.8794,
     "lng": 108.3283
  }
}
```

### 3.12. Lịch trình mẫu (Sample Itineraries)
**URL:** `/api/v1/sample-itineraries` | **Method:** `GET`
**Mô tả:** Chứa danh sách các lộ trình được chuyên gia thiết kế, hỗ trợ cấu trúc lồng ghép theo ngày.
- **Response Data (Mảng Object):**
```json
[
  {
    "id": "31",
    "trip_name": "Khám phá Đà Lạt mộng mơ",
    "duration": "5 ngày 4 đêm",
    "price": 3500000,
    "rating": 4.9,
    "img": "url_anh_cover",
    "location": "Đà Lạt",
    "category": "nature",
    "maxPeople": 4,
    "itinerary": [
      {
        "day": 1,
        "date": "2024-05-01",
        "theme": "Sắc hoa thành phố",
        "activities": [
          { "time": "08:00", "location": "Sân bay Liên Khương", "note": "Hành trình bắt đầu", "lat": 11.7508, "lng": 108.3689 },
          { "time": "12:00", "location": "Lẩu gà lá é Tao Ngộ", "note": "Thưởng thức ẩm thực", "lat": 11.9360, "lng": 108.4485 }
        ]
      },
      {
        "day": 2,
        "date": "2024-05-02",
        "theme": "Săn mây đại ngàn",
        "activities": [
           { "time": "04:30", "location": "Cầu gỗ săn mây", "note": "Trải nghiệm bình minh", "lat": 11.9056, "lng": 108.5492 }
        ]
      }
    ]
  }
]
```

---

## 5. Luồng xử lý Tối ưu hóa lộ trình thông minh (AI Optimization)

Đây là luồng quan trọng nhất, nơi AI nhận các điểm người dùng đã chọn và cấu hình chuyến đi để sắp xếp lộ trình tối ưu.

### 5.1. Bước 1: Frontend gửi yêu cầu tối ưu hóa (Request)
**URL:** `/api/v1/itineraries/generate` | **Method:** `POST`

Dữ liệu FE gửi lên khi người dùng nhấn "Tối ưu hóa lộ trình AI":
```json
{
  "userId": 1,
  "provinceId": 1,
  "title": "Huế Cultural and Culinary Experience",
  "startDate": "2026-05-01",
  "days": 2,
  "budget": 5000000,
  "numberOfPeople": 3,
  "interests": ["history", "food", "culture"],
  "selectedLocations": [ 
    { "id": 7, "type": "ATTRACTION" },
    { "id": 1, "type": "RESTAURANT" },
    { "id": 3, "type": "HOTEL" }
  ] // Gửi kèm Type để BE phân loại bảng truy vấn (ATTRACTION, HOTEL, RESTAURANT)
}
```


### 5.2. Bước 2: Backend trả về kết quả (Response)
Backend cần trả về một đối tượng lịch trình đầy đủ đã được AI phân bổ vào các ngày.

**Cấu trúc dữ liệu trong `data`:**
```json
{
  "itineraryId": "ITI-20260427-002",
  "userId": 1,
  "title": "Huế Cultural and Culinary Experience",
  "provinceId": 1,
  "provinceName": "Huế",
  "days": 2,
  "budget": "5000000",
  "interests": ["history", "food", "culture"],
  "totalEstimatedCost": 5000000.0,
  "reasonRecommended": "Lịch trình này hoàn hảo cho những người đam mê lịch sử và văn hóa...",
  "startDate": "2026-05-01",
  "itineraryDays": [
    {
      "dayNumber": 1,
      "date": "2026-05-01",
      "theme": "Exploring Historical Sites",
      "activities": [
        {
          "order": 1,
          "startTime": "08:00:00",
          "endTime": "10:00:00",
          "type": "ATTRACTION",
          "name": "Tu Duc Tomb",
          "address": "Tu Duc Tomb, Huế",
          "latitude": 16.3876,
          "longitude": 107.6289,
          "description": "Mô tả của AI về địa điểm này..."
        }
      ]
    }
  ],
  "hotels": [
    {
      "hotelId": 5,
      "name": "Pilgrimage Village",
      "address": "Near Thien Mu Pagoda, Huế",
      "latitude": 16.4841,
      "longitude": 107.5789,
      "checkInDay": 1,
      "checkOutDay": 3
    }
  ]
}
```

### 5.3. Giải thích cấu trúc dữ liệu AI phản hồi
Dữ liệu AI trả về được tổ chức theo 3 cấp độ chính để FE dễ dàng hiển thị:

**1. Cấp độ Lộ trình (Root Level):**
- `itineraryId`: Mã định danh duy nhất của lịch trình trong hệ thống.
- `title`: Tên gợi ý cho chuyến đi (AI tự sinh dựa trên điểm đến và sở thích).
- `reasonRecommended`: Đoạn văn AI giải thích lý do tại sao lộ trình này lại tối ưu cho người dùng (Giúp tăng tính thuyết phục).

**2. Cấp độ Ngày (Day Level):**
- `dayNumber`: Thứ tự ngày (1, 2, 3...).
- `date`: Ngày cụ thể của lịch trình.
- `theme`: Chủ đề hoặc tiêu điểm của ngày (ví dụ: "Ngày 1: Hành trình văn hóa").

**3. Cấp độ Hoạt động (Activity Level):**
- `order`: Thứ tự tham quan trong ngày (BE cần sắp xếp theo logic đường đi ngắn nhất).
- `startTime` & `endTime`: Khung giờ gợi ý để đảm bảo người dùng không bị quá tải.
- `type`: Phân loại địa điểm (`ATTRACTION`, `RESTAURANT`, `HOTEL`) để FE hiển thị Icon tương ứng.
- `latitude` & `longitude`: Tọa độ GPS chính xác để bản đồ vẽ đường nối giữa các điểm.
- `tips`: Mảng các lời khuyên hữu ích của AI riêng cho địa điểm đó (ví dụ: "Nên mang giày thể thao", "Thử món bún bò tại đây").


### 5.4. Bước 3: Cập nhật Lộ trình sau khi chỉnh sửa (Manual Edit & Sync)
Sau khi AI tạo ra lộ trình, người dùng có quyền thêm/xóa hoặc kéo thả để thay đổi thứ tự. Khi nhấn "Hoàn tất", FE sẽ gửi cấu trúc mới lên BE.

**URL:** `/api/v1/itineraries/{id}` | **Method:** `PUT`

**Payload gửi lên (Tối giản):**
FE chỉ gửi các trường định danh và các trường thay đổi theo thời gian/thứ tự. BE dựa vào `entityId` để map lại thông tin chi tiết (ảnh, mô tả, tips) từ DB gốc.

```json
{
  "title": "Chuyến đi Đà Nẵng 3 ngày (Edited)",
  "budget": "4000000",
  "startDate": [2026, 5, 14],
  "itineraryDays": [
    {
      "dayNumber": 1,
      "theme": "Chủ đề ngày 1",
      "activities": [
        {
          "order": 1,           // Thứ tự mới sau khi kéo thả
          "startTime": [8, 0],
          "endTime": [9, 30],
          "type": "ATTRACTION",
          "entityId": 20,       // BE dùng ID này để lấy lại Full Info
          "name": "Tên địa điểm",
          "location": "16.1,108.2",
          "estimatedCost": 0.0,
          "note": "Ghi chú của người dùng"
        }
      ]
    }
  ],
  "hotels": [
    {
      "hotelId": 7,
      "checkInDay": 1,
      "checkOutDay": 3
    }
  ]
}
```

**Yêu cầu cho Backend:**
1.  **Đồng bộ hóa:** Xóa các `activities` cũ của lộ trình và chèn lại theo danh sách mới.
2.  **Tính toán lại:** BE tự tính lại `totalDistance` và `totalEstimatedCost` của lộ trình sau khi cập nhật.
3.  **Xử lý Custom Spot:** Nếu `entityId` là `null`, BE lưu `name` và `location` trực tiếp từ payload vào bảng hoạt động.

**Phân loại các trường dữ liệu khi cập nhật:**
Để tối ưu hóa hiệu suất, Frontend chỉ gửi đi những thông tin có tính chất "thay đổi". Backend sẽ chịu trách nhiệm kết hợp các thông tin này với dữ liệu gốc trong Database.

**1. Nhóm dữ liệu người dùng có thể sửa (Editable):**
- **Thứ tự & Thời gian**: `order` (thứ tự), `startTime`, `endTime`. Đây là các trường cốt lõi thay đổi khi người dùng kéo thả sắp xếp lại lộ trình.
- **Thông tin cá nhân hóa**: `note` (ghi chú riêng của khách cho từng điểm), `title` (tên chuyến đi), `budget`, `startDate`.
- **Lưu trú**: `hotelId` (thay đổi khách sạn chọn), `checkInDay`, `checkOutDay`.

**2. Nhóm dữ liệu hệ thống quản lý (Read-only - FE không gửi lại):**
- **Thông tin định danh**: `entityId`, `itineraryId`, `userId`, `provinceId`. Đây là các khóa chính để truy vấn, không được phép thay đổi.
- **Dữ liệu Master**: `description`, `imageUrl`, `gallery`, `tips`, `rating`, `address`. Backend sẽ tự động "nhúng" lại các thông tin này từ bảng gốc dựa trên `entityId`.
- **Dữ liệu tính toán (Calculated)**: `totalDistance`, `totalEstimatedCost`. Backend cần tự tính toán lại các trường này sau khi lưu thành công danh sách hoạt động mới để đảm bảo tính nhất quán.

**Đặc tả API cập nhật (API Specification):**
```json
{
  "api_specification": {
    "endpoint": "PUT /api/v1/itineraries/{id}",
    "description": "FE gửi lên các trường 'Editable' (có thể sửa). BE bỏ qua hoặc không cần FE gửi các trường 'Read-only'.",
    
    "fields_definition": {
      "editable_by_user": {
        "itinerary_level": ["title", "budget", "startDate"],
        "activity_level": [
          "order",          // Cập nhật khi kéo thả (Reorder)
          "startTime",      // Cập nhật giờ bắt đầu
          "endTime",        // Cập nhật giờ kết thúc
          "note",           // Ghi chú cá nhân của người dùng
          "estimatedCost"   // Chi phí người dùng tự điều chỉnh
        ],
        "hotel_level": ["hotelId", "checkInDay", "checkOutDay"]
      },
      
      "read_only_system_managed": {
        "identities": ["itineraryId", "userId", "entityId", "provinceId"],
        "master_data": [
          "description",    // BE lấy từ DB gốc
          "imageUrl",       // BE lấy từ DB gốc
          "gallery",        // BE lấy từ DB gốc
          "tips",           // BE lấy từ DB gốc
          "rating",         // BE lấy từ DB gốc
          "address"         // BE lấy từ DB gốc
        ],
        "calculated_by_server": [
          "totalDistance", 
          "totalEstimatedCost", 
          "averageRating"
        ]
      }
    },
    
    "logic_requirement": "Khi nhận được mảng activities, BE chỉ quan tâm tới 'entityId' để xác định địa điểm, sau đó dùng các trường 'order' và 'startTime' của FE gửi lên để sắp xếp lại lộ trình. Các thông tin mô tả, ảnh... sẽ được BE tự động 'nhúng' (hydrate) lại từ Database trước khi trả phản hồi về cho FE."
  }
}
```

---

### 3.13. Khách sạn & Nhà hàng (Hotels & Restaurants)
**URL:** `/api/v1/hotels` | `/api/v1/restaurants` | **Method:** `GET`
**Mô tả:** Lấy danh sách tài nguyên phục vụ trang Khám phá.
- **Yêu cầu Schema:**
```json
{
  "id": "string",
  "title": "string",
  "location": "string",
  "rating": "number",
  "reviews": "string (e.g. '1.5k')",
  "img": "string (URL)",
  "desc": "string",
  "type": "string (e.g. 'bed', 'food')",
  "category": "string"
}
```

---

## 4. Đặc tả dữ liệu Chi tiết (Detailed Schema Mapping)

Phần này định nghĩa cấu trúc dữ liệu đầy đủ cho API Chi tiết (`/places/:id` hoặc `/hotels/:id`). Dữ liệu này trực tiếp quyết định khả năng hiển thị của trang **Destination Detail**.

### 4.1. JSON Schema Chi tiết Đầy đủ

```json
{
  "id": 1,
  "name": "Chi tiết tên tài nguyên",
  "location": "Địa chỉ cụ thể",
  "rating": 4.8,
  "reviews": "1.2k",
  "image": "url_anh_chinh",
  "type": "MODERN",
  "status": "ACTIVE",
  "provinceId": 1,
  
  "description": "Mô tả dài giới thiệu về địa điểm/khách sạn.",
  "price": "1.200.000đ - 5.000.000đ",
  "distance": "1.5 km từ trung tâm",
  "time": "Phục vụ 24/7",
  
  "gallery": [
    "url_anh_1", "url_anh_2", "url_anh_3"
  ],
  
  "coordinates": {
    "lat": 16.0471,
    "lng": 108.2062
  },

  "quickInfo": [
    { "label": "Giờ nhận phòng", "value": "14:00" },
    { "label": "Wifi", "value": "Miễn phí" }
  ],

  "services": [
    {
      "id": 101,
      "name": "Dịch vụ A",
      "type": "food",
      "price": "50.000đ",
      "image": "url_anh"
    }
  ],

  "reviewsData": {
    "average": 4.8,
    "total": 1240,
    "breakdown": [
      { "stars": 5, "percentage": 85 },
      { "stars": 4, "percentage": 10 },
      { "stars": 3, "percentage": 5 },
      { "stars": 2, "percentage": 0 },
      { "stars": 1, "percentage": 0 }
    ],
    "list": [
      {
        "user": "Tên người dùng",
        "avatar": "url_avatar",
        "rating": 5,
        "date": "2 tuần trước",
        "tag": "Khách du lịch",
        "content": "Bình luận chi tiết của khách..."
      }
    ]
  },

  "travelTips": [
    { "icon": "Camera", "title": "Góc chụp đẹp", "content": "Mô tả mẹo..." }
  ],
  
  "weatherCurrent": {
    "temp": 28,
    "description": "Nắng nhẹ",
    "icon": "Sun"
  }
}
```

### 4.2. Ánh xạ Giao diện (UI Mapping)

| Nhóm dữ liệu | Trường JSON | Vị trí hiển thị trên Frontend |
| :--- | :--- | :--- |
| **Hero Section** | `name`, `image`, `location`, `rating` | Ảnh bìa, Tiêu đề lớn và thông tin cơ bản đầu trang. |
| **Quick Stats Bar** | `price`, `distance`, `time` | Thanh 3 ô thông tin nhanh ngay dưới ảnh bìa. |
| **Overview Tab** | `description`, `gallery` | Nội dung văn bản giới thiệu và slide ảnh slide-show. |
| **Services Tab** | `services` | Danh sách các thẻ dịch vụ đi kèm ngay bên dưới tab. |
| **Reviews Tab** | `reviewsData` | Biểu đồ tỉ lệ sao và danh sách các bình luận chi tiết. |
| **Tips Tab** | `travelTips` | Các khối thông tin mẹo vặt, lưu ý cho người dùng. |
| **Sidebar** | `coordinates`, `quickInfo`, `weatherCurrent` | Bản đồ Google Maps, danh sách thông tin kỹ thuật và thời tiết. |

---

## 5. Lưu ý quan trọng cho Backend
- **Key phản hồi**: Luôn sử dụng `data` cấp cao nhất để chứa payload.
- **Đồng bộ Schema**: Các trường như `id`, `title`, `img` trong `places/hotels/restaurants` cần đặt tên thống nhất để FE dễ dàng hiển thị trong Tab "Tất cả".
- [ ] **Tọa độ Marker**: Mỗi `activity` trong lịch trình mẫu **CẦN** có trường `lat` và `lng` để bản đồ có thể hiển thị chính xác vị trí và vẽ đường đi logic.
- [ ] **Phân chia theo ngày**: Backend **BẮT BUỘC** trả về thêm trường `day: 1`, `day: 2` để FE có thể hiển thị dữ liệu theo từng Tab Ngày tương ứng.
