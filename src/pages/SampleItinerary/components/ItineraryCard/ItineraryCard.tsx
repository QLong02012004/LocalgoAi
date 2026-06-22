import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Users,
  Star,
  Coins,
  CaretRight,
  Eye,
  MapTrifold,
} from "@phosphor-icons/react";
import * as Icons from "@phosphor-icons/react";
import styles from "./ItineraryCard.module.scss";
import type { GeneratedItinerary } from "../../../../services/itineraryService";

interface Props {
  data: GeneratedItinerary;
}

const formatTime = (time: any): string => {
  if (Array.isArray(time)) {
    const h = String(time[0]).padStart(2, '0');
    const m = String(time[1]).padStart(2, '0');
    return `${h}:${m}`;
  }
  if (typeof time === 'string') return time.substring(0, 5);
  return "--:--";
};

const ItineraryCard: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleViewDetail = () => {
    // Ưu tiên id số, nếu BE chưa có thì dùng tạm itineraryId (hiện BE đang trả về số ở đây)
    const finalId = data.id || data.itineraryId;
    navigate(`/itinerary-detail/${finalId}`, {
      state: { itineraryData: data },
    });
  };

  const hasMoreDays = data.itineraryDays.length > 1;
  const budgetNum = Number(data.budget) || 0;

  // Ưu tiên ảnh chính của lộ trình, sau đó đến ảnh hoạt động hoặc khách sạn
  const firstActivityImg = data.itineraryDays
    ?.flatMap(day => day.activities)
    ?.find(act => act.imageUrl)?.imageUrl;
  
  const firstHotelImg = data.hotels?.[0]?.imageUrl;
  const cardImg = data.imageUrl || data.img || firstActivityImg || firstHotelImg || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800";

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={cardImg} alt={data.title} loading="lazy" />
        <div className={styles.overlayTags}>
          <span className={styles.priceBadge}>
            <Coins size={16} weight="fill" />
            {budgetNum.toLocaleString()}đ
          </span>
          <span className={styles.peopleBadge}>
            <Users size={16} weight="bold" />
            Lộ trình mẫu
          </span>
        </div>
        <div className={styles.ratingBadge}>
          <Star size={14} weight="fill" /> {(data.averageRating || 4.5).toFixed(1)}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{data.title}</h3>
          <div className={styles.metaInfo}>
            <span className={styles.duration}>
              <Clock size={16} weight="bold" /> {data.days} ngày
            </span>
            {data.totalDistance > 0 && (
              <span className={styles.distance}>
                <Icons.MapTrifold size={16} weight="bold" /> {data.totalDistance.toFixed(1)} km
              </span>
            )}
            <span className={styles.location}>
              <MapPin size={16} weight="bold" /> {data.provinceName}
            </span>
          </div>
        </div>

        <div className={styles.itineraryTimeline}>
          <p className={styles.timelineLabel}>Lịch trình dự kiến:</p>
          <div className={styles.daysList}>
            {(data.itineraryDays || [])
              .slice(0, isExpanded ? undefined : 1)
              .map((day, dayIdx) => (
                <div key={dayIdx} className={styles.dayGroup}>
                  <div className={styles.dayHeader}>
                    <span className={styles.dayBadge}>Ngày {day.dayNumber}</span>
                    <span className={styles.dayTheme}>{day.theme}</span>
                  </div>
                  <div className={styles.activitiesList}>
                    {(day.activities || []).slice(0, 3).map((act, actIdx) => (
                      <div key={actIdx} className={styles.stepItem}>
                        <div className={styles.visualLine}>
                          <div className={styles.dot} />
                          <div className={styles.line} />
                        </div>
                        <div className={styles.stepInfo}>
                          <div className={styles.timeRow}>
                            <span className={styles.time}>{formatTime(act.startTime)}</span>
                            <span className={styles.distance}>{act.type}</span>
                          </div>
                          <p className={styles.activity}>{act.name}</p>
                        </div>
                      </div>
                    ))}
                    {day.activities.length > 3 && (
                      <p className={styles.moreActivities}>+ {day.activities.length - 3} hoạt động khác</p>
                    )}
                  </div>
                </div>
              ))}
            {!isExpanded && hasMoreDays && (
              <p className={styles.moreDays}>
                ... và {data.itineraryDays.length - 1} ngày khác
              </p>
            )}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.detailBtn} onClick={handleViewDetail}>
            <Eye size={18} weight="bold" /> Chi tiết
          </button>
          {hasMoreDays && (
            <button
              className={styles.selectBtn}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Thu gọn" : "Xem thêm"}{" "}
              <CaretRight
                size={18}
                weight="bold"
                style={{
                  transform: isExpanded ? "rotate(-90deg)" : "rotate(90deg)",
                  transition: "transform 0.3s",
                }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
