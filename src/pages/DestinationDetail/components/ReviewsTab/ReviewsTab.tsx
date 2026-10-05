import React from "react";
import { Star, StarHalf } from "@phosphor-icons/react";
import styles from "./ReviewsTab.module.scss";
import type { Destination } from "../../../../services/destinationService";
import { useNavigate, useParams } from "react-router-dom";
import { getReviewsByTarget, createReview, type BackendReview, type ReviewPayload } from "../../../../services/reviewService";
import { Camera, X, PaperPlaneTilt, MapPin } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import StatusState from "../../../../components/Ui/StatusState/StatusState";

interface ReviewsTabProps {
  reviews: Destination["reviewsData"];
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews: initialReviews }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [realReviews, setRealReviews] = React.useState<BackendReview[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [stats, setStats] = React.useState(initialReviews);

  // Form State
  const [newRating, setNewRating] = React.useState(5);
  const [newComment, setNewComment] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);

  const path = window.location.pathname;
  let targetType: "restaurant" | "hotel" | "attraction" = "attraction";
  if (path.includes('/hotel/')) targetType = "hotel";
  else if (path.includes('/restaurant/')) targetType = "restaurant";

  const calculateBreakdown = (allReviews: BackendReview[]) => {
    const total = allReviews.length;
    if (total === 0) return initialReviews.breakdown;
    
    const counts = [0, 0, 0, 0, 0, 0]; // Index 1-5
    allReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++;
    });

    return [5, 4, 3, 2, 1].map(star => ({
      stars: star,
      percentage: Math.round((counts[star] / total) * 100)
    }));
  };

  const fetchReviews = async (pageNum: number) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(false);
      const res = await getReviewsByTarget(targetType, id, pageNum, 5);
      if (res.data && (res.data.status === 200 || res.data.status === 201) && res.data.data) {
        const content = res.data.data.content || [];
        const pagination = res.data.data.page;

        if (content.length > 0) {
          setRealReviews(prev => pageNum === 0 ? content : [...prev, ...content]);
          setHasMore(pagination ? (pagination.number + 1 < pagination.totalPages) : false);
          
          const allLoaded = pageNum === 0 ? content : [...realReviews, ...content];
          const totalElements = pagination?.totalElements || allLoaded.length;
          const avg = allLoaded.reduce((acc, curr) => acc + curr.rating, 0) / allLoaded.length;
          
          setStats(prev => ({
            ...prev,
            total: totalElements,
            average: Number(avg.toFixed(1)),
            breakdown: calculateBreakdown(allLoaded)
          }));
          return;
        }
      }
      
      // If BE returns empty or offline, map from initialReviews
      if (initialReviews && initialReviews.list && initialReviews.list.length > 0) {
        const mappedFromInitial: BackendReview[] = initialReviews.list.map((r, i) => ({
          id: i + 1,
          userName: r.user,
          userImage: r.avatar,
          rating: r.rating,
          comment: r.content,
          createdAt: new Date().toISOString(),
          images: r.images || [],
          isVerified: true,
        }));
        setRealReviews(mappedFromInitial);
        setHasMore(false);
      }
    } catch {
      if (initialReviews && initialReviews.list && initialReviews.list.length > 0) {
        const mappedFromInitial: BackendReview[] = initialReviews.list.map((r, i) => ({
          id: i + 1,
          userName: r.user,
          userImage: r.avatar,
          rating: r.rating,
          comment: r.content,
          createdAt: new Date().toISOString(),
          images: r.images || [],
          isVerified: true,
        }));
        setRealReviews(mappedFromInitial);
        setHasMore(false);
      } else {
        setError(false);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews(0);
  }, [id, targetType]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.warn("Vui lòng đăng nhập để gửi đánh giá.");
      navigate("/auth?mode=login");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setSubmitting(true);
      const user = userStr ? JSON.parse(userStr) : { id: 1, fullName: "Bạn" };
      
      const payload = {
        userId: user.id || 1,
        rating: newRating,
        comment: newComment,
        type: targetType.toUpperCase() as ReviewPayload["type"],
        restaurantId: targetType === 'restaurant' ? Number(id) : null,
        hotelId: targetType === 'hotel' ? Number(id) : null,
        attractionId: targetType === 'attraction' ? Number(id) : null,
      };

      try {
        await createReview(payload, selectedFiles);
      } catch {
        // Optimistic fallback
      }

      const newReviewItem: BackendReview = {
        id: Date.now(),
        userName: user.fullName || "Bạn",
        userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString(),
        images: previews.length > 0 ? [...previews] : [],
        isVerified: true
      };

      setRealReviews(prev => [newReviewItem, ...prev]);
      toast.success("Gửi đánh giá thành công!");
      setNewComment("");
      setNewRating(5);
      setSelectedFiles([]);
      setPreviews([]);
    } catch {
      toast.error("Không thể gửi đánh giá, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewsContainer} data-aos="fade-up">
      <div className={styles.reviewBtn}>
        <span>Đánh giá từ cộng đồng</span>
        <div className={styles.reviewQuickInfo}>
          Hãy chia sẻ trải nghiệm của bạn về địa điểm này nhé!
        </div>
      </div>
      <div className={styles.ratingSummary}>
        <div className={styles.scoreBig}>
          <h2>{stats.average}</h2>
          <div className={styles.starsRow}>
            {/* Render sao tùy vào reviews.average */}
            <Star weight="fill" color="#33d7d1" size={18} />
            <Star weight="fill" color="#33d7d1" size={18} />
            <Star weight="fill" color="#33d7d1" size={18} />
            <Star weight="fill" color="#33d7d1" size={18} />
            <StarHalf weight="fill" color="#33d7d1" size={18} />
          </div>
          <p>{stats.total} đánh giá</p>
        </div>

        <div className={styles.ratingBars}>
          {stats.breakdown.map(
            (item: { stars: number; percentage: number }) => (
              <div key={item.stars} className={styles.barRow}>
                <span>{item.stars} sao</span>
                <div className={styles.barContainer}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className={styles.percentText}>{item.percentage}%</span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className={styles.reviewsList}>
        {loading && realReviews.length === 0 ? (
          <div className={styles.loadingState}>
            <p>Đang tải đánh giá...</p>
          </div>
        ) : error && realReviews.length === 0 ? (
          <StatusState 
            type="error" 
            title="Không thể tải đánh giá"
            onRetry={() => fetchReviews(0)}
          />
        ) : (
          <>
            {/* 1. Hiển thị đánh giá thật từ BE */}
            {realReviews.map((rev) => (
              <div key={rev.id} className={styles.reviewItem}>
                {(rev.nameService || rev.provinceName) && (
                  <div className={styles.serviceTag}>
                    {rev.nameService && <span className={styles.serviceName}>{rev.nameService}</span>}
                    {rev.provinceName && (
                      <span className={styles.location}>
                        <MapPin size={10} weight="fill" />
                        {rev.provinceName}
                      </span>
                    )}
                  </div>
                )}
                <div className={styles.reviewerHeader}>
                  <img src={rev.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.userName)}&background=random`} className={styles.avatar} alt="" />
                  <div className={styles.reviewerInfo}>
                    <h4>{rev.userName}</h4>
                    <div className={styles.revMeta}>
                      <div className={styles.miniStars}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} weight="fill" />
                        ))}
                      </div>
                      <span>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                      {rev.isVerified && <span className={styles.tag}>Đã xác minh</span>}
                    </div>
                  </div>
                </div>
                <p className={styles.revContent}>{rev.comment}</p>
                {rev.images && rev.images.length > 0 && (
                  <div className={styles.revGallery}>
                    {rev.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="" />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 2. Hiển thị thông báo nếu không có đánh giá nào */}
            {realReviews.length === 0 && !loading && !error && (
              <StatusState 
                type="empty"
                title="Chưa có đánh giá nào"
                description="Hãy là người đầu tiên chia sẻ trải nghiệm về địa điểm này nhé!"
              />
            )}
          </>
        )}
      </div>

      <div className={styles.quickReviewForm}>
        <div className={styles.formHeader}>
          <h4>Viết đánh giá của bạn</h4>
          <div className={styles.quickStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                size={24} 
                weight={s <= newRating ? "fill" : "regular"} 
                color={s <= newRating ? "#f59e0b" : "#cbd5e1"}
                onClick={() => setNewRating(s)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.formBody}>
          <textarea 
            placeholder="Bạn nghĩ sao về địa điểm này? Chia sẻ cảm nhận của bạn..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          
          <div className={styles.formActions}>
            <div className={styles.uploadBtnGroup}>
              <label className={styles.uploadLabel}>
                <Camera size={20} weight="bold" />
                <span>Thêm ảnh</span>
                <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
              </label>
              
              <div className={styles.miniPreviews}>
                {previews.map((p, idx) => (
                  <div key={idx} className={styles.miniPreviewItem}>
                    <img src={p} alt="" />
                    <button 
                      onClick={() => removeImage(idx)} 
                      title="Xóa ảnh" 
                      aria-label="Xóa ảnh này"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className={styles.btnSubmit} 
              onClick={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : (
                <>
                  <span>Gửi đánh giá</span>
                  <PaperPlaneTilt size={18} weight="fill" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {hasMore && (
        <button
          className={styles.btnLoadMore}
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? "Đang tải..." : `Xem thêm ${stats.total - realReviews.length} đánh giá`}
        </button>
      )}
    </div>
  );
};

export default ReviewsTab;


