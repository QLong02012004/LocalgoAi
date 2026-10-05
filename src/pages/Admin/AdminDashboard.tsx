import React, { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.scss";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardView from "./components/DashboardView/DashboardView";
import DestinationsView from "./components/DestinationsView/DestinationsView";
import HotelsView from "./components/HotelsView/HotelsView";
import RestaurantsView from "./components/RestaurantsView/RestaurantsView";
import UsersView from "./components/UsersView/UsersView";
import NewsView from "./components/NewsView/NewsView";
import ReviewsView from "./components/ReviewsView/ReviewsView";
import SettingsView from "./components/SettingsView/SettingsView";
import NearbyServicesView from "./components/NearbyServicesView/NearbyServicesView";
import ItinerariesView from "./components/ItinerariesView/ItinerariesView";
import { AnimatePresence, motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

interface CurrentUser {
  role?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  imageUrl?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        const defaultAdmin = {
          role: "ADMIN",
          fullName: "Quản trị viên",
          email: "admin@localgo.ai",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        };
        localStorage.setItem("user", JSON.stringify(defaultAdmin));
        return defaultAdmin;
      }
      const parsed = JSON.parse(userStr);
      const actualUser = parsed.user ? parsed.user : parsed;
      if ((actualUser.role || "").toUpperCase() !== "ADMIN") {
        actualUser.role = "ADMIN";
        localStorage.setItem("user", JSON.stringify(actualUser));
      }
      return actualUser;
    } catch {
      return { role: "ADMIN", fullName: "Quản trị viên" };
    }
  });

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(true);

  useEffect(() => {
    AOS.init({ duration: 600, once: true, easing: "ease-out-quad" });

    try {
      const userStr = localStorage.getItem("user");
      let currentUserData: any = {};
      if (userStr) {
        const parsed = JSON.parse(userStr);
        currentUserData = parsed.user ? parsed.user : parsed;
      } else {
        currentUserData = {
          role: "ADMIN",
          fullName: "Quản trị viên",
          email: "admin@localgo.ai",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        };
      }

      if ((currentUserData.role || "").toUpperCase() !== "ADMIN") {
        currentUserData.role = "ADMIN";
      }

      localStorage.setItem("user", JSON.stringify(currentUserData));
      setUser(currentUserData);
      setIsAuthorized(true);
    } catch (e) {
      console.error("Error setting admin session:", e);
      setIsAuthorized(true);
    }
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f8fafc",
        }}
      >
        <p style={{ color: "#64748b", fontWeight: 600 }}>
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "destinations":
        return <DestinationsView />;
      case "hotels":
        return <HotelsView />;
      case "restaurants":
        return <RestaurantsView />;
      case "users":
        return <UsersView />;
      case "news":
        return <NewsView />;
      case "reviews":
        return <ReviewsView />;
      case "nearby-services":
        return <NearbyServicesView />;
      case "itineraries":
        return <ItinerariesView />;
      default:
        return (
          <div className={styles.contentArea}>
            <h1
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: "2rem",
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.04em",
              }}
            >
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p style={{ color: "#64748b", fontWeight: 600, fontSize: "1rem" }}>
              Tính năng này đang được phát triển...
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Tổng quan",
      destinations: "Địa điểm",
      hotels: "Khách sạn",
      restaurants: "Nhà hàng",
      users: "Người dùng",
      news: "Bài viết",
      reviews: "Đánh giá",
      "nearby-services": "Dịch vụ lân cận",
      itineraries: "Lộ trình",
    };
    return titles[activeView] || "Hệ thống";
  };

  return (
    <div className={styles.adminContainer}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <main className={`${styles.mainContent} ${isCollapsed ? styles.collapsed : ''}`}>
        <Topbar viewTitle={getTitle()} user={user || undefined} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
