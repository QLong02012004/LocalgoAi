import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { 
  ArrowLeft, 
  Bank, 
  FirstAid, 
  Storefront, 
  Coffee, 
  Bed, 
  ForkKnife, 
  Sparkle,
  Star,
  MapPin,
  NavigationArrow,
  MagnifyingGlass,
  List,
  MapTrifold,
  SquaresFour
} from '@phosphor-icons/react';
import { getAllNearbyServices, type NearbyService } from '../../services/destinationService';
import styles from './NearbyServices.module.scss';

const getServiceIcon = (type: string) => {
  switch (type) {
    case "ATM": return <Bank weight="fill" size={20} />;
    case "PHARMACY":
    case "HOSPITAL": return <FirstAid weight="fill" size={20} />;
    case "RESTAURANT": return <ForkKnife weight="fill" size={20} />;
    case "HOTEL": return <Bed weight="fill" size={20} />;
    case "CAFE": return <Coffee weight="fill" size={20} />;
    case "SHOP": return <Storefront weight="fill" size={20} />;
    default: return <Sparkle weight="fill" size={20} />;
  }
};

const getServiceColorClass = (type: string) => {
  switch (type) {
    case "RESTAURANT": return styles.food;
    case "HOTEL": return styles.bed;
    case "ATM": return styles.atm;
    case "PHARMACY":
    case "HOSPITAL": return styles.medical;
    default: return styles.pin;
  }
};

const NearbyServices: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !type) return;
      try {
        setLoading(true);
        const res = await getAllNearbyServices(id, type as any);
        if (res.status === 200) {
          setServices(res.data || []);
        }
      } catch (error) {
        console.error("Error fetching nearby services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const categories = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'ATM', label: 'ATM' },
    { id: 'PHARMACY', label: 'Y tế' },
    { id: 'RESTAURANT', label: 'Ẩm thực' },
    { id: 'SHOP', label: 'Mua sắm' },
    { id: 'HOTEL', label: 'Lưu trú' },
  ];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || 
                          (activeCategory === 'PHARMACY' ? (s.serviceType === 'PHARMACY' || s.serviceType === 'HOSPITAL') : s.serviceType === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const createCustomIcon = (type: string) => {
    const colorClass = getServiceColorClass(type);
    return L.divIcon({
      className: styles.markerWrap,
      html: renderToString(
        <div className={`${styles.markerCircle} ${colorClass}`}>
          {getServiceIcon(type)}
        </div>
      ),
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải các dịch vụ lân cận...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} weight="bold" />
          </button>
          <div>
            <h1>Dịch vụ lân cận</h1>
            <p>{services.length} địa điểm được tìm thấy</p>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <MagnifyingGlass size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dịch vụ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className={styles.viewToggle}>
            <button 
              className={viewMode === 'list' ? styles.active : ''} 
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
            <button 
              className={viewMode === 'split' ? styles.active : ''} 
              onClick={() => setViewMode('split')}
            >
              <SquaresFour size={20} />
            </button>
            <button 
              className={viewMode === 'map' ? styles.active : ''} 
              onClick={() => setViewMode('map')}
            >
              <MapTrifold size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.categoryFilter}>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={activeCategory === cat.id ? styles.active : ''}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <main className={`${styles.content} ${styles[viewMode]}`}>
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={styles.listSection}>
            {filteredServices.length > 0 ? (
              <div className={styles.grid}>
                {filteredServices.map(service => (
                  <div 
                    key={service.id} 
                    className={styles.serviceCard}
                    onClick={() => navigate(`/nearby-service/${service.id}`)}
                  >
                    <div className={styles.cardImg}>
                      <img src={service.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop"} alt={service.serviceName} />
                      <div className={styles.distBadge}>
                        {service.distanceKm < 5 ? `${(service.distanceKm * 1000).toFixed(0)} m` : `${service.distanceKm.toFixed(0)} m`}
                      </div>
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardHeader}>
                        <h3>{service.serviceName}</h3>
                        <div className={styles.rating}>
                          <Star size={14} weight="fill" />
                          <span>{service.rating}</span>
                        </div>
                      </div>
                      <p className={styles.address}><MapPin size={14} /> {service.address}</p>
                      <div className={styles.cardFooter}>
                        <span className={styles.serviceType}>{service.serviceType}</span>
                        <span className={styles.priceLevel}>{service.priceLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>Không tìm thấy dịch vụ nào phù hợp.</div>
            )}
          </div>
        )}

        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={styles.mapSection}>
            <MapContainer 
              center={filteredServices.length > 0 ? [filteredServices[0].latitude, filteredServices[0].longitude] : [16.047, 108.206]} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution="© Google Maps"
                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
              />
              {filteredServices.map(service => (
                <Marker 
                  key={service.id} 
                  position={[service.latitude, service.longitude]}
                  icon={createCustomIcon(service.serviceType)}
                >
                  <Popup className={styles.customPopup}>
                    <div className={styles.popupContent}>
                      <h4>{service.serviceName}</h4>
                      <p>{service.address}</p>
                      <button onClick={() => navigate(`/nearby-service/${service.id}`)}>
                        Xem chi tiết
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </main>
    </div>
  );
};

export default NearbyServices;
