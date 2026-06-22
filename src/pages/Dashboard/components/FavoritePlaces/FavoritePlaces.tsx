import React from "react";
import styles from "./FavoritePlaces.module.scss";
import { Star, MapPin, Tag, Heart, Trash } from "@phosphor-icons/react";
import AddressDisplay from "../../../../components/Ui/AddressDisplay/AddressDisplay";
import { anhmatdinh } from "../../../../assets/images/img";
import ConfirmModal from "../../../../components/Ui/ConfirmModal/ConfirmModal";
import { useProfileSidebar } from "../../../Profile/components/ProfileSidebar/hooks/useProfileSidebar";
import { motion } from "framer-motion";

const FavoritePlaces: React.FC = () => {
  const {
    favorites,
    isLoading,
    deleteModal,
    setDeleteModal,
    handleRemoveFavorite,
    confirmDelete,
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

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Đang tải danh sách yêu thích...</span>
      </div>
    );
  }

  return (
    <div className={styles.favoritePlaces}>
      <div className={styles.grid}>
        {favorites.length > 0 ? (
          favorites.map((item, index) => (
            <motion.div 
              key={item.id} 
              className={styles.placeCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => handleRemoveFavorite(e, item)}
                  title="Xóa khỏi yêu thích"
                >
                  <Trash size={18} weight="bold" />
                </button>
              </div>

              <div className={styles.cardBody}>
                <h4 className={styles.title}>{item.locationName}</h4>
                
                <div className={styles.metaRow}>
                  <div className={styles.rating}>
                    <Star size={16} weight="fill" color="#f59e0b" />
                    <span>{item.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className={styles.separator}>•</div>
                  <div className={styles.type}>
                    <Tag size={14} weight="bold" />
                    <span>{getLocationTypeLabel(item.locationType)}</span>
                  </div>
                </div>

                <div className={styles.address}>
                  <MapPin size={14} weight="bold" />
                  <span className={styles.addressText}>
                    <AddressDisplay address={item.address} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className={styles.empty}>
            <Heart size={64} weight="thin" color="#cbd5e1" />
            <p>Chưa có địa điểm yêu thích nào.</p>
          </div>
        )}
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

export default FavoritePlaces;
