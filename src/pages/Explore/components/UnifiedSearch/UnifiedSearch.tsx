import React from 'react';
import { 
  SquaresFour, 
  Bed, 
  ForkKnife, 
  Sparkle,
  FadersHorizontal,
  MapPin
} from '@phosphor-icons/react';
import styles from './UnifiedSearch.module.scss';
import ThreeDSearchInput from '../../../../components/Ui/ThreeDSearchInput/ThreeDSearchInput';

interface UnifiedSearchProps {
  searchTerm: string;
  activeCategory: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (category: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  searchTerm,
  activeCategory,
  onSearchChange,
  onCategoryChange,
  showFilters,
  onToggleFilters,
  selectedTags,
  onTagToggle
}) => {
  const categories = [
    { id: 'all', label: 'TẤT CẢ', icon: SquaresFour },
    { id: 'pin', label: 'ĐỊA ĐIỂM', icon: MapPin },
    { id: 'bed', label: 'KHÁCH SẠN', icon: Bed },
    { id: 'food', label: 'NHÀ HÀNG', icon: ForkKnife },
    { id: 'service', label: 'DỊCH VỤ', icon: Sparkle },
  ];

  const moodTags = [
    { id: "chill", label: "#Chill" },
    { id: "checkin", label: "#CheckinSốngẢo" },
    { id: "family", label: "#GiaĐình" },
    { id: "date", label: "#HẹnHò" },
    { id: "quiet", label: "#YênTĩnh" },
    { id: "work", label: "#LàmViệc" }
  ];

  return (
    <div className={styles.unifiedSearchWrapper}>
      {/* Category Tabs */}
      <div className={styles.categoriesTabs}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tabItem} ${activeCategory === cat.id ? styles.active : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Integrated Search & Filter Bar */}
      <div className={styles.searchBarContainer}>
        <div className={styles.searchBox}>
          <ThreeDSearchInput 
            value={searchTerm} 
            onChange={onSearchChange} 
            placeholder="Bạn muốn đi đâu hôm nay?..."
            className={styles.customSearchInput}
          />
          
          <div className={styles.searchActions}>
            <div className={styles.searchDecor}>
               <div className={styles.pulseDot}></div>
               <span>AI</span>
            </div>

            <button 
              className={`${styles.filterToggleBtn} ${showFilters ? styles.active : ''}`}
              onClick={onToggleFilters}
              title="Bộ lọc nâng cao"
            >
              <FadersHorizontal size={20} weight={showFilters ? "fill" : "bold"} />
              <span className={styles.btnText}>Bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mood Chips / Quick Suggestions */}
      <div className={styles.moodSuggestions}>
        {moodTags.map(tag => (
          <button
            key={tag.id}
            className={`${styles.moodChip} ${selectedTags.includes(tag.id) ? styles.active : ''}`}
            onClick={() => onTagToggle(tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnifiedSearch;
