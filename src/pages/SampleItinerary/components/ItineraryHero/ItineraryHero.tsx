import React, { useState, useEffect } from "react";
import styles from './ItineraryHero.module.scss';
import { Sparkle, Star, MapPin, Users, CloudSun, Wallet, Info } from "@phosphor-icons/react";
import heroIllustration from "../../../../assets/images/travel_3d_illustration.png";

const ItineraryHero: React.FC = () => {
  const [typingText, setTypingText] = useState("");
  const fullText = "LỘ TRÌNH DU LỊCH MẪU";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypingText(fullText.substring(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, 70); // Slightly faster for smoothness
    return () => clearInterval(timer);
  }, []);

  const showSecondPart = typingText.length > 8;

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          {/* Left Side: Text and CTA with Glassmorphism */}
          <div className={styles.leftSide} data-aos="fade-right">
            <div className={styles.glassCard}>
              <h1 className={styles.heroTitle}>
                {typingText.substring(0, 8)}
                {showSecondPart && (
                  <span>{typingText.substring(8)}</span>
                )}
                <span className={styles.cursor}>|</span>
              </h1>
              
              <p className={styles.heroDescription}>
                Khám phá những hành trình được thiết kế tối ưu bởi trí tuệ nhân tạo và chuyên gia bản địa, mang lại trải nghiệm độc bản tại mỗi điểm đến.
              </p>

              <div className={styles.heroStats}>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>50+</span>
                  <p className={styles.statLab}>LỊCH TRÌNH</p>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>100%</span>
                  <p className={styles.statLab}>TÙY BIẾN</p>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>24/7</span>
                  <p className={styles.statLab}>AI HỖ TRỢ</p>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>4.9/5</span>
                  <p className={styles.statLab}>ĐÁNH GIÁ</p>
                </div>
              </div>

              {/* Social Proof Section */}
              <div className={styles.socialProof} data-aos="fade-up" data-aos-delay="400">
                <div className={styles.avatarStack}>
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/150?u=${i + 10}`} 
                      alt="User Avatar" 
                      className={styles.avatar}
                    />
                  ))}
                  <div className={styles.avatarMore}>
                    <Users size={14} weight="bold" />
                  </div>
                </div>
                <div className={styles.proofText}>
                  <strong>1.000+ người</strong> đã lên kế hoạch thành công
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Illustration */}
          <div className={styles.rightSide} data-aos="fade-left" data-aos-delay="200">
            <div className={styles.illustrationWrapper}>
              <img src={heroIllustration} alt="Travel Illustration" className={styles.mainImg} />
              
              {/* Floating Badges */}
              <div className={`${styles.floatingBadge} ${styles.aiPowered}`}>
                <Sparkle size={18} weight="fill" color="#14b8a6" />
                <span>AI Powered Planner</span>
              </div>
              
              <div className={`${styles.floatingBadge} ${styles.personalized}`}>
                <MapPin size={18} weight="fill" color="#f97316" />
                <span>Personalized Trips</span>
              </div>

              {/* Floating UI Cards */}
              <div className={`${styles.floatingCard} ${styles.weatherCard}`}>
                <CloudSun size={20} weight="fill" color="#0ea5e9" />
                <div className={styles.cardContent}>
                  <span className={styles.cardVal}>28°C</span>
                  <span className={styles.cardLab}>Đà Nẵng</span>
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.aiScoreCard}`}>
                <Sparkle size={20} weight="fill" color="#8b5cf6" />
                <div className={styles.cardContent}>
                  <span className={styles.cardVal}>9.8/10</span>
                  <span className={styles.cardLab}>AI Score</span>
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.budgetCard}`}>
                <Wallet size={20} weight="fill" color="#10b981" />
                <div className={styles.cardContent}>
                  <span className={styles.cardVal}>5M+</span>
                  <span className={styles.cardLab}>Budget</span>
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.tipsCard}`}>
                <Info size={20} weight="fill" color="#f59e0b" />
                <div className={styles.cardContent}>
                  <span className={styles.cardVal}>Local Tips</span>
                  <span className={styles.cardLab}>Khám phá Huế</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ItineraryHero;