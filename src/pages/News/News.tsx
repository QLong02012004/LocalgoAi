import React, { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import styles from "./News.module.scss";

import FeaturedPost from "./components/FeaturedPost/FeaturedPost";
import NewsCard from "./components/NewsCard/NewsCard";
import Newsletter from "./components/Newsletter/Newsletter";
import CategoryTabs from "./components/CategoryTabs/CategoryTabs";
import NewsSidebar from "./components/NewsSidebar/NewsSidebar";
import type { NewsItem } from "./types";
import StatusState from "../../components/Ui/StatusState/StatusState";

import { getNewsList, getFeaturedNewsList } from "../../services/newsService";



const News: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [featuredNewsData, setFeaturedNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 6;
  const categories = [
    "Tất cả",
    "Điểm đến",
    "Ẩm thực",
    "Mẹo du lịch",
    "Sự kiện",
  ];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-quad",
    });

    const fetchFeaturedNews = async () => {
      try {
        const featuredRes = await getFeaturedNewsList();
        if (featuredRes.data && featuredRes.data.status === 200 && featuredRes.data.data) {
          if ('content' in featuredRes.data.data) {
            setFeaturedNewsData(featuredRes.data.data.content as NewsItem[]);
          } else {
            setFeaturedNewsData(featuredRes.data.data as NewsItem[]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải tin nổi bật:", error);
        const fakeFeatured = [
          {
            id: 9801,
            title: "10 Địa Điểm Không Thể Bỏ Qua Khi Đến Đà Nẵng Mùa Hè Này",
            excerpt: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới.",
            content: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới. Từ Cầu Vàng lơ lửng giữa mây ngàn tại Bà Nà Hills đến các hang động huyền bí tại Ngũ Hành Sơn, đây là danh sách 10 địa điểm du lịch Đà Nẵng tuyệt vời nhất mà bạn nhất định phải ghé thăm.",
            image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
            category: "Điểm đến",
            readTime: "5 phút đọc",
            isFeatured: true,
            authorName: "Nguyễn Văn Hoàng",
            createdAt: "2026-05-10T08:00:00Z",
            date: "10/05/2026"
          }
        ];
        setFeaturedNewsData(fakeFeatured);
      }
    };

    fetchFeaturedNews();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await getNewsList(0, 100, activeTab, debouncedSearchQuery);
        
        if (res.data && res.data.status === 200 && res.data.data) {
          if ('content' in res.data.data) {
            setNewsData(res.data.data.content as NewsItem[]);
          } else {
            setNewsData(res.data.data as NewsItem[]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
        
        const fakeNewsList: NewsItem[] = [
          {
            id: 9801,
            title: "10 Địa Điểm Không Thể Bỏ Qua Khi Đến Đà Nẵng Mùa Hè Này",
            excerpt: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới.",
            content: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới. Từ Cầu Vàng lơ lửng giữa mây ngàn tại Bà Nà Hills đến các hang động huyền bí tại Ngũ Hành Sơn, đây là danh sách 10 địa điểm du lịch Đà Nẵng tuyệt vời nhất mà bạn nhất định phải ghé thăm.",
            image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
            category: "Điểm đến",
            readTime: "5 phút đọc",
            isFeatured: true,
            authorName: "Nguyễn Văn Hoàng",
            createdAt: "2026-05-10T08:00:00Z",
            date: "10/05/2026"
          },
          {
            id: 9802,
            title: "Khám Phá Bản Sắc Ẩm Thực Cung Đình Huế Xưa Và Nay",
            excerpt: "Ẩm thực cung đình Huế không chỉ là món ăn ngon, đó là cả một nghệ thuật tinh túy phản ánh chiều sâu văn hóa lịch sử triều đại Nguyễn.",
            content: "Ẩm thực cung đình Huế không chỉ là món ăn ngon, đó là cả một nghệ thuật tinh túy phản ánh chiều sâu văn hóa lịch sử triều đại Nguyễn. Từ những món ăn được bày biện công phu như nem công chả phượng đến các chén chè sen thanh mát, mỗi hương vị đều là sự giao thoa hoàn hảo giữa nguyên liệu tự nhiên và tài hoa người đầu bếp.",
            image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80",
            category: "Ẩm thực",
            readTime: "4 phút đọc",
            isFeatured: false,
            authorName: "Trần Thị Lan",
            createdAt: "2026-05-12T09:30:00Z",
            date: "12/05/2026"
          },
          {
            id: 9803,
            title: "Mẹo Nhỏ Để Có Chuyến Du Lịch Hội An Tiết Kiệm Và Trọn Vẹn",
            excerpt: "Hội An luôn mang vẻ đẹp hoài cổ lãng mạn. Hãy cùng bỏ túi những kinh nghiệm du lịch tự túc tiết kiệm mà vẫn cực kỳ lý thú dưới đây.",
            content: "Hội An luôn mang vẻ đẹp hoài cổ lãng mạn. Hãy cùng bỏ túi những kinh nghiệm du lịch tự túc tiết kiệm mà vẫn cực kỳ lý thú dưới đây. Hướng dẫn chọn thời gian ghé thăm lý tưởng, cách thuê xe đạp khám phá ngõ nhỏ, thưởng thức bánh mì Phượng nổi tiếng mà không phải xếp hàng lâu.",
            image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
            category: "Mẹo du lịch",
            readTime: "6 phút đọc",
            isFeatured: false,
            authorName: "Lê Minh Triết",
            createdAt: "2026-05-14T10:15:00Z",
            date: "14/05/2026"
          },
          {
            id: 9804,
            title: "Lễ Hội Pháo Hoa Quốc Tế Đà Nẵng DIFF 2026 Có Gì Hot?",
            excerpt: "Sự kiện được mong chờ nhất mùa hè 2026 tại thành phố sông Hàn hứa hẹn đem đến những màn trình diễn ánh sáng đỉnh cao từ nhiều quốc gia.",
            content: "Sự kiện được mong chờ nhất mùa hè 2026 tại thành phố sông Hàn hứa hẹn đem đến những màn trình diễn ánh sáng đỉnh cao từ nhiều quốc gia. Lễ hội pháo hoa quốc tế DIFF chính thức quay trở lại hoành tráng hơn, hội tụ các đội bắn pháo hoa hàng đầu thế giới từ Ý, Pháp, Mỹ hứa hẹn thắp sáng bầu trời Đà Nẵng.",
            image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800",
            category: "Sự kiện",
            readTime: "4 phút đọc",
            isFeatured: false,
            authorName: "Phạm Hồng Phước",
            createdAt: "2026-05-15T14:20:00Z",
            date: "15/05/2026"
          },
          {
            id: 9805,
            title: "Trải Nghiệm Độc Đáo Đi Thuyền Thúng Tại Rừng Dừa Bảy Mẫu",
            excerpt: "Đến Quảng Nam không thể bỏ lỡ hoạt động múa thúng xoay vòng đầy kịch tính và thú vị tại khu du lịch sinh thái nổi tiếng.",
            content: "Đến Quảng Nam không thể bỏ lỡ hoạt động múa thúng xoay vòng đầy kịch tính và thú vị tại khu du lịch sinh thái nổi tiếng. Du khách sẽ được hòa mình vào thiên nhiên sông nước mát lành, trải nghiệm quăng chài bắt cá và xem các nghệ nhân biểu diễn kỹ nghệ xoay thúng nước vô cùng ngoạn mục.",
            image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800",
            category: "Điểm đến",
            readTime: "5 phút đọc",
            isFeatured: false,
            authorName: "Hoàng Gia Bảo",
            createdAt: "2026-05-16T16:00:00Z",
            date: "16/05/2026"
          }
        ];
        
        let filtered = fakeNewsList;
        if (activeTab && activeTab !== "Tất cả") {
          filtered = filtered.filter(item => item.category === activeTab);
        }
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.excerpt.toLowerCase().includes(query)
          );
        }
        setNewsData(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [activeTab, debouncedSearchQuery]);

  const featured = useMemo(() => newsData.find((n) => n.isFeatured), [newsData]);
  
  const trendingNews = useMemo(() => 
    featuredNewsData.length > 0 ? featuredNewsData : newsData.slice(0, 5)
  , [featuredNewsData, newsData]);

  const filteredNews = useMemo(() => {
    return newsData.filter((n) => {
      // Backend already filters by category and search, so we only need to exclude featured if desired.
      // But if there is a search query, we might want to show all results including featured ones in the grid.
      if (debouncedSearchQuery) return true;
      return !n.isFeatured;
    });
  }, [newsData, debouncedSearchQuery]);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedNews = filteredNews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleTabChange = (cat: string) => {
    setActiveTab(cat);
    setCurrentPage(1);
  };

  return (
    <div className={styles.newsPage}>
      <header className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 data-aos="fade-down" className={styles.mainTitle}>
            <span className={styles.newsText}>Tin tức</span>
            <span className={styles.accentText}>& Cảm hứng</span>
          </h1>
          <p data-aos="fade-up" data-aos-delay="200">
            Cập nhật những thông tin mới nhất và những câu chuyện thú vị về du
            lịch khắp thế giới.
          </p>
        </div>
      </header>

      {featured && (
        <div className={styles.featuredSection}>
          <div className={styles.container}>
            <FeaturedPost data={featured} />
          </div>
        </div>
      )}

      <div className={styles.contentSection}>
        <div className={styles.container}>
          <CategoryTabs 
            categories={categories} 
            activeCategory={activeTab} 
            onCategoryChange={handleTabChange} 
          />

          <div className={styles.layoutWrapper}>
            <main className={styles.mainGrid}>
              <div className={styles.grid}>
                {isLoading ? (
                  <div className={styles.loadingState}>
                    <p>Đang tải tin tức...</p>
                  </div>
                ) : error ? (
                  <div className={styles.statusWrapper}>
                    <StatusState 
                      type="error" 
                      title="Lỗi tải tin tức" 
                      onRetry={() => window.location.reload()}
                    />
                  </div>
                ) : displayedNews.length > 0 ? (
                  displayedNews.map((item, index) => (
                    <div
                      key={item.id}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <NewsCard item={item} />
                    </div>
                  ))
                ) : (
                  <div className={styles.statusWrapper}>
                    <StatusState 
                      type="empty" 
                      title="Không tìm thấy tin tức" 
                      description="Hãy thử từ khóa khác hoặc quay lại sau nhé!"
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`${styles.pageBtn} ${
                            currentPage === page ? styles.activePage : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    className={styles.pageNavBtn}
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Sau <CaretRight size={18} weight="bold" />
                  </button>
                </div>
              )}
            </main>

            <NewsSidebar 
              trendingNews={trendingNews}
              categories={categories}
              activeCategory={activeTab}
              onCategoryChange={handleTabChange}
              onSearch={setSearchQuery}
            />
          </div>
        </div>
      </div>

      <Newsletter />
    </div>
  );
};

export default News;
