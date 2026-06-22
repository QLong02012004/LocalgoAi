import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type RoutePoint } from '../../types';
import styles from './ItineraryMap.module.scss';
import { Plus, Minus, Crosshair, NavigationArrow, MapPin, MagnifyingGlass } from '@phosphor-icons/react';
import { useState } from 'react';

const PROVINCE_GEOJSON_URL = "https://data.opendevelopmentmekong.net/dataset/999c96d8-fae0-4b82-9a2b-e481f6f50e12/resource/2818c2c5-e9c3-440b-a9b8-3029d7298065/download/diaphantinhenglish.geojson";
const TARGET_PROVINCES = ["Da Nang", "Quang Nam", "Thua Thien - Hue"];

const getDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


interface Props {
  points: RoutePoint[];
  activePointId: string | null;
  onPointClick: (id: string) => void;
  isPreviewing: boolean;
  previewPoint?: Partial<RoutePoint> | null;
  metrics?: Record<string, { distance: string; duration: number }>;
  onOpenNavigation: (lat: number, lng: number, name: string) => void;
  activeDay: number;
  userLocation: { lat: number, lng: number } | null;
  navRoute: [number, number][] | null;
  isMapExpanded?: boolean;
  nearbyPlaces?: any[];
  onAddNearby?: (place: any) => void;
  selectedNearby?: any | null;
  contextualServices?: any[];
  onSelectNearby?: (place: any) => void;
  showNearby?: boolean;
  onToggleNearby?: () => void;
  onOpenSearch?: () => void;
  dayRouteCoords?: [number, number][];
}



// Custom hook to handle map side-effects
const MapEffectManager: React.FC<{
  points: RoutePoint[];
  activePointId: string | null;
  isPreviewing: boolean;
  previewPoint?: Partial<RoutePoint> | null;
  isMapExpanded?: boolean;
}> = ({ points, activePointId, isPreviewing, previewPoint, isMapExpanded }) => {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450);
    return () => clearTimeout(timer);
  }, [isMapExpanded, map]);

  useEffect(() => {
    if (activePointId) {
      const point = points.find(p => p.id === activePointId);
      if (point && point.lat && point.lng) {
        map.flyTo([point.lat, point.lng], 14, { duration: 1.2 });
      }
    }
  }, [activePointId, map, points]);

  useEffect(() => {
    if (previewPoint && previewPoint.lat && previewPoint.lng) {
      map.flyTo([previewPoint.lat, previewPoint.lng], 15, { duration: 1.2 });
    }
  }, [previewPoint, map]);

  useEffect(() => {
    let timeoutId: number | ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const playPreview = async () => {
      for (const point of points) {
        if (isCancelled) break;
        if (point.lat && point.lng) {
          map.flyTo([point.lat, point.lng], 15, { duration: 1.5 });
          await new Promise(r => { timeoutId = setTimeout(r, 2500); });
        }
      }
      
      if (!isCancelled && points.length > 0) {
        const validPoints = points.filter(p => p.lat && p.lng);
        if (validPoints.length > 0) {
          const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng] as [number, number]));
          map.fitBounds(bounds.pad(0.2));
        }
      }
    };

    if (isPreviewing) playPreview();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isPreviewing, map, points]);

  useEffect(() => {
    if (points.length > 0 && !activePointId && !isPreviewing && !previewPoint) {
      const validPoints = points.filter(p => p.lat && p.lng);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds.pad(0.1));
      }
    }
  }, [points, map, activePointId, isPreviewing, previewPoint]);

  return null;
};

