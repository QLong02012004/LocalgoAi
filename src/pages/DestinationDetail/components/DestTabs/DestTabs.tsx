import React from "react";
import styles from "./DestTabs.module.scss";

interface DestTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const DestTabs: React.FC<DestTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "services", label: "Dịch vụ" },
    { id: "reviews", label: "Đánh giá" },
    { id: "tips", label: "Mẹo du lịch" },
  ];

  return (
    <div className={styles.destTabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          // Class active sẽ kích hoạt thuộc tính ::after trong CSS
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DestTabs;
