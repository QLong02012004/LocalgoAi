import React from "react";
import styles from "./AdminSearchInput.module.scss";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface AdminSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const AdminSearchInput: React.FC<AdminSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
}) => {
  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <MagnifyingGlass size={20} weight="bold" className={styles.searchIcon} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.searchInput}
      />
    </div>
  );
};

export default AdminSearchInput;
