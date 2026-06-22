import React from "react";
import { MapPin, Check } from "phosphor-react";
import styles from "./FeaturesMap.module.scss";

const FeaturesMap: React.FC = () => {
  const checklist = [
    "Tối ưu hóa quãng đường di chuyển",
    "Cảnh báo thời tiết theo thời gian thực",
    "Chia sẻ vị trí với bạn bè dễ dàng",
  ];

  return (
    <section className={styles.features}>
      <div className={`container ${styles.featuresContainer}`}>
        {/* Left: Phone Mockup */}
        <div className={styles.featureMockup}>
          <div className={styles.phoneFrame}>
            <div className={styles.phoneScreen}>
              {/* CSS Map */}
              <div className={styles.cssMap}>
                <div className={`${styles.road} ${styles.road1}`}></div>
                <div className={`${styles.road} ${styles.road2}`}></div>
                <div className={`${styles.road} ${styles.road3}`}></div>
                <div className={styles.river}></div>
                <div className={styles.routeLine}></div>
                <div className={`${styles.mapPinPoint} ${styles.start}`}></div>
                <div className={`${styles.mapPinPoint} ${styles.end}`}></div>
              </div>
            </div>
          </div>

          {/* Floating Card */}
          <div className={styles.floatingCard}>
            <div className={styles.floatingIcon}>
              <MapPin size={18} weight="fill" />
            </div>
            <div className={styles.floatingText}>
              <span className={styles.label}>ĐIỂM ĐẾN</span>
              <span className={styles.value}>Đà Nẵng, VN</span>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className={styles.featureContent}>
          <h2 className={styles.sectionTitle}>
            <span>Bản đồ tương tác </span>
            <span className={styles.gradientText}>Định hình chuyến đi</span>
          </h2>

          <p className={styles.sectionDescription}>
            Giao diện trực quan giúp bạn dễ dàng kéo thả các địa điểm yêu thích
            vào lộ trình. AI sẽ tự động tính toán thời gian di chuyển và gợi ý
            các điểm dừng chân thú vị dọc đường.
          </p>

          <ul className={styles.featureChecklist}>
            {checklist.map((item, index) => (
              <li key={index}>
                <div className={styles.checkIcon}>
                  <Check size={14} weight="bold" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesMap;
