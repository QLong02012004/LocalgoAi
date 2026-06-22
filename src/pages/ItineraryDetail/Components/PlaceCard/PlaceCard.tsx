import React from "react";
import { type RoutePoint } from "../../types";
import styles from "./PlaceCard.module.scss";
import {
  NavigationArrow,
  Notepad,
  Clock,
  Bed,
  ForkKnife,
  Camera,
  ShoppingBag,
  MapPin,
  Star,
  Heart,
  PencilSimple,
  Trash,
  NavigationArrow as MapArrow,
  List,
  WarningCircle,
  Money,
  House
} from "@phosphor-icons/react";
import { addFavorite, removeFavorite } from "../../../../services/profileService";
import { toast } from "react-toastify";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  point: RoutePoint;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onOpenNavigation: (lat: number, lng: number, name: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (point: RoutePoint) => void;
  conflictMsg?: string | null;
}

const getTypeProps = (type: string) => {
  switch (type) {
    case "hotel":
      return {
        Icon: House,
        badgeClass: styles.badge_hotel,
        label: "🏠 Khách sạn",
      };
    case "restaurant":
      return {
        Icon: ForkKnife,
        badgeClass: styles.badge_restaurant,
        label: "🍽️ Nhà hàng",
      };
    case "attraction":
      return {
        Icon: Camera,
        badgeClass: styles.badge_attraction,
        label: "📷 Địa điểm tham quan",
      };
    case "shopping":
      return {
        Icon: ShoppingBag,
        badgeClass: styles.badge_shopping,
        label: "🛍️ Mua sắm",
      };
    default:
      return {
        Icon: MapPin,
        badgeClass: styles.badge_other,
        label: "📍 Địa điểm khác",
      };
  }
};

