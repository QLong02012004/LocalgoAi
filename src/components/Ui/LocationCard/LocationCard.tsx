import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Bed as BedIcon, ForkKnife, Heart } from "@phosphor-icons/react";
import styles from "./LocationCard.module.scss";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import AddressDisplay from "../AddressDisplay/AddressDisplay";
import type { HighlightItem } from "../../../services/highlightService";
import { addFavorite, removeFavorite } from "../../../services/profileService";
import { toast } from "react-toastify";

interface LocationCardProps {
  item: HighlightItem;
  idx?: number;
}

const LocationCard: React.FC<LocationCardProps> = ({ item, idx = 0 }) => {
  const [isLiked, setIsLiked] = useState(false);

  const renderIcon = (type: string) => {
    if (type === "bed") return <BedIcon size={16} weight="fill" />;
    if (type === "food") return <ForkKnife size={16} weight="fill" />;
    return <MapPin size={16} weight="fill" />;
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const locationType = item.type === "bed" ? "HOTEL" : item.type === "food" ? "RESTAURANT" : "ATTRACTION";

    if (isLiked) {
      // Logic gỡ bỏ yêu thích
      try {
        await removeFavorite(String(item.id), locationType);
        setIsLiked(false);
        toast.info("Đã xóa khỏi danh sách yêu thích!");
      } catch (error) {
        console.error("Lỗi khi xóa yêu thích:", error);
        toast.error("Không thể xóa khỏi yêu thích. Vui lòng thử lại!");
      }
    } else {
      // Logic thêm yêu thích
      try {
        const payload = {
          locationId: item.id,
          locationType: locationType,
          locationName: item.name,
          imageUrl: item.imageUrl,
          rating: item.rating || 5.0,
          address: item.location || ""
        };
        
        const res = await addFavorite(payload);
        if (res.data.status === 201 || res.data.status === 200) {
          setIsLiked(true);
          toast.success("Đã thêm vào danh sách yêu thích!");
        }
      } catch (error) {
        console.error("Lỗi khi thêm yêu thích:", error);
        toast.error("Không thể thêm vào yêu thích. Vui lòng thử lại!");
      }
    }
  };

  return (
    <div 
      className={styles.cardContainer}
      data-aos="fade-up"
      data-aos-delay={idx * 100}
    >
      <Link
        to={
          item.type === "bed"
            ? `/hotel/${item.id}`
            : item.type === "food"
            ? `/restaurant/${item.id}`
            : `/attraction/${item.id}`
        }
        className={styles.cardWrapperLink}
      >
        <div className={styles.locationCard}>
          <div className={styles.imageContainer}>
            <img src={item.imageUrl} alt={item.name} loading="lazy" />
            <div className={styles.imageOverlay}></div>
            
            <div className={styles.statusBadge}>
              <span
                className={`${styles.ribbon} ${
                  styles[item.status?.toLowerCase() || "active"]
                }`}
              >
                {item.status === "ACTIVE" || item.status === "OPEN"
                  ? "Đang mở cửa"
                  : item.status === "MAINTENANCE"
                  ? "Đang bảo trì"
                  : "Đã đóng cửa"}
              </span>
            </div>
            {item.isHot && <div className={styles.hotTag}>HOT</div>}
            {item.averagePrice > 0 && (
              <div className={styles.floatingPrice}>
                {item.averagePrice.toLocaleString("vi-VN")}đ
              </div>
            )}
          </div>

          <div className={styles.cardInfo}>
            <div className={styles.infoHead}>
              <div className={styles.typeBadge}>
                {renderIcon(item.type)}{" "}
                {item.type === "bed"
                  ? "Khách sạn"
                  : item.type === "food"
                  ? "Ẩm thực"
                  : "Địa điểm"}
              </div>
              <div className={styles.ratingBadge}>
                <Star size={14} weight="fill" /> {item.rating}
              </div>
            </div>

            <h3>{item.name}</h3>
            <p>{item.description}</p>

            <div className={styles.infoFooter}>
              <div className={styles.locationName}>
                <MapPin size={14} weight="fill" /> <AddressDisplay address={item.location} />
              </div>
              <div className={styles.viewDetail}>
                <AnimatedButton text="XEM THÊM" size="mini" />
              </div>
            </div>
          </div>
        </div>
      </Link>

    
    </div>
  );
};

export default LocationCard;
