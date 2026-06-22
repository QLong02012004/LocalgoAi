import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './JourneyMap.module.scss';
import { CornersOut, MapTrifold, Calendar, ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from 'react-router-dom';

// Marker Xanh ngọc đồng bộ theme Cyan
const cyanIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-cyan.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const JourneyMap: React.FC = () => {
  const navigate = useNavigate();
  
  // Giả lập dữ liệu các điểm đến trong hành trình sắp tới
  const upcomingPoints = [
    { id: 1, name: "Cầu Rồng", pos: [16.0612, 108.2269], date: "15/05/2026" },
    { id: 2, name: "Bán đảo Sơn Trà", pos: [16.1214, 108.2785], date: "16/05/2026" },
    { id: 3, name: "Bà Nà Hills", pos: [15.9958, 107.9944], date: "17/05/2026" },
    { id: 4, name: "Phố cổ Hội An", pos: [15.8801, 108.3319], date: "18/05/2026" },
  ];

  const polylinePath = upcomingPoints.map(p => p.pos as [number, number]);
  const centerPos: [number, number] = [16.0544, 108.2022];

  return (
    <div className={styles.journeyMap}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.iconBox}>
            <MapTrifold size={20} weight="bold" />
          </div>
          <div className={styles.headerInfo}>
            <h3>Hành trình sắp tới</h3>
            <p>Tự động tối ưu hóa bởi AI</p>
          </div>
        </div>
        <button className={styles.btnMaximize} onClick={() => navigate('/itinerary-detail')}>
          <CornersOut size={20} weight="bold" />
          <span>Chi tiết</span>
        </button>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer center={centerPos} zoom={11} className={styles.leafletContainer} zoomControl={false}>
          <TileLayer
            attribution="© Google Maps"
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
          />
          
          <Polyline 
            positions={polylinePath} 
            pathOptions={{ 
              color: '#33d7d1', 
              weight: 4, 
              opacity: 0.6,
              dashArray: '10, 10',
              lineJoin: 'round'
            }} 
          />

          {upcomingPoints.map((point) => (
            <Marker key={point.id} position={point.pos as [number, number]} icon={cyanIcon}>
              <Popup>
                <div className={styles.mapPopup}>
                  <h5>{point.name}</h5>
                  <div className={styles.popupMeta}>
                    <Calendar size={14} weight="fill" />
                    <span>{point.date}</span>
                  </div>
                  <button className={styles.popupLink} onClick={() => navigate('/itinerary-detail')}>
                    Xem lịch trình <ArrowRight size={12} weight="bold" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default JourneyMap;