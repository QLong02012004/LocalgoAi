import React from 'react';
import styles from './FilterBar.module.scss';
import { MapPin, Tag, CurrencyCircleDollar } from "@phosphor-icons/react";
import ThreeDSearchInput from '../../../../components/Ui/ThreeDSearchInput/ThreeDSearchInput';
import CustomDropdown from '../../../../components/Ui/CustomDropdown/CustomDropdown';

interface FilterBarProps {
  searchTerm: string;
  activeTab: string;
  provinceValue: string;
  categoryValue: string;
  priceValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProvinceChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  searchTerm, 
  activeTab,
  provinceValue,
  categoryValue,
  priceValue,
  onSearchChange,
  onProvinceChange,
  onPriceRangeChange,
  onCategoryChange,
  selectedTags,
  onTagToggle
}) => {
  const provinceOptions = [
    { value: "all", label: "Toàn bộ khu vực" },
    { value: "1", label: "Thừa Thiên Huế" },
    { value: "2", label: "Đà Nẵng" },
    { value: "3", label: "Quảng Nam" },
  ];
 
  const getCategoryOptions = () => {
    if (activeTab === "bed") {
      return [
        { value: "all", label: "#TấtCả", color: "#64748b" },
        { value: "LUXURY", label: "#CaoCấpLuxury", color: "#fb7185" },
        { value: "RESORT", label: "#ResortNghỉDưỡng", color: "#33d7d1" },
        { value: "BOUTIQUE", label: "#BoutiquePhongCách", color: "#a78bfa" },
        { value: "BUDGET", label: "#BìnhDânGiáRẻ", color: "#f59e0b" },
        { value: "BUSINESS", label: "#CôngTácBusiness", color: "#60a5fa" },
        { value: "HOMESTAY", label: "#Homestay", color: "#34d399" },
        { value: "VILLA", label: "#VillaBiệtThự", color: "#ec4899" },
      ];
    }
    
    if (activeTab === "food") {
      return [
        { value: "all", label: "#TấtCả", color: "#64748b" },
        { value: "VIETNAMESE", label: "#MónViệt", color: "#f59e0b" },
        { value: "SEAFOOD", label: "#HảiSản", color: "#33d7d1" },
        { value: "DESSERT", label: "#TrángMiệngCafe", color: "#fb7185" },
        { value: "WESTERN", label: "#MónÂu", color: "#a78bfa" },
        { value: "ASIAN", label: "#MónÁ", color: "#60a5fa" },
        { value: "VEGETARIAN", label: "#ĐồChay", color: "#34d399" },
      ];
    }
    
    if (activeTab === "pin") {
      return [
        { value: "all", label: "#TấtCả", color: "#64748b" },
        { value: "CULTURE", label: "#VănHóaLịchSử", color: "#f59e0b" },
        { value: "NATURE", label: "#ThiênNhiênCảnhSắc", color: "#34d399" },
        { value: "ATTRACTION", label: "#ĐiểmThamQuan", color: "#33d7d1" },
        { value: "RELAX", label: "#NghỉDưỡngThưGiãn", color: "#fb7185" },
        { value: "ENTERTAINMENT", label: "#VuiChơiGiảiTrí", color: "#a78bfa" },
      ];
    }
 
    return [
      { value: "all", label: "#TấtCả", color: "#64748b" },
      { value: "resort", label: "#ResortLuxury", color: "#33d7d1" },
      { value: "hotel", label: "#KháchSạn", color: "#60a5fa" },
      { value: "restaurant", label: "#NhàHàng", color: "#f59e0b" },
      { value: "cafe", label: "#Cafe", color: "#fb7185" },
      { value: "attraction", label: "#ĐiểmThamQuan", color: "#34d399" },
    ];
  };
 
  const categoryOptions = getCategoryOptions();
 
  const priceOptions = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "budget", label: "Tiết kiệm (< 500k)" },
    { value: "mid", label: "Phổ thông (500k-2tr)" },
    { value: "luxury", label: "Cao cấp (> 2tr)" },
  ];
 
  return (
    <div className={styles.filterBar}>
      <div className={styles.mainFilters}>
        <div className={styles.searchSide}>
          <div className={styles.aiBadge}>AI Powered</div>
          <ThreeDSearchInput 
            value={searchTerm} 
            onChange={onSearchChange} 
            placeholder="Tìm kiếm tên địa điểm..." 
          />
        </div>
        
        <div className={styles.selectSide}>
          <CustomDropdown 
            options={provinceOptions} 
            value={provinceValue} 
            onChange={onProvinceChange}
            icon={<MapPin weight="fill" color="#ef4444" />}
          />
          
          <CustomDropdown 
            options={priceOptions} 
            value={priceValue} 
            onChange={onPriceRangeChange} 
            icon={<CurrencyCircleDollar weight="fill" color="#10b981" />}
          />
        </div>
      </div>
 
      <div className={styles.quickTagsSection}>
         <span className={styles.tagLabel}>Gợi ý cho bạn:</span>
         <div className={styles.tagsContainer}>
            {categoryOptions.map(option => {
               const isActive = categoryValue === option.value || (option.value === 'all' && (!categoryValue || categoryValue === 'all'));
               return (
                  <button 
                     key={option.value}
                     className={`${styles.tagBtn} ${isActive ? styles.active : ''}`}
                     onClick={() => {
                        if (categoryValue === option.value) {
                           onCategoryChange("all");
                        } else {
                           onCategoryChange(option.value);
                        }
                     }}
                     style={{ '--tag-color': option.color } as React.CSSProperties}
                  >
                     {option.label}
                  </button>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default FilterBar;