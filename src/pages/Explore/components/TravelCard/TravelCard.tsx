import React from "react";
import { Heart, Plus, Star, MapPin, Play, X } from "@phosphor-icons/react";
import styles from "./TravelCard.module.scss";
import AnimatedButton from "../../../../components/Ui/AnimatedButton/AnimatedButton";

import { anhmatdinh } from "../../../../assets/images/img";

interface Props {
  image: string;
  title: string;
  rating: number;
  location?: string;
  description: string;
  isHot?: boolean;
  previewVideo?: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onDetail?: () => void;
  status?: string;
  price?: number;
  onAddToItinerary?: () => void;
  isInItinerary?: boolean;
}

const TravelCard: React.FC<Props> = React.memo(
  ({
    image,
    title,
    rating,
    location,
    description,
    isHot,
    previewVideo,
    isLiked = false,
    onToggleLike,
    onDetail,
    status,
    price,
    onAddToItinerary,
    isInItinerary = false,
  }) => {
    const [localLiked, setLocalLiked] = React.useState(isLiked);
    const [isHovered, setIsHovered] = React.useState(false);
    const [imgSrc, setImgSrc] = React.useState(image || anhmatdinh);

    React.useEffect(() => {
      setImgSrc(image || anhmatdinh);
    }, [image]);

    React.useEffect(() => {
      setLocalLiked(isLiked);
    }, [isLiked]);

    const [isPlaying, setIsPlaying] = React.useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }, [isPlaying]);

    // Logic xử lý trạng thái tối giản theo yêu cầu BE (ACTIVE, CLOSE)
    const statusLower = status?.toLowerCase() || "";
    const isOpen = statusLower === "active";

    return (
      <div
        className={`${styles.card} ${isPlaying ? styles.isPlayingVideo : ""} ${isHovered && previewVideo ? styles.isHovered : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPlaying(false);
        }}
        data-is-playing={isPlaying}
      >
        <div className={styles.imageContainer}>
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className={isPlaying ? styles.hideImage : ""}
            onError={() => {
              if (imgSrc !== anhmatdinh) {
                setImgSrc(anhmatdinh);
              }
            }}
          />

          {previewVideo && (isPlaying || isHovered) && (
            <video
              ref={videoRef}
              src={previewVideo}
              className={styles.previewVideo}
              muted
              loop
              playsInline
              autoPlay={isPlaying}
              preload="none"
            />
          )}

          <div className={styles.imageOverlay} />

          <div className={styles.statusBadge}>
            {status && !isPlaying && (
              <div
                className={`${styles.modernBadge} ${isOpen ? styles.active : styles.closed}`}
              >
                {isOpen ? "Mở cửa" : "Đóng cửa"}
              </div>
            )}
          </div>

          {isHot && !isPlaying && <div className={styles.hotTag}>PHỔ BIẾN</div>}

          <div className={styles.topActions}>
            <button
              className={`${styles.actionBtn} ${localLiked ? styles.liked : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setLocalLiked(!localLiked);
                if (onToggleLike) onToggleLike();
              }}
              aria-label="Yêu thích"
            >
              <Heart size={24} weight={localLiked ? "fill" : "bold"} />
            </button>

            <button
              className={`${styles.actionBtn} ${styles.itineraryBtn} ${isInItinerary ? styles.active : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToItinerary) onAddToItinerary();
              }}
              aria-label="Thêm vào hành trình"
            >
              <Plus size={24} weight={isInItinerary ? "fill" : "bold"} />
            </button>
          </div>

          {price !== undefined && price >= 0 && (
            <div className={styles.floatingPrice}>
              <span className={styles.priceLabel}>Chỉ từ</span>
              <span className={styles.priceValue}>{price.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          {isPlaying && (
            <button
              aria-label="Dừng video"
              className={styles.btnCloseVideo}
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(false);
              }}
            >
              <X size={20} weight="bold" />
            </button>
          )}
        </div>

        <div className={styles.cardInfo}>
          <div className={styles.infoHead}>
            <div className={styles.ratingBadge}>
              <Star size={16} weight="fill" className={styles.starIcon} />{" "}
              {rating}
            </div>
            {location && (
              <span className={styles.locationTag}>
                <MapPin size={18} weight="bold" /> {location}
              </span>
            )}
          </div>

          <h3 className={styles.title}>{title}</h3>
          <p className={styles.shortDesc}>{description}</p>

          <div className={styles.cardFooter}>
            <div className={styles.tags}>
              {previewVideo && !isPlaying && (
                <button
                  className={styles.btnVideo}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(true);
                  }}
                >
                  <Play size={18} weight="fill" /> Video
                </button>
              )}
            </div>
            <AnimatedButton text="CHI TIẾT" size="mini" onClick={onDetail} />
          </div>
        </div>
      </div>
    );
  },
);

export default TravelCard;
