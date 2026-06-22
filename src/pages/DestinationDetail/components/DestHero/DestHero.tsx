import React, { useState } from "react";
import {
  MapPin,
  Star,
  StarHalf,
  ShareNetwork,
  Heart,
  BookmarkSimple,
} from "phosphor-react";

import styles from "./DestHero.module.scss";
import AddressDisplay from "../../../../components/Ui/AddressDisplay/AddressDisplay";
import type { Destination } from "../../../../services/destinationService";

const DestHero: React.FC<{ data: Destination }> = ({ data }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className={styles.destHero} data-aos="zoom-out">
      <img src={data.heroImage} alt={data.name} className={styles.heroBgImg} />
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <div className={styles.locationTag}>
          <MapPin size={18} weight="fill" /> <AddressDisplay address={data.location} className={styles.addressText} />
        </div>
        <h1 className={styles.heroTitle}>{data.name}</h1>
        <div className={styles.heroMeta}>
          <div className={styles.heroRating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => {
                // Nếu là 4 sao đầu (index 0-3) thì dùng Star fill
                if (i < 4) {
                  return (
                    <Star key={i} size={18} weight="fill" color="#33d7d1" />
                  );
                }
                // Nếu là sao cuối cùng (index 4) thì dùng StarHalf
                return (
                  <StarHalf key={i} size={18} weight="fill" color="#33d7d1" />
                );
              })}
            </div>
            <span>
              {data.rating} ({data.reviews} đánh giá)
            </span>
          </div>
          <div className={styles.heroCategory}>{data.category}</div>
        </div>
      </div>

      <div className={styles.heroActions}>
        <button 
          className={styles.btnIconCircle} 
          title="Chia sẻ địa điểm"
          aria-label="Chia sẻ địa điểm này"
        >
          <div className={styles.btnIcon}>
            <ShareNetwork weight="bold" />
          </div>
        </button>
        <button
          className={`${styles.btnIconCircle} ${isFavorite ? styles.activeHeart : ""}`}
          onClick={() => setIsFavorite(!isFavorite)}
          title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          aria-label={isFavorite ? "Bỏ yêu thích địa điểm này" : "Yêu thích địa điểm này"}
        >
          <div className={styles.btnIcon}>
            <Heart
              weight={isFavorite ? "fill" : "bold"}
              color={isFavorite ? "#ef4444" : "currentColor"}
            />
          </div>
        </button>
        <button 
          className={styles.btnIconCircle}
          title="Lưu địa điểm"
          aria-label="Lưu địa điểm này vào danh sách"
        >
          <div className={styles.btnIcon}>
            <BookmarkSimple weight="bold" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DestHero;
