import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import {
  House,
  SquaresFour,
  Compass,
  Star,
  SignOut,
  CaretUp,
  CaretDown,
  ArrowSquareOut,
  Sun,
  Moon,
  CaretLeft,
  CaretRight,
  Heart,
  ChatCircleText
} from "@phosphor-icons/react";
import { logo, anhmatdinh } from "../../../../assets/images/img";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import ProtectedImage from "../../../../components/ProtectedImage/ProtectedImage";
import { useTheme } from "../../../../context/ThemeContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const location = useLocation();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { theme, toggleTheme } = useTheme();

  const mainMenuItems = [
    { icon: SquaresFour, label: "Bảng điều khiển", path: "/dashboard" },
    { icon: Sun, label: "Thời tiết", path: "/dashboard?tab=weather" },
    { icon: Heart, label: "Địa điểm yêu thích", path: "/dashboard?tab=favorites" },
    { icon: ChatCircleText, label: "Lịch sử đánh giá", path: "/dashboard?tab=reviews" },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Brand Logo Section removed */}
      <div className={styles.brandContainer}>
        {!isCollapsed && <h1 className={styles.pageTitle}>DASHBOARD</h1>}
        <button className={styles.collapseBtn} onClick={onToggle}>
          {isCollapsed ? <CaretRight size={18} weight="bold" /> : <CaretLeft size={18} weight="bold" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        <div className={styles.navSectionTitle}>{isCollapsed ? "•••" : "MENU CHÍNH"}</div>
        {mainMenuItems.map((item, index) => {
          const isActive = (location.pathname + location.search) === item.path || 
                          (location.pathname === item.path && !location.search);
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon size={22} weight={isActive ? "bold" : "regular"} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className={styles.navSectionTitle}>{isCollapsed ? "•••" : "HỆ THỐNG"}</div>
        
        <Link to="/" className={styles.navItem} title={isCollapsed ? "Về trang chủ chính" : ""}>
           <ArrowSquareOut size={22} weight="regular" />
           {!isCollapsed && <span>Về trang chủ chính</span>}
        </Link>

        <div className={styles.navItem} onClick={toggleTheme} style={{ cursor: 'pointer' }} title={isCollapsed ? "Chế độ Sáng/Tối" : ""}>
           {theme === "light" ? (
             <Moon size={22} weight="regular" />
           ) : (
             <Sun size={22} weight="regular" />
           )}
           {!isCollapsed && <span>Chế độ {theme === "light" ? "Tối" : "Sáng"}</span>}
        </div>

        <Link 
          to="/auth" 
          className={`${styles.navItem} ${styles.btnLogout}`}
          onClick={() => {
            localStorage.clear();
          }}
          title={isCollapsed ? "Đăng xuất" : ""}
        >
          <SignOut size={22} weight="regular" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </Link>
      </nav>

      {/* User Profile Footer */}
      <div className={styles.userProfile}>
        <div
          className={styles.userTrigger}
          onClick={() => !isCollapsed && setIsUserOpen(!isUserOpen)}
        >
          <div className={styles.avatarWrapper}>
            <ProtectedImage
              src={userInfo?.avatarUrl || ""}
              alt="User Avatar"
              fallbackSrc={anhmatdinh}
            />
            <span className={styles.statusDot}></span>
          </div>
          {!isCollapsed && (
            <>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userInfo?.fullName || "Khách"}</span>
                <span className={styles.userRole}>{userInfo?.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}</span>
              </div>
              <CaretUp 
                size={16} 
                weight="bold" 
                className={`${styles.caret} ${isUserOpen ? styles.open : ""}`} 
              />
            </>
          )}
        </div>

        {isUserOpen && !isCollapsed && (
          <div className={styles.dropdownMenu}>
            <Link to="/profile">Hồ sơ cá nhân</Link>
            <Link to="/planner">Kế hoạch của tôi</Link>
            <div className={styles.divider}></div>
            <Link to="/auth" className={styles.logoutItem} onClick={() => localStorage.clear()}>
              Thoát tài khoản
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
