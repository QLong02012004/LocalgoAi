import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "./Dashboard.module.scss";

// Import các Components con
import Sidebar from "./components/Sidebar/Sidebar";
import ClockStation from "./components/ClockStation/ClockStation";
import JourneyMap from "./components/JourneyMap/JourneyMap";
import AIInsightCard from "./components/AIInsightCard/AIInsightCard";
import BudgetAnalysis from "./components/BudgetAnalysis/BudgetAnalysis";
import TripCard from "./components/TripCard/TripCard";
import AddTripCard from "./components/AddTripCard/AddTripCard";
import FavoritePlaces from "./components/FavoritePlaces/FavoritePlaces";
import UserReviews from "../Profile/components/UserReviews/UserReviews";
import WeatherDashboard from "./components/WeatherDashboard/WeatherDashboard";

// Import Types
import type { TripPlan } from "./types";
import { getUserItineraries, type GeneratedItinerary } from "../../services/itineraryService";
import { getUserReviews } from "../../services/reviewService";
import instance from "../../utils/AxiosCustomize";
import type { BackendResponse } from "../../types/backend";
import { Calendar, Heart, ChatCircleText, SquaresFour } from "@phosphor-icons/react";
import { useSearchParams } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"itineraries" | "favorites" | "reviews" | "weather">("itineraries");

  // Sync tab with URL query param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "favorites" || tabParam === "reviews" || tabParam === "itineraries" || tabParam === "weather") {
      setActiveTab(tabParam as any);
    } else if (!tabParam) {
      setActiveTab("itineraries");
    }
  }, [searchParams]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchDashboardData();
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const tabs = [
    { id: "itineraries", label: "Lịch trình của tôi", icon: <Calendar size={20} /> },
    { id: "favorites", label: "Địa điểm yêu thích", icon: <Heart size={20} /> },
    { id: "reviews", label: "Lịch sử đánh giá", icon: <ChatCircleText size={20} /> },
  ];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem("user");
      let userId: string | number = "1";
      if (userStr) {
        userId = (JSON.parse(userStr) as { id: number }).id;
      }

      // Parallel data fetching
      const [itineraryRes, reviewsRes, favoritesRes] = await Promise.all([
        getUserItineraries(userId.toString()),
        getUserReviews(Number(userId)),
        instance.get<BackendResponse<any>>("/favorites?page=0&size=1") // Just get count
      ]);

      // 1. Handle Itineraries
      if (itineraryRes.data.status === 200 && Array.isArray(itineraryRes.data.data)) {
        const mappedTrips: TripPlan[] = itineraryRes.data.data.map((item: GeneratedItinerary) => ({
          id: item.itineraryId,
          title: item.title,
          dateRange: `${item.startDate} (${item.days} ngày)`,
          days: item.days,
          people: 1,
          image: item.hotels?.[0]?.imageUrl || "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800",
          status: "upcoming",
          checklist: [
            { id: "c1", label: "Vé tham quan", isCompleted: true },
            { id: "c2", label: "Khách sạn", isCompleted: true },
          ],
          raw: item
        }));
        setTrips(mappedTrips);
      }

      // 2. Handle Reviews Count
      if (reviewsRes.data && (reviewsRes.data.status === 200 || reviewsRes.data.status === 201)) {
        const rawData = reviewsRes.data.data;
        if (Array.isArray(rawData)) {
          setReviewsCount(rawData.length);
        } else if (rawData && typeof rawData === "object") {
          const total = (rawData as any).totalElements ?? (rawData as any).page?.totalElements;
          if (total !== undefined) {
            setReviewsCount(total);
          } else if (Array.isArray((rawData as any).content)) {
            setReviewsCount((rawData as any).content.length);
          }
        }
      }

      // 3. Handle Favorites Count
      if (favoritesRes.data && (favoritesRes.data.status === 200 || favoritesRes.data.status === 201)) {
        const rawData = favoritesRes.data.data;
        if (Array.isArray(rawData)) {
          setFavoritesCount(rawData.length);
        } else if (rawData && typeof rawData === "object") {
          const total = (rawData as any).totalElements ?? (rawData as any).page?.totalElements;
          if (total !== undefined) {
            setFavoritesCount(total);
          } else if (Array.isArray((rawData as any).content)) {
            setFavoritesCount((rawData as any).content.length);
          }
        }
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderContent = () => {
    switch (activeTab) {
      case "weather":
        return {
          title: "Dự báo thời tiết",
          subtitle: "Theo dõi điều kiện thời tiết tại các điểm đến của bạn",
          count: null,
          suffix: ""
        };
      case "favorites":
        return {
          title: "Địa điểm yêu thích",
          subtitle: `Bạn đã lưu `,
          count: favoritesCount,
          suffix: " địa điểm vào danh sách"
        };
      case "reviews":
        return {
          title: "Lịch sử đánh giá",
          subtitle: `Bạn đã chia sẻ `,
          count: reviewsCount,
          suffix: " đánh giá với cộng đồng"
        };
      default:
        return {
          title: "Quản lý lịch trình",
          subtitle: `Bạn có `,
          count: trips.length,
          suffix: " chuyến đi đang được quản lý"
        };
    }
  };

  const header = getHeaderContent();

  return (
    <div className={`${styles.dashboardLayout} ${isSidebarCollapsed ? styles.collapsed : ""}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      <main className={styles.mainContent}>
        <div className={`${styles.pageContent} ${activeTab === "weather" ? styles.weatherPage : ""}`}>
          {activeTab === "itineraries" && (
            <>
              {/* Row 1: Clock & Map */}
              <div className={styles.topRow}>
                <div className={styles.clockCol}>
                  <ClockStation />
                </div>
                <div className={styles.mapCol}>
                  <JourneyMap />
                </div>
              </div>

              <div className={styles.midRow}>
                <AIInsightCard />
                <BudgetAnalysis />
              </div>
            </>
          )}

          {/* Unified Management Header */}
          {activeTab !== "weather" && (
            <div className={styles.sectionHeader}>
              <div className={styles.headerTitle}>
                <h2>{header.title}</h2>
                <p>
                  {header.subtitle} {header.count !== null && <span>{header.count}</span>} {header.suffix}
                </p>
              </div>

              {activeTab === "itineraries" && (
                <div className={styles.tripFilters}>
                  <button className={`${styles.filterBtn} ${styles.active}`}>
                    Tất cả
                  </button>
                  <button className={styles.filterBtn}>Sắp tới</button>
                  <button className={styles.filterBtn}>Đã đi</button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content Rendering */}
          <div className={styles.tabContentArea}>
            {activeTab === "itineraries" && (
              <div className={styles.tripGrid}>
                {isLoading ? (
                  <div className={styles.loading}>Đang tải lộ trình của bạn...</div>
                ) : (
                  <>
                    {trips.map((trip) => (
                      <TripCard key={trip.id} data={trip} />
                    ))}
                    <AddTripCard />
                  </>
                )}
              </div>
            )}

            {activeTab === "favorites" && <FavoritePlaces />}
            
            {activeTab === "reviews" && (
              <div className={styles.reviewsWrapper}>
                <UserReviews />
              </div>
            )}

            {activeTab === "weather" && <WeatherDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
