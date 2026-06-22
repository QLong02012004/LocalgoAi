import React, { useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type HighlightItem } from '../../../../services/highlightService';
import styles from './ExploreMap.module.scss';
import { Plus, Minus, Crosshair, Sparkle, MapPinPlus, ForkKnife, Bed, Star, Bank, FirstAid, Storefront, Coffee, Car, X, MapPin } from '@phosphor-icons/react';
import { renderToString } from 'react-dom/server';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryTabs from '../CategoryTabs/CategoryTabs';

interface Props {
  places: HighlightItem[];
  selectedPoints: HighlightItem[];
  onToggleSelection: (item: HighlightItem) => void;
  activePointId?: string | number | null;
  onPointClick?: (id: string | number) => void;
  routeGeometry?: [number, number][] | null;
  provinceId?: number | string;
  activeCategory: string;
  nearbyServices?: HighlightItem[];
  primaryActivePointId?: string | number | null;
  onClosePanel?: () => void;
  onCategoryChange?: (category: string) => void;
}

// Map management hook
const MapController: React.FC<{ 
  places: HighlightItem[]; 
  nearbyServices: HighlightItem[];
  activePointId?: string | number | null;
  routeGeometry?: [number, number][] | null;
  provinceId?: number | string;
}> = ({ places, nearbyServices, activePointId, routeGeometry, provinceId }) => {
  const map = useMap();

  useEffect(() => {
    if (activePointId) {
      const point = [...places, ...nearbyServices].find(p => 
        (p.uniqueId && String(p.uniqueId) === String(activePointId)) || 
        String(p.id) === String(activePointId)
      );
      if (point && point.latitude && point.longitude) {
        map.flyTo([point.latitude, point.longitude], 14, { duration: 1.5, easeLinearity: 0.25 });
        return;
      }
    }

    if (routeGeometry && routeGeometry.length > 0) {
      const validRoute = routeGeometry.filter(point => 
        point && !isNaN(point[0]) && !isNaN(point[1])
      );
      if (validRoute.length > 0) {
        const bounds = L.latLngBounds(validRoute);
        map.fitBounds(bounds.pad(0.1));
        return;
      }
    }

    const validPlaces = places.filter(p => 
      typeof p.latitude === 'number' && !isNaN(p.latitude) && 
      typeof p.longitude === 'number' && !isNaN(p.longitude) && 
      p.latitude !== 0
    );

    if (validPlaces.length < places.length) {
      const hiddenItems = places.filter(p => !validPlaces.includes(p));
      console.warn(`Bản đồ: Đã ẩn ${places.length - validPlaces.length} địa điểm do thiếu tọa độ hợp lệ.`, 
        hiddenItems.map(p => ({ name: p.name, lat: p.latitude, lng: p.longitude, type: typeof p.latitude })));
    }
    
    if (validPlaces.length > 0) {
      const bounds = L.latLngBounds(validPlaces.map(p => [p.latitude as number, p.longitude as number]));
      map.fitBounds(bounds.pad(0.2));
    } else if (provinceId && provinceId !== "all") {
      const centers: Record<string, [number, number]> = {
        "1": [16.4637, 107.5908], // Huế
        "2": [16.0471, 108.2062], // Đà Nẵng
        "3": [15.8801, 108.3380]  // Quảng Nam (Hội An)
      };
      
      const center = centers[String(provinceId)];
      if (center) {
        map.flyTo(center, 13, { duration: 1.5 });
      }
    }
  }, [places, map, routeGeometry, provinceId, activePointId]);

  return null;
};

