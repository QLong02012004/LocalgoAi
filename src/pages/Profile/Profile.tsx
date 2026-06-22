import React from "react";
import "aos/dist/aos.css";
import styles from "./Profile.module.scss";
import ProfileHeader from "./components/ProfileHeader/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs/ProfileTabs";
import ProfileForm from "./components/ProfileForm/ProfileForm";
import ProfileSidebar from "./components/ProfileSidebar/ProfileSidebar";
import UserReviews from "./components/UserReviews/UserReviews";
import { useProfile } from "./hooks/useProfile";

const Profile: React.FC = () => {
  const {
    profile,
    activeTab,
    setActiveTab,
    handleAvatarUpdate,
    handleEditClick,
    showPasswordForm,
    setShowPasswordForm,
  } = useProfile();

  if (!profile)
    return (
      <div className={styles.loadingContainer}>
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className={styles.profilePage}>
      <div className={`${styles.container} ${showPasswordForm ? styles.wide : ""}`}>
        <div data-aos="fade-down">
          <ProfileHeader
            name={profile.fullName}
            email={profile.email}
            badge={profile.badge}
            avatarUrl={profile.avatarUrl}
            coverUrl={profile.coverUrl}
            joinDate={profile.joinDate}
            location={profile.location}
            onAvatarUpdate={handleAvatarUpdate}
            onEditClick={handleEditClick}
          />
        </div>

        <div data-aos="fade-in" data-aos-delay="200">
          <ProfileTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </div>

        <div className={styles.profileGrid}>
          <div
            className={styles.mainContent}
            data-aos="fade-up"
            data-aos-delay="400"
          >
            {activeTab === "info" && (
              <ProfileForm
                title="Cập nhật thông tin"
                mode="info"
                profile={profile}
              />
            )}
            {activeTab === "password" && (
              <ProfileForm title="Đổi mật khẩu" mode="password" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
