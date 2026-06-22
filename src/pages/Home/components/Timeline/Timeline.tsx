import React, { useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import styles from "./Timeline.module.scss";

import dragonBridgeVideo from "../../../../assets/video/DRAGON BRIDGE.mp4";
import hoiAnVideo from "../../../../assets/video/HOI AN ANCIENT TOWN.mp4";
import hueVideo from "../../../../assets/video/HUE IMPERIAL CITY.mp4";

const EXPERIENCES = [
  {
    id: 1,
    title: "CẦU RỒNG",
    desc: "Biểu tượng kiêu hãnh của Đà Nẵng với kiến trúc độc bản và màn trình diễn phun lửa, phun nước đầy ấn tượng vào mỗi cuối tuần.",
    image: "https://images.unsplash.com/photo-1559592413-7ce8509975b4?q=80&w=1600",
    video: dragonBridgeVideo,
    label: "BIỂU TƯỢNG ĐÀ NẴNG",
    align: "left"
  },
  {
    id: 2,
    title: "PHỐ CỔ HỘI AN",
    desc: "Đắm chìm trong vẻ đẹp cổ kính với những dãy nhà vàng rêu phong, đèn lồng lung linh và dòng sông Hoài thơ mộng.",
    image: "https://images.unsplash.com/photo-1599708141690-d81b30501709?q=80&w=1600",
    video: hoiAnVideo,
    label: "DI SẢN VĂN HÓA",
    align: "right"
  },
  {
    id: 3,
    title: "KINH THÀNH HUẾ",
    desc: "Kinh đô cuối cùng của các triều đại phong kiến Việt Nam, nơi lưu giữ những giá trị kiến trúc đồ sộ và tinh hoa văn hóa cố đô nghìn năm văn hiến.",
    image: "https://images.unsplash.com/photo-1563492062331-50e58836599b?q=80&w=1600",
    video: hueVideo,
    label: "DI SẢN CỐ ĐÔ",
    align: "left"
  }
];

const TimelineVideo: React.FC<{ src: string; id: number }> = ({ src, id }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.1 }); // Bắt đầu load khi chớm thấy 10%
  const isActuallyPlaying = useInView(videoRef, { amount: 0.5 }); // Chỉ chạy khi thấy 50%

  useEffect(() => {
    if (videoRef.current) {
      if (isActuallyPlaying) {
        videoRef.current.playbackRate = 0.75;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActuallyPlaying]);

  return (
    <video
      ref={videoRef}
      className={styles.mediaVideo}
      muted
      loop
      playsInline
      preload={isInView ? "auto" : "none"}
      key={id}
    >
      {/* Ưu tiên WebM nếu có trong tương lai, fallback về MP4 */}
      <source src={src.replace(".mp4", ".webm")} type="video/webm" />
      <source src={src} type="video/mp4" />
      Trình duyệt của bạn không hỗ trợ video.
    </video>
  );
};

const AnimatedLine: React.FC<{ isToLeft: boolean }> = ({ isToLeft }) => {
  // isToLeft = true: Video hiện tại bên PHẢI -> Video sau bên TRÁI
  // isToLeft = false: Video hiện tại bên TRÁI -> Video sau bên PHẢI
  const pathData = isToLeft 
    ? "M 750 0 C 750 100, 250 100, 250 200" // Phải sang Trái
    : "M 250 0 C 250 100, 750 100, 750 200"; // Trái sang Phải

  return (
    <div className={styles.curvedLineWrapper}>
      <svg 
        viewBox="0 0 1000 200" 
        preserveAspectRatio="none"
        className={styles.curvedLineSvg}
      >
        <path
          d={pathData}
          fill="transparent"
          stroke="rgba(51, 215, 209, 0.5)"
          strokeWidth="3"
          strokeDasharray="10 10"
        />
        <circle
          cx={isToLeft ? 250 : 750}
          cy="200"
          r="5"
          fill="#33d7d1"
        />
      </svg>
    </div>
  );
};

const Timeline: React.FC = () => {
  return (
    <section className={styles.experienceSection}>
      <div className={styles.container}>


        <div className={styles.experienceList}>
          {EXPERIENCES.map((exp, idx) => (
            <div 
              key={exp.id} 
              className={`${styles.experienceItem} ${exp.align === 'right' ? styles.reverse : ''}`}
              data-aos={exp.align === 'left' ? "fade-right" : "fade-left"}
            >
              <div className={styles.mediaContainer}>
                <div className={styles.mediaWrapper}>
                  {exp.video ? (
                    <TimelineVideo src={exp.video} id={exp.id} />
                  ) : (
                    <img src={exp.image} alt={exp.title} className={styles.mediaImage} />
                  )}
                </div>
              </div>

              {/* Connecting Curved Line - Spans across the item width */}
              {idx < EXPERIENCES.length - 1 && (
                <AnimatedLine isToLeft={exp.align === 'right'} />
              )}


              <div className={styles.contentContainer}>
                <motion.div 
                  className={styles.textContent}
                  initial={{ opacity: 0, x: exp.align === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.2, 0.65, 0.3, 0.9],
                    delay: 0.2 
                  }}
                >
                  <span className={styles.itemLabel}>{exp.label}</span>
                  <motion.h3 
                    className={styles.itemTitle}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {exp.title}
                  </motion.h3>
                  <motion.p 
                    className={styles.itemDesc}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {exp.desc}
                  </motion.p>
                  <button className={styles.exploreBtn}>Tìm hiểu thêm</button>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
