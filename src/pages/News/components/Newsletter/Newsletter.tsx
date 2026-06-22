import React from 'react';
import { EnvelopeSimple, PaperPlaneRight } from "@phosphor-icons/react";
import styles from './Newsletter.module.scss';

const Newsletter: React.FC = () => {
  return (
    <section className={styles.newsletterBg} data-aos="zoom-in">
      <div className={styles.inner}>
        <div className={styles.iconCircle}>
          <EnvelopeSimple size={40} weight="duotone" />
        </div>
        <h2>Đăng ký nhận bản tin <span>TravelAi</span></h2>
        <p>Tham gia cộng đồng 50,000+ người du lịch để nhận những mẹo hữu ích và ưu đãi độc quyền hàng tuần.</p>
        
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputWrapper}>
            <input type="email" placeholder="Địa chỉ email của bạn..." className={styles.input} required />
          </div>
          <button type="submit" className={styles.btnSubmit}>
            Đăng ký ngay <PaperPlaneRight size={20} weight="bold" />
          </button>
        </form>
        
        <span className={styles.privacy}>* Chúng tôi cam kết bảo mật thông tin và không gửi spam.</span>
      </div>
    </section>
  );
};

export default Newsletter;