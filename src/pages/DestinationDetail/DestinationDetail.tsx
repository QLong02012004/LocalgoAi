import React from "react";
import "aos/dist/aos.css";

// Import các Component con
import styles from "./DestinationDetail.module.scss";
import DestHero from "./components/DestHero/DestHero";
import QuickStats from "./components/QuickStats/QuickStats";
import DestTabs from "./components/DestTabs/DestTabs";
import OverviewTab from "./components/OverviewTab/OverviewTab";
import Sidebar from "./components/Sidebar/Sidebar";
import ServicesTab from "./components/ServicesTab/ServicesTab";
import ReviewsTab from "./components/ReviewsTab/ReviewsTab";
import TipsTab from "./components/TipsTab/TipsTab";
import HighlightLocations from "../Home/components/HighlightLocations/HighlightLocations";
import StatusState from "../../components/Ui/StatusState/StatusState";

import { useDestinationDetail } from "./hooks/useDestinationDetail";

const DestinationDetail: React.FC = () => {
  const {
    data,
    isLoading,
    activeTab,
    setActiveTab,
    normalizedServices
  } = useDestinationDetail();

  if (isLoading) return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner}></div>
      <p>Đang tải dữ liệu địa điểm...</p>
    </div>
  );
  
  if (!data) return (
    <div className={styles.errorWrapper}>
      <StatusState 
        type="error" 
        title="Không tìm thấy địa điểm" 
        description="Có thể địa điểm này đã bị gỡ bỏ hoặc link không chính xác."
        onRetry={() => window.location.reload()}
      />
    </div>
  );

  return (
    <main className={styles.destMain}>
      <DestHero data={data} />
      <QuickStats data={data} />
      <DestTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={styles.destContentGrid}>
        <div className={styles.destLeft}>
          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "services" && (
            <ServicesTab 
              services={normalizedServices} 
              targetId={data.id}
              targetType={window.location.pathname.includes('/hotel/') ? 'hotel' : window.location.pathname.includes('/restaurant/') ? 'restaurant' : 'attraction'}
            />
          )}
          {activeTab === "reviews" && <ReviewsTab reviews={data.reviewsData} />}
          {activeTab === "tips" && <TipsTab tips={data.travelTips} />}
        </div>
        
        <Sidebar data={data} />
      </div>

      <HighlightLocations
        titlePrimary="Địa điểm"
        titleHighlight="liên quan"
        description={`Những địa điểm tương tự như ${data.name} dành cho bạn.`}
      />
    </main>
  );
};

export default DestinationDetail;