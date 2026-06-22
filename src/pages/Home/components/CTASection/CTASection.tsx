import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CTA.module.scss";
import MagicButton from "../../../../components/Ui/MagicButton/MagicButton";
import { RocketLaunch, Compass } from "phosphor-react";

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.ctaCard} data-aos="zoom-in">
          <h2>
            Bắt đầu hành trình <br /> của riêng bạn.
          </h2>
          <p>
            Chúng tôi ở đây để giúp bạn tạo nên những chuyến đi đáng nhớ nhất. Hãy để AI đồng hành cùng bạn.
          </p>
          <div className={styles.ctaButtons}>
            <MagicButton 
              text="Lên kế hoạch ngay"
              loadingText="Đang chuẩn bị"
              variant="sunset"
              icon={<RocketLaunch weight="fill" />}
              onClick={() => navigate("/planner")}
            />
            
            <MagicButton 
              text="Khám phá cộng đồng"
              loadingText="Đang tìm kiếm"
              variant="dark"
              icon={<Compass weight="bold" />}
              onClick={() => navigate("/explore")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
