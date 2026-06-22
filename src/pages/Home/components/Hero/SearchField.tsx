import React from "react";
import styles from "./Hero.module.scss";
import type { SearchFieldProps } from "./Hero.types";

const SearchField: React.FC<SearchFieldProps> = ({ 
  label, icon, children, className = "", innerRef, onClick 
}) => (
  <div ref={innerRef} className={`${styles.searchField} ${className}`} onClick={onClick}>
    <div className={styles.fieldIcon}>{icon}</div>
    <div className={styles.fieldInfo}>
      <label>{label}</label>
      {children}
    </div>
  </div>
);

export default SearchField;
