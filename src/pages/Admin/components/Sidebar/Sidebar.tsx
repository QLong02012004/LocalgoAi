import React from 'react';
import styles from './Sidebar.module.scss';
import { motion } from 'framer-motion';
import { 
  Compass, 
  SquaresFour, 
  ForkKnife, 
  BedIcon, 
  Users, 
  Gear, 
  SignOut,
  Article,
  ChatCircleText,
  House,
  ArrowLeft,
  MapTrifold,
  Signpost,
  CaretLeft,
  CaretRight
} from "@phosphor-icons/react";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postLogout } from '../../../../services/userService';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || "";
      await postLogout(refreshToken);
    } catch (error) {
      console.error("Lỗi khi đăng xuất hệ thống:", error);
    } finally {
      localStorage.clear();
      toast.info("Đã đăng xuất khỏi hệ thống quản trị");
      navigate("/");
    }
  };

  const menuGroups = [
    {
      title: 'QUẢN LÝ CHUNG',
      items: [
        { id: 'dashboard', label: 'Tổng Quan', icon: SquaresFour },
        { id: 'users', label: 'Người dùng', icon: Users },
      ]
    },
    {
      title: 'NỘI DUNG DU LỊCH',
      items: [
        { id: 'destinations', label: 'Địa điểm', icon: Compass },
        { id: 'restaurants', label: 'Nhà hàng', icon: ForkKnife },
        { id: 'hotels', label: 'Khách sạn', icon: BedIcon },
      ]
    },
    {
      title: 'DỊCH VỤ & HỆ THỐNG',
      items: [
        { id: 'itineraries', label: 'Lộ trình', icon: Signpost },
        { id: 'news', label: 'Bài viết', icon: Article },
        { id: 'reviews', label: 'Đánh giá', icon: ChatCircleText },
        { id: 'nearby-services', label: 'DV Lân cận', icon: MapTrifold },
      ]
    }
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logoContainer}>
          <Compass size={22} weight="fill" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.logoText}
          >
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>LocalGo</span>
              <span style={{ color: '#A78BFA' }}>Ai</span>
            </h1>
          </motion.div>
        )}
      </div>

      <Link to="/" className={styles.backToHome}>
        <House size={18} weight="fill" />
        {!isCollapsed && <span>Về trang chủ người dùng</span>}
      </Link>

      <nav className={styles.nav}>
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className={styles.navGroup}>
            {!isCollapsed && <h3 className={styles.groupTitle}>{group.title}</h3>}
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`${styles.sidebarItem} ${activeView === item.id ? styles.active : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                {activeView === item.id && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className={styles.activeIndicator} 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={20} weight={activeView === item.id ? "fill" : "regular"} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <SignOut size={20} weight="bold" />
          {!isCollapsed && <span>Đăng xuất hệ thống</span>}
        </button>
        
        <button 
          className={styles.collapseBtn} 
          onClick={onToggleCollapse}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <CaretRight size={18} weight="bold" /> : <CaretLeft size={18} weight="bold" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
