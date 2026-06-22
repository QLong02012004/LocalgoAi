# Tài Liệu Đặc Tả API TravelAi (Real-world JSON Objects)

Tài liệu này cung cấp các ví dụ JSON thực tế (Request/Response) cho từng chức năng chính của hệ thống.

---

## 1. Module Xác thực (Authentication)

### 1.1. Đăng nhập (`POST /auth/login`)
- **Request:**
```json
{
  "email": "customer@travelai.com",
  "password": "StrongPassword123!"
}
```
- **Response:**
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "def456...",
    "user": {
      "id": 15,
      "email": "customer@travelai.com",
      "fullName": "Nguyễn Du Khách",
      "avatarUrl": "https://res.cloudinary.com/travelai/avatar15.jpg",
      "role": "USER",
      "isActive": true,
      "phone": "0901234567"
    }
  }
}
```

### 1.2. Đăng ký (`POST /auth/register`)
- **Request:**
```json
{
  "full_name": "Trần Văn Du Lịch",
  "email": "traveller@gmail.com",
  "password": "SecurePassword!@#"
}
```

---

## 2. Module Khám phá & Dữ liệu (Explore & Services)

### 2.1. Lấy danh sách Khách sạn (`GET /hotels?page=0&size=10&provinceId=1`)
- **Response:**
```json
{
  "status": 200,
  "message": "Lấy danh sách thành công",
  "data": {
    "content": [
      {
        "id": 101,
        "name": "Vinpearl Resort & Spa",
        "imageUrl": "https://img.travelai.com/hotel/vinpearl.jpg",
        "rating": 4.8,
        "reviewCount": 1250,
        "averagePrice": 3500000,
        "provinceId": 1,
        "category": "RESORT",
        "status": "ACTIVE"
      }
    ],
    "page": {
      "size": 10,
      "number": 0,
      "totalElements": 45,
      "totalPages": 5
    }
  }
}
```

### 2.2. Chi tiết Địa điểm tham quan (`GET /attractions/501`)
- **Response:**
```json
{
  "status": 200,
  "data": {
    "id": 501,
    "name": "Đại Nội Huế",
    "description": "Kinh thành của triều đại nhà Nguyễn...",
    "addressDetailed": "Phú Hậu, Thành phố Huế, Thừa Thiên Huế",
    "imageUrl": "https://img.travelai.com/at/dainoi.jpg",
    "gallery": [
      "https://img.travelai.com/at/dainoi_1.jpg",
      "https://img.travelai.com/at/dainoi_2.jpg"
    ],
    "rating": 4.9,
    "reviewCount": 8500,
    "estimatedDuration": 180,
    "provinceId": 1,
    "previewVideo": "https://www.youtube.com/watch?v=..."
  }
}
```

---

## 3. Module AI Planner (Trí tuệ nhân tạo)

### 3.1. Tạo lịch trình tự động (`POST /itineraries/generate`)
- **Request:**
```json
{
  "userId": 15,
  "provinceId": 1,
  "days": 2,
  "budget": 5000000,
  "interests": ["HISTORY", "FOOD"],
  "startDate": "2026-05-15",
  "numberOfPeople": 2,
  "selectedLocations": [
    {"id": 501, "type": "ATTRACTION"},
    {"id": 602, "type": "RESTAURANT"}
  ]
}
```
- **Response:**
```json
{
  "status": 200,
  "data": {
    "itineraryId": "ITI-2026-X99",
    "title": "Khám phá Cố đô Huế 2 ngày 1 đêm",
    "totalEstimatedCost": 4200000,
    "reasonRecommended": "Lịch trình tập trung vào các di tích lịch sử và đặc sản địa phương đúng ý bạn.",
    "itineraryDays": [
      {
        "dayNumber": 1,
        "date": "2026-05-15",
        "theme": "Dấu ấn Hoàng cung",
        "activities": [
          {
            "order": 1,
            "startTime": "08:30",
            "endTime": "11:30",
            "name": "Đại Nội Huế",
            "type": "ATTRACTION",
            "description": "Tham quan Ngọ Môn, Điện Thái Hòa...",
            "estimatedCost": 200000
          }
        ]
      }
    ],
    "hotels": [
      {
        "hotelId": 101,
        "name": "Vinpearl Resort",
        "checkInDay": 1,
        "checkOutDay": 2
      }
    ]
  }
}
```

---

## 4. Module Hồ sơ & Yêu thích (Profile & Social)

### 4.1. Thêm địa điểm yêu thích (`POST /favorites`)
- **Request:**
```json
{
  "locationId": 501,
  "locationType": "ATTRACTION",
  "locationName": "Đại Nội Huế",
  "imageUrl": "https://...",
  "rating": 4.9,
  "address": "Thành phố Huế"
}
```

### 4.2. Gửi đánh giá kèm ảnh (`POST /reviews`)
- **Request (Review JSON Part):**
```json
{
  "userId": 15,
  "attractionId": 501,
  "type": "ATTRACTION",
  "rating": 5,
  "comment": "Chuyến đi thật tuyệt vời, kiến trúc rất đẹp!"
}
```

---

## 5. Module Quản trị (Admin Dashboard)

### 5.1. Thống kê tổng quan (`GET /dashboard_stats`)
- **Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "stat_users",
      "label": "Tổng người dùng",
      "value": "1,250",
      "trend": "+12%",
      "trendUp": true,
      "icon": "Users"
    },
    {
      "id": "stat_revenue",
      "label": "Doanh thu tháng",
      "value": "45,000,000đ",
      "trend": "-5%",
      "trendUp": false,
      "icon": "Money"
    }
  ]
}
```

---

## VI. Lưu ý Quan trọng
1. **Dữ liệu mảng**: Luôn bọc trong `content` nếu có phân trang.
2. **Loại bỏ DT**: Không còn bất kỳ API nào trả về trường `DT`. Dữ liệu luôn nằm trực tiếp trong `data`.
3. **Multipart Form Data**: Khi gửi ảnh (Avatar, Review, Hotel images), sử dụng `FormData`.
