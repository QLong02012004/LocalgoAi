import React, { useState } from "react";
import styles from "./ProfileForm.module.scss";
import type { UserProfile } from "../../types";
import {
  UserCircle,
  LockKey,
  User,
  Phone,
  MapPin,
  Key,
  Check,
  ShieldCheck,
  WarningCircle,
  CircleNotch,
  Eye,
  EyeSlash,
} from "phosphor-react";
import { useProfileForm } from "./hooks/useProfileForm";

interface ProfileFormProps {
  title: string;
  mode: "info" | "password";
  profile?: UserProfile;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ title, mode, profile }) => {
  const {
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isLoading,
    errors,
    handleSubmit,
  } = useProfileForm(mode);

  return (
    <div
      className={styles.sectionCard}
      id={mode === "info" ? "profile-info-section" : "profile-password-section"}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          {mode === "info" ? (
            <UserCircle weight="fill" />
          ) : (
            <LockKey weight="fill" />
          )}
        </div>
        <div className={styles.cardHeaderText}>
          <h3>{title}</h3>
          <p>
            {mode === "info"
              ? "Quản lý thông tin cá nhân của bạn"
              : "Cập nhật mật khẩu để bảo vệ tài khoản"}
          </p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "info" ? (
          <div className={styles.formContent}>
            <div className={styles.fieldSection}>
              <h4 className={styles.sectionTitle}>
                <i className="ph-bold ph-identification-card"></i> Thông tin cơ bản
              </h4>
              <div className={styles.fieldsGrid}>
                <div className={`${styles.formGroup} ${errors.fullName ? styles.hasError : ""}`}>
                  <label>Họ và tên</label>
                  <div className={styles.inputWrapper}>
                    <User weight="bold" />
                    <input
                      type="text"
                      name="fullName"
                      defaultValue={profile?.fullName || ""}
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  {errors.fullName && (
                    <span className={styles.errorText}>
                      <WarningCircle weight="fill" /> {errors.fullName}
                    </span>
                  )}
                </div>

                <div className={`${styles.formGroup} ${errors.phone ? styles.hasError : ""}`}>
                  <label>Số điện thoại</label>
                  <div className={styles.inputWrapper}>
                    <Phone weight="bold" />
                    <input
                      type="text"
                      name="phone"
                      defaultValue={profile?.phone || ""}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  {errors.phone && (
                    <span className={styles.errorText}>
                      <WarningCircle weight="fill" /> {errors.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.fieldSection}>
              <h4 className={styles.sectionTitle}>
                <i className="ph-bold ph-address-book"></i> Liên hệ & Giới thiệu
              </h4>
              <div className={styles.fieldsGrid}>
                <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                  <label>Địa chỉ</label>
                  <div className={styles.inputWrapper}>
                    <MapPin weight="bold" />
                    <input
                      type="text"
                      name="address"
                      defaultValue={profile?.address || ""}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                  <label>Giới thiệu bản thân</label>
                  <textarea
                    name="bio"
                    rows={4}
                    defaultValue={profile?.bio || ""}
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.passwordFields}>
            <div className={`${styles.formGroup} ${errors.old_password ? styles.hasError : ""}`}>
              <label>Mật khẩu hiện tại</label>
              <div className={styles.inputWrapper}>
                <Key weight="bold" />
                <input
                  type={showCurrent ? "text" : "password"}
                  name="old_password"
                  placeholder="********"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={
                    showCurrent ? "Hide current password" : "Show current password"
                  }
                >
                  {showCurrent ? <EyeSlash weight="bold" /> : <Eye weight="bold" />}
                </button>
              </div>
              {errors.old_password && (
                <span className={styles.errorText}>
                  <WarningCircle weight="fill" /> {errors.old_password}
                </span>
              )}
            </div>
            <div className={styles.passwordRow}>
              <div className={`${styles.formGroup} ${errors.newPassword ? styles.hasError : ""}`}>
                <label>Mật khẩu mới</label>
                <div className={styles.inputWrapper}>
                  <Key weight="bold" />
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? "Hide new password" : "Show new password"}
                  >
                    {showNew ? <EyeSlash weight="bold" /> : <Eye weight="bold" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className={styles.errorText}>
                    <WarningCircle weight="fill" /> {errors.newPassword}
                  </span>
                )}
              </div>
              <div className={`${styles.formGroup} ${errors.confirmPassword ? styles.hasError : ""}`}>
                <label>Xác nhận mật khẩu</label>
                <div className={styles.inputWrapper}>
                  <ShieldCheck weight="bold" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={
                      showConfirm ? "Hide confirm password" : "Show confirm password"
                    }
                  >
                    {showConfirm ? <EyeSlash weight="bold" /> : <Eye weight="bold" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.errorText}>
                    <WarningCircle weight="fill" /> {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.formFooter}>
          <button
            type="submit"
            disabled={isLoading}
            className={mode === "info" ? styles.btnPrimary : styles.btnSecondary}
          >
            {isLoading ? (
              <>
                <CircleNotch weight="bold" className={styles.spinner} /> Đang xử lý...
              </>
            ) : mode === "info" ? (
              <>
                <Check weight="bold" /> Lưu thay đổi
              </>
            ) : (
              <>
                <ShieldCheck weight="bold" /> Cập nhật mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
