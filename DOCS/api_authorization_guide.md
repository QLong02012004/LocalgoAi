# Tài liệu phân quyền API - TravelAi

Tài liệu này liệt kê các nhóm API cần cấu hình phân quyền trên Backend để đảm bảo trải nghiệm người dùng (UX) và bảo mật hệ thống.

---

## 1. Nhóm API PUBLIC (Khách vãng lai xem được - PermitAll)
Các API này không được yêu cầu Token (không check Authorization header) để khách vãng lai có thể tham khảo thông tin trước khi đăng nhập.

### 🔍 Bộ lọc & Danh mục (Filters)
*   `GET /api/v1/provinces` - Lấy danh sách Tỉnh/Thành phố.
*   `GET /api/v1/categories` - Lấy danh sách các danh mục (Thăm quan, Khách sạn, Nhà hàng...).

### 📍 Địa điểm & Khám phá
*   `GET /api/v1/attractions` - Lấy danh sách địa điểm.
*   `GET /api/v1/attractions/{id}` - Xem chi tiết một địa điểm.
*   `GET /api/v1/attractions/featured` - Lấy danh sách địa điểm nổi bật (Home page).
*   `GET /api/v1/hotels` - Lấy danh sách khách sạn.
*   `GET /api/v1/hotels/{id}` - Xem chi tiết khách sạn.
*   `GET /api/v1/restaurants` - Lấy danh sách nhà hàng.
*   `GET /api/v1/restaurants/{id}` - Xem chi tiết nhà hàng.

### 🗺️ Dịch vụ lân cận (Nearby Services)
*   `GET /api/v1/nearby-services/{targetType}/{targetId}` - Lấy tất cả dịch vụ lân cận của một đối tượng.
*   `GET /api/v1/nearby-services/{targetType}/{targetId}/type/{serviceType}` - Lấy dịch vụ lân cận theo loại.

### 📰 Tin tức (News)
*   `GET /api/v1/news` - Danh sách tin tức.
*   `GET /api/v1/news/{id}` - Chi tiết tin tức.

### 🗓️ Lộ trình mẫu (Sample Itineraries)
*   `GET /api/v1/itineraries/samples` - Lấy danh sách lộ trình mẫu (để khách vãng lai xem).

### 💬 Đánh giá (Reviews)
*   `GET /api/v1/reviews/attraction/{id}` - Xem danh sách đánh giá của địa điểm.

---

## 2. Nhóm API PRIVATE (Yêu cầu Đăng nhập - Authenticated)
Các API này bắt buộc phải có `Authorization: Bearer <token>` hợp lệ.

### 👤 Người dùng & Cá nhân hóa
*   `GET /api/v1/users/profile` - Xem thông tin cá nhân.
*   `PUT /api/v1/users/profile` - Cập nhật thông tin cá nhân.
*   `POST /api/v1/favorites` - Thêm vào danh sách yêu thích.
*   `GET /api/v1/favorites` - Xem danh sách yêu thích cá nhân.

### 🗓️ Lập kế hoạch (Planner / Itinerary)
*   `GET /api/v1/itineraries/my-itineraries?userId={id}` - Danh sách lộ trình của một người dùng cụ thể.
*   `GET /api/v1/itineraries` - Danh sách hành trình đã lưu (mặc định theo token).
*   `POST /api/v1/itineraries` - Tạo hành trình mới.
*   `PUT /api/v1/itineraries/{id}` - Cập nhật hành trình.
*   `DELETE /api/v1/itineraries/{id}` - Xóa hành trình.

### ✍️ Tương tác
*   `POST /api/v1/reviews` - Gửi đánh giá mới.
*   `POST /api/v1/comments` - Bình luận.

---

## 3. Nhóm API ADMIN (Quyền Admin - Role Admin)
Chỉ tài khoản có quyền Admin mới được phép gọi các API này.

*   `POST /api/v1/attractions` - Tạo mới địa điểm.
*   `PUT /api/v1/attractions/{id}` - Sửa địa điểm.
*   `DELETE /api/v1/attractions/{id}` - Xóa địa điểm.
*   `POST /api/v1/nearby-services` - Tạo mới dịch vụ lân cận (Multipart/Form-data).
*   `PUT /api/v1/nearby-services/{id}` - Cập nhật dịch vụ lân cận.
*   `DELETE /api/v1/nearby-services/{id}` - Xóa dịch vụ lân cận.
*   `GET /api/v1/admin/...` - Tất cả các API quản lý người dùng, thống kê.

---

**Ghi chú cho Backend:**
- Hiện tại trang Chi tiết đang trả về lỗi **403 Forbidden** khi không có token, vui lòng cấu hình lại Security để cho phép `GET` các route này mà không cần token.
- Đảm bảo các API hình ảnh (nếu có route riêng) cũng là Public để hiển thị ảnh cho khách vãng lai.
