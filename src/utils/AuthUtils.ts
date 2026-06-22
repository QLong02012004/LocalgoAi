/**
 * Utility để xử lý xóa thông tin xác thực mà không làm ảnh hưởng đến các cài đặt cục bộ khác
 * (như trạng thái đã hoàn thành khảo sát sở thích).
 */
export const clearAuthData = () => {
  const authKeys = [
    "accessToken",
    "refreshToken",
    "user",
    "username",
    "email",
    "avatar",
    "createdAt"
  ];
  
  authKeys.forEach(key => localStorage.removeItem(key));
  
  // Lưu ý: Không xóa "surveyCompleted" ở đây để tránh modal sở thích hiện lại mỗi lần logout/login
};
