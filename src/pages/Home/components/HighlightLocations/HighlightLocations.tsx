import React, { useState, useRef, useEffect } from "react";
import {
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import styles from "./HighlightLocations.module.scss";
import AnimatedButton from "../../../../components/Ui/AnimatedButton/AnimatedButton";
import {
  getFeaturedAttractions,
  type HighlightItem,
} from "../../../../services/highlightService";
import SkeletonCard from "../../../../components/Ui/SkeletonCard/SkeletonCard";
import LocationCard from "../../../../components/Ui/LocationCard/LocationCard";
import StatusState from "../../../../components/Ui/StatusState/StatusState";
import { motion, AnimatePresence } from "framer-motion";
import bgVideo from "../../../../assets/video/Da_Nang.mp4";

// Thêm Interface cho Props
interface HighlightLocationsProps {
  titlePrimary: string; // Ví dụ: "Gợi ý"
  titleHighlight: string; // Ví dụ: "nổi bật"
  description?: string; // Mô tả nhỏ bên dưới tiêu đề
  locationFilter?: string; // Tên khu vực/tỉnh thành để lọc lân cận
  currentId?: string | number; // ID của địa điểm đang xem để loại bỏ khỏi danh sách gợi ý
}
const HighlightLocations: React.FC<HighlightLocationsProps> = ({
  titlePrimary,
  titleHighlight,
  description,
  locationFilter,
  currentId
}) => {
  const [items, setItems] = useState<HighlightItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Cơ chế Cache cho trang chủ
  const cacheRef = useRef<Record<string, HighlightItem[]>>({});

  // Chỉ tải dữ liệu khi component xuất hiện trên màn hình (Intersection Observer)
  const [hasInView, setHasInView] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);



  useEffect(() => {
    if (!hasInView) return;

    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      setItems([]); 

      if (cacheRef.current["featured"]) {
        setItems(cacheRef.current["featured"]);
        setLoading(false);
        return;
      }
      
      try {
        const res = await getFeaturedAttractions(10);
        const allFetchedItems = res.data?.data || [];

        if (controller.signal.aborted) return;

        let filtered = (allFetchedItems || []).filter(item => item.status === 'ACTIVE');

        if (currentId) {
          filtered = filtered.filter(item => item.id.toString() !== currentId.toString());
        }

        cacheRef.current["featured"] = filtered;
        setItems(filtered);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Lỗi khi tải dữ liệu Highlight:", error);
          
          const fakeData: HighlightItem[] = [
            {
              id: 9991,
              name: "Cầu Vàng",
              location: "Đà Nẵng",
              rating: 4.8,
              reviewCount: 1250,
              imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
              description: "Tác phẩm kiến trúc kỳ vĩ lơ lửng giữa mây ngàn của đỉnh Bà Nà Hills, được nâng đỡ bởi đôi bàn tay khổng lồ rêu phong cổ kính, mở ra một tầm nhìn bao quát toàn cảnh núi non hùng vĩ và dải bờ biển Đà Nẵng xinh đẹp tuyệt trần.",
              type: "pin",
              category: "Địa điểm tham quan",
              averagePrice: 0,
              provinceId: 2,
              status: "ACTIVE"
            },
            {
              id: 9992,
              name: "Đại Nội Huế",
              location: "Thừa Thiên Huế",
              rating: 4.7,
              reviewCount: 980,
              imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80",
              description: "Quần thể di tích lịch sử và kiến trúc nghệ thuật cung đình đỉnh cao của triều Nguyễn - vương triều cuối cùng của Việt Nam. Nơi đây lưu giữ trọn vẹn những nét văn hóa cung đình cổ kính và những giá trị di sản thế giới độc đáo được UNESCO công nhận.",
              type: "pin",
              category: "Di tích lịch sử",
              averagePrice: 150000,
              provinceId: 1,
              status: "ACTIVE"
            },
            {
              id: 9993,
              name: "Phố cổ Hội An",
              location: "Quảng Nam",
              rating: 4.9,
              reviewCount: 2100,
              imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
              description: "Đô thị cổ bên bờ sông Hoài hiền hòa, lung linh huyền ảo với muôn sắc đèn lồng thủ công rực rỡ khi đêm về. Nơi đây quyến rũ du khách bởi những mái ngói rêu phong cổ kính, ẩm thực phong phú và những con người vô cùng thân thiện mến khách.",
              type: "pin",
              category: "Phố cổ",
              averagePrice: 0,
              provinceId: 3,
              status: "ACTIVE"
            },
            {
              id: 9994,
              name: "Bà Nà Hills",
              location: "Đà Nẵng",
              rating: 4.6,
              reviewCount: 1500,
              imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
              description: "Thiên đường nghỉ dưỡng và vui chơi giải trí hàng đầu Đông Nam Á tọa lạc trên đỉnh Núi Chúa. Nơi đây sở hữu khí hậu 4 mùa trong một ngày độc đáo, khu phố Pháp lãng mạn hoài cổ cùng tuyến cáp treo đạt nhiều kỷ lục thế giới.",
              type: "pin",
              category: "Khu du lịch sinh thái",
              averagePrice: 850000,
              provinceId: 2,
              status: "ACTIVE"
            },
            {
              id: 9995,
              name: "Thánh địa Mỹ Sơn",
              location: "Quảng Nam",
              rating: 4.5,
              reviewCount: 650,
              imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
              description: "Thung lũng linh thiêng lưu giữ quần thể đền tháp Chămpa cổ kính rêu phong cổ kính được bao bọc bởi đồi núi trùng điệp. Nơi đây là kiệt tác nghệ thuật kiến trúc gạch nung độc đáo và là minh chứng lịch sử về một nền văn minh huy hoàng từng rực rỡ.",
              type: "pin",
              category: "Di tích lịch sử",
              averagePrice: 150000,
              provinceId: 3,
              status: "ACTIVE"
            }
          ];

          let filtered = fakeData.filter(item => item.status === 'ACTIVE');
          if (currentId) {
            filtered = filtered.filter(item => item.id.toString() !== currentId.toString());
          }
          
          cacheRef.current["featured"] = filtered;
          setItems(filtered);
          setError(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    setIsExpanded(false);

    return () => controller.abort();
  }, [locationFilter, currentId, hasInView]);



  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Tự động xoay nếu muốn, nhưng ở đây để người dùng chủ động
  useEffect(() => {
    if (!loading && items.length > 0 && !isExpanded) {
      const timer = setInterval(nextSlide, 3000); // Set back to 3 seconds
      return () => clearInterval(timer);
    }
  }, [loading, items.length, isExpanded]);

  return (
    <section className={styles.locations} ref={sectionRef}>
      <div className={styles.locationsContainer}>
        <div className={styles.headerWrapper} data-aos="fade-up">
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h2 className={styles.sectionTitle}>
                <span>{titlePrimary}</span>
                <span className={styles.highlightUnderline}>
                  {titleHighlight}
                </span>
              </h2>
            </div>
            <p className={styles.sectionDescription}>{description}</p>
          </div>

          <div className={styles.controls}>
            {/* Controls now empty as buttons moved to sides */}
          </div>
        </div>

        <div className={`${styles.sliderWrap} ${isExpanded ? styles.expandedMode : styles.circularMode}`}>
          {!isExpanded && items.length > 0 && (
            <div className={styles.sliderNav}>
              <button
                className={`${styles.sliderBtn} ${styles.prevBtn}`}
                title="Trước"
                onClick={prevSlide}
              >
                <CaretLeft weight="bold" />
              </button>
              <button
                className={`${styles.sliderBtn} ${styles.nextBtn}`}
                title="Sau"
                onClick={nextSlide}
              >
                <CaretRight weight="bold" />
              </button>
            </div>
          )}

          <div
            className={`${styles.sliderContent} ${isExpanded ? styles.gridContent : styles.carousel3D}`}
            ref={sliderRef}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-home-${i}`} className={styles.card3D}>
                  <SkeletonCard />
                </div>
              ))
            ) : error ? (
              <StatusState 
                type="error" 
                onRetry={() => setHasInView(false)} 
              />
            ) : items && items.length > 0 ? (
              isExpanded ? (
                items.map((item, idx) => (
                  <div key={`${item.type}-${item.id}`} className={styles.gridItem}>
                    <LocationCard item={item} idx={idx} />
                  </div>
                ))
              ) : (
                <div className={styles.perspectiveWrapper}>
                  {items.map((item, idx) => {
                    const total = items.length;
                    
                    // Calculate the shortest distance in a circular array
                    let diff = idx - activeIndex;
                    if (diff > total / 2) diff -= total;
                    if (diff < -total / 2) diff += total;

                    // Only render items within a certain range to keep the "circle" clean
                    // But enough to see them coming from the back
                    if (Math.abs(diff) > 3) return null;

                    const isActive = diff === 0;
                    const zIndex = 10 - Math.abs(diff);
                    
                    // Circular math for a stunning "vòng tròn" effect
                    // cards move on an ellipse: x = radiusX * sin, z = radiusZ * cos
                    const angle = diff * (Math.PI / 4); // 45 degrees apart
                    
                    // Desktop Spacing
                    let baseRadiusX = windowWidth < 768 ? 140 : windowWidth < 1200 ? 220 : 300;
                    const translateX = Math.sin(angle) * baseRadiusX;
                    const translateZ = (Math.cos(angle) - 1) * 200; // Less depth for smaller cards
                    const rotateY = diff * -35; // Slightly less rotation
                    const scale = 1 - Math.abs(diff) * 0.1;
                    const opacity = 1 - Math.abs(diff) * 0.3;

                    return (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        className={`${styles.card3D} ${isActive ? styles.activeCard : ""}`}
                        initial={false}
                        animate={{
                          x: translateX,
                          z: translateZ,
                          rotateY: rotateY,
                          scale: scale,
                          opacity: opacity,
                          zIndex: zIndex,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250, // Balanced speed
                          damping: 25, 
                          mass: 1
                        }}
                        style={{
                          position: "absolute",
                          left: windowWidth < 768 ? "calc(50% - 140px)" : "calc(50% - 160px)", 
                          top: 0,
                          transformStyle: "preserve-3d",
                        }}
                        onClick={() => setActiveIndex(idx)}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          if (info.offset.x > 100) prevSlide();
                          else if (info.offset.x < -100) nextSlide();
                        }}
                      >
                        <LocationCard item={item} idx={idx} />
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : (
              <StatusState 
                type="empty" 
                title="Chưa có dữ liệu nổi bật"
                description="Hiện tại hệ thống chưa có địa điểm nào để gợi ý cho bạn. Hãy quay lại sau nhé!"
              />
            )}
          </div>

          {!isExpanded && items.length > 1 && (
            <div className={styles.paginationDots}>
              {items.map((_, i) => (
                <div 
                  key={i} 
                  className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ""}`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.locationsAction} data-aos="fade-up">
            <AnimatedButton 
              onClick={() => setIsExpanded(!isExpanded)}
              text={isExpanded ? "THU GỌN" : "XEM TẤT CẢ GỢI Ý"}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HighlightLocations;
