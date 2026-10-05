import React, { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import styles from "./SampleItinerary.module.scss";

// Import Components
import ItineraryHero from "./components/ItineraryHero/ItineraryHero";
import FilterSection from "./components/FilterSection/FilterSection";
import ItineraryCard from "./components/ItineraryCard/ItineraryCard";
import CategoryTabs from "./components/CategoryTabs/CategoryTabs";
import AICustomCTA from "./components/AICustomCTA/AICustomCTA";
import StatusState from "../../components/Ui/StatusState/StatusState";

// Import Types
import type { FilterState } from "./types";
import { getSampleItineraries } from "../../services/itineraryService";
import type { GeneratedItinerary } from "../../services/itineraryService";

// Client-side cache to persist state across component unmount/remount (Stale-While-Revalidate pattern)
let cachedItineraries: GeneratedItinerary[] = [];
let cachedTotalPages = 1;
let cachedTotalElements = 0;
let cachedFilters: FilterState = {
  location: "all",
  priceRange: "all",
  people: 1,
  days: undefined,
};
let cachedActiveCategory = "all";
let cachedCurrentPage = 1;

const SampleItinerary: React.FC = () => {
  const [itineraries, setItineraries] = useState<GeneratedItinerary[]>(cachedItineraries);
  const [isLoading, setIsLoading] = useState(cachedItineraries.length === 0);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(cachedFilters);

  const [activeCategory, setActiveCategory] = useState(cachedActiveCategory);
  const [currentPage, setCurrentPage] = useState(cachedCurrentPage);
  const [totalPages, setTotalPages] = useState(cachedTotalPages);
  const [totalElements, setTotalElements] = useState(cachedTotalElements);
  const ITEMS_PER_PAGE = 9;

  const fetchItineraries = async () => {
    try {
      const isInitialLoad = itineraries.length === 0;
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsBackgroundLoading(true);
      }
      setError(null);

      // Map priceRange string to min/maxBudget for the API
      let minBudget: number | undefined;
      let maxBudget: number | undefined;
      
      if (filters.priceRange === "low") {
        maxBudget = 2000000;
      } else if (filters.priceRange === "mid") {
        minBudget = 2000000;
        maxBudget = 5000000;
      } else if (filters.priceRange === "high") {
        minBudget = 5000000;
      }

      const response = await getSampleItineraries({
        page: currentPage - 1, // BE uses 0-based indexing
        size: ITEMS_PER_PAGE,
        provinceId: filters.provinceId,
        minBudget,
        maxBudget,
        days: filters.days,
        interests: activeCategory !== "all" ? [activeCategory] : undefined,
      });

      const resData = response?.data?.data as any;
      if (resData) {
        // Handle both structure types: { content, page } or direct spring data { content, totalPages, ... }
        const content = resData.content || (Array.isArray(resData) ? resData : []);
        const totalP = resData.page?.totalPages || resData.totalPages || 1;
        const totalE = resData.page?.totalElements || resData.totalElements || content.length;
        
        setItineraries(content);
        setTotalPages(totalP);
        setTotalElements(totalE);

        // Update static caches
        cachedItineraries = content;
        cachedTotalPages = totalP;
        cachedTotalElements = totalE;
        cachedFilters = filters;
        cachedActiveCategory = activeCategory;
        cachedCurrentPage = currentPage;
      }
    } catch (err) {
      console.error("Lỗi khi lấy lộ trình mẫu:", err);
      
      const fakeData: GeneratedItinerary[] = [
        {
          id: 9901,
          itineraryId: "sample-9901",
          userId: 1,
          title: "Hành Trình Di Sản Huế Cổ Kính",
          provinceId: 1,
          provinceName: "Thừa Thiên Huế",
          days: 3,
          budget: "3500000",
          interests: ["lịch sử", "văn hóa", "ẩm thực"],
          totalEstimatedCost: 3500000,
          totalDistance: 45.2,
          averageRating: 4.8,
          reasonRecommended: "Khám phá trọn vẹn nét văn hóa di sản của cố đô Huế trong 3 ngày 2 đêm.",
          startDate: [2026, 5, 20],
          imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
          costBreakdown: { accommodation: 1200000, food: 1000000, activities: 800000, services: 500000, total: 3500000 },
          hotels: [
            {
              hotelId: 1,
              name: "Khách sạn Mường Thanh Holiday Huế",
              address: "38 Lê Lợi, Phú Hội, Thành phố Huế",
              latitude: 16.4637,
              longitude: 107.5905,
              checkInDay: 1,
              checkOutDay: 3,
              nights: 2,
              pricePerNight: 600000,
              totalPrice: 1200000,
              rating: 4.5,
              imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80"
            }
          ],
          itineraryDays: [
            {
              dayNumber: 1,
              date: [2026, 5, 20],
              theme: "Khám phá Cung điện Cố đô",
              activities: [
                {
                  order: 1,
                  startTime: "08:00",
                  endTime: "11:30",
                  durationMinutes: 210,
                  type: "ATTRACTION",
                  entityId: 9992,
                  name: "Đại Nội Huế",
                  description: "Quần thể di tích lịch sử và kiến trúc nghệ thuật tiêu biểu của triều Nguyễn vương triều.",
                  address: "Phú Hậu, Thành phố Huế",
                  location: "Thành phố Huế",
                  latitude: 16.4675,
                  longitude: 107.5786,
                  rating: 4.8,
                  estimatedCost: 150000,
                  imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
                  gallery: [],
                  tips: []
                },
                {
                  order: 2,
                  startTime: "12:00",
                  endTime: "13:30",
                  durationMinutes: 90,
                  type: "RESTAURANT",
                  entityId: 9994,
                  name: "Nhà hàng Cung Đình",
                  description: "Thưởng thức ẩm thực cung đình Huế đặc sắc trong không gian hoàng tộc xưa.",
                  address: "3 Lê Lợi, Thành phố Huế",
                  location: "Thành phố Huế",
                  latitude: 16.463,
                  longitude: 107.592,
                  rating: 4.5,
                  estimatedCost: 350000,
                  imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
                  gallery: [],
                  tips: []
                }
              ]
            },
            {
              dayNumber: 2,
              date: [2026, 5, 21],
              theme: "Lăng tẩm và Chùa cổ",
              activities: [
                {
                  order: 1,
                  startTime: "08:30",
                  endTime: "10:30",
                  durationMinutes: 120,
                  type: "ATTRACTION",
                  entityId: 9995,
                  name: "Lăng Khải Định",
                  description: "Công trình kiến trúc độc đáo giao thoa Đông - Tây tuyệt mỹ, tinh xảo bậc nhất.",
                  address: "Thủy Bằng, Hương Thủy, Thừa Thiên Huế",
                  location: "Hương Thủy",
                  latitude: 16.3986,
                  longitude: 107.5902,
                  rating: 4.7,
                  estimatedCost: 150000,
                  imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
                  gallery: [],
                  tips: []
                }
              ]
            }
          ]
        },
        {
          id: 9902,
          itineraryId: "sample-9902",
          userId: 1,
          title: "Đà Nẵng - Thành Phố Của Những Cây Cầu",
          provinceId: 2,
          provinceName: "Đà Nẵng",
          days: 3,
          budget: "4500000",
          interests: ["giải trí", "thiên nhiên", "biển"],
          totalEstimatedCost: 4500000,
          totalDistance: 62.0,
          averageRating: 4.9,
          reasonRecommended: "Hành trình khám phá thành phố đáng sống nhất Việt Nam với các điểm check-in cực hot.",
          startDate: [2026, 5, 20],
          imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80",
          costBreakdown: { accommodation: 1800000, food: 1200000, activities: 1000000, services: 500000, total: 4500000 },
          hotels: [
            {
              hotelId: 2,
              name: "Khách sạn Novotel Danang Premier Han River",
              address: "36 Bạch Đằng, Hải Châu, Đà Nẵng",
              latitude: 16.0792,
              longitude: 108.2238,
              checkInDay: 1,
              checkOutDay: 3,
              nights: 2,
              pricePerNight: 900000,
              totalPrice: 1800000,
              rating: 4.8,
              imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80"
            }
          ],
          itineraryDays: [
            {
              dayNumber: 1,
              date: [2026, 5, 20],
              theme: "Bà Nà Hills - Đường Lên Tiên Cảnh",
              activities: [
                {
                  order: 1,
                  startTime: "08:00",
                  endTime: "16:00",
                  durationMinutes: 480,
                  type: "ATTRACTION",
                  entityId: 9991,
                  name: "Cầu Vàng & Bà Nà Hills",
                  description: "Check-in cây cầu biểu tượng quốc tế nâng đỡ bởi bàn tay khổng lồ rêu phong vắt ngang sương mây.",
                  address: "Hòa Vang, Đà Nẵng",
                  location: "Hòa Vang",
                  latitude: 15.995,
                  longitude: 107.994,
                  rating: 4.9,
                  estimatedCost: 850000,
                  imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80",
                  gallery: [],
                  tips: []
                }
              ]
            }
          ]
        },
        {
          id: 9903,
          itineraryId: "sample-9903",
          userId: 1,
          title: "Khám Phá Phố Cổ Hội An Hoài Cổ",
          provinceId: 3,
          provinceName: "Quảng Nam",
          days: 2,
          budget: "2800000",
          interests: ["văn hóa", "phố cổ", "lãng mạn"],
          totalEstimatedCost: 2800000,
          totalDistance: 32.5,
          averageRating: 4.7,
          reasonRecommended: "Trải nghiệm không gian lãng mạn đèn lồng rực rỡ và các món đặc sản Hội An truyền thống cực hấp dẫn.",
          startDate: [2026, 5, 20],
          imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80",
          costBreakdown: { accommodation: 1000000, food: 800000, activities: 600000, services: 400000, total: 2800000 },
          hotels: [
            {
              hotelId: 3,
              name: "Hoi An Historic Hotel",
              address: "10 Trần Hưng Đạo, Hội An, Quảng Nam",
              latitude: 15.8794,
              longitude: 108.3282,
              checkInDay: 1,
              checkOutDay: 2,
              nights: 1,
              pricePerNight: 1000000,
              totalPrice: 1000000,
              rating: 4.6,
              imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80"
            }
          ],
          itineraryDays: [
            {
              dayNumber: 1,
              date: [2026, 5, 20],
              theme: "Phố cổ & Đi thuyền Sông Hoài",
              activities: [
                {
                  order: 1,
                  startTime: "16:00",
                  endTime: "21:00",
                  durationMinutes: 300,
                  type: "ATTRACTION",
                  entityId: 9993,
                  name: "Phố cổ Hội An",
                  description: "Dạo bước qua những mái ngói rêu phong cổ kính trầm mặc, thả hoa đăng bên bờ sông Hoài về đêm lấp lánh.",
                  address: "Minh An, Hội An, Quảng Nam",
                  location: "Hội An",
                  latitude: 15.8794,
                  longitude: 108.3282,
                  rating: 4.9,
                  estimatedCost: 0,
                  imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80",
                  gallery: [],
                  tips: []
                }
              ]
            }
          ]
        }
      ];

      let filtered = fakeData;
      if (filters.provinceId) {
        filtered = filtered.filter(item => item.provinceId === Number(filters.provinceId));
      }
      if (activeCategory && activeCategory !== "all") {
        const cat = activeCategory.toLowerCase();
        filtered = filtered.filter(item => 
          item.interests.some(i => i.toLowerCase().includes(cat))
        );
      }

      setItineraries(filtered);
      setTotalPages(1);
      setTotalElements(filtered.length);

      // Update static caches
      cachedItineraries = filtered;
      cachedTotalPages = 1;
      cachedTotalElements = filtered.length;
      cachedFilters = filters;
      cachedActiveCategory = activeCategory;
      cachedCurrentPage = currentPage;
    } finally {
      setIsLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  useEffect(() => {
    if (itineraries.length > 0) {
      AOS.refresh();
    }
  }, [itineraries]);

  useEffect(() => {
    fetchItineraries();
  }, [filters, activeCategory, currentPage]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-quad",
    });
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage > 1 + delta + 1) {
      range.unshift("...");
    }
    if (currentPage < totalPages - delta - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  return (
    <div className={styles.pageWrapper}>
      <ItineraryHero />
      <FilterSection filters={filters} onFilterChange={setFilters} />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div data-aos="fade-up" data-aos-delay="200">
            <CategoryTabs 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange} 
            />
          </div>

          <div className={`${styles.itineraryGrid} ${isBackgroundLoading ? styles.gridLoading : ""}`}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Đang tải dữ liệu lộ trình...</p>
              </div>
            ) : error ? (
              <div className={styles.statusWrapper}>
                <StatusState 
                  type="error" 
                  description={error}
                  onRetry={() => window.location.reload()}
                />
              </div>
            ) : itineraries.length > 0 ? (
              itineraries.map((itinerary, index) => (
                <div key={itinerary.itineraryId || `iti-${index}`} data-aos="fade-up" data-aos-delay={index * 100}>
                  <ItineraryCard data={itinerary} />
                </div>
              ))
            ) : (
              <div className={styles.statusWrapper}>
                <StatusState 
                  type="empty" 
                  title="Không tìm thấy lộ trình"
                  description="Thử thay đổi bộ lọc hoặc tỉnh thành để khám phá thêm nhiều lộ trình nhé!"
                />
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationContainer} data-aos="fade-up">
              <button
                className={styles.pageNavBtn}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <CaretLeft size={18} weight="bold" /> Trước
              </button>
              
              <div className={styles.pageNumbers}>
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === "..." ? (
                    <span key={`dots-${idx}`} className={styles.paginationDots}>...</span>
                  ) : (
                    <button
                      key={`page-${pageNum}`}
                      className={`${styles.pageBtn} ${currentPage === pageNum ? styles.activePage : ""}`}
                      onClick={() => handlePageChange(pageNum as number)}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>

              <button
                className={styles.pageNavBtn}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau <CaretRight size={18} weight="bold" />
              </button>
            </div>
          )}

          <AICustomCTA />
        </div>
      </main>
    </div>
  );
};

export default SampleItinerary;
