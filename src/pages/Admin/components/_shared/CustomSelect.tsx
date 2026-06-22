import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from 'phosphor-react';
import styles from './CustomSelect.module.scss';

interface Option {
  value: string | number | boolean;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  placeholder?: string;
  label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Chọn một mục...",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number | boolean) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div 
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.triggerContent}>
          {selectedOption?.icon && <span className={styles.icon}>{selectedOption.icon}</span>}
          <span className={selectedOption ? styles.value : styles.placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <CaretDown 
          size={18} 
          weight="bold" 
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`} 
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownInner}>
            {options.map((option) => (
              <div
                key={String(option.value)}
                className={`${styles.option} ${String(option.value) === String(value) ? styles.optionSelected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <div className={styles.optionContent}>
                  {option.icon && <span className={styles.optionIcon}>{option.icon}</span>}
                  <span className={styles.optionLabel}>{option.label}</span>
                </div>
                {String(option.value) === String(value) && (
                  <Check size={16} weight="bold" className={styles.checkIcon} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
