import React from "react";
import styles from "./Hero.module.scss";
import type { DropdownContentProps } from "./Hero.types";

const DropdownContent: React.FC<DropdownContentProps> = ({ show, children, className = "" }) => (
  <div className={`${styles.suggestionsDropdown} ${show ? styles.show : ""} ${className}`}>
    {children}
  </div>
);

export default DropdownContent;
