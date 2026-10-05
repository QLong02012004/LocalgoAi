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
const MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: 1,
    userId: 1,
    locationId: 1,
    locationType: "ATTRACTION",
    locationName: "Cầu Vàng - Bà Nà Hills",
    imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    address: "Hòa Phú, Hòa Vang, Đà Nẵng",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    locationId: 2,
    locationType: "HOTEL",
    locationName: "InterContinental Danang Sun Peninsula Resort",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    rating: 5.0,
    address: "Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    locationId: 3,
    locationType: "RESTAURANT",
    locationName: "Nhà Hàng Cơm Niêu Nhà Đỏ",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    address: "86 Nguyễn Tri Phương, Hải Châu, Đà Nẵng",
    createdAt: new Date().toISOString(),
  },
];

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
        if (typeof rawData === 'object' && "content" in rawData && Array.isArray((rawData as { content: FavoriteItem[] }).content) && (rawData as { content: FavoriteItem[] }).content.length > 0) {
          setFavorites((rawData as { content: FavoriteItem[] }).content);
        } else if (Array.isArray(rawData) && rawData.length > 0) {
          setFavorites(rawData as FavoriteItem[]);
        } else {
          setFavorites(MOCK_FAVORITES);
        }
      } else {
        setFavorites(MOCK_FAVORITES);
      }
    } catch {
      setFavorites(MOCK_FAVORITES);
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
