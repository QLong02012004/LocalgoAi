import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CaretLeft, 
  CalendarBlank, 
  Clock, 
  User, 
  Eye, 
  ShareNetwork, 
  FacebookLogo, 
  TwitterLogo, 
  LinkedinLogo, 
  ArrowRight, 
  MagicWand,
  LinkSimple
} from "@phosphor-icons/react";
import { motion } from 'framer-motion';
import styles from './NewsDetail.module.scss';
import { getNewsDetail, getNewsList } from '../../services/newsService';
import type { NewsItem } from '../News/types';
import { toast } from 'react-toastify';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cuộn mượt lên đầu trang khi chuyển bài viết
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchDetailAndRelated = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await getNewsDetail(id);
        if (res.data && res.data.status === 200 && res.data.data) {
          const detail = res.data.data as NewsItem;
          setNewsItem(detail);
          
          // Lấy tin tức liên quan cùng chuyên mục
          const listRes = await getNewsList(0, 6, detail.category);
          let filtered = listRes.data.data?.content?.filter((item: NewsItem) => String(item.id) !== String(id)) || [];
          
          // Nếu không đủ tin liên quan, lấy thêm tin tức tổng hợp làm fallback
          if (filtered.length < 3) {
            const generalRes = await getNewsList(0, 10);
            const generalFiltered = generalRes.data.data?.content?.filter((item: NewsItem) => String(item.id) !== String(id)) || [];
            
            // Hợp nhất và loại bỏ trùng lặp
            const merged = [...filtered, ...generalFiltered];
            const unique = merged.filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);
            filtered = unique;
          }
          
          setRelatedPosts(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết tin tức:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailAndRelated();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết bài viết vào bộ nhớ tạm!");
  };

  const handleMockShare = (platform: string) => {
    toast.info(`Tính năng chia sẻ qua ${platform} sẽ sớm được cập nhật!`);
  };

  // Định dạng lại nội dung dạng text thô có xuống dòng thành thẻ HTML <br />
  const formatContent = (content: string) => {
    if (!content) return "";
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content;
    }
    return content.replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <div className={styles.newsDetailPage}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Đang tải bài viết chất lượng cao...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className={styles.newsDetailPage}>
        <div className={styles.errorWrapper}>
          <h3>Không tìm thấy bài viết</h3>
          <p>Bài viết này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
          <button className={styles.btnBackNews} onClick={() => navigate('/news')}>
            <CaretLeft size={20} weight="bold" /> Quay lại trang Tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newsDetailPage}>
      {/* Background Decor */}
      <div className={styles.bgDecorCircle1}></div>
      <div className={styles.bgDecorCircle2}></div>

      <div className={styles.container}>
        {/* Navigation & Header */}
        <motion.div 
          className={styles.headerSection}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.backBtnWrapper}>
            <button className={styles.backBtn} onClick={() => navigate('/news')}>
              <CaretLeft size={20} weight="bold" />
              <span>Tất cả tin tức</span>
            </button>
          </div>
          
          <div className={styles.categoryTag}>{newsItem.category}</div>
          <h1 className={styles.mainTitle}>{newsItem.title}</h1>

          {/* Premium Meta Row */}
          <div className={styles.metaRow}>
            {newsItem.authorName && (
              <div className={styles.metaItem}>
                <div className={styles.authorAvatarMini}>
                  {newsItem.authorName.charAt(0)}
                </div>
                <span>{newsItem.authorName}</span>
              </div>
            )}
            <div className={styles.metaItem}>
              <CalendarBlank size={18} weight="bold" />
              <span>
                {(() => {
                  const dateVal = newsItem.createdAt || newsItem.date;
                  if (!dateVal) return "---";
                  if (Array.isArray(dateVal)) {
                    const [year, month, day] = dateVal;
                    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                  }
                  const parsedDate = new Date(dateVal);
                  return !isNaN(parsedDate.getTime()) 
                    ? parsedDate.toLocaleDateString('vi-VN') 
                    : String(dateVal);
                })()}
              </span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={18} weight="bold" />
              <span>
                {newsItem.readTime && !isNaN(Number(newsItem.readTime)) 
                  ? `${newsItem.readTime} phút đọc` 
                  : newsItem.readTime || "---"}
              </span>
            </div>
            {newsItem.viewCount !== undefined && (
              <div className={styles.metaItem}>
                <Eye size={18} weight="bold" />
                <span>{newsItem.viewCount} lượt xem</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Cover Image Frame */}
        {newsItem.image && (
          <motion.div 
            className={styles.imageFrame}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <img src={newsItem.image} alt={newsItem.title} />
            <div className={styles.imageOverlay}></div>
          </motion.div>
        )}

        {/* Double Column Grid */}
        <div className={styles.contentGrid}>
          {/* Main Article Content */}
          <motion.article 
            className={styles.mainArticle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {newsItem.excerpt && (
              <div className={styles.excerptBox}>
                <p>{newsItem.excerpt}</p>
              </div>
            )}

            <div 
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: formatContent(newsItem.content || "") }}
            />

            {/* Social Share Bar */}
            <div className={styles.shareBar}>
              <div className={styles.shareTitle}>
                <ShareNetwork size={20} weight="bold" />
                <span>Chia sẻ bài viết này:</span>
              </div>
              <div className={styles.shareActions}>
                <button 
                  className={`${styles.shareBtn} ${styles.btnFacebook}`} 
                  onClick={() => handleMockShare("Facebook")}
                  title="Chia sẻ Facebook"
                >
                  <FacebookLogo size={20} weight="fill" />
                </button>
                <button 
                  className={`${styles.shareBtn} ${styles.btnTwitter}`} 
                  onClick={() => handleMockShare("Twitter")}
                  title="Chia sẻ Twitter"
                >
                  <TwitterLogo size={20} weight="fill" />
                </button>
                <button 
                  className={`${styles.shareBtn} ${styles.btnLinkedin}`} 
                  onClick={() => handleMockShare("LinkedIn")}
                  title="Chia sẻ LinkedIn"
                >
                  <LinkedinLogo size={20} weight="fill" />
                </button>
                <button 
                  className={`${styles.shareBtn} ${styles.btnCopy}`} 
                  onClick={handleCopyLink}
                  title="Sao chép liên kết"
                >
                  <LinkSimple size={20} weight="bold" />
                </button>
              </div>
            </div>
          </motion.article>

          {/* Sidebar Area */}
          <aside className={styles.sidebar}>
            {/* Author Profile Card */}
            <motion.div 
              className={styles.sidebarCard}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className={styles.sidebarTitle}>Người viết bài</h4>
              <div className={styles.authorCard}>
                <div className={styles.authorAvatarLarge}>
                  {newsItem.authorName ? newsItem.authorName.charAt(0) : <User size={32} />}
                </div>
                <div className={styles.authorInfo}>
                  <h5>{newsItem.authorName || "Travel AI Editor"}</h5>
                  <span className={styles.authorRole}>Chuyên gia du lịch</span>
                  <p className={styles.authorBio}>
                    Đam mê khám phá các miền đất mới, chia sẻ những lịch trình độc bản và những mẹo du lịch thông minh hữu ích nhất dành cho bạn.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* AI Generator Promo CTA Card */}
            <motion.div 
              className={`${styles.sidebarCard} ${styles.promoCard}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={styles.promoHeader}>
                <div className={styles.iconBox}>
                  <MagicWand size={28} weight="fill" />
                </div>
                <h4>Tạo lịch trình với AI</h4>
              </div>
              <p>Bạn muốn đi du lịch nhưng chưa biết lập kế hoạch? Hãy để AI của chúng tôi thiết kế lịch trình miễn phí chỉ trong 30 giây.</p>
              <button 
                className={styles.promoBtn}
                onClick={() => navigate("/planner")}
              >
                Trải nghiệm ngay <ArrowRight size={18} weight="bold" />
              </button>
            </motion.div>

            {/* Related/Recent Posts */}
            {relatedPosts.length > 0 && (
              <motion.div 
                className={styles.sidebarCard}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h4 className={styles.sidebarTitle}>Bài viết liên quan</h4>
                <div className={styles.relatedList}>
                  {relatedPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      to={`/news/${post.id}`} 
                      className={styles.relatedItem}
                    >
                      <img src={post.image || undefined} alt={post.title} className={styles.relatedThumb} />
                      <div className={styles.relatedText}>
                        <h6>{post.title}</h6>
                        <span className={styles.relatedDate}>
                          {(() => {
                            const dateVal = post.createdAt || post.date;
                            if (!dateVal) return "Tin mới nhất";
                            if (Array.isArray(dateVal)) {
                              const [year, month, day] = dateVal;
                              return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                            }
                            const parsedDate = new Date(dateVal);
                            return !isNaN(parsedDate.getTime()) 
                              ? parsedDate.toLocaleDateString('vi-VN') 
                              : String(dateVal);
                          })()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
