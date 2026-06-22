import React, { useState } from "react";
import styles from "./SettingsView.module.scss";
import {
  User,
  ShieldCheck,
  GlobeHemisphereWest,
  Key,
  CloudArrowUp,
  FloppyDisk,
  DeviceMobile,
  Lock,
  Envelope,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  } as const;

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  } as const;

  const tabContentVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2 },
  } as const;

  return (
    <motion.div
      className={styles.contentArea}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Cài đặt hệ thống</h2>
          <p>
            Quản lý hồ sơ cá nhân, cấu hình bảo mật và tùy chỉnh trải nghiệm
            quản trị
          </p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.btnPrimary}>
            <FloppyDisk size={18} weight="bold" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.tabGroup}>
            {[
              { id: "profile", icon: User, label: "Hồ sơ cá nhân" },
              {
                id: "security",
                icon: ShieldCheck,
                label: "Bảo mật & Tài khoản",
              },
              {
                id: "system",
                icon: GlobeHemisphereWest,
                label: "Cấu hình hệ thống",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className={styles.tabInner}>
                  <tab.icon
                    size={16}
                    weight={activeTab === tab.id ? "fill" : "regular"}
                  />
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={tabContentVariants.transition}
          className={styles.settingsCard}
        >
          {activeTab === "profile" && (
            <div className={styles.profileLayout}>
              <div className={styles.avatarContainer}>
                <img
                  src="https://i.pravatar.cc/200?u=admin"
                  alt="Current Avatar"
                  className={styles.avatar}
                />
                <button
                  type="button"
                  className={styles.uploadBtn}
                  title="Tải ảnh lên"
                  aria-label="Tải ảnh lên"
                >
                  <CloudArrowUp size={20} weight="bold" />
                </button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Họ và tên</label>
                  <input
                    id="fullName"
                    type="text"
                    defaultValue="Quản trị viên"
                    title="Họ và tên"
                    placeholder="Họ và tên"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Vai trò</label>
                  <input
                    id="role"
                    type="text"
                    defaultValue="Super Admin"
                    title="Vai trò"
                    placeholder="Vai trò"
                    disabled
                    className={styles.input}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="email">Địa chỉ Email</label>
                  <div className={styles.inputWrapper}>
                    <Envelope size={18} className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      defaultValue="admin@travelai.com"
                      title="Địa chỉ Email"
                      placeholder="Địa chỉ Email"
                      className={`${styles.input} ${styles.withIcon}`}
                    />
                  </div>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="bio">Giới thiệu tiểu sử</label>
                  <textarea
                    id="bio"
                    rows={4}
                    defaultValue="Quản trị viên cấp cao của hệ thống Travel AI, phụ trách điều hành và giám sát toàn bộ hoạt động của ứng dụng."
                    title="Giới thiệu tiểu sử"
                    placeholder="Giới thiệu tiểu sử"
                    className={styles.textarea}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className={styles.securitySection}>
              <h3 className={styles.sectionTitle}>Thay đổi mật khẩu</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••••••"
                        title="Mật khẩu hiện tại"
                        className={`${styles.input} ${styles.withIcon}`}
                      />
                    </div>
                  </div>
                  <div />
                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        title="Mật khẩu mới"
                        className={`${styles.input} ${styles.withIcon}`}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        title="Xác nhận mật khẩu"
                        className={`${styles.input} ${styles.withIcon}`}
                      />
                    </div>
                  </div>
                </div>

                <hr className={styles.divider} />

                <div>
                  <h3 className={styles.sectionTitle}>Bảo mật 2 lớp (2FA)</h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      marginBottom: "20px",
                    }}
                  >
                    Tăng cường bảo mật cho tài khoản của bạn bằng cách yêu cầu
                    mã xác minh mỗi khi đăng nhập.
                  </p>
                  <div className={styles.twoFactorCard}>
                    <div className={styles.twoFactorInfo}>
                      <div className={styles.iconBox}>
                        <DeviceMobile size={24} weight="bold" />
                      </div>
                      <div>
                        <p className={styles.title}>
                          Xác thực qua thiết bị di động
                        </p>
                        <p className={styles.desc}>
                          Sử dụng các ứng dụng như Google Authenticator.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      style={{
                        background: "#f1f5f9",
                        color: "#0f172a",
                        boxShadow: "none",
                      }}
                    >
                      Kích hoạt ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className={styles.systemSection}>
              <h3 className={styles.sectionTitle}>Cấu hình hệ thống</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "28px",
                }}
              >
                <div className={styles.settingRow}>
                  <div className={styles.labelBox}>
                    <p className={styles.title}>
                      Chế độ bảo trì (Maintenance Mode)
                    </p>
                    <p className={styles.desc}>
                      Tạm dừng tất cả các hoạt động trên ứng dụng phía người
                      dùng.
                    </p>
                  </div>
                  <div className={styles.toggle}>
                    <div className={styles.knob}></div>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.labelBox}>
                    <p className={styles.title}>Thông báo hệ thống</p>
                    <p className={styles.desc}>
                      Gửi thông báo đẩy về các sự kiện quan trọng trong hệ
                      thống.
                    </p>
                  </div>
                  <div className={`${styles.toggle} ${styles.active}`}>
                    <div className={styles.knob}></div>
                  </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.formGroup}>
                  <label htmlFor="apiKey">API Gateway Key</label>
                  <div className={styles.apiKeyContainer}>
                    <div style={{ flex: 1 }} className={styles.inputWrapper}>
                      <Key size={18} className={styles.inputIcon} />
                      <input
                        id="apiKey"
                        type="password"
                        defaultValue="AI_TRAVEL_API_SECRET_PLATFORM_KEY_2024"
                        title="API Gateway Key"
                        placeholder="API Gateway Key"
                        disabled
                        className={`${styles.input} ${styles.withIcon}`}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      style={{ padding: "0 20px" }}
                    >
                      Hiển thị
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsView;