const PlaceCard: React.FC<Props> = ({
  point,
  index,
  isActive,
  onClick,
  onOpenNavigation,
  onDelete,
  onEdit,
  conflictMsg
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState(false);
  const typeProps = getTypeProps(point.type);

  const mapToBackendType = (type: string) => {
    switch (type) {
      case 'hotel': return 'HOTEL';
      case 'restaurant': return 'RESTAURANT';
      default: return 'ATTRACTION';
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriteLoading) return;

    console.log("DEBUG: Full Point Data:", point);
    
    const pAny = point as any;
    let realId = pAny.entityId || pAny.locationId || pAny.destinationId || 
                 pAny.restaurantId || pAny.hotelId || pAny.attractionId;
    
    // 2. Only use point.id if it's purely numeric (not an ai-56-... string)
    if (!realId && /^\d+$/.test(String(point.id))) {
      realId = point.id;
    }

    if (!realId) {
      toast.warning(`Địa điểm "${point.name}" chưa có mã định danh (entityId) để lưu vào yêu thích.`, {
        position: "bottom-right",
      });
      return;
    }
    
    const idString = String(realId);
    const numericMatch = idString.match(/\d+/); 
    const extractedId = numericMatch ? Number(numericMatch[0]) : NaN;
    
    if (isNaN(extractedId)) {
      toast.error("Mã địa điểm không hợp lệ.");
      return;
    }
    
    setIsFavoriteLoading(true);
    const payload = {
      locationId: extractedId, 
      locationType: mapToBackendType(point.type),
      locationName: point.name,
      imageUrl: point.imageUrl || null,
      rating: point.rating || 0,
      address: point.address || "Đà Nẵng"
    };
    
    console.log(">>> SENDING TO BE:", payload);
    
    try {
      if (!isFavorite) {
        const res = await addFavorite(payload);
        toast.success(res.data.message || `Đã thêm ${point.name} vào mục yêu thích!`, {
          position: "bottom-right",
          autoClose: 2000,
        });
      } else {
        const res = await removeFavorite(extractedId, mapToBackendType(point.type));
        toast.info(res.data.message || `Đã xóa ${point.name} khỏi mục yêu thích.`, {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err: any) {
      console.error("Favorite Error:", err);
      const msg = err.response?.data?.message || "Không thể thực hiện thao tác này. Vui lòng thử lại sau!";
      toast.error(msg, {
        position: "bottom-right",
      });
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Logic for opening status based on scheduled time or simulated business hours
  const getOpeningStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeInMins = currentHour * 60 + currentMin;

    // Typical business hours by type
    let openTime = 8 * 60; // 8:00
    let closeTime = 22 * 60; // 22:00

    if (point.type === 'restaurant') {
      openTime = 7 * 60;
      closeTime = 23 * 60;
    } else if (point.type === 'hotel') {
      return { label: 'Mở cửa cả ngày', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    }

    if (currentTimeInMins < openTime || currentTimeInMins >= closeTime) {
      return { label: 'Đã đóng cửa', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    } else if (closeTime - currentTimeInMins < 60) {
      return { label: 'Sắp đóng cửa', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    } else {
      return { label: 'Đang mở cửa', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    }
  };

  const status = getOpeningStatus();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.itiItem} ${isActive ? styles.itemActiveHighlight : ""} ${isDragging ? styles.dragging : ""} ${conflictMsg ? styles.hasConflict : ""}`}
      onClick={onClick}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <List size={18} weight="bold" />
      </div>

      <div className={styles.itemImg}>
        <div className={styles.floatingPin}>{index}</div>
        <div className={`${styles.typeTag} ${typeProps.badgeClass}`}>
          {typeProps.label}
        </div>
        {point.imageUrl ? (
          <img src={point.imageUrl} alt={point.name} />
        ) : (
          <div className={styles.placeholderImg}>
            <typeProps.Icon size={32} weight="fill" />
          </div>
        )}
      </div>
      <div className={styles.itemInfo}>
        <div className={styles.titleRow}>
          <h4>{point.name}</h4>
          {point.rating && point.rating > 0 && (
            <div className={styles.miniRating}>
              <Star size={12} weight="fill" />
              <span>{point.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className={styles.metaRow}>
          <div className={`${styles.itemTime} ${conflictMsg ? styles.timeWarning : ""}`}>
            <Clock size={14} weight="bold" /> 
            <span>{point.time} {point.endTime ? ` - ${point.endTime}` : ''}</span>
            <div className={styles.statusDivider}></div>
            {point.type !== 'other' && (
              <div className={styles.statusMini} style={{ color: status.color }}>
                <div className={styles.statusDot} style={{ background: status.color }}></div>
                {status.label}
              </div>
            )}
            {point.estimatedCost && point.estimatedCost > 0 && (
              <>
                <div className={styles.statusDivider}></div>
                <div className={styles.priceTag}>
                  <Money size={14} weight="bold" />
                  {point.type === 'hotel' && point.pricePerNight ? (
                    <div className={styles.hotelPriceWrapper}>
                      <span className={styles.totalPrice}>{point.estimatedCost.toLocaleString()}đ</span>
                      <span className={styles.pricePerNight}>({point.pricePerNight.toLocaleString()}đ/đêm)</span>
                    </div>
                  ) : (
                    <span>{point.estimatedCost.toLocaleString()}đ</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {conflictMsg && (
          <div className={styles.conflictAlert}>
            <WarningCircle size={14} weight="fill" />
            <span>
              {conflictMsg.split("'Tối ưu'").map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <strong className={styles.highlightText}>'Tối ưu'</strong>}
                </React.Fragment>
              ))}
            </span>
          </div>
        )}

        {point.note && !conflictMsg && (
          <div className={styles.itemNote}>
            {point.note}
          </div>
        )}

        {point.alternatives && point.alternatives.length > 0 && (
          <div className={styles.alternativesBox}>
            <div className={styles.altHeader}>
              <WarningCircle size={14} weight="bold" />
              <span>Dự phòng:</span>
            </div>
            <div className={styles.altList}>
              {point.alternatives.map((alt, i) => (
                <div key={i} className={styles.altItem} title={alt.address}>
                  <MapPin size={12} weight="fill" />
                  <span className={styles.altName}>{alt.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.cardActions}>
          {onEdit && (
            <button
              className={styles.actionBtn}
              onClick={(e) => { e.stopPropagation(); onEdit(point); }}
              title="Chỉnh sửa thông tin"
            >
              <PencilSimple size={18} weight="bold" />
            </button>
          )}

          {onDelete && (
            <button
              className={`${styles.actionBtn} ${styles.btnDelete}`}
              onClick={(e) => { e.stopPropagation(); onDelete(point.id); }}
              title="Xóa địa điểm"
            >
              <Trash size={18} weight="bold" />
            </button>
          )}

          {point.type !== 'other' && (
            <>
              <div className={styles.actionDivider}></div>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNavigation(point.lat, point.lng, point.name);
                }}
                title="Mở Google Maps"
              >
                <MapArrow size={18} weight="bold" />
              </button>
              <button
                className={`${styles.actionBtn} ${isFavorite ? styles.isFavorite : ""} ${isFavoriteLoading ? styles.btnLoading : ""}`}
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
                title={isFavorite ? "Xóa khỏi yêu thích" : "Lưu vào yêu thích"}
              >
                <Heart size={18} weight={isFavorite ? "fill" : "bold"} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
