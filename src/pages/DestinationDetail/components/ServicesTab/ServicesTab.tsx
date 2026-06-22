import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, NavigationArrow, Phone, Clock } from "@phosphor-icons/react";
import styles from "./ServicesTab.module.scss";
import type { NearbyService } from "../../../../services/destinationService";

interface ServicesTabProps {
  services: NearbyService[];
  targetId: string | number;
  targetType: "hotel" | "restaurant" | "attraction";
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services, targetId, targetType }) => {
  const navigate = useNavigate();
  if (!services || services.length === 0) {
    return (
      <div className={styles.emptyServices}>
        <p>Hiện chưa có dịch vụ lân cận nào được cập nhật.</p>
      </div>
    );
  }

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'RESTAURANT': return 'Nhà hàng';
      case 'HOTEL': return 'Khách sạn';
      case 'ATM': return 'ATM';
      case 'STORE': return 'Cửa hàng';
      case 'COFFEE': return 'Cà phê';
      default: return type;
    }
  };

  return (
    <div className={styles.servicesContainer} data-aos="fade-up">
      <div className={styles.headerFlex}>
        <h2 className={styles.tabTitle}>Dịch vụ lân cận</h2>
        <span 
          className={styles.viewAll}
          onClick={() => navigate(`/nearby-services/${targetType}/${targetId}`)}
        >
          Xem tất cả
        </span>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.cardThumb}>
              <img 
                src={service.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"} 
                alt={service.serviceName} 
              />
              <span className={styles.typeBadge}>{getServiceLabel(service.serviceType)}</span>
              {service.distanceKm && (
                <div className={styles.distanceChip}>
                  <NavigationArrow size={12} weight="fill" /> {service.distanceKm < 5 ? `${(service.distanceKm * 1000).toFixed(0)} m` : `${service.distanceKm.toFixed(0)} m`}
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h4 title={service.serviceName}>{service.serviceName}</h4>
                <div className={styles.ratingRow}>
                  <Star size={14} weight="fill" />
                  <span className={styles.ratingVal}>{service.rating || "5.0"}</span>
                  <span className={styles.reviewCount}>({service.reviewCount || 0} đánh giá)</span>
                </div>
              </div>
              
              <div className={styles.infoList}>
                <p className={styles.infoLine}>
                  <MapPin size={16} /> 
                  <span className={styles.infoText} title={service.address || "Đang cập nhật"}>
                    {service.address ? service.address.split(',').slice(0, 3).join(',') : "Đang cập nhật"}
                  </span>
                </p>
                <p className={styles.infoLine}>
                  <Clock size={14} /> 
                  <span className={styles.statusText}>
                    <span className={styles.statusIndicator}></span>
                    <span className={styles.infoText} title={service.openingHours || "Đang mở cửa"}>
                      {service.openingHours || "Đang mở cửa"}
                    </span>
                  </span>
                </p>
                {service.phoneNumber && (
                  <p className={styles.infoLine}>
                    <Phone size={16} /> 
                    <span className={styles.infoText} title={service.phoneNumber}>
                      {service.phoneNumber}
                    </span>
                  </p>
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={`${styles.priceTag} ${service.priceLevel === 'CHEAP' ? styles.priceCheap : ''}`}>
                  {service.priceLevel || "Liên hệ"}
                </div>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => navigate(`/nearby-service/${service.id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesTab;
