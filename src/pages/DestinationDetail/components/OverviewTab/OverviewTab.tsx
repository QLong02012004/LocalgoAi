import React, { useState } from "react";
import styles from "./OverviewTab.module.scss";
import type { Destination } from "../../../../services/destinationService";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const OverviewTab: React.FC<{ data: Destination }> = ({ data }) => {
  const galleryList = (data.gallery && data.gallery.length > 0) ? data.gallery : [data.heroImage];
  const [mainImage, setMainImage] = useState(galleryList[0] || data.heroImage);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const handleNext = () => {
    if (startIndex + visibleCount < galleryList.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div data-aos="fade-up">
      <section className={styles.destSection}>
        {data.category && (
          <div className={styles.categoryBadge}>
            {data.category.toUpperCase()}
          </div>
        )}
        <h2 className={styles.destSectionTitle}>Giới thiệu</h2>
        <div className={`${styles.destDescription} ${!isExpanded ? styles.collapsed : ''}`}>
          {(data.description || "Đang cập nhật thông tin chi tiết.").split("\n").map((text, index) => (
            <p key={index} className={styles.paragraph}>
              {text}
            </p>
          ))}
          {!isExpanded && <div className={styles.descriptionFade}></div>}
        </div>
        <button 
          className={styles.readMoreBtn} 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      </section>

      <section className={styles.destSection}>
        <h2 className={styles.destSectionTitle}>Hình ảnh</h2>
        <div className={styles.photoGallery}>
          <div className={styles.galleryMain}>
            <img 
              src={mainImage || data.heroImage} 
              alt={data.name} 
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          </div>
          
          <div className={styles.galleryNavWrapper}>
            <button 
              className={styles.navBtn} 
              onClick={handlePrev}
              disabled={startIndex === 0}
            >
              <CaretLeft size={24} weight="bold" />
            </button>

            <div className={styles.galleryThumbs}>
              {galleryList.slice(startIndex, startIndex + visibleCount).map((img: string, idx: number) => (
                <img
                  key={startIndex + idx}
                  src={img}
                  alt={`Thumb ${startIndex + idx}`}
                  className={mainImage === img ? styles.activeThumb : ""}
                  onClick={() => setMainImage(img)}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              ))}
            </div>

            <button 
              className={styles.navBtn} 
              onClick={handleNext}
              disabled={startIndex + visibleCount >= data.gallery.length}
            >
              <CaretRight size={24} weight="bold" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
