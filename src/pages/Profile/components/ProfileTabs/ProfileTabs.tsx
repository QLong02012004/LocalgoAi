import React from 'react';
import styles from './ProfileTabs.module.scss';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeTab, 
  setActiveTab,
}) => {
  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: 'ph-bold ph-user' },
    { id: 'password', label: 'Đổi mật khẩu', icon: 'ph-bold ph-lock-key' },
    { id: 'reviews', label: 'Đánh giá của tôi', icon: 'ph-bold ph-star' },
  ];

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;