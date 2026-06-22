import React from "react";
import styles from "./FilterSection.module.scss";
import type { FilterState } from "../../types";
import { MapPin, Wallet, Users, MagnifyingGlass } from "@phosphor-icons/react";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";

interface Props {
  onFilterChange: (newFilters: FilterState) => void;
  filters: FilterState;
}

const FilterSection: React.FC<Props> = ({ onFilterChange, filters }) => {
  const locationOptions = [
    { value: "all", label: "Tất cả địa điểm" },
    { value: "1", label: "Huế" },
    { value: "2", label: "Đà Nẵng" },
    { value: "3", label: "Quảng Nam" },
  ];

  const priceOptions = [
    { value: "all", label: "Tất cả mức giá" },
    { value: "low", label: "Tiết kiệm (Dưới 2tr)" },
    { value: "mid", label: "Tiêu chuẩn (2tr - 5tr)" },
    { value: "high", label: "Cao cấp (Trên 5tr)" },
  ];

  const handleDropdownChange = (name: string, value: string) => {
    if (name === "location") {
      onFilterChange({
        ...filters,
        location: value,
        provinceId: value === "all" ? undefined : parseInt(value),
      });
    } else {
      onFilterChange({
        ...filters,
        [name]: value,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: parseInt(value) || undefined,
    });
  };

  return (
    <div className={styles.filterWrapper} data-aos="fade-up" data-aos-delay="400">
      <div className={styles.premiumSearchWidget}>
        {/* Điểm đến */}
        <div className={styles.searchField}>
          <div className={styles.fieldIcon}>
            <MapPin size={24} weight="bold" color="#14b8a6" />
          </div>
          <div className={styles.fieldContent}>
            <label>ĐIỂM ĐẾN</label>
            <CustomDropdown
              options={locationOptions}
              value={filters.location}
              onChange={(val) => handleDropdownChange("location", val)}
              placeholder="Bạn muốn đi đâu?"
              noBorder
              className={styles.dropdownCustom}
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Ngân sách */}
        <div className={styles.searchField}>
          <div className={styles.fieldIcon}>
            <Wallet size={24} weight="bold" color="#14b8a6" />
          </div>
          <div className={styles.fieldContent}>
            <label>NGÂN SÁCH</label>
            <CustomDropdown
              options={priceOptions}
              value={filters.priceRange}
              onChange={(val) => handleDropdownChange("priceRange", val)}
              placeholder="Chọn ngân sách..."
              noBorder
              className={styles.dropdownCustom}
            />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Số khách */}
        <div className={styles.searchField}>
          <div className={styles.fieldIcon}>
            <Users size={24} weight="bold" color="#14b8a6" />
          </div>
          <div className={styles.fieldContent}>
            <label>SỐ KHÁCH</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                name="people"
                min="1"
                max="20"
                value={filters.people}
                onChange={handleInputChange}
                className={styles.guestInput}
              />
              <span className={styles.unitText}>Khách</span>
            </div>
          </div>
        </div>

        <button className={styles.btnSearchSubmit} title="Tìm kiếm">
          <MagnifyingGlass size={26} weight="bold" color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
