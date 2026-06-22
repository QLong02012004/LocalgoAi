import React from "react";
import { MagnifyingGlass, Bell, Plus, List } from "@phosphor-icons/react";
import styles from "./TopBar.module.scss";

const TopBar: React.FC = () => {
  return (
    <header className={styles.topBar}>
      <div className={styles.leftActions}>
        <div className={styles.searchBox}>
          <MagnifyingGlass size={20} weight="bold" />
          <input type="text" placeholder="Tìm kiếm hành trình, địa điểm..." />
        </div>
      </div>

      <div className={styles.topbarActions}>
        <button className={styles.iconBtn} title="Thông báo">
          <div>
            <Bell size={22} weight="fill" />
          </div>{" "}
          <span className={styles.notiDot}></span>
        </button>
        <button className={styles.btnCreate}>
          <Plus size={20} weight="bold" />
          <span>Tạo mới</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
