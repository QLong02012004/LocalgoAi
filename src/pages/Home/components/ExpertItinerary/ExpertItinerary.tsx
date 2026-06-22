import React from "react";
import { CheckCircle } from "phosphor-react";
import styles from "./ExpertItinerary.module.scss";

const ExpertItinerary: React.FC = () => {
  // Mảng chứa các tính năng để code sạch hơn
  const features = [
    "Tiết kiệm thời gian lên kế hoạch",
    "Tối ưu hóa chi phí chuyến đi",
    "Trải nghiệm được những điểm tốt nhất",
  ];

  return (
    <section className={styles.expertItinerary}>
      <div className={styles.expertContainer}>
        <div className={styles.expertContent} data-aos="fade-right">
          <span className={styles.subHeading}>DÀNH RIÊNG CHO BẠN</span>
          <h2 className={styles.sectionTitle}>
            Lịch trình mẫu được thiết kế <br /> bởi chuyên gia
          </h2>
          <p className={styles.sectionDescription}>
            Không biết bắt đầu từ đâu? Hãy tham khảo các lịch trình du lịch mẫu
            của chúng tôi, được tinh chỉnh hoàn hảo cho từng đối tượng và thời
            gian cụ thể.
          </p>

          <ul className={styles.featureList}>
            {features.map((item, index) => (
              <li key={index}>
                <div className={styles.featureIcon}>
                  <CheckCircle size={20} weight="fill" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="/sample"
            className={`${styles.btnPrimary} ${styles.shadowBtn}`}
          >
            Xem Lịch Trình Mẫu
          </a>
        </div>

        <div className={styles.expertImages} data-aos="fade-left">
          <div className={styles.imageMain}>
            <img
              src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=800"
              alt="Hồ nước xanh thiên nhiên"
              loading="lazy"
            />
          </div>
          <div className={styles.imageOverlay}>
            <img
              src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=600"
              alt="Bãi biển hoàng hôn"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertItinerary;
