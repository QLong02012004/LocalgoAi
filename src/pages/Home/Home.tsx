import React, { useEffect, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
// import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import styles from "./Home.module.scss";
import FeaturesMap from "./components/FeaturesMap/FeaturesMap";
import Timeline from "./components/Timeline/Timeline";
import WhyUs from "./components/WhyUs/WhyUs";
import ExpertItinerary from "./components/ExpertItinerary/ExpertItinerary";
import Testimonials from "./components/Testimonials/Testimonials";
import HighlightLocations from "./components/HighlightLocations/HighlightLocations";
import CTASection from "./components/CTASection/CTASection";
import Hero from "./components/Hero/Hero";
import Partners from "./components/Partners/Partners";
import { getProfile } from "../../services/profileService";

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    flatpickr("#dates-input", {

      mode: "range",
      minDate: "today",
      dateFormat: "d/m/Y",
    });

    const fetchUser = async () => {
      // 1. Kiểm tra trạng thái đăng nhập trước (ví dụ lấy token)
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUserName(null); // Đảm bảo gỡ tên nếu chưa đăng nhập
        return;
      }

      // 2. Nếu đã đăng nhập thì mới gọi dữ liệu
      try {
        const res = await getProfile();
        if (res?.data?.data?.fullName) {
          setUserName(res.data.data.fullName);
        } else {
          const localName = localStorage.getItem("username");
          if (localName) setUserName(localName);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        const localName = localStorage.getItem("username");
        if (localName) setUserName(localName);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.main}>
        {/* Sticky Hero & Overlapping Section Wrapper */}
        <div className={styles.heroScrollWrapper}>
          <Hero userName={userName} />
          <section className={styles.timeline}>
            <Timeline />
          </section>
        </div>

        {/* Why Choose Us Section */}
        <section className={styles.whyUs}>
          <div className={styles.container}>
            <WhyUs />
          </div>
        </section>
        
        {/* expertItinerary */}
        <section className={styles.expertItinerary}>
          <div className={`${styles.container} ${styles.expertContainer}`}>
            <ExpertItinerary />
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.container}>
            <FeaturesMap />
          </div>
        </section>
        {/* Highlight Locations */}
        <HighlightLocations
          titlePrimary="Gợi ý"
          titleHighlight="nổi bật"
          description="Khám phá những điểm đến được yêu thích nhất bởi cộng đồng."
        />

        {/* Testimonials Section */}
        <section className={styles.testimonials}>
          <div className={styles.container}>
            <Testimonials />
          </div>
        </section>

        {/* Partners Marquee Section */}
        <Partners />

        {/* Bottom CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <CTASection />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
