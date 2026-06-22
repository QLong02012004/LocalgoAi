import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, MapPin } from "@phosphor-icons/react";
import styles from "./ExploreHero.module.scss";

const FEATURED_PLACES = [
  {
    id: 1,
    title: "TIME TO TRAVEL",
    location: "Đà Nẵng, Việt Nam",
    description: "Khám phá vẻ đẹp bất tận của thành phố đáng sống nhất Việt Nam với những bãi biển xanh ngắt và những cây cầu huyền thoại.",
    image: "https://images.unsplash.com/photo-1559592413-7ce8509975b4?q=80&w=1600",
  },
  {
    id: 2,
    title: "ANCIENT TOWN",
    location: "Hội An, Quảng Nam",
    description: "Lạc bước giữa những con phố cổ nhuốm màu thời gian, nơi những chiếc đèn lồng lung linh thắp sáng dòng sông Hoài thơ mộng.",
    image: "https://images.unsplash.com/photo-1599708141690-d81b30501709?q=80&w=1600",
  },
  {
    id: 3,
    title: "IMPERIAL CITY",
    location: "Cố đô Huế",
    description: "Trở về với lịch sử triều đình Nguyễn, khám phá những cung điện nguy nga và tinh hoa văn hóa cố đô nghìn năm văn hiến.",
    image: "https://images.unsplash.com/photo-1563492062331-50e58836599b?q=80&w=1600",
  },
  {
    id: 4,
    title: "MỸ SƠN HOLYLAND",
    location: "Quảng Nam, Việt Nam",
    description: "Khám phá di sản thế giới với những đền đài Chăm Pa cổ kính, minh chứng cho một nền văn minh rực rỡ trong quá khứ.",
    image: "https://images.unsplash.com/photo-1597516843431-7e8509975b4?q=80&w=1600",
  }
];

const ExploreHero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activePlace = FEATURED_PLACES[currentIndex];

  return (
    <div className={styles.hero}>
      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activePlace.id}
          className={styles.heroBg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ backgroundImage: `url(${activePlace.image})` }}
        >
          <div className={styles.overlay} />
        </motion.div>
      </AnimatePresence>

      <div className={styles.container}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlace.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className={styles.title}>{activePlace.title}</h1>
              <div className={styles.locationTag}>
                <MapPin size={20} weight="fill" />
                <span>{activePlace.location}</span>
              </div>
              <p className={styles.description}>{activePlace.description}</p>
              <button className={styles.seeMoreBtn}>
                <span>XEM THÊM</span>
                <CaretRight size={20} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumb Slider Area */}
        <div className={styles.thumbSlider}>
          {FEATURED_PLACES.map((place, index) => (
            <motion.div
              key={place.id}
              className={`${styles.thumbCard} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className={styles.thumbImage} 
                style={{ backgroundImage: `url(${place.image})` }} 
              />
              <div className={styles.thumbContent}>
                <h4>{place.title}</h4>
                <p>Description</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreHero;
