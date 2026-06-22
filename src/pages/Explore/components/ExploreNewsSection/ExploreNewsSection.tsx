import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./ExploreNewsSection.module.scss";
import { getFeaturedNewsList } from "../../../../services/newsService";
import { type NewsItem } from "../../../News/types";

const ExploreNewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getFeaturedNewsList(0, 3);
        const data = response.data?.data;
        const content = Array.isArray(data) ? data : (data as any)?.content || [];
        setNews(content.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch news for explore page:", error);
        setNews([
          {
            id: 9801,
            title: "10 Địa Điểm Không Thể Bỏ Qua Khi Đến Đà Nẵng Mùa Hè Này",
            excerpt: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới.",
            image: "https://images.unsplash.com/photo-1559592413-7ce8509975b4?q=80&w=800",
            category: "Điểm đến",
            readTime: "5 phút đọc",
            isFeatured: true,
            createdAt: "2026-05-10T08:00:00Z"
          },
          {
            id: 9802,
            title: "Khám Phá Bản Sắc Ẩm Thực Cung Đình Huế Xưa Và Nay",
            excerpt: "Ẩm thực cung đình Huế không chỉ là món ăn ngon, đó là cả một nghệ thuật tinh túy phản ánh chiều sâu văn hóa lịch sử triều đại Nguyễn.",
            image: "https://images.unsplash.com/photo-1563492062331-50e58836599b?q=80&w=800",
            category: "Ẩm thực",
            readTime: "4 phút đọc",
            isFeatured: false,
            createdAt: "2026-05-12T09:30:00Z"
          },
          {
            id: 9803,
            title: "Mẹo Nhỏ Để Có Chuyến Du Lịch Hội An Tiết Kiệm Và Trọn Vẹn",
            excerpt: "Hội An luôn mang vẻ đẹp hoài cổ lãng mạn. Hãy cùng bỏ túi những kinh nghiệm du lịch tự túc tiết kiệm mà vẫn cực kỳ lý thú dưới đây.",
            image: "https://images.unsplash.com/photo-1599708141690-d81b30501709?q=80&w=800",
            category: "Mẹo du lịch",
            readTime: "6 phút đọc",
            isFeatured: false,
            createdAt: "2026-05-14T10:15:00Z"
          }
        ]);
      }
    };
    fetchNews();
  }, []);

  if (news.length === 0) return null;

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tin tức & <span className={styles.highlight}>Cảm hứng</span></h2>
          <p className={styles.subtitle}>Cập nhật những xu hướng và mẹo du lịch mới nhất</p>
        </div>

        <div className={styles.newsGrid}>
            {news.map((item, index) => {
              // Xử lý hình ảnh: đảm bảo luôn có ảnh đẹp kể cả khi dữ liệu lỗi
              const imageUrl = item.image && item.image.startsWith('http') 
                ? item.image 
                : "https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=800"; // Ảnh Hội An/Việt Nam dự phòng

              return (
                <motion.div 
                  key={item.id} 
                  className={styles.newsCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => window.location.href = `/news/${item.id}`}
                >
                  <div className={styles.imageWrapper}>
                    <img 
                      src={imageUrl} 
                      alt={item.title} 
                      className={styles.cardImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800";
                      }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.newsTitle}>{item.title}</h3>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default ExploreNewsSection;
