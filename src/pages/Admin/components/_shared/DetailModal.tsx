import React, { useState, useEffect } from "react";
import styles from "./DetailModal.module.scss";
import {
  X,
  MapPin,
  Star,
  Clock,
  Envelope,
  PhoneCall,
  IdentificationCard,
  UserCircle,
  Buildings,
  ForkKnife,
  MapTrifoldIcon,
  Image as ImageIcon,
  GlobeHemisphereWest,
  Video,
  ShieldCheck,
  ChatCircleText,
} from "@phosphor-icons/react";
import NearbyServicesSection from "../NearbyServicesView/NearbyServicesSection";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { 
  Hotel, 
  Restaurant, 
  Destination, 
  DbUser, 
  AdminReview
} from "../../../../services/adminService";
import {
  fetchUserDetail,
  fetchHotelDetail,
  fetchRestaurantDetail,
  fetchAttractionDetail,
  fetchReviewDetail,
  fetchReviewsByTarget,
  fetchNearbyServicesByTarget,
} from "../../../../services/adminService";
import ProtectedImage from "../../../../components/ProtectedImage/ProtectedImage";
import AddressDisplay from "../../../../components/Ui/AddressDisplay/AddressDisplay";

// Custom Map Icons for Detail Modal (Teardrop shape for absolute clarity and contrast)
const placeMarkerIcon = (type: string) => {
  const color = type === "hotel" ? "#0ea5e9" : type === "restaurant" ? "#f43f5e" : "#10b981";
  return L.divIcon({
    className: "detail-map-main-marker",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: -3px 4px 10px rgba(0, 0, 0, 0.45);
        border: 3px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const nearbyMarkerIcon = (serviceType: string) => {
  let color = "#3b82f6";
  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path></svg>`;

  const typeUpper = serviceType?.toUpperCase() || "";
  if (typeUpper === "RESTAURANT" || typeUpper === "CAFE") {
    color = "#f97316";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M152,80a8,8,0,0,1-8,8H136V216a8,8,0,0,1-16,0V88H112a8,8,0,0,1-8-8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0ZM200,32a8,8,0,0,0-8,8V120H176V40a8,8,0,0,0-16,0v88a8,8,0,0,0,8,8h24v80a8,8,0,0,0,16,0V40A8,8,0,0,0,200,32Z"></path></svg>`;
  } else if (typeUpper === "HOTEL") {
    color = "#8b5cf6"; // Royal purple for distinct hotel styling
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72H48A24,24,0,0,0,24,96v96a8,8,0,0,0,16,0V176H216v16a8,8,0,0,0,16,0V96A24,24,0,0,0,208,72ZM40,96a8,8,0,0,1,8-8h56a8,8,0,0,1,8,8v32H40Zm168,64H40V144H216v16A8,8,0,0,1,208,160Zm0-32a8,8,0,0,1-8-8V88h8a8,8,0,0,1,8,8Z"></path></svg>`;
  } else if (typeUpper === "PHARMACY" || typeUpper === "HOSPITAL") {
    color = "#10b981";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A16,16,0,0,0,32,56v144a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200Zm-32-72H136V80a8,8,0,0,0-16,0v48H80a8,8,0,0,0,0,16h40v48a8,8,0,0,0,16,0V144h40a8,8,0,0,0,0-16Z"></path></svg>`;
  } else if (typeUpper === "ATM") {
    color = "#06b6d4";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM116,96a12,12,0,1,1,12,12A12,12,0,0,1,116,96Zm32,72a8,8,0,0,1-8,8H116a8,8,0,0,1,0-16h8V128h-8a8,8,0,0,1,0-16h24a8,8,0,0,1,8,8v40h8a8,8,0,0,1,8,8Z"></path></svg>`;
  }

  return L.divIcon({
    className: "detail-map-nearby-marker",
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: -2px 3px 8px rgba(0, 0, 0, 0.4);
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

const DetailMapEffect: React.FC<{
  center: [number, number];
  nearbyServices: any[];
}> = ({ center, nearbyServices }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center) {
      const coords: [number, number][] = [center];
      nearbyServices.forEach((svc) => {
        if (svc.latitude && svc.longitude) {
          coords.push([svc.latitude, svc.longitude]);
        } else if (svc.location && svc.location.includes(",")) {
          const [lat, lng] = svc.location.split(",").map((s: string) => parseFloat(s.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            coords.push([lat, lng]);
          }
        }
      });

      if (coords.length > 1) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds.pad(0.15), { duration: 1.0 });
      } else {
        map.setView(center, 15, { animate: true });
      }
    }
  }, [center, nearbyServices, map]);

  return null;
};

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string | number | null;
  type: "hotel" | "restaurant" | "destination" | "user" | "review";
}

