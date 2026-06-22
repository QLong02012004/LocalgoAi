import React from "react";
import styles from "./ProfileHeader.module.scss";
import { anhmatdinh, cover as defaultCoverImg } from "../../../../assets/images/img";
import { 
  Camera, 
  CircleNotch, 
  ShareNetwork, 
  Crown, 
  CalendarBlank, 
  MapPin 
} from "@phosphor-icons/react";
import GlossyButton from "../../../../components/Ui/GlossyButton/GlossyButton";

import ProtectedImage from "../../../../components/ProtectedImage/ProtectedImage";

interface Props {
  name: string;
  email: string;
  badge: string;
  avatarUrl: string;
  coverUrl: string;
  joinDate: string;
  location: string;
  onAvatarUpdate?: (newUrl: string) => void;
  onEditClick?: () => void;
}

import { useProfileHeader } from "./hooks/useProfileHeader";

const ProfileHeader: React.FC<Props> = ({
  name,
  email,
  badge,
  avatarUrl,
  coverUrl,
  joinDate,
  location,
  onAvatarUpdate,
  onEditClick,
}) => {
  const { fileInputRef, isUploading, handleFileChange } = useProfileHeader(onAvatarUpdate);

  const defaultAvatar = anhmatdinh;
  const defaultCover = defaultCoverImg;

  return (
    <div className={styles.profileHeaderWrapper}>
      <div className={styles.coverPhoto}>
        <ProtectedImage
          src={coverUrl}
          alt="Cover"
          fallbackSrc={defaultCover}
        />
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className={styles.headerContent}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarWrapper}>
            <ProtectedImage
              src={avatarUrl}
              alt="Avatar"
              className={styles.avatar}
              fallbackSrc={defaultAvatar}
            />
            {isUploading && (
              <div className={styles.uploadOverlay}>
                <CircleNotch size={32} weight="bold" className={styles.spin} />
              </div>
            )}
            <button
              className={styles.changeAvatarBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Thay đổi ảnh"
            >
              <div className={styles.cameraIconWrapper}>
                {isUploading ? (
                  <CircleNotch size={18} weight="bold" className={styles.spin} />
                ) : (
                  <Camera size={18} weight="bold" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className={styles.mainInfo}>
          <div className={styles.titleRow}>
            <div className={styles.nameBlock}>
              <h1>{name}</h1>
              <span className={styles.email}>{email}</span>
            </div>

            <div className={styles.actions}>
              <button className={styles.shareBtn}>
                <ShareNetwork size={18} weight="bold" />
                Chia sẻ
              </button>
              <GlossyButton 
                variant="primary"
                onClick={onEditClick}
              >
                Chỉnh sửa hồ sơ
              </GlossyButton>
            </div>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.badge}>
              <Crown size={16} weight="fill" />
              {badge}
            </div>
            <div className={styles.statItem}>
              <CalendarBlank size={18} weight="bold" />
              Tham gia từ {joinDate}
            </div>
            <div className={styles.statItem}>
              <MapPin size={18} weight="bold" />
              {location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
