import React from "react";
import styles from "./StatusState.module.scss";

interface StatusStateProps {
  type: "empty" | "error";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

const StatusState: React.FC<StatusStateProps> = ({
  type,
  title,
  description,
  icon,
  onRetry,
  className = "",
}) => {
  const isError = type === "error";
  
  // Default values
  const defaultTitle = isError ? "Rất tiếc, đã có lỗi xảy ra" : "Không tìm thấy dữ liệu";
  const defaultDesc = isError 
    ? "Chúng tôi không thể kết nối với máy chủ lúc này. Vui lòng thử lại sau."
    : "Hiện tại hệ thống chưa có dữ liệu cho mục này. Hãy quay lại sau nhé!";
  const defaultIcon = isError 
    ? <i className="ph-bold ph-warning-circle"></i>
    : <i className="ph-bold ph-magnifying-glass"></i>;

  return (
    <div className={`${styles.statusContainer} ${isError ? styles.error : styles.empty} ${className}`}>
      <div className={styles.iconWrapper}>
        {icon || defaultIcon}
      </div>
      <h4>{title || defaultTitle}</h4>
      <p>{description || defaultDesc}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          <i className="ph-bold ph-arrows-clockwise"></i> THỬ LẠI NGAY
        </button>
      )}
    </div>
  );
};

export default StatusState;
