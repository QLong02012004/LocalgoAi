import React from "react";
import styles from "./ProfileSidebar.module.scss";

import { Star, MapPin, Tag, Heart, Trash } from "@phosphor-icons/react";
import AddressDisplay from "../../../../components/Ui/AddressDisplay/AddressDisplay";
import { anhmatdinh } from "../../../../assets/images/img";
import ConfirmModal from "../../../../components/Ui/ConfirmModal/ConfirmModal";
import { useProfileSidebar } from "./hooks/useProfileSidebar";

const ProfileSidebar: React.FC = () => {
  const {
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
  } = useProfileSidebar();

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case "ATTRACTION": return "Địa điểm";
      case "HOTEL": return "Khách sạn";
      case "RESTAURANT": return "Nhà hàng";
      default: return "Khác";
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleWrapper}>
            <Heart size={20} weight="fill" color="#33d7d1" />
            <span>Địa điểm yêu thích</span>
          </div>
          {favorites.length > 3 && (
            <button 
              className={styles.toggleBtn}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Thu gọn" : "Xem tất cả"}
            </button>
          )}
        </div>

        <div className={styles.tripList}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>Đang tải...</span>
            </div>
          ) : favorites.length > 0 ? (
            displayedFavorites.map((item) => (
              <div 
                key={item.id} 
                className={styles.tripItem} 
                onClick={() => handleNavigate(item)}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={item.imageUrl || anhmatdinh} 
                    alt={item.locationName} 
                  />
                  <div className={styles.typeBadge}>
                    {getLocationTypeLabel(item.locationType)}
                  </div>
                </div>

                <div className={styles.tripInfo}>
                  <div className={styles.titleRow}>
                    <h4 className={styles.tripTitle}>{item.locationName}</h4>
                    <button 
                      className={styles.deleteBtn}
                      onClick={(e) => handleRemoveFavorite(e, item)}
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                  
                  <div className={styles.metaRow}>
                    <div className={styles.rating}>
                      <Star size={14} weight="fill" />
                      <span>{item.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className={styles.separator}>•</div>
                    <div className={styles.type}>
                      <Tag size={12} weight="bold" />
                      <span>{getLocationTypeLabel(item.locationType)}</span>
                    </div>
                  </div>

                  <div className={styles.address}>
                    <MapPin size={12} weight="bold" />
                    <span className={styles.addressText}>
                      <AddressDisplay address={item.address} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <Heart size={32} weight="thin" />
              <p>Chưa có địa điểm yêu thích nào.</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.referral}>
        <div className={styles.referralIcon}>
          <i className="ph-fill ph-gift"></i>
        </div>
        <h4>Mời bạn bè</h4>
        <p>Nhận ngay <strong>100 điểm</strong> MyPoints khi bạn bè đăng ký qua liên kết của bạn.</p>
        <button className={styles.copyBtn}>
          <i className="ph-bold ph-copy"></i>
          Sao chép liên kết
        </button>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        message={`Bạn có chắc chắn muốn xóa "${deleteModal.item?.locationName}" khỏi danh sách yêu thích?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null })}
      />
    </div>
  );
};

export default ProfileSidebar;