const ItineraryMarker: React.FC<{
  point: RoutePoint;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onOpenNavigation: (lat: number, lng: number, name: string) => void;
}> = ({ point, index, isActive, onClick, onOpenNavigation }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isActive]);

  const icon = L.divIcon({
    className: 'iti-map-marker-wrap',
    html: `
      <div class="iti-map-marker-container ${isActive ? 'is-active' : ''}">
        <div class="iti-map-marker-pin">
          <div class="iti-map-marker-inner">
            <span>${index}</span>
          </div>
        </div>
        <div class="iti-map-marker-shadow"></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
  });

  return (
    <Marker ref={markerRef} position={[point.lat, point.lng]} icon={icon} eventHandlers={{ click: onClick }} />
  );
};

const PreviewMarker: React.FC<{ point: Partial<RoutePoint> }> = ({ point }) => {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (markerRef.current) markerRef.current.openPopup();
  }, [point]);

  const searchIcon = L.divIcon({
    className: 'search-marker-wrap',
    html: `<div class="search-marker-div"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8    8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <Marker ref={markerRef} position={[point.lat!, point.lng!]} icon={searchIcon}>
      <Popup className="iti-custom-popup" offset={[0, -32]}>
        <div className={styles.searchPopupContent}>
           <h4 className={styles.searchPopupTitle}>{point.name}</h4>
           <p className={styles.searchPopupAddr}>Nhấn "Thêm vào lịch trình" để lưu địa điểm này.</p>
        </div>
      </Popup>
    </Marker>
  );
};

