import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  getFavorites, 
  removeFavorite, 
  type FavoriteItem 
} from "../../../../../services/profileService";

/**
 * Custom hook quản lý logic của Sidebar trong trang Profile.
 * - Hiển thị danh sách địa điểm yêu thích.
 * - Xử lý xóa địa điểm khỏi danh sách yêu thích.
 * - Quản lý trạng thái mở rộng (xem tất cả) và điều hướng.
 */
export const useProfileSidebar = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: FavoriteItem | null;
  }>({ isOpen: false, item: null });
  
  const navigate = useNavigate();

  /**
   * Gọi API để lấy danh sách các địa điểm người dùng đã yêu thích.
   * Xử lý linh hoạt dữ liệu trả về (hỗ trợ cả phân trang và mảng tĩnh).
   */
  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await getFavorites(0, 10);
      
      const rawData = res.data?.data as unknown;
      if (rawData) {
        if (typeof rawData === 'object' && "content" in rawData && Array.isArray((rawData as { content: FavoriteItem[] }).content)) {
          setFavorites((rawData as { content: FavoriteItem[] }).content);
        } else if (Array.isArray(rawData)) {
          setFavorites(rawData as FavoriteItem[]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích trong sidebar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  /**
   * Xử lý khi người dùng nhấn nút xóa một địa điểm yêu thích.
   * - Mở Modal xác nhận xóa thay vì xóa ngay lập tức.
   */
  const handleRemoveFavorite = (e: React.MouseEvent, item: FavoriteItem) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, item });
  };

  /**
   * Xác nhận xóa địa điểm yêu thích sau khi người dùng đồng ý trên Modal.
   * - Áp dụng Optimistic UI: Xóa khỏi giao diện ngay lập tức trước khi gọi API để tăng tốc độ phản hồi.
   * - Nếu API lỗi, khôi phục lại dữ liệu cũ.
   */
  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    
    const item = deleteModal.item;
    const originalFavorites = [...favorites];
    
    // Đóng modal trước
    setDeleteModal({ isOpen: false, item: null });
    
    // Optimistic UI
    setFavorites(prev => prev.filter(f => f.id !== item.id));
    
    try {
      await removeFavorite(item.locationId, item.locationType);
      toast.info("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      toast.error("Không thể xóa yêu thích lúc này");
      setFavorites(originalFavorites);
    }
  };

  const displayedFavorites = isExpanded ? favorites : favorites.slice(0, 3);

  /**
   * Điều hướng người dùng đến trang chi tiết của địa điểm yêu thích.
   */
  const handleNavigate = (item: FavoriteItem) => {
    const type = item.locationType.toLowerCase();
    navigate(`/${type}/${item.locationId}`);
  };

  return {
    favorites,
    isExpanded,
    setIsExpanded,
    isLoading,
    deleteModal,
    setDeleteModal,
    handleRemoveFavorite,
    confirmDelete,
    displayedFavorites,
    handleNavigate
  };
};
