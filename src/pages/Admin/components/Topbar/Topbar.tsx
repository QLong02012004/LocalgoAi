import React from "react";
import styles from "./Topbar.module.scss";

interface TopbarProps {
  viewTitle: string;
  user?: {
    fullName?: string;
    name?: string;
    avatarUrl?: string;
    imageUrl?: string;
  };
}

const Topbar: React.FC<TopbarProps> = ({ viewTitle, user }) => {
  return (
    <header className={styles.topbar}>
      <h2 className={styles.viewTitle}>{viewTitle}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>


        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <p>Quản trị viên</p>
            <p>{user?.fullName || user?.name || "Admin"}</p>
          </div>
          <img
            src={
              localStorage.getItem("avatar") ||
              user?.avatarUrl ||
              (user as any)?.avatar_url ||
              (user as any)?.avatar ||
              (user as any)?.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.name || "Admin")}&background=random&color=fff`
            }
            alt="Avatar"
            className={styles.avatar}
          />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