const UserLocationMarker: React.FC<{ position: { lat: number, lng: number } }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    // Optionally focus on user when position is first found or updated
  }, [position, map]);

  const userIcon = L.divIcon({
    className: 'user-location-marker-wrap',
    html: `<div class="user-pulse-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon} zIndexOffset={1000}>
      <Popup>Bạn đang ở đây</Popup>
    </Marker>
  );
};

const NearbyMarker: React.FC<{ place: any, isSelected: boolean, onSelect: (p: any) => void, onAdd?: (place: any) => void }> = ({ place, isSelected, onSelect, onAdd }) => {
  const getIconColor = () => {
    if (place.serviceType === 'hotel') return '#3b82f6';
    if (place.serviceType === 'restaurant') return '#f97316';
    return '#10b981';
  };

  const getIconHtml = () => {
    const color = getIconColor();
    let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,122.34l-34.34-34.34,34.34-34.34a8,8,0,0,0-11.32-11.32L168,76.69l-34.34-34.35a8,8,0,0,0-11.32,11.32L156.69,88l-34.35,34.34a8,8,0,0,0,11.32,11.32L168,99.31l34.34,34.35a8,8,0,0,0,11.32-11.32ZM111.32,142.66,76.97,108.31l34.35-34.35a8,8,0,0,0-11.32-11.32L65.66,96.97,31.32,62.63a8,8,0,0,0-11.32,11.32l34.35,34.35L20,142.66a8,8,0,0,0,11.32,11.32l34.34-34.34,34.34,34.34a8,8,0,0,0,11.32-11.32Z"></path></svg>';
    
    if (place.serviceType === 'hotel') {
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M224,115.55V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V160H112v48a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l72-66.66a16,16,0,0,1,21.66,0l72,66.66A16,16,0,0,1,224,115.55Z"></path></svg>';
    } else if (place.serviceType === 'restaurant') {
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M152,80a8,8,0,0,1-8,8H136V216a8,8,0,0,1-16,0V88H112a8,8,0,0,1-8-8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0ZM200,32a8,8,0,0,0-8,8V120H176V40a8,8,0,0,0-16,0v88a8,8,0,0,0,8,8h24v80a8,8,0,0,0,16,0V40A8,8,0,0,0,200,32Z"></path></svg>';
    }
    
    return `
      <div class="${styles.exploreMarkerContainer} ${isSelected ? styles.selected : ''}">
        <div class="${styles.exploreMarkerPin}" style="background: ${color}">
          <div class="${styles.exploreMarkerIcon}">
            ${iconSvg}
          </div>
        </div>
        <div class="${styles.exploreMarkerLabel}">
          <span>${place.name}</span>
        </div>
      </div>
    `;
  };

  const exploreIcon = L.divIcon({
    className: 'explore-marker-wrap',
    html: getIconHtml(),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const lat = place.latitude || (place.location && parseFloat(place.location.split(',')[0]));
  const lng = place.longitude || (place.location && parseFloat(place.location.split(',')[1]));

  if (!lat || !lng) return null;

  return (
    <Marker 
      position={[lat, lng]} 
      icon={exploreIcon} 
      zIndexOffset={isSelected ? 1000 : 500}
      eventHandlers={{ 
        click: () => {
          onSelect(place);
          onAdd?.(place);
        } 
      }}
    >
      <Popup className={styles.nearbyPopup}>
        <div className={styles.popupContent}>
          {place.imageUrl && <img src={place.imageUrl} alt={place.name} />}
          <div className={styles.popupInfo}>
            <h4>{place.name}</h4>
            <p className={styles.popupAddr}>{place.addressDetailed || place.location}</p>
            <div className={styles.popupMeta}>
              <span className={styles.popupRating}>⭐ {place.rating || 0}</span>
              {place.averagePrice > 0 && <span className={styles.popupPrice}>💰 {place.averagePrice.toLocaleString()}đ</span>}
            </div>
            {onAdd && (
              <button className={styles.popupAddBtn} onClick={(e) => { e.stopPropagation(); onAdd(place); }}>
                <Plus size={16} weight="bold" /> Thêm vào lộ trình
              </button>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const MapLegend: React.FC = () => {
  return (
    <div className={styles.mapLegend}>
      <div className={styles.legendTitle}>GHI CHÚ</div>
      <div className={styles.legendItem}>
        <span className={styles.dot} style={{ background: '#f97316' }}></span> Ẩm thực
      </div>
      <div className={styles.legendItem}>
        <span className={styles.dot} style={{ background: '#10b981' }}></span> Tham quan
      </div>
      <div className={styles.legendItem}>
        <span className={styles.dot} style={{ background: '#64748b' }}></span> Tiện ích
      </div>
    </div>
  );
};

const MapControls: React.FC<{ 
  showNearby: boolean; 
  onToggleNearby: () => void;
  onOpenSearch?: () => void;
}> = ({ showNearby, onToggleNearby, onOpenSearch }) => {
  const map = useMap();
  return (
    <div className={styles.mapCtrlStack}>
      <div className={styles.ctrlGroup}>
        <button type="button" onClick={() => map.zoomIn()} title="Phóng to" aria-label="Phóng to"><div className={styles.ctrlIcon}><Plus size={18} weight="bold" /></div></button>
        <button type="button" onClick={() => map.zoomOut()} title="Thu nhỏ" aria-label="Thu nhỏ"><div className={styles.ctrlIcon}><Minus size={18} weight="bold" /></div></button>
      </div>

      <button 
        type="button" 
        className={`${styles.ctrlBtn} ${showNearby ? styles.active : ''}`}
        onClick={onToggleNearby}
        title={showNearby ? "Ẩn địa điểm xung quanh" : "Hiện địa điểm xung quanh"}
      >
        <div className={styles.ctrlIcon}>
          <MapPin size={22} weight={showNearby ? "fill" : "bold"} />
        </div>
      </button>

      <button 
        type="button" 
        className={styles.ctrlBtn} 
        onClick={onOpenSearch}
        title="Tìm kiếm & Thêm địa điểm"
      >
        <div className={styles.ctrlIcon}>
          <MagnifyingGlass size={22} weight="bold" />
        </div>
      </button>

      <button 
        type="button" 
        className={styles.ctrlBtn} 
        onClick={() => {
          map.locate({ 
            setView: true, 
            maxZoom: 15,
            enableHighAccuracy: true
          });
        }}
        title="Vị trí của tôi"
      >
        <div className={styles.ctrlIcon}>
          <Crosshair size={22} weight="bold" />
        </div>
      </button>
    </div>
  );
};

const provinceCenters: Record<string, [number, number]> = {
  "Đà Nẵng": [16.047079, 108.20623],
  "Huế": [16.4637, 107.5905],
  "Quảng Nam": [15.5833, 107.9167],
  "Hội An": [15.8801, 108.3338]
};

const ItineraryMap: React.FC<Props> = ({ points, activePointId, onPointClick, isPreviewing, previewPoint, metrics = {}, onOpenNavigation, activeDay, userLocation, navRoute, isMapExpanded, nearbyPlaces = [], onAddNearby, selectedNearby, contextualServices = [], onSelectNearby, showNearby = false, onToggleNearby = () => {}, onOpenSearch, dayRouteCoords = [] }) => {
  const [provinceData, setProvinceData] = useState<any>(null);
  const activePoint = points.find(p => p.id === activePointId);

  // Get initial center based on points or province name
  const getInitialCenter = (): [number, number] => {
    if (points.length > 0) {
      const first = points.find(p => p.lat && p.lng);
      if (first) return [first.lat, first.lng];
    }
    // Try to match province name from Props or from first point's metadata (if any)
    // For now, let's look at the first point's address or name if it contains keywords
    const provinceName = points[0]?.address || "";
    for (const [name, center] of Object.entries(provinceCenters)) {
      if (provinceName.includes(name)) return center;
    }
    return [16.047, 108.206]; // Default Da Nang
  };

  const initialCenter = getInitialCenter();

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch(PROVINCE_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`GeoJSON fetch returned HTTP status ${response.status}`);
        }
        const data = await response.json();
        const filtered = {
          ...data,
          features: data.features.filter((f: any) => {
            const name = f.properties?.Name || f.properties?.name || '';
            const normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return TARGET_PROVINCES.some(target => {
              const normTarget = target.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              return normalized.includes(normTarget) || normTarget.includes(normalized);
            });
          })
        };
        setProvinceData(filtered);
      } catch (err) {
        console.error("Error fetching GeoJSON:", err);
      }
    };
    fetchGeoJSON();
  }, []);

  const renderPolylines = () => {
    if (navRoute && navRoute.length > 0) return null;
    const dailyPoints = points.filter(p => (p.day || 1) === activeDay && p.lat && p.lng);
    if (dailyPoints.length < 2) return null;
    
    // Nối các điểm đường đi chính xác từ OSRM nếu có, nếu không thì fallback về đường nối thẳng
    const pathPositions = (dayRouteCoords && dayRouteCoords.length > 0)
      ? dayRouteCoords
      : dailyPoints.map(p => [p.lat, p.lng] as [number, number]);
    
    return (
      <React.Fragment key={`path-day-${activeDay}`}>
        {/* Outer Glow Line */}
        <Polyline positions={pathPositions} pathOptions={{ color: '#0ea5e9', weight: 12, opacity: 0.15, lineCap: 'round', lineJoin: 'round' }} interactive={false} />
        {/* Middle Glow */}
        <Polyline positions={pathPositions} pathOptions={{ color: '#0ea5e9', weight: 6, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} interactive={false} />
        {/* Core Sharp Line */}
        <Polyline positions={pathPositions} pathOptions={{ color: '#0ea5e9', weight: 3, opacity: 1, lineCap: 'round', lineJoin: 'round' }} interactive={false} />
      </React.Fragment>
    );
  };

  return (
    <main className={styles.mapViewContainer}>
      <MapContainer center={initialCenter} zoom={11} zoomControl={false} className={styles.mapViewContainer}>
        <TileLayer
          attribution="© Google Maps"
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
        <MapEffectManager 
          points={points} 
          activePointId={activePointId} 
          isPreviewing={isPreviewing} 
          previewPoint={previewPoint} 
          isMapExpanded={isMapExpanded}
        />

        {provinceData && (
          <GeoJSON 
            data={provinceData} 
            pathOptions={{
              color: '#0ea5e9',
              weight: 2,
              fillColor: '#0ea5e9',
              fillOpacity: 0.05,
              dashArray: '5, 10'
            }}
          />
        )}
        <MapControls showNearby={showNearby} onToggleNearby={onToggleNearby} onOpenSearch={onOpenSearch} />
        {renderPolylines()}

        {points.filter(p => (p.day || 1) === activeDay && p.lat && p.lng).map((point) => {
          const globalIdx = points.findIndex(p => p.id === point.id) + 1;
          return (
            <ItineraryMarker 
              key={point.id} 
              point={point} 
              index={globalIdx} 
              isActive={activePointId === point.id} 
              onClick={() => onPointClick(point.id)} 
              onOpenNavigation={onOpenNavigation}
            />
          );
        })}

        {previewPoint && previewPoint.lat && previewPoint.lng && <PreviewMarker point={previewPoint} />}
        {userLocation && <UserLocationMarker position={userLocation} />}
        
        {/* Render Live Navigation Route */}
        {navRoute && (
          <Polyline 
            positions={navRoute} 
            pathOptions={{ 
              color: '#3b82f6', 
              weight: 6, 
              opacity: 1, 
              lineJoin: 'round',
              lineCap: 'round'
            }} 
            interactive={false}
          />
        )}

        {/* Active Point Scan Circle */}
        {showNearby && activePoint && activePoint.lat && activePoint.lng && (
          <>
            {/* Outer scan circle (1000m) */}
            <Circle 
              center={[activePoint.lat, activePoint.lng]}
              radius={1000} 
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '6, 12'
              }}
            />
            {/* Inner scan circle (500m) */}
            <Circle 
              center={[activePoint.lat, activePoint.lng]}
              radius={500} 
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.015,
                weight: 1,
                dashArray: '3, 6'
              }}
            />
          </>
        )}

        {/* Nearby Services (Main Entities) */}
        {showNearby && nearbyPlaces
          .filter(place => {
            if (place.serviceType === 'hotel') return false; // Hide hotels from discovery map by default
            
            // If there is an active point, only show places within 1000m
            if (activePoint && activePoint.lat && activePoint.lng) {
              const placeLat = place.latitude || (place.location && parseFloat(place.location.split(',')[0]));
              const placeLng = place.longitude || (place.location && parseFloat(place.location.split(',')[1]));
              if (placeLat && placeLng) {
                const dist = getDistanceInMeters(activePoint.lat, activePoint.lng, placeLat, placeLng);
                return dist <= 1000;
              }
              return false;
            }
            return true; // Show all if no active point is selected
          })
          .map((place, idx) => {
            const isAlreadyInPoints = points.some(p => p.name?.toLowerCase() === place.name?.toLowerCase());
            if (isAlreadyInPoints) return null;
            
            return (
              <NearbyMarker 
                key={`nearby-${place.serviceType}-${place.id || idx}`} 
                place={place} 
                isSelected={selectedNearby?.id === place.id}
                onSelect={(p) => onSelectNearby && onSelectNearby(p)}
                onAdd={(p) => onAddNearby && onAddNearby(p)} 
              />
            );
          })}

        {/* Discovery Circle & Contextual Services */}
        {showNearby && selectedNearby && (
          <>
            <Circle 
              center={[
                selectedNearby.latitude || parseFloat(selectedNearby.location.split(',')[0]),
                selectedNearby.longitude || parseFloat(selectedNearby.location.split(',')[1])
              ]}
              radius={800} 
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '5, 8'
              }}
            />
            {contextualServices.map((service, idx) => {
              const placeObj = {
                ...service,
                name: service.serviceName,
                serviceType: service.serviceType.toLowerCase()
              };
              const isAlreadyInPoints = points.some(p => p.name?.toLowerCase() === placeObj.name?.toLowerCase());
              if (isAlreadyInPoints) return null;

              return (
                <NearbyMarker 
                  key={`contextual-${placeObj.serviceType}-${service.id || idx}`}
                  place={placeObj}
                  isSelected={false}
                  onSelect={() => {}}
                  onAdd={(p) => onAddNearby && onAddNearby(p)}
                />
              );
            })}
          </>
        )}

        {showNearby && <MapLegend />}
      </MapContainer>
    </main>
  );
};

export default ItineraryMap;