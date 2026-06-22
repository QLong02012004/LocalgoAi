import React from "react";
import { Star, MapPin, Money, Clock } from "phosphor-react";
import styles from "./QuickStats.module.scss";
import type { Destination } from "../../../../services/destinationService";


const QuickStats: React.FC<{ data: Destination }> = ({ data }) => {
  const getProvinceName = (location: string): string => {
    if (!location) return "Đang cập nhật";
    const lower = location.toLowerCase();
    if (lower.includes("đà nẵng")) return "Đà Nẵng";
    if (lower.includes("quảng nam") || lower.includes("hội an")) return "Quảng Nam";
    if (lower.includes("huế") || lower.includes("thừa thiên")) return "Thừa Thiên Huế";
    
    // Fallback: lấy phần tử cuối cùng bỏ qua "Việt Nam"
    const parts = location.split(',').map(p => p.trim()).filter(p => p.toLowerCase() !== "việt nam");
    return parts[parts.length - 1] || "Đang cập nhật";
  };

  const stats = [
    { icon: <Star weight="fill" color="#33d7d1" />, label: "Đánh giá", value: `${data.rating}/5.0` },
    { 
      icon: <MapPin weight="fill" color="#33d7d1" />, 
      label: "Vị trí", 
      value: getProvinceName(data.location) 
    },
    { 
      icon: <Money weight="fill" color="#33d7d1" />, 
      label: data.category?.toLowerCase().includes("khách sạn") ? "Giá TB/Đêm" : "Mức giá", 
      value: data.price 
    },
    { 
      icon: <Clock weight="fill" color="#33d7d1" />, 
      label: data.category?.toLowerCase().includes("khách sạn") ? "Duy trì" : "Thời gian", 
      value: data.time 
    },
  ];

  return (
    <div className={styles.quickStats} data-aos="fade-up">
      {stats.map((stat, idx) => (
        <div key={idx} className={styles.statBox}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}><strong>{stat.value}</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;