import React, { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import PremiumButton from "../../components/Ui/PremiumButton/PremiumButton";
import StarRating from "./component/StarRating";
import styles from "./Review.module.scss";
import {
  X,
  Camera,
  Sparkle,
  Smiley,
  SmileySad,
  SmileyMeh,
  Trophy,
  Gift,
  Medal,
} from "@phosphor-icons/react";
import { useReview } from "./hooks/useReview";
import StatusState from "../../components/Ui/StatusState/StatusState";

const Review: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const {
    rating, setRating, comment, setComment, previews, communityReviews, isLoading, 
    isSubmitting, userLevel, suggestedTags, sentiment, state,
    addTagToComment, handleSubmit, handleImageUpload, handleImageRemove
  } = useReview();

  const getSentimentIcon = () => {
    if (sentiment.type === "pos") return <Smiley weight="fill" />;
    if (sentiment.type === "neg") return <SmileySad weight="fill" />;
    return <SmileyMeh weight="fill" />;
  };

  return (
    <main className={`container ${styles.reviewMain}`}>
      <section className={styles.reviewIntro} data-aos="fade-down">
        <h1 className={styles.reviewTitle}>Cộng đồng TravelAI</h1>
        <p className={styles.reviewSubtitle}>
          Góc nhìn chân thực, kiến tạo hành trình.
        </p>
      </section>

      <div className={styles.reviewLayout}>
        <aside className={styles.reviewStatsCard} data-aos="fade-right">
          <div className={styles.userBadgeSection}>
            <div className={styles.badgeIcon}><Trophy weight="fill" /></div>
            <div className={styles.badgeInfo}>
              <span className={styles.badgeLabel}>Local Guide</span>
              <h4 className={styles.levelName}>{userLevel.name}</h4>
            </div>
          </div>

          <div className={styles.rewardProgress}>
            <div className={styles.rewardHeader}>
              <div className={styles.rewardTitle}>
                <Gift weight="bold" />
                <span>Tiến trình nhận quà</span>
              </div>
              <span className={styles.remaining}>
                Còn {userLevel.target - userLevel.currentReviews} bài
              </span>
            </div>
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{
                  width: `${(userLevel.currentReviews / userLevel.target) * 100}%`,
                }}
              ></motion.div>
            </div>
            <p className={styles.rewardHint}>
              Viết thêm {userLevel.target - userLevel.currentReviews} đánh giá
              nữa để nhận Voucher!
            </p>
          </div>

          <div className={styles.divider}></div>

          <h3>Thống kê</h3>
          <div className={styles.overallRating}>
            <span className={styles.ratingValue}>4.8</span>
            <StarRating initialRating={5} isEditable={false} />
          </div>

          <div className={styles.aiSentimentBox}>
            <div className={styles.aiHeader}>
              <Sparkle weight="fill" />
              <span>AI Analyzer</span>
            </div>
            <div
              className={`${styles.sentimentContent} ${styles[sentiment.type]}`}
            >
              {getSentimentIcon()}
              <span>{comment ? sentiment.msg : "Hãy viết gì đó..."}</span>
            </div>
          </div>
        </aside>

        <section className={styles.feedbackFormCard} data-aos="fade-left">
          <div className={styles.formGroup}>
            <h4>Đánh giá của bạn</h4>
            <StarRating onChange={(val) => setRating(val)} />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelWithAi}>
              <h4>Chia sẻ cảm nhận</h4>
              <span className={styles.charCount}>{comment.length} ký tự</span>
            </div>
            <textarea
              placeholder={
                !state?.targetType
                  ? "Chia sẻ trải nghiệm của bạn về website..."
                  : "Chia sẻ về hành trình của bạn..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={styles.smartTags}>
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  className={styles.tagBtn}
                  onClick={() => addTagToComment(tag)}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <h4>Ảnh thực tế</h4>
            <div className={styles.uploadGrid}>
              <label className={styles.uploadBtn}>
                <Camera />
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              {previews.map((img, index) => (
                <div key={index} className={styles.uploadThumb}>
                  <img src={img} alt="Thumb" />
                  <button
                    className={styles.btnRemoveImg}
                    onClick={() => handleImageRemove(index)}
                    title="Xóa ảnh"
                    aria-label="Xóa ảnh"
                  >
                    <X />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <PremiumButton
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              <Medal weight="fill" />
              <span>GỬI ĐỂ NHẬN ĐIỂM</span>
            </PremiumButton>
          </div>
        </section>
      </div>

      <section className={styles.recentReviewsSection}>
        <h2 className={styles.sectionTitle}>Cảm hứng cộng đồng</h2>
        <div className={styles.recentReviewsContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : communityReviews.length > 0 ? (
            <div className={styles.masonryGrid}>
              {communityReviews.map((review, index) => (
                <div
                  key={review.id}
                  className={styles.masonryItem}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  {review.images && review.images.length > 0 && (
                    <div className={styles.reviewImage}>
                      <img src={review.images[0]} alt="Review" />
                    </div>
                  )}
                  <div className={styles.masonryContent}>
                    <div className={styles.userRow}>
                      <img
                        src={review.avatar}
                        alt={review.userName}
                        className={styles.userAvatar}
                      />
                      <div className={styles.userInfo}>
                        <strong>{review.userName}</strong>
                        <span>{review.timeAgo}</span>
                      </div>
                    </div>
                    <div className={styles.starsFixed}>
                      <StarRating
                        initialRating={review.rating}
                        isEditable={false}
                      />
                    </div>
                    <p className={styles.reviewText}>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.statusWrapper}>
              <StatusState 
                type="empty" 
                title="Cộng đồng đang chờ bạn"
                description="Hãy là người tiếp theo truyền cảm hứng cho mọi người bằng những đánh giá chân thực nhé!"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Review;
