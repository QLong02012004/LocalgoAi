import React, { useState, useEffect } from "react";
import { 
  CaretLeft, CaretRight, MapTrifold, SquaresFour, Sparkle, Trash, ArrowsMerge, MapPin, CaretUp, CaretDown
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Explore.module.scss";
import VideoHome from "../../assets/video/Da_Nang.mp4";

import CategoryTabs from "./components/CategoryTabs/CategoryTabs";
import FilterBar from "./components/FilterBar/FilterBar";
import AIRecommendations from "./components/AIRecommendations/AIRecommendations";
import SkeletonCard from "../../components/Ui/SkeletonCard/SkeletonCard";
import ExploreMap from "./components/ExploreMap/ExploreMap";
import OptimizeConfigModal from "./components/OptimizeConfigModal/OptimizeConfigModal";
import StatusState from "../../components/Ui/StatusState/StatusState";
import TrendingSection from "../Home/components/TrendingSection/TrendingSection";
import ExploreNewsSection from "./components/ExploreNewsSection/ExploreNewsSection";

import { useExplore } from "./hooks/useExplore";

const Explore: React.FC = () => {
  const {
    isLoading, error, activeCategory, searchTerm, viewMode, 
    selectedRoutePoints, isOptimizingRoute, routeGeometry, activeMapPointId, 
    currentPage, filterProvince, filterPriceRange, filterSubCategory, 
    selectedTags, isOptimizeModalOpen,
    displayedData, filteredData, totalPages, savedTrips, nearbyServices, primaryActivePointId,
    handleSearchChange, handleCategoryChange, 
    handleTagToggle, handleToggleRouteSelection, handleOptimizeRoute, confirmOptimize, 
    clearRouteSelection, handlePageChange, handleToggleLike, setActiveMapPointId,
    setIsOptimizeModalOpen, setFilterProvince, setFilterSubCategory, setFilterPriceRange, 
    fetchPlaces, setViewMode, handleCloseDetail
  } = useExplore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePosition({ x, y });
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % displayedData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + displayedData.length) % displayedData.length);
  };

  // Reset active index when data changes
  useEffect(() => {
    setActiveIndex(0);
  }, [displayedData]);

  const activePlace = displayedData[activeIndex] || null;

  return (
    <div className={styles.explorePage} onMouseMove={handleMouseMove}>
      {/* PREMIUM NEON PRE-LOADER */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className={styles.exploreLoader}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            <div className={styles.loaderContent}>
              <div className={styles.neonSpinner}>
                <div className={styles.spinnerCircle}></div>
                <div className={styles.spinnerGlow}></div>
              </div>
              <motion.h3 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                Đang chuẩn bị chuyến hành trình...
              </motion.h3>
              <p>TravelAi đang đồng bộ dữ liệu tốt nhất cho bạn</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CINEMATIC VIEW MODE */}
      {viewMode === 'grid' && activePlace && (
        <div className={styles.cinematicHero}>
          {/* MINIMAL VIEW TOGGLE FOR CINEMATIC MODE */}
          <div className={styles.minimalToggle}>
            <div className={styles.viewModeToggle}>
              <button 
                className={`${styles.modeBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <SquaresFour size={20} weight="fill" />
              </button>
              <button 
                className={`${styles.modeBtn} ${viewMode === 'map' ? styles.active : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapTrifold size={20} weight="fill" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activePlace.id}
              className={styles.heroBg}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ 
                opacity: 1, 
                scale: 1.05,
                x: -mousePosition.x,
                y: -mousePosition.y
              }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ 
                opacity: { duration: 1 },
                scale: { duration: 1.5 },
                x: { type: "spring", stiffness: 50, damping: 20 },
                y: { type: "spring", stiffness: 50, damping: 20 }
              }}
              style={{ backgroundImage: `url(${activePlace.imageUrl})` }}
            >
              <div className={styles.overlay} />
            </motion.div>
          </AnimatePresence>

          <div className={styles.cinematicContainer}>
            <div className={styles.mainInfo}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlace.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className={styles.placeTitle}>{activePlace.name}</h1>
                  <div className={styles.placeMeta}>
                    <MapPin size={20} weight="fill" color="#33d7d1" />
                    <span>{activePlace.location}</span>
                  </div>
                  <p className={styles.placeDesc}>{activePlace.description}</p>
                  <div className={styles.placeActions}>
                    <button 
                      className={styles.primaryBtn}
                      onClick={() => {
                        const path = activePlace.type === 'bed' ? `/hotel/${activePlace.id}` : activePlace.type === 'food' ? `/restaurant/${activePlace.id}` : `/attraction/${activePlace.id}`;
                        window.location.href = path;
                      }}
                    >
                      XEM CHI TIẾT
                    </button>
                    <button 
                      className={styles.secondaryBtn}
                      onClick={() => handleToggleRouteSelection(activePlace)}
                    >
                      {selectedRoutePoints.some(p => p.id === activePlace.id) ? "BỎ CHỌN" : "THÊM VÀO LỘ TRÌNH"}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Vertical Thumb Slider */}
            <div className={styles.thumbSection}>
              <button className={styles.navBtn} onClick={handlePrev}>
                <CaretUp size={20} weight="bold" />
              </button>
              
              <div className={styles.thumbList}>
                {Array.from({ length: Math.min(4, displayedData.length) }).map((_, i) => {
                  const dataIndex = (activeIndex + i) % displayedData.length;
                  const place = displayedData[dataIndex];
                  return (
                    <motion.div
                      key={place.id}
                      className={`${styles.thumbItem} ${i === 0 ? styles.active : ""}`}
                      onClick={() => setActiveIndex(dataIndex)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateY: i === 0 ? 0 : 10,
                        z: 50
                      }}
                    >
                      <div className={styles.thumbImg} style={{ backgroundImage: `url(${place.imageUrl})` }} />
                      <div className={styles.thumbText}>
                        <h4>{place.name}</h4>
                        <p>{place.location.split(',').pop()}</p>
                      </div>
                      {i === 0 && <div className={styles.activeGlow} />}
                    </motion.div>
                  );
                })}
              </div>

              <button className={styles.navBtn} onClick={handleNext}>
                <CaretDown size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trending Section (Minimalist TikTok Style) - Moved to TOP of content */}
      {viewMode === 'grid' && <TrendingSection />}

      <main className={styles.mainContainer}>
        {viewMode === 'map' && (
          <div className={styles.mapViewWrapper}>
            {/* STATIC FILTERS FOR MAP MODE */}
            <div className={styles.mapFiltersStatic}>
              <div className={styles.filterInner}>
                <div style={{ flex: 1 }} />
                <div className={styles.viewModeToggle}>
                  <button 
                    className={`${styles.modeBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <SquaresFour size={20} weight="fill" />
                  </button>
                  <button 
                    className={`${styles.modeBtn} ${viewMode === 'map' ? styles.active : ''}`}
                    onClick={() => setViewMode('map')}
                  >
                    <MapTrifold size={20} weight="fill" />
                  </button>
                </div>
              </div>
              <div className={styles.searchContainer}>
                <FilterBar
                  searchTerm={searchTerm} activeTab={activeCategory} onSearchChange={handleSearchChange}
                  provinceValue={filterProvince} categoryValue={filterSubCategory} priceValue={filterPriceRange}
                  onProvinceChange={setFilterProvince} onCategoryChange={setFilterSubCategory} onPriceRangeChange={setFilterPriceRange}
                  selectedTags={selectedTags} onTagToggle={handleTagToggle}
                />
              </div>
            </div>

            <div className={styles.mapInner}>
              <ExploreMap 
                places={filteredData} selectedPoints={selectedRoutePoints} onToggleSelection={handleToggleRouteSelection}
                activePointId={activeMapPointId} onPointClick={setActiveMapPointId} routeGeometry={routeGeometry}
                provinceId={filterProvince} activeCategory={activeCategory} nearbyServices={nearbyServices}
                primaryActivePointId={primaryActivePointId} onClosePanel={handleCloseDetail}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        )}

        {/* Floating Route Selection Panel */}
        {selectedRoutePoints.length > 0 && (
          <div className={styles.floatingRoutePanel}>
             <div className={styles.routeHeader}>
                <div className={styles.routeTitle}>
                   <Sparkle size={20} weight="fill" color="#33d7d1" />
                   <span>Lộ trình ({selectedRoutePoints.length})</span>
                </div>
                <button className={styles.clearBtn} onClick={clearRouteSelection}><Trash size={18} /></button>
             </div>
             <div className={styles.routeList}>
                {selectedRoutePoints.map(p => (
                   <div key={p.id} className={styles.routeItem}>
                      <img src={p.imageUrl} alt={p.name} />
                   </div>
                ))}
             </div>
             <button className={styles.optimizeBtn} disabled={selectedRoutePoints.length < 2 || isOptimizingRoute} onClick={handleOptimizeRoute}>
                {isOptimizingRoute ? "Đang tính..." : "AI Tối ưu lộ trình"}
             </button>
          </div>
        )}
      </main>

      <OptimizeConfigModal 
        isOpen={isOptimizeModalOpen} onClose={() => setIsOptimizeModalOpen(false)} onConfirm={confirmOptimize}
        provinceName={filterProvince === '1' ? "Huế" : filterProvince === '2' ? "Đà Nẵng" : "Quảng Nam"}
      />
      

      {/* News & Inspiration Section at the bottom */}
      {viewMode === 'grid' && <ExploreNewsSection />}
    </div>
  );
};

export default Explore;