const ExploreMarker: React.FC<{
  item: HighlightItem;
  isSelected: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClick?: () => void;
}> = ({ item, isSelected, isActive, onToggle, onClick }) => {
  // Hàm băm đơn giản để tạo tọa độ giả định ổn định dựa trên ID
  const getStableOffset = (id: number, salt: number) => {
    let hash = 0;
    const str = id.toString() + salt;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 100) / 1000; // Tạo offset nhỏ quanh trung tâm
  };

  const lat = (typeof item.latitude === 'number' && !isNaN(item.latitude)) 
    ? item.latitude 
    : (16.047 + getStableOffset(item.id, 1) - 0.05);
  const lng = (typeof item.longitude === 'number' && !isNaN(item.longitude)) 
    ? item.longitude 
    : (108.206 + getStableOffset(item.id, 2) - 0.05);

  const iconColorClass = 
    item.type === 'food' ? styles.food : 
    item.type === 'bed' ? styles.bed : 
    item.type === 'atm' ? styles.atm :
    (item.type === 'pharmacy' || item.type === 'hospital') ? styles.medical :
    item.type === 'shop' ? styles.shop :
    item.type === 'cafe' ? styles.cafe :
    item.type === 'parking' ? styles.parking :
    styles.pin;

  const icon = L.divIcon({
    className: `${styles.markerWrap} ${isActive ? styles.activeZIndex : ''}`,
    html: renderToString(
      <div className={`${styles.markerContent} ${isSelected ? styles.selected : ''} ${isActive ? styles.active : ''} ${iconColorClass}`}>
        <div className={`${styles.markerCircle} ${iconColorClass}`}>
          {item.type === 'food' ? <ForkKnife weight="fill" size={20} /> : 
           item.type === 'bed' ? <Bed weight="fill" size={20} /> : 
           item.type === 'atm' ? <Bank weight="fill" size={20} /> :
           (item.type === 'pharmacy' || item.type === 'hospital') ? <FirstAid weight="fill" size={20} /> :
           item.type === 'shop' ? <Storefront weight="fill" size={20} /> :
           item.type === 'cafe' ? <Coffee weight="fill" size={20} /> :
           item.type === 'parking' ? <Car weight="fill" size={20} /> :
           <Sparkle weight="fill" size={20} />}
        </div>
        <div className={styles.markerLabel}>{item.name.substring(0, 12)}{item.name.length > 12 ? '...' : ''}</div>
      </div>
    ),
    iconSize: [100, 40],
    iconAnchor: [20, 40],
    popupAnchor: [30, -40]
  });

  return (
    <Marker position={[lat, lng]} icon={icon} eventHandlers={{ click: onClick }} zIndexOffset={isActive ? 1000 : 0} />
  );
};

const MapControls: React.FC = () => {
  const map = useMap();
  return (
    <div className={styles.controls}>
      <button onClick={() => map.zoomIn()} title="Phóng to" aria-label="Phóng to"><Plus size={20} weight="bold" /></button>
      <button onClick={() => map.zoomOut()} title="Thu nhỏ" aria-label="Thu nhỏ"><Minus size={20} weight="bold" /></button>
      <button 
        onClick={() => {
          map.locate().on("locationfound", (e) => map.flyTo(e.latlng, 15));
        }}
        title="Vị trí của tôi"
        aria-label="Vị trí của tôi"
      >
        <Crosshair size={20} weight="bold" />
      </button>
    </div>
  );
};

