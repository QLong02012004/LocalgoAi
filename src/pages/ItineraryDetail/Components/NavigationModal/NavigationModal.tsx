import React from 'react';
import styles from './NavigationModal.module.scss';
import { X, NavigationArrow, MapPin } from '@phosphor-icons/react';

interface Props {
  onClose: () => void;
  destination: {
    lat: number;
    lng: number;
    name: string;
  };
  userLocation: string | null;
}

const NavigationModal: React.FC<Props> = ({ onClose, destination, userLocation }) => {
  // Construct the Google Maps URL based on available data
  let mapUrl = "";
  if (userLocation) {
    // Current source to destination directions
    mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(userLocation)}&daddr=${encodeURIComponent(`${destination.lat},${destination.lng}`)}&output=embed`;
  } else {
    // Fallback: search for destination on embedded map
    mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(`${destination.lat},${destination.lng}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div className={styles.titleArea}>
            <div className={styles.iconBox}>
              <NavigationArrow size={24} weight="fill" color="#0ea5e9" />
            </div>
            <div className={styles.textInfo}>
              <h3>Chỉ đường chi tiết</h3>
              <p><MapPin size={14} weight="bold" /> {destination.name}</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng cửa sổ">
            <X size={24} weight="bold" />
          </button>
        </header>

        <div className={styles.mapBody}>
          <iframe
            title="Directions"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={mapUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <footer className={styles.modalFooter}>
          <div className={styles.note}>
             <i className="ph-fill ph-info"></i>
             <span>Dữ liệu giao thông và lộ trình được cung cấp thời gian thực từ Google Maps.</span>
          </div>
          <button 
            className={styles.externalBtn}
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`, '_blank')}
          >
            Mở trong ứng dụng Google Maps
            <i className="ph-bold ph-arrow-square-out"></i>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NavigationModal;
