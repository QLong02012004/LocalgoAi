import React from "react";
import styles from "./ThreeDSearchInput.module.scss";

interface ThreeDSearchInputProps {
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const ThreeDSearchInput: React.FC<ThreeDSearchInputProps> = ({ 
  value,
  onChange, 
  placeholder = "Tìm kiếm...",
  className = ""
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.inputContainer}>
        <div className={styles.shadowInput} />
        <button className={styles.inputButtonShadow} type="button">
          <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="20px" width="20px">
            <path d="M4 9a5 5 0 1110 0A5 5 0 014 9zm5-7a7 7 0 104.2 12.6.999.999 0 00.093.107l3 3a1 1 0 001.414-1.414l-3-3a.999.999 0 00-.107-.093A7 7 0 009 2z" fillRule="evenodd" fill="#33d7d1" />
          </svg>
        </button>
        <input 
          type="text" 
          name="text" 
          className={styles.inputSearch} 
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default ThreeDSearchInput;
