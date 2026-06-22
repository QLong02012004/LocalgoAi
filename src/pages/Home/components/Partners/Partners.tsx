import React from 'react';
import styles from './Partners.module.scss';

const PARTNERS = [
  { id: 1, name: 'TripAdvisor', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504944.png', desc: 'Nền tảng đánh giá du lịch lớn nhất thế giới' },
  { id: 2, name: 'Booking.com', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504812.png', desc: 'Hệ thống đặt phòng khách sạn toàn cầu' },
  { id: 3, name: 'Expedia', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504845.png', desc: 'Tập đoàn du lịch và lữ hành đa quốc gia' },
  { id: 4, name: 'Klook', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504910.png', desc: 'Nền tảng đặt vé tham quan và trải nghiệm' },
  { id: 5, name: 'Agoda', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504810.png', desc: 'Dịch vụ đặt phòng trực tuyến uy tín tại châu Á' },
  { id: 6, name: 'Traveloka', logo: 'https://cdn-icons-png.flaticon.com/512/2504/2504940.png', desc: 'Ứng dụng đặt vé máy bay và khách sạn hàng đầu' },
];

const Partners: React.FC = () => {
  // Double the list for a seamless loop
  const displayPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <div className={styles.partnersSection}>
      <div className={styles.container}>
        <div className={styles.titleWrapper} data-aos="fade-up">
          <span className={styles.subtitle}>ĐỐI TÁC CHIẾN LƯỢC</span>
          <h2 className={styles.title}>Đồng hành cùng những thương hiệu hàng đầu</h2>
        </div>
        
        <div className={styles.marqueeWrapper}>
          <div className={styles.marquee}>
            {displayPartners.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className={styles.partnerLogo}>
                <div className={styles.logoWrapper}>
                  <img 
                    src={partner.logo} 
                    alt={`Đối tác du lịch ${partner.name}`} 
                    loading="lazy"
                  />
                  <span>{partner.name}</span>
                  
                  {/* Tooltip */}
                  <div className={styles.tooltip}>
                    <strong>{partner.name}</strong>
                    <p>{partner.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
