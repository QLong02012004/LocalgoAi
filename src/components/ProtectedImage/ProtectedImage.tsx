import React, { useEffect, useState } from "react";
import instance from "../../utils/AxiosCustomize";
import styles from "./ProtectedImage.module.scss";

interface ProtectedImageProps {
  src: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({
  src,
  alt = "",
  className = "",
  fallbackSrc,
  onError,
}) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgUrl(fallbackSrc || null);
      return;
    }

    // Nếu là ảnh từ domain khác (cloudinary, unsplash...) 
    // HOẶC là ảnh local assets (Vite dev mode) thì không cần fetch có token
    if (
      (src.startsWith("http") && !src.includes("localhost:8888")) || 
      src.startsWith("/src/") || 
      src.includes("/assets/") ||
      src.startsWith("blob:") ||
      src.startsWith("data:")
    ) {
      setImgUrl(src);
      return;
    }

    let isMounted = true;
    let currentBlobUrl = "";

    const fetchImage = async () => {
      try {
        setIsLoading(true);
        
        // Loại bỏ tiền tố /api/v1 nếu nó đã tồn tại trong src để tránh bị Axios instance nhân đôi
        const apiPrefix = "/api/v1";
        let cleanUrl = src;
        if (src.startsWith(apiPrefix)) {
          cleanUrl = src.substring(apiPrefix.length);
        } else if (src.startsWith(`http://localhost:8888${apiPrefix}`)) {
          cleanUrl = src.substring(`http://localhost:8888${apiPrefix}`.length);
        }

        const response = await instance.get(cleanUrl, { responseType: "blob" });
        
        if (isMounted) {
          if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
          currentBlobUrl = URL.createObjectURL(response.data);
          setImgUrl(currentBlobUrl);
        }
      } catch (error) {
        console.error(`[ProtectedImage] Lỗi khi tải ảnh từ ${src}:`, error);
        if (isMounted) {
          setImgUrl(fallbackSrc || null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImage();

    // Cleanup: giải phóng bộ nhớ khi src thay đổi hoặc unmount
    return () => {
      isMounted = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [src, fallbackSrc]);

  // Nếu không có ảnh và không đang load
  if (!imgUrl && !isLoading) {
      if (fallbackSrc) return <img src={fallbackSrc} alt={alt} className={`${styles.protectedImg} ${className}`} />;
      return null;
  }

  // Không render img nếu src là null/empty để tránh cảnh báo trình duyệt
  if (!imgUrl) return null;

  return (
    <img
      src={imgUrl}
      alt={alt}
      className={`${styles.protectedImg} ${isLoading ? styles.loading : ""} ${className}`}
      onError={onError}
      referrerPolicy="no-referrer"
    />
  );
};

export default ProtectedImage;
