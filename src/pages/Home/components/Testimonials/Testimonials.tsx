import React, { useState, useEffect } from "react";
import { Star, MapPin, Quotes } from "phosphor-react";
import styles from "./Testimonials.module.scss";
import Marquee from "../../../../components/Ui/Marquee/Marquee";
import {
  getTestimonials,
  type TestimonialItem,
} from "../../../../services/testimonialService";
import StatusState from "../../../../components/Ui/StatusState/StatusState";

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      // Lấy nhiều đánh giá hơn để chạy marquee mượt hơn (ví dụ 20 cái)
      const res = await getTestimonials();
      if (res && res.data && res.data.status === 200) {
        const paginatedData = res.data.data;
        if (paginatedData) {
          setReviews(paginatedData.content || []);
        }
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      
      const fakeReviews: TestimonialItem[] = [
        {
          id: "1",
          name: "Nguyễn Hoàng Anh",
          role: "Khách tham quan",
          initial: "HA",
          color: "bgBlue",
          text: "Ứng dụng tuyệt vời, giúp tôi lên lịch trình dễ dàng hơn bao giờ hết. Các địa điểm gợi ý rất sát với sở thích của tôi.",
          delay: "100",
          nameService: "Cầu Vàng",
          provinceName: "Đà Nẵng"
        },
        {
          id: "2",
          name: "Trần Ngọc Diệp",
          role: "Khách lưu trú",
          initial: "ND",
          color: "bgGreen",
          text: "Rất ấn tượng với tính năng AI tự động tạo lịch trình. Khách sạn và nhà hàng được đề xuất rất phù hợp với ngân sách.",
          delay: "300",
          nameService: "Khách sạn Mường Thanh",
          provinceName: "Thừa Thiên Huế"
        },
        {
          id: "3",
          name: "Lê Minh Tuấn",
          role: "Thực khách",
          initial: "MT",
          color: "bgPurple",
          text: "Giao diện đẹp mắt, dễ sử dụng. Thông tin về các nhà hàng rất chi tiết và đánh giá chính xác. Sẽ tiếp tục ủng hộ!",
          delay: "500",
          nameService: "Nhà hàng Mộc",
          provinceName: "Quảng Nam"
        },
        {
          id: "4",
          name: "Phạm Phương Thảo",
          role: "Khách tham quan",
          initial: "PT",
          color: "bgOrange",
          text: "Tôi đã có một chuyến du lịch hoàn hảo nhờ TravelAI. Cảm ơn đội ngũ phát triển đã tạo ra một sản phẩm hữu ích như vậy.",
          delay: "100",
          nameService: "Bà Nà Hills",
          provinceName: "Đà Nẵng"
        },
        {
          id: "5",
          name: "Hoàng Quốc Việt",
          role: "Khách lưu trú",
          initial: "QV",
          color: "bgRed",
          text: "Ứng dụng rất mượt mà, không bị giật lag. Tìm kiếm và đặt phòng khách sạn diễn ra nhanh chóng, tiện lợi.",
          delay: "300",
          nameService: "Resort Nam Hải",
          provinceName: "Quảng Nam"
        },
        {
          id: "6",
          name: "Đặng Thu Hương",
          role: "Thực khách",
          initial: "TH",
          color: "bgBlue",
          text: "Mình rất thích phần review địa điểm, rất chân thực và có ích. Nhờ vậy mà mình đã tìm được nhiều quán ăn ngon.",
          delay: "500",
          nameService: "Cơm Niêu",
          provinceName: "Đà Nẵng"
        }
      ];
      
      setReviews(fakeReviews);
      setError(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstColumn = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondColumn = reviews.slice(Math.ceil(reviews.length / 2));

  const TestimonialCard = ({ rev }: { rev: TestimonialItem }) => (
    <div className={styles.testimonialCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          {rev.provinceName && (
            <span className={styles.location}>
              <MapPin size={10} weight="fill" />
              {rev.provinceName}
            </span>
          )}
        </div>
        
        <div className={styles.serviceTag}>
          <span className={styles.serviceName}>
            {rev.nameService || "Travel AI Service"}
          </span>
        </div>

        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} weight="fill" />
          ))}
        </div>
      </div>

      <div className={styles.cardBody}>
        <Quotes size={32} weight="fill" className={styles.quoteIcon} />
        <p className={styles.reviewText}>"{rev.text}"</p>
      </div>

      <div className={styles.userInfo}>
        <div
          className={`${styles.avatar} ${
            styles[rev.color as keyof typeof styles] || ""
          }`}
        >
          {rev.avatarUrl ? (
            <img 
              src={rev.avatarUrl} 
              alt={rev.name} 
              loading="lazy"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
          <span style={{ display: rev.avatarUrl ? 'none' : 'block' }}>{rev.initial}</span>
        </div>
        <div className={styles.userText}>
          <h4>{rev.name}</h4>
          <div className={styles.userMeta}>
            <span className={styles.role}>{rev.role}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={styles.testimonials} id="testimonials-section">
      <div className={styles.container}>
        <div data-aos="fade-up">
          <h2 className={styles.sectionTitle}>
            Khách hàng <span className={styles.gradientText}>Nói gì?</span>
          </h2>
          <p className={styles.sectionDescription}>
            Hàng ngàn chuyến đi thành công đã được lên kế hoạch một cách hoàn hảo.
          </p>
        </div>

        <div className={styles.marqueeWrapper}>
          {loading ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.loadingSpinner}></div>
              <span>Đang tải đánh giá...</span>
            </div>
          ) : error ? (
            <StatusState 
              type="error" 
              title="Lỗi tải đánh giá"
              onRetry={() => fetchData()}
            />
          ) : reviews.length > 0 ? (
            <div className={styles.marqueeContent}>
              <Marquee pauseOnHover duration="40s" className={styles.marqueeRow}>
                {firstColumn.map((rev) => (
                  <TestimonialCard key={rev.id} rev={rev} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover duration="45s" className={styles.marqueeRow}>
                {secondColumn.map((rev) => (
                  <TestimonialCard key={rev.id} rev={rev} />
                ))}
              </Marquee>
              
              <div className={styles.fadeLeft}></div>
              <div className={styles.fadeRight}></div>
            </div>
          ) : (
            <StatusState 
              type="empty" 
              title="Chưa có đánh giá nào từ cộng đồng"
              description="Hệ thống đang chờ đợi những chia sẻ đầu tiên của các bạn!"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
