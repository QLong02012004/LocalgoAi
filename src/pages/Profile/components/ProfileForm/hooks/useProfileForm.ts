import React, { useState } from "react";
import { toast } from "react-toastify";
import { updateProfile, changePassword } from "../../../../../services/profileService";

/**
 * Custom hook xử lý logic của các biểu mẫu (Form) trong trang Profile.
 * - Hỗ trợ cả 2 chế độ: Cập nhật thông tin cá nhân (`info`) và Đổi mật khẩu (`password`).
 * - Xử lý ẩn/hiện mật khẩu cho các ô input.
 * @param mode Chế độ hoạt động của Form ("info" hoặc "password")
 */
export const useProfileForm = (mode: "info" | "password") => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Xử lý sự kiện Submit của Form.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setErrors({});

    if (mode === "info") {
      const fullName = (formData.get("fullName") as string)?.trim() || "";
      const phone = (formData.get("phone") as string)?.trim() || "";
      const address = (formData.get("address") as string)?.trim() || "";
      const bio = (formData.get("bio") as string)?.trim() || "";

      const newErrors: Record<string, string> = {};

      // Gỡ bỏ kiểm tra ràng buộc cứng ở FE để cho phép gọi API và lấy message từ BE
      if (!fullName) {
        newErrors.fullName = "Vui lòng nhập họ và tên";
      }
      if (!phone) {
        newErrors.phone = "Vui lòng nhập số điện thoại";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Không gọi API nếu thiếu các trường bắt buộc
        return;
      }

      setIsLoading(true);
      try {
        const res = await updateProfile({ fullName, phone, address, bio });
        
        // Luôn ưu tiên lấy message từ Backend
        const successMsg = res.data?.message || "Cập nhật thông tin thành công! ✨";
        toast.success(successMsg);
        
        // Tải lại trang để hiển thị thông tin mới nhất
        setTimeout(() => window.location.reload(), 1500);
      } catch (error: any) {
        console.error("Lỗi cập nhật thông tin:", error);
        
        // Lấy message và dữ liệu lỗi từ BE
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || "Đã xảy ra lỗi khi cập nhật thông tin.";
        
        // Nếu BE trả về danh sách lỗi chi tiết cho từng trường
        if (errorData?.data && typeof errorData.data === 'object') {
          setErrors(errorData.data);
        }
        
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "password") {
      const old_password = formData.get("old_password") as string;
      const new_password = formData.get("newPassword") as string;
      const confirm_password = formData.get("confirmPassword") as string;

      const newErrors: Record<string, string> = {};

      if (!old_password) {
        newErrors.old_password = "Vui lòng nhập mật khẩu hiện tại";
      }

      const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;
      if (!new_password) {
        newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      } else if (!PASSWORD_REGEX.test(new_password)) {
        newErrors.newPassword = "Mật khẩu 8-32 ký tự, bao gồm chữ hoa, thường và số";
      }

      if (!confirm_password) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
      } else if (new_password !== confirm_password) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Vui lòng kiểm tra lại mật khẩu! ❌");
        return;
      }

      setIsLoading(true);
      try {
        const res = await changePassword({
          old_password,
          new_password,
          confirm_password,
        });
        
        const resData = res.data;
        if (resData && (resData.status === 200 || resData.status === 201)) {
          toast.success(resData.message || "Đổi mật khẩu thành công! 🔐");
          form.reset();
        } else {
          toast.error(resData?.message || "Đổi mật khẩu thất bại!");
        }
      } catch (error: any) {
        console.error("Lỗi cập nhật mật khẩu:", error);
        
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || "Đã xảy ra lỗi khi cập nhật mật khẩu.";
        
        // Nếu BE trả về danh sách lỗi chi tiết cho mật khẩu (ví dụ: mật khẩu cũ sai)
        if (errorData?.data && typeof errorData.data === 'object') {
          setErrors(errorData.data);
        }
        
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isLoading,
    errors,
    handleSubmit,
  };
};
