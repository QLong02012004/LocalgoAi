import React from "react";
import { useNavigate } from "react-router-dom";
import { MagicWand, ArrowRight } from "@phosphor-icons/react";
import styles from "./AICustomCTA.module.scss";

const AICustomCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.ctaWrapper} data-aos="fade-up">
      <div className={styles.content}>
        <div className={styles.iconBox}>
          <MagicWand size={32} weight="fill" color="#fff" />
        </div>
        <div className={styles.textSide}>
          <h2>Bạn vẫn chưa tìm được <span>Lịch trình ưng ý?</span></h2>
          <p>Hãy để AI của chúng tôi thiết kế một hành trình độc bản dựa trên sở thích và ngân sách riêng của bạn chỉ trong vài giây.</p>
        </div>
        <button className={styles.ctaBtn} onClick={() => navigate("/planner")}>
          Thử ngay miễn phí <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </section>
  );
};

export default AICustomCTA;
