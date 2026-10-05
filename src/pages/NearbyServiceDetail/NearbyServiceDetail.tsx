import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ArrowLeft, 
  ShareNetwork, 
  Heart, 
  NavigationArrow, 
  Info, 
  Tag, 
  CalendarCheck, 
  Robot, 
  Car, 
  Compass, 
  Bank, 
  FirstAid, 
  Storefront, 
  Coffee, 
  Bed, 
  ForkKnife, 
  Sparkle 
} from "@phosphor-icons/react";
import { getNearbyServiceById, type NearbyService } from "../../services/itineraryService";
import styles from "./NearbyServiceDetail.module.scss";
import { pharmacyDefault, cover } from "../../assets/images/img";

const getServiceIcon = (type: string) => {
  switch (type) {
    case "ATM": return <Bank weight="fill" size={22} />;
    case "PHARMACY":
    case "HOSPITAL": return <FirstAid weight="fill" size={22} />;
    case "RESTAURANT": return <ForkKnife weight="fill" size={22} />;
    case "HOTEL": return <Bed weight="fill" size={22} />;
    case "CAFE": return <Coffee weight="fill" size={22} />;
    case "SHOP": return <Storefront weight="fill" size={22} />;
    case "PARKING": return <Car weight="fill" size={22} />;
    default: return <Sparkle weight="fill" size={22} />;
  }
};

const getServiceColorClass = (type: string) => {
  switch (type) {
    case "RESTAURANT": return styles.food;
    case "HOTEL": return styles.bed;
    case "ATM": return styles.atm;
    case "PHARMACY":
    case "HOSPITAL": return styles.medical;
    case "PARKING": return styles.parking;
    default: return styles.pin;
  }
};

const NearbyServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<NearbyService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getNearbyServiceById(id);
        if (res.data.status === 200) {
          setService(res.data.data || null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết dịch vụ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBack = () => navigate(-1);

  const getPriceLevelLabel = (level: string) => {
    switch (level) {
      case "CHEAP": return "Giá rẻ";
      case "MODERATE": return "Trung bình";
      case "EXPENSIVE": return "Cao cấp";
      default: return level;
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "RESTAURANT": return "Nhà hàng";
      case "HOTEL": return "Khách sạn";
      case "PHARMACY": return "Nhà thuốc";
      case "ATM": return "ATM";
      case "CAFE": return "Cà phê";
      case "SHOP": return "Cửa hàng";
      case "HOSPITAL": return "Bệnh viện";
      default: return type;
    }
  };

  const getDefaultImage = (type: string) => {
    switch (type) {
      case "PHARMACY": return pharmacyDefault;
      case "RESTAURANT": return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";
      case "HOTEL": return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
      case "CAFE": return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2070&auto=format&fit=crop";
      case "SHOP": return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop";
      case "HOSPITAL": return "https://images.unsplash.com/photo-1586773860418-d319a39005c0?q=80&w=2070&auto=format&fit=crop";
      default: return cover;
    }
  };

  const getSmartSummary = (service: NearbyService) => {
    const typeLabel = getServiceTypeLabel(service.serviceType);
    const location = service.address.split(',')[0] || "khu vực";
    
    if (service.serviceType === "PHARMACY") {
      return `${service.serviceName} tại ${location} cung cấp đầy đủ thuốc men, thực phẩm chức năng và mỹ phẩm với đội ngũ dược sĩ chuyên môn cao.`;
    }
    if (service.serviceType === "RESTAURANT") {
      return `${service.serviceName} là điểm đến lý tưởng để thưởng thức ẩm thực tại ${location}, nổi bật với không gian ấm cúng và chất lượng phục vụ tận tâm.`;
    }
    if (service.serviceType === "HOTEL") {
      return `Trải nghiệm kỳ nghỉ tuyệt vời tại ${service.serviceName} với dịch vụ phòng cao cấp và vị trí thuận tiện ngay tại ${location}.`;
    }
    if (service.serviceType === "SHOP") {
      return `${service.serviceName} là địa điểm mua sắm đa dạng tại ${location}, nơi bạn có thể tìm thấy nhiều món đồ lưu niệm và nhu yếu phẩm cần thiết.`;
    }
    if (service.serviceType === "HOSPITAL") {
      return `${service.serviceName} là cơ sở y tế uy tín tại ${location}, cung cấp dịch vụ chăm sóc sức khỏe chuyên nghiệp 24/7 cho du khách.`;
    }
    return `${service.serviceName} là ${typeLabel.toLowerCase()} uy tín tại ${location}, cam kết mang lại trải nghiệm tốt nhất cho khách hàng.`;
  };

  const getAITip = (service: NearbyService) => {
    const location = service.address.split(',')[0] || "khu vực";
    if (service.serviceType === "PHARMACY") {
      return `Nhà thuốc này thường mở cửa đến khuya (${service.openingHours.split('-')[1] || '23:00'}), rất phù hợp nếu bạn cần mua đồ dùng y tế gấp vào buổi tối khi du lịch quanh ${location}.`;
    }
    if (service.serviceType === "RESTAURANT") {
      return `Bạn nên ghé thăm ${service.serviceName} vào khung giờ trưa hoặc tối muộn để tránh chờ đợi lâu, đừng quên thử các món đặc sản tại ${location}.`;
    }
    if (service.serviceType === "SHOP") {
      return `Đừng quên kiểm tra các chương trình khuyến mãi tại ${service.serviceName}, đây là nơi tuyệt vời để mua quà tặng cho người thân.`;
    }
    if (service.serviceType === "HOSPITAL") {
      return `Trong trường hợp khẩn cấp, bạn có thể liên hệ hotline của ${service.serviceName} hoặc di chuyển nhanh chóng từ trung tâm ${location}.`;
    }
    return `Hãy lưu lại địa điểm này vào danh sách yêu thích để TravelAi có thể gợi ý cho bạn những lộ trình tối ưu nhất quanh ${location}.`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Đang tải thông tin dịch vụ...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy dịch vụ</h2>
        <button onClick={handleBack}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className={styles.landscapeContainer}>
      {/* Left Column: Visuals (Image + Map) */}
      <div className={styles.leftVisuals}>
        <button className={styles.backBtnFloating} onClick={handleBack}>
          <ArrowLeft size={24} weight="bold" />
        </button>

        <div className={styles.visualHero}>
          <img 
            src={service.imageUrl || getDefaultImage(service.serviceType)} 
            alt={service.serviceName} 
            className={styles.heroImg} 
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className={styles.heroOverlayGradient}></div>
          <div className={styles.heroTextOverlay}>
            <span className={styles.categoryBadge}>{getServiceTypeLabel(service.serviceType)}</span>
            <h1 className={styles.serviceName}>{service.serviceName}</h1>
          </div>
          <div className={styles.floatingActions}>
            <button className={styles.actionCircle}><ShareNetwork size={20} weight="bold" /></button>
            <button className={styles.actionCircle}><Heart size={20} weight="bold" /></button>
          </div>
        </div>

        <div className={styles.landscapeMapSection}>
          <div className={styles.mapContainer}>
             <iframe
                title="Google Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(service.address || (service.latitude + "," + service.longitude))}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
          </div>
          <div className={styles.mapActionsBar}>
            <div className={styles.distMeta}>
              <Car size={20} weight="fill" />
              <span>Cách bạn {service.distanceKm < 5 ? `${(service.distanceKm * 1000).toFixed(0)} m` : `${service.distanceKm.toFixed(0)} m`}</span>
            </div>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(service.address || (service.latitude + "," + service.longitude))}`} 
              target="_blank" 
              rel="noreferrer"
              className={styles.getDirectionsBtn}
            >
              <NavigationArrow size={18} weight="bold" />
              Chỉ đường
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Information & Details (Scrollable) */}
      <div className={styles.rightDetails}>
        <div className={styles.detailScrollContent}>
          <div className={styles.headerMetaRow}>
            <div className={styles.ratingBox}>
              <Star size={24} weight="fill" color="#f59e0b" />
              <div className={styles.ratingText}>
                <strong>{service.rating}</strong>
                <span>{service.reviewCount} đánh giá</span>
              </div>
            </div>
            <div className={`${styles.statusPill} ${service.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
              <span className={styles.pulseDot} />
              {service.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
            </div>
          </div>

          <div className={styles.glassCard}>
            <h2 className={styles.cardHeader}><Info size={24} weight="duotone" /> Giới thiệu</h2>
            <p className={styles.descriptionText}>{service.description}</p>
            <div className={styles.aiInsightBox}>
              <Robot size={24} weight="fill" color="#0ea5e9" />
              <p>{getSmartSummary(service)}</p>
            </div>
          </div>

          <div className={styles.infoGridLandscape}>
            <div className={styles.infoGlassItem}>
              <MapPin size={22} weight="fill" color="#0ea5e9" />
              <div className={styles.itText}>
                <label>Địa chỉ</label>
                <p>{service.address}</p>
              </div>
            </div>
            <div className={styles.infoGlassItem}>
              <Clock size={22} weight="fill" color="#f59e0b" />
              <div className={styles.itText}>
                <label>Giờ mở cửa</label>
                <p>{service.openingHours}</p>
              </div>
            </div>
            <div className={styles.infoGlassItem}>
              <Phone size={22} weight="fill" color="#10b981" />
              <div className={styles.itText}>
                <label>Hotline</label>
                <p>{service.phoneNumber || "N/A"}</p>
              </div>
            </div>
            <div className={styles.infoGlassItem}>
              <Tag size={22} weight="fill" color="#8b5cf6" />
              <div className={styles.itText}>
                <label>Mức giá</label>
                <p>{getPriceLevelLabel(service.priceLevel)}</p>
              </div>
            </div>
          </div>

          <div className={styles.aiTipSection}>
             <div className={styles.aiTipCard}>
                <div className={styles.aiTipHeader}>
                  <Sparkle size={20} weight="fill" color="#f59e0b" />
                  <span>LocalGo AI gợi ý</span>
                </div>
                <p>{getAITip(service)}</p>
             </div>
          </div>

          <div className={styles.gallerySection}>
            <h2 className={styles.cardHeader}><Compass size={24} weight="duotone" /> Khám phá qua ảnh</h2>
            <div className={styles.galleryScroll}>
              {[
                "1584308666744-24959349f919", 
                "1576602976047-174e57a47881", 
                "1512069772995-ec65ed45afd6", 
                "1587854692152-cbe660dbbb88", 
                "1586773860418-d319a39005c0"
              ].map((imgId, i) => (
                <div key={i} className={styles.galleryImgWrap}>
                  <img src={`https://images.unsplash.com/photo-${imgId}?q=80&w=600&auto=format&fit=crop`} alt="" />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reviewsSection}>
            <h2 className={styles.cardHeader}><Star size={24} weight="duotone" /> Đánh giá cộng đồng</h2>
            <div className={styles.reviewsListCondensed}>
               {[
                  { name: "Minh Anh", rating: 5, comment: "Dịch vụ tuyệt vời, không gian rất thoải mái." },
                  { name: "Hoàng Nam", rating: 4, comment: "Nhân viên nhiệt tình, vị trí dễ tìm." }
               ].map((rev, idx) => (
                  <div key={idx} className={styles.reviewItemSmall}>
                    <div className={styles.revHeader}>
                      <strong>{rev.name}</strong>
                      <div className={styles.revStars}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} weight={i < rev.rating ? "fill" : "regular"} color="#f59e0b" />)}
                      </div>
                    </div>
                    <p>{rev.comment}</p>
                  </div>
               ))}
            </div>
            <button className={styles.viewMoreBtn}>Xem tất cả đánh giá</button>
          </div>

          <div className={styles.bottomActions}>
            <button className={styles.bookingBtn}>
              <CalendarCheck size={20} weight="bold" />
              Đặt chỗ qua TravelAi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyServiceDetail;