type DetailData = Hotel | Restaurant | Destination | DbUser | AdminReview;


const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  id,
  type,
}) => {
  const [data, setData] = useState<DetailData | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          let res;
          if (type === "hotel") res = await fetchHotelDetail(id);
          else if (type === "restaurant") res = await fetchRestaurantDetail(id);
          else if (type === "destination")
            res = await fetchAttractionDetail(id);
          else if (type === "user") res = await fetchUserDetail(id);
          else if (type === "review") res = await fetchReviewDetail(id);

          if (res && res.data) {
            // Robust data extraction: use data field
            const resBody = res.data;
            const resData = resBody.data;
            
            if (resData) setData(resData as DetailData);
          }

          // Fetch reviews for places
          if (type === "hotel" || type === "restaurant" || type === "destination") {
            setLoadingReviews(true);
            try {
              const targetType = type === "destination" ? "attraction" : type;
              const revRes = await fetchReviewsByTarget(targetType, id);
              if (revRes.data) {
                const revData = revRes.data.data?.content || revRes.data.data;
                setReviews(Array.isArray(revData) ? (revData as AdminReview[]) : []);
              }
            } catch (err) {
              console.error("Lỗi khi lấy reviews:", err);
              setReviews([]);
            } finally {
              setLoadingReviews(false);
            }

            // Fetch nearby services
            try {
              const targetType = type === "destination" ? "attraction" : type;
              const svcRes = await fetchNearbyServicesByTarget(targetType, id);
              if (svcRes.data) {
                setNearbyServices(svcRes.data.data || []);
              }
            } catch (err) {
              console.error("Lỗi khi lấy dịch vụ lân cận:", err);
              setNearbyServices([]);
            }
          }
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setData(null);
      setReviews([]);
      setNearbyServices([]);
    }
  }, [isOpen, id, type]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải thông tin chi tiết...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className={styles.errorContainer}>
          <p>Không tìm thấy dữ liệu hoặc có lỗi xảy ra.</p>
        </div>
      );
    }

    if (type === "user") {
      const userData = data as DbUser;
      return (
        <div className={styles.userDetail}>
          <div className={styles.profileSection}>
            <div className={styles.avatarWrapper}>
              <ProtectedImage
                src={userData.avatarUrl || ""}
                fallbackSrc={`https://ui-avatars.com/api/?name=${userData.fullName || userData.email}&background=0ea5e9&color=fff`}
                alt="Avatar"
              />
              <div className={styles.roleBadgeFloating}>
                {userData.roleName} (ID: {userData.roleId})
              </div>
            </div>
            <div className={styles.profileMain}>
              <h4>{userData.fullName || "Chưa cập nhật tên"}</h4>
              <p className={styles.userEmail}>{userData.email}</p>
              <div className={styles.userMeta}>
                <span
                  className={
                    userData.isActive ? styles.statusActive : styles.statusInactive
                  }
                >
                  {userData.isActive ? "Đang hoạt động" : "Đã bị khóa"}
                </span>
                <span className={styles.joinDate}>
                  Tham gia:{" "}
                  {(() => {
                    const dateVal = userData.createdAt;
                    if (Array.isArray(dateVal)) {
                      const [year, month, day] = dateVal;
                      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                    }
                    return new Date(dateVal).toLocaleDateString("vi-VN");
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h5>Thông tin liên hệ</h5>
              <div className={styles.cardContent}>
                <div className={styles.infoLine}>
                  <Envelope size={20} />
                  <span>{userData.email}</span>
                </div>
                <div className={styles.infoLine}>
                  <PhoneCall size={20} />
                  <span>{userData.phone || "Chưa cập nhật SĐT"}</span>
                </div>
                <div className={styles.infoLine}>
                  <MapPin size={20} />
                  <span><AddressDisplay address={userData.address || "Chưa cập nhật địa chỉ"} /></span>
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <h5>Bảo mật & Hệ thống</h5>
              <div className={styles.cardContent}>
                <div className={styles.infoLine}>
                  <ShieldCheck size={20} />
                  <span>
                    Xác minh Email:{" "}
                    {userData.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
                  </span>
                </div>
                <div className={styles.infoLine}>
                  <GlobeHemisphereWest size={20} />
                  <span>
                    Liên kết:{" "}
                    {userData.isGoogleLinked
                      ? "Google"
                      : userData.isFacebookLinked
                        ? "Facebook"
                        : "Mặc định"}
                    {userData.googleId && ` (${userData.googleId})`}
                    {userData.facebookId && ` (${userData.facebookId})`}
                  </span>
                </div>
                <div className={styles.infoLine}>
                  <IdentificationCard size={20} />
                  <span>User ID: {userData.id}</span>
                </div>
                <div className={styles.infoLine}>
                  <Clock size={20} />
                  <span>
                    Cập nhật cuối:{" "}
                    {(() => {
                      const dateVal = userData.updatedAt;
                      if (Array.isArray(dateVal)) {
                        const [year, month, day, h, m] = dateVal;
                        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      }
                      return new Date(dateVal).toLocaleString("vi-VN");
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {userData.bio && (
            <div className={styles.bioCard}>
              <h5>Giới thiệu bản thân</h5>
              <p>{userData.bio}</p>
            </div>
          )}
        </div>
      );
    }

    if (type === "review") {
      const reviewData = data as AdminReview;
      return (
        <div className={styles.reviewDetail}>
          <div className={styles.reviewHeader}>
            <ProtectedImage
              src={reviewData.userImage || ""}
              fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(reviewData.userName || "User")}&background=0ea5e9&color=fff`}
              alt="Avatar"
              className={styles.reviewerAvatar}
            />
            <div className={styles.reviewerInfo}>
              <h4>
                {reviewData.userName || "Người dùng ẩn danh"}
                <span className={styles.idBadge}>ID: {reviewData.id}</span>
              </h4>
              <div className={styles.reviewMeta}>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      weight={i < (reviewData.rating || 0) ? "fill" : "regular"}
                      color={i < (reviewData.rating || 0) ? "#f59e0b" : "#cbd5e1"}
                    />
                  ))}
                  <span>{reviewData.rating}/5</span>
                </div>
                <div className={styles.categoryTag}>{reviewData.type}</div>
                {(reviewData.nameService || reviewData.provinceName) && (
                  <div className={styles.targetInfo}>
                    {reviewData.nameService && (
                      <span className={styles.serviceName}>
                        <Buildings size={14} weight="fill" /> {reviewData.nameService}
                      </span>
                    )}
                    {reviewData.provinceName && (
                      <span className={styles.provinceTag}>
                        <MapPin size={14} weight="fill" /> {reviewData.provinceName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.reviewContent}>
            <div className={styles.descHeader}>
              <ChatCircleText size={24} weight="fill" />
              <h5>Nội dung đánh giá</h5>
            </div>
            <p className={styles.commentText}>
              "{reviewData.comment || "Không có nội dung."}"
            </p>
          </div>

          <div className={styles.imageGallery}>
            <h5>Hình ảnh đính kèm</h5>
            <div className={styles.largeGrid}>
              {reviewData.images && reviewData.images.length > 0 ? (
                reviewData.images.map((img: string, i: number) => (
                  <ProtectedImage key={i} src={img} alt={`review-${i}`} />
                ))
              ) : (
                <div className={styles.noImages}>
                  <ImageIcon
                    size={32}
                    color="#cbd5e1"
                    className={styles.mb8}
                  />
                  <p className={styles.m0}>Không có hình ảnh đính kèm</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.techGrid}>
            <div className={styles.techItem}>
              <label>User ID</label>
              <p>{reviewData.userId || "N/A"}</p>
            </div>
            <div className={styles.techItem}>
              <label>Mục tiêu</label>
              <p>
                {reviewData.hotelId && `Khách sạn (ID: ${reviewData.hotelId})`}
                {reviewData.restaurantId && `Nhà hàng (ID: ${reviewData.restaurantId})`}
                {reviewData.attractionId && `Địa điểm (ID: ${reviewData.attractionId})`}
                {!reviewData.hotelId &&
                  !reviewData.restaurantId &&
                  !reviewData.attractionId &&
                  "Hệ thống"}
              </p>
            </div>
            <div className={styles.techItem}>
              <label>Trạng thái</label>
              <p
                className={
                  reviewData.status === "ACTIVE" ? styles.statusActive : styles.statusMaint
                }
              >
                {reviewData.status === "ACTIVE" ? "Đã duyệt" : "Bị khóa/Ẩn"}
              </p>
            </div>
            <div className={styles.techItem}>
              <label>Ngày đăng</label>
              <p>
                {(() => {
                  const dateVal = reviewData.createdAt;
                  if (Array.isArray(dateVal)) {
                    const [year, month, day, h, m] = dateVal;
                    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                  }
                  return new Date(dateVal).toLocaleString("vi-VN");
                })()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // For Hotels, Restaurants, Destinations (Common structure)
    const provinceMap: Record<string, string> = {
      "1": "Thừa Thiên Huế",
      "2": "Đà Nẵng",
      "3": "Quảng Nam",
      "4": "Hà Nội",
      "5": "TP. Hồ Chí Minh",
    };

    const categoryMap: Record<string, string> = {
      // Hotels
      LUXURY: "Hạng sang (Luxury)",
      RESORT: "Khu nghỉ dưỡng (Resort)",
      BOUTIQUE: "Độc đáo (Boutique)",
      BUDGET: "Bình dân (Budget)",
      BUSINESS: "Công tác (Business)",
      HOMESTAY: "Homestay",
      VILLA: "Biệt thự (Villa)",
      // Restaurants
      VIETNAMESE: "Món Việt",
      SEAFOOD: "Hải sản",
      DESSERT: "Tráng miệng / Cafe",
      WESTERN: "Món Âu",
      ASIAN: "Món Á",
      VEGETARIAN: "Món chay",
      // Destinations
      ATTRACTION: "Điểm tham quan",
      CULTURE: "Văn hóa & Lịch sử",
      NATURE: "Thiên nhiên & Sinh thái",
      RELAX: "Nghỉ dưỡng & Thư giãn",
      ENTERTAINMENT: "Giải trí & Vui chơi",
    };

    const placeData = data as (Hotel | Restaurant | Destination) & {
      heroImage?: string;
      img?: string;
      image?: string;
      price?: number;
      time?: number;
      reviews?: number;
    };

    const rawStatus = placeData.status?.toUpperCase() || "ACTIVE";
    const statusText = rawStatus === "ACTIVE" ? "Đang hoạt động" : "Đóng cửa";

    return (
      <div className={styles.placeDetail}>
        {/* Hero */}
        <div className={styles.heroSection}>
          <img
            src={placeData.imageUrl || placeData.heroImage}
            alt={placeData.name}
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}>
            <h2 className={styles.heroTitle}>{placeData.name}</h2>
            <p className={styles.heroSubtitle}>ID: {placeData.id}</p>
            <div className={styles.heroRating}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  weight={i < Math.round(placeData.rating || 0) ? "fill" : "regular"}
                  color={i < Math.round(placeData.rating || 0) ? "#f59e0b" : "#94a3b8"}
                />
              ))}
              <span>{placeData.rating} ({placeData.reviewCount || placeData.reviews || 0} đánh giá)</span>
            </div>
          </div>
        </div>

        {/* Content Row: Location left + Info grid right */}
        <div className={styles.contentRow}>
          {/* Left: Location & Map */}
          <div className={styles.locationBlock}>
            <div className={styles.locHeader}>
              <div className={styles.locIcon}>
                <MapPin size={22} weight="fill" />
              </div>
              <div className={styles.locInfo}>
                <label>VỊ TRÍ & ĐỊA CHỈ</label>
                <p className={styles.locAddress}>
                  <AddressDisplay address={placeData.addressDetailed || "Chưa cập nhật"} />
                </p>
                <p className={styles.locCoords}>{placeData.location || "Chưa có tọa độ"}</p>
              </div>
            </div>
            {/* Mini map from coordinates */}
            {(() => {
              // Parse location string for map embed only
              const loc = placeData.location || "";
              // Handle formats: "16,066985, 108,220137" or "16.004304, 108.263527"
              const parts = loc.split(/,\s+/);
              let lat = 0, lng = 0;
              if (parts.length === 2) {
                lat = parseFloat(parts[0].replace(",", "."));
                lng = parseFloat(parts[1].replace(",", "."));
              } else if (parts.length === 4) {
                // "16,066985, 108,220137" splits into ["16", "066985", "108", "220137"]
                lat = parseFloat(`${parts[0]}.${parts[1]}`);
                lng = parseFloat(`${parts[2]}.${parts[3]}`);
              }
              if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                return (
                  <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    zoomControl={true}
                    className={styles.miniMap}
                  >
                    <TileLayer
                      attribution="© Google Maps"
                      url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                      maxZoom={20}
                    />
                    
                    <DetailMapEffect center={[lat, lng]} nearbyServices={nearbyServices} />

                    {/* Main Place Marker */}
                    <Marker position={[lat, lng]} icon={placeMarkerIcon(type)}>
                      <Popup>
                        <div style={{ fontSize: "0.85rem", maxWidth: "240px", textWrap: "balance" }}>
                          <strong style={{ color: type === "hotel" ? "#0ea5e9" : type === "restaurant" ? "#f43f5e" : "#10b981" }}>{placeData.name}</strong>
                          <br />
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{placeData.addressDetailed || placeData.address}</span>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Nearby Services Markers */}
                    {nearbyServices.map((svc, idx) => {
                      const svcLat = svc.latitude || (svc.location && parseFloat(svc.location.split(",")[0]));
                      const svcLng = svc.longitude || (svc.location && parseFloat(svc.location.split(",")[1]));
                      if (!svcLat || !svcLng || isNaN(svcLat) || isNaN(svcLng)) return null;

                      return (
                        <Marker 
                          key={`nearby-map-${svc.id || idx}`} 
                          position={[svcLat, svcLng]} 
                          icon={nearbyMarkerIcon(svc.serviceType)}
                        >
                          <Popup>
                            <div style={{ fontSize: "0.85rem", maxWidth: "240px", textWrap: "balance" }}>
                              <strong style={{ color: "#3b82f6" }}>{svc.serviceName}</strong>
                              <br />
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Loại: {svc.serviceType} | Cách: {svc.distanceKm} km
                              </span>
                              <br />
                              <span style={{ fontSize: "0.75rem" }}>{svc.address}</span>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                );
              }
              return (
                <div className={styles.miniMapEmpty}>
                  <MapPin size={28} weight="fill" color="#7c3aed" />
                  <span>Không có tọa độ</span>
                </div>
              );
            })()}
          </div>

          {/* Right: 2x2 Info Grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon} style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                <ShieldCheck size={20} weight="fill" color="#10b981" />
              </div>
              <div>
                <label>TRẠNG THÁI</label>
                <p className={styles.infoValue}>{statusText}</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon} style={{ background: "rgba(99, 102, 241, 0.1)" }}>
                <IdentificationCard size={20} weight="fill" color="#6366f1" />
              </div>
              <div>
                <label>GIÁ</label>
                <p className={styles.infoValue}>
                  {Number(placeData.averagePrice || placeData.price || 0).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon} style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                <Clock size={20} weight="fill" color="#8b5cf6" />
              </div>
              <div>
                <label>THỜI LƯỢNG</label>
                <p className={styles.infoValue}>{placeData.estimatedDuration || placeData.time || 0} phút</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon} style={{ background: "rgba(14, 165, 233, 0.1)" }}>
                <Video size={20} weight="fill" color="#0ea5e9" />
              </div>
              <div>
                <label>VIDEO XEM TRƯỚC</label>
                <p className={styles.infoValue}>{placeData.previewVideo ? "Có" : "Không có"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.descSection}>
          <label>MÔ TẢ CHI TIẾT</label>
          <h4 className={styles.descTitle}>
            {(placeData.category ? categoryMap[placeData.category] : null) || placeData.category || ""}
            {" — "}
            {provinceMap[String(placeData.provinceId)] || ""}
          </h4>
          <p>{placeData.description || "Hiện chưa có mô tả chi tiết cho mục này."}</p>
        </div>

        {/* Gallery */}
        {placeData.gallery && placeData.gallery.length > 0 && (
          <div className={styles.gallerySection}>
            <label>BỘ SƯU TẬP ẢNH ({placeData.gallery.length})</label>
            <div className={styles.galleryGrid}>
              {placeData.gallery.map((img: string, idx: number) => (
                <div key={idx} className={styles.galleryItem}>
                  <ProtectedImage src={img} alt={`${placeData.name} gallery ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media URLs */}
        <div className={styles.mediaUrlSection}>
          <label>ĐƯỜNG DẪN ẢNH GỐC</label>
          <div className={styles.mediaUrlCard}>
            <div className={styles.mediaUrlIcon}>
              <ImageIcon size={20} weight="fill" />
            </div>
            <div className={styles.mediaUrlContent}>
              <span>NGUỒN</span>
              <code>{placeData.imageUrl || placeData.heroImage || "N/A"}</code>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className={styles.reviewsSection}>
          <div className={styles.reviewsSectionHeader}>
            <ChatCircleText size={22} weight="fill" color="#f59e0b" />
            <h5>Đánh giá từ khách hàng ({reviews.length})</h5>
          </div>

          {loadingReviews ? (
            <div className={styles.reviewsLoading}>
              <div className={styles.spinnerSmall}></div>
              <span>Đang tải đánh giá...</span>
            </div>
          ) : reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((rev) => (
                <div key={rev.id} className={styles.reviewItem}>
                  <div className={styles.revHeader}>
                    <ProtectedImage
                      src={rev.userImage}
                      fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=random`}
                      alt=""
                      className={styles.revAvatar}
                    />
                    <div className={styles.revMeta}>
                      <strong>{rev.userName}</strong>
                      <div className={styles.revStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            weight={i < rev.rating ? "fill" : "regular"}
                            color={i < rev.rating ? "#f59e0b" : "#cbd5e1"}
                          />
                        ))}
                        <span>
                          {(() => {
                            const dateVal = rev.createdAt;
                            if (Array.isArray(dateVal)) {
                              const [year, month, day] = dateVal;
                              return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                            }
                            return new Date(dateVal).toLocaleDateString('vi-VN');
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.revComment}>{rev.comment}</p>
                  {rev.images && rev.images.length > 0 && (
                    <div className={styles.revGallery}>
                      {rev.images.map((img: string, i: number) => (
                        <ProtectedImage key={i} src={img} alt="" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noReviews}>
              Chưa có đánh giá nào cho địa điểm này.
            </div>
          )}
        </div>

        {/* Nearby Services */}
        <NearbyServicesSection 
          parentId={placeData.id} 
          parentType={type as "hotel" | "restaurant" | "destination"} 
          parentLocation={placeData.location}
          parentName={placeData.name}
        />
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              {type === "hotel" && <Buildings size={24} color="#0EA5E9" />}
              {type === "restaurant" && <ForkKnife size={24} color="#F43F5E" />}
              {type === "destination" && (
                <MapTrifoldIcon size={24} color="#10B981" />
              )}
              {type === "user" && <UserCircle size={24} color="#8B5CF6" />}
              {type === "review" && (
                <ChatCircleText size={24} color="#f59e0b" />
              )}
              <h3>
                Chi tiết{" "}
                {type === "user"
                  ? "Người dùng"
                  : type === "hotel"
                    ? "Khách sạn"
                    : type === "restaurant"
                      ? "Nhà hàng"
                      : type === "review"
                        ? "Đánh giá"
                        : "Địa điểm"}
              </h3>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
              title="Đóng"
            >
              <div className={styles.smallFont}>
                <X size={20} weight="bold" />
              </div>
            </button>
          </div>

          <div className={styles.body}>{renderContent()}</div>

          <div className={styles.footer}>
            <button type="button" className={styles.btnClose} onClick={onClose}>
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DetailModal;