const ExploreMap: React.FC<Props> = ({ 
  places, 
  selectedPoints, 
  onToggleSelection, 
  activePointId,
  onPointClick,
  routeGeometry,
  provinceId,
  activeCategory,
  nearbyServices = [],
  primaryActivePointId,
  onClosePanel,
  onCategoryChange
}) => {
  // Search in both main places and nearby services with unique identification
  const activeItem = [...places, ...nearbyServices].find(p => 
    (p.uniqueId && String(p.uniqueId) === String(activePointId)) || 
    String(p.id) === String(activePointId)
  );
  
  // The circle should center on the PRIMARY point
  const primaryItem = places.find(p => 
    (p.uniqueId && p.uniqueId === primaryActivePointId) || 
    String(p.id) === String(primaryActivePointId)
  );
  const activePos: [number, number] | null = (primaryItem && !primaryItem.isService && primaryItem.latitude && primaryItem.longitude) 
    ? [primaryItem.latitude, primaryItem.longitude] 
    : null;

  return (
    <div className={styles.mapContainer}>
      {onCategoryChange && (
        <CategoryTabs 
          activeCategory={activeCategory} 
          onCategoryChange={onCategoryChange} 
          className={styles.mapCategoryTabs}
        />
      )}
      <MapContainer center={[16.047, 108.206]} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© Google Maps"
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
        
        <MapController places={places} nearbyServices={nearbyServices} activePointId={activePointId} routeGeometry={routeGeometry} provinceId={provinceId} />
        <MapControls />

        {routeGeometry && (
          <Polyline 
            positions={routeGeometry} 
            pathOptions={{ 
              color: '#33d7d1', 
              weight: 5, 
              opacity: 0.8,
              dashArray: '1, 10',
              lineCap: 'round'
            }} 
          />
        )}

        {/* Radius Circle for Nearby Services */}
        {activePos && (
          <Circle 
            center={activePos}
            radius={1000} // 1km radius
            pathOptions={{
              fillColor: '#33d7d1',
              fillOpacity: 0.15,
              color: '#33d7d1',
              weight: 2,
              dashArray: '5, 10'
            }}
          />
        )}

        {/* Nearby Services Markers */}
        {nearbyServices.map(service => (
          <ExploreMarker 
            key={service.uniqueId || `nearby-${service.id}`} 
            item={service} 
            isSelected={selectedPoints.some(p => p.id === service.id)}
            isActive={(service.uniqueId && String(service.uniqueId) === String(activePointId)) || String(service.id) === String(activePointId)}
            onToggle={() => onToggleSelection(service)}
            onClick={() => onPointClick?.(service.uniqueId || service.id)}
          />
        ))}

        {places.filter(p => p.latitude != null && p.longitude != null).filter(place => {
          if (primaryActivePointId) {
            return (place.uniqueId && String(place.uniqueId) === String(primaryActivePointId)) || 
                   String(place.id) === String(primaryActivePointId);
          }
          return true;
        }).map(place => (
          <ExploreMarker 
            key={place.uniqueId || place.id} 
            item={place} 
            isSelected={selectedPoints.some(p => p.id === place.id)}
            isActive={(place.uniqueId && String(place.uniqueId) === String(activePointId)) || String(place.id) === String(activePointId)}
            onToggle={() => onToggleSelection(place)}
            onClick={() => onPointClick?.(place.uniqueId || place.id)}
          />
        ))}
      </MapContainer>

      {routeGeometry && (
        <div className={styles.routeBadge}>
          <Sparkle size={18} weight="fill" />
          <span>Lộ trình tối ưu bởi AI</span>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className={styles.mapLegend}>
        <div className={styles.legendTitle}>Ghi chú</div>
        {(activeCategory === 'all' || activeCategory === 'food') && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.foodDot}`} />
            <span>Ẩm thực</span>
          </div>
        )}
        {(activeCategory === 'all' || activeCategory === 'bed') && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.bedDot}`} />
            <span>Khách sạn</span>
          </div>
        )}
        {(activeCategory === 'all' || activeCategory === 'pin') && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.pinDot}`} />
            <span>Tham quan</span>
          </div>
        )}
        {(activeCategory === 'all' || activeCategory === 'service') && (
          <>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.atmDot}`} />
              <span>ATM</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.medicalDot}`} />
              <span>Y tế</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.shopDot}`} />
              <span>Mua sắm</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.cafeDot}`} />
              <span>Cà phê</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.parkingDot}`} />
              <span>Bãi đỗ xe</span>
            </div>
          </>
        )}
      </div>

      {/* Modern Left-side Info Panel */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            className={styles.infoPanel}
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button className={styles.closePanel} onClick={onClosePanel}>
              <X size={20} weight="bold" />
            </button>

            <div className={styles.panelContent}>
              <div className={styles.panelImage}>
                <img src={activeItem.imageUrl} alt={activeItem.name} />
                <div className={styles.imageOverlay}>
                  <span className={styles.panelType}>
                    {activeItem.type === 'food' ? 'Ẩm thực' : activeItem.type === 'bed' ? 'Lưu trú' : 'Tham quan'}
                  </span>
                </div>
              </div>

              <div className={styles.panelBody}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>{activeItem.name}</h3>
                  <div className={styles.panelRating}>
                    <Star weight="fill" size={16} color="#f59e0b" />
                    <span>{activeItem.rating}</span>
                  </div>
                </div>

                <div className={styles.panelAddress}>
                  <MapPin size={18} weight="fill" />
                  <p>{activeItem.location}</p>
                </div>

                {activeItem.description && (
                  <p className={styles.panelDesc}>{activeItem.description}</p>
                )}

                <div className={styles.panelActions}>
                  <button 
                    className={`${styles.panelAddBtn} ${selectedPoints.some(p => p.id === activeItem.id) ? styles.remove : ''}`}
                    onClick={() => onToggleSelection(activeItem)}
                  >
                    {selectedPoints.some(p => p.id === activeItem.id) ? (
                      <><Minus weight="bold" size={18} /> Xóa khỏi lộ trình</>
                    ) : (
                      <><MapPinPlus size={18} weight="bold" /> Thêm vào lộ trình</>
                    )}
                  </button>
                  
                  <button 
                    className={styles.panelDetailBtn}
                    onClick={() => {
                      const path = activeItem.type === 'bed' ? `/hotel/${activeItem.id}` : activeItem.type === 'food' ? `/restaurant/${activeItem.id}` : `/attraction/${activeItem.id}`;
                      window.location.href = path;
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreMap;
