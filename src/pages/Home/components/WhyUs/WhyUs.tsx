import React from "react";
import { Lightning, Target, CurrencyCircleDollar } from "phosphor-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "../../Home.module.scss"; 

const WhyUs: React.FC = () => {
  const cards = [
    {
      icon: <Lightning weight="fill" />,
      title: "Tốc độ chớp nhoáng",
      desc: "Nhận được kế hoạch chi tiết cho chuyến đi nhiều ngày chỉ trong vài giây.",
      delay: "100",
      badge: "GPT-4o Engine"
    },
    {
      icon: <Target weight="fill" />,
      title: "Cá nhân hóa 100%",
      desc: "Lịch trình được thiết kế may đo dựa trên sở thích và ngân sách của riêng bạn.",
      delay: "300",
      badge: "Real-time Data"
    },
    {
      icon: <CurrencyCircleDollar weight="fill" />,
      title: "Tối ưu chi phí",
      desc: "AI tự động tìm kiếm và đề xuất lộ trình với chi phí hợp lý nhất.",
      delay: "500",
      badge: "Smart Search"
    }
  ];

  return (
    <section className={styles.whyUs}>
      <div className={styles.container}>
        <div data-aos="fade-up">
          <h2 className={styles.sectionTitle}>
            Tại sao chọn <br />
            <span className={styles.gradientText}>chúng tôi?</span>
          </h2>
          <p className={styles.sectionDescription1}>
            Sự kết hợp hoàn hảo giữa công nghệ AI và dữ liệu du lịch khổng lồ.
          </p>
        </div>

        <motion.div 
          className={styles.whyUsGrid}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          {cards.map((card, index) => (
            <TiltCard key={index} card={card} />
          ))}
        </motion.div>

      </div>
    </section>
  );
};

const TiltCard: React.FC<{ card: any }> = ({ card }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={styles.glassCard}
    >
      <div 
        style={{ transform: "translateZ(50px)" }}
        className={styles.cardInner}
      >
        <div className={styles.cardHeader}>
          <motion.div 
            className={styles.glassIcon}
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
          >
            {card.icon}
          </motion.div>
          <div className={styles.cardBadge}>{card.badge}</div>
        </div>
        <h3>{card.title}</h3>
        <p>{card.desc}</p>
      </div>
    </motion.div>
  );
};

export default WhyUs;