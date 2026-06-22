import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getUserReviews, updateReview, type BackendReview } from "../../../../../services/reviewService";

export type UserReview = BackendReview;

interface PaginatedReviews {
  content: UserReview[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Custom hook quản lý logic hiển thị và cập nhật Lịch sử đánh giá của người dùng.
 * - Gọi API lấy danh sách các đánh giá.
 * - Cung cấp các hàm xử lý sửa đánh giá, upload hình ảnh đính kèm.
 */
export const useUserReviews = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);

  /**
   * Gọi API lấy toàn bộ danh sách đánh giá của người dùng.
   * Xử lý linh hoạt dữ liệu trả về (mảng tĩnh hoặc phân trang).
   */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      let userId: number | undefined = undefined;
      if (userStr) {
        userId = (JSON.parse(userStr) as { id: number }).id;
      }
      const res = await getUserReviews(userId);
      if (res.data && (res.data.status === 200 || res.data.status === 201)) {
        const rawData = res.data.data;
        // Kiểm tra xem dữ liệu trả về là mảng trực tiếp hay object có content (phân trang)
        if (Array.isArray(rawData)) {
          setReviews(rawData);
        } else if (
          rawData &&
          typeof rawData === "object" &&
          Array.isArray((rawData as PaginatedReviews).content)
        ) {
          setReviews((rawData as PaginatedReviews).content);
        } else {
          setReviews([]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá của bạn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /**
   * Kích hoạt chế độ chỉnh sửa cho một đánh giá cụ thể.
   * Sao chép dữ liệu hiện tại vào Form và tự động cuộn lên đầu màn hình.
   */
  const handleStartEdit = (review: UserReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditFiles([]);
    setEditPreviews([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Xử lý khi người dùng chọn thêm ảnh đính kèm cho đánh giá.
   * - Lưu file thực tế vào state `editFiles`.
   * - Tạo Local Object URL để hiển thị preview ảnh ngay lập tức.
   */
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setEditFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setEditPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  /**
   * Xóa một ảnh đính kèm đang trong chế độ preview.
   * Giải phóng bộ nhớ (revokeObjectURL) để tránh rò rỉ bộ nhớ (memory leak).
   */
  const removeEditImage = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
    setEditPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Gửi yêu cầu cập nhật đánh giá lên Server.
   * - Đóng gói nội dung và hình ảnh.
   * - Reload lại danh sách sau khi cập nhật thành công.
   */
  const handleUpdate = async () => {
    if (!editingReview) return;
    try {
      // Chỉ gửi rating và comment theo yêu cầu mới của BE
      const payload = {
        rating: editRating,
        comment: editComment,
      };

      const res = await updateReview(editingReview.id, payload, editFiles);
      if (res.data && (res.data.status === 200 || res.data.status === 201)) {
        toast.success(res.data.message || "Cập nhật đánh giá thành công!");
        setEditingReview(null);
        setEditFiles([]);
        setEditPreviews([]);
        fetchReviews();
      } else {
        toast.error(res.data?.message || "Cập nhật đánh giá thất bại!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  return {
    reviews,
    loading,
    editingReview,
    setEditingReview,
    editRating,
    setEditRating,
    editComment,
    setEditComment,
    editPreviews,
    handleStartEdit,
    handleEditFileChange,
    removeEditImage,
    handleUpdate
  };
};
