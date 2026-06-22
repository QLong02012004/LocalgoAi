import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomDropdown.module.scss";
import { CaretDown } from "@phosphor-icons/react";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "small" | "medium";
  noBorder?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Chọn một tùy chọn...",
  icon,
  className = "",
  size = "medium",
  noBorder = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${styles.dropdownContainer} ${className}`} ref={dropdownRef}>
      <div 
        className={`${styles.dropdownHeader} ${isOpen ? styles.active : ""} ${size === "small" ? styles.small : ""} ${noBorder ? styles.noBorder : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.selectedContent}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={selectedOption ? styles.value : styles.placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <CaretDown 
          size={18} 
          weight="bold" 
          className={`${styles.arrow} ${isOpen ? styles.rotated : ""}`} 
        />
      </div>

      {isOpen && (
        <ul className={styles.optionsList}>
          {options.map((option) => (
            <li 
              key={option.value} 
              className={`${styles.optionItem} ${value === option.value ? styles.selected : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && (
                <div className={styles.checkIcon}>
                  <i className="ph-bold ph-check"></i>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
