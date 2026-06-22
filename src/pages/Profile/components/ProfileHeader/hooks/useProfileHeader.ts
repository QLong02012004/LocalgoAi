import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "../../../../../services/profileService";

/**
 * Custom hook quản lý logic phần Header của trang Profile.
 * Chịu trách nhiệm chính cho việc chọn, kiểm tra và upload ảnh đại diện (Avatar).
 * @param onAvatarUpdate Callback được gọi khi upload ảnh thành công, dùng để cập nhật giao diện bên ngoài.
 */
export const useProfileHeader = (onAvatarUpdate?: (newUrl: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Xử lý sự kiện khi người dùng chọn một file ảnh từ máy tính.
   * - Kiểm tra định dạng (chỉ nhận hình ảnh).
   * - Kiểm tra dung lượng (tối đa 5MB).
   * - Gọi API upload file và kích hoạt callback `onAvatarUpdate`.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh!");
      return;
    }

    // Kiểm tra kích thước (ví dụ 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadImage(file);
      if (res.data && res.data.status === 200 && res.data.data) {
        const path = res.data.data as string;
        onAvatarUpdate?.(path);
        toast.success(res.data.message || "Cập nhật ảnh đại diện thành công!");
      } else {
        toast.error(res.data?.message || "Không thể tải ảnh lên.");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải ảnh lên:", error);
      toast.error(error.response?.data?.message || "Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  return {
    fileInputRef,
    isUploading,
    handleFileChange,
  };
};
