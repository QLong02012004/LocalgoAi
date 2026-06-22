import React, { useState, useEffect, useCallback } from "react";
import styles from "./NearbyServicesSection.module.scss";
import {
  MapTrifold,
  Plus,
  Trash,
  Pencil,
  Star,
  MapPin,
  X,
  Eye,
  NavigationArrow,
  Clock,
  Phone,
  CurrencyCircleDollar,
  Info,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import {
  fetchNearbyServicesByTarget,
  removeNearbyService,
  createNearbyService,
  updateNearbyService,
  type AdminNearbyService,
} from "../../../../services/adminService";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8080";

const SERVICE_TYPE_MAP: Record<string, { label: string; colorClass: string }> = {
  RESTAURANT: { label: "Nhà hàng", colorClass: "bgOrange" },
  CAFE: { label: "Quán cà phê", colorClass: "bgAmber" },
  HOTEL: { label: "Khách sạn", colorClass: "bgBlue" },
  PHARMACY: { label: "Nhà thuốc", colorClass: "bgEmerald" },
  HOSPITAL: { label: "Bệnh viện", colorClass: "bgRose" },
  ATM: { label: "ATM", colorClass: "bgCyan" },
  SHOP: { label: "Cửa hàng", colorClass: "bgPurple" },
  PARKING: { label: "Bãi đỗ xe", colorClass: "bgBlue" },
};


// Coordinates string parsing helper
const parseCoordinates = (locStr: string): [number, number] | null => {
  if (!locStr) return null;
  const parts = locStr.split(/,\s*/);
  if (parts.length === 2) {
    const lat = parseFloat(parts[0].replace(",", "."));
    const lng = parseFloat(parts[1].replace(",", "."));
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  } else if (parts.length === 4) {
    const lat = parseFloat(`${parts[0]}.${parts[1]}`);
    const lng = parseFloat(`${parts[2]}.${parts[3]}`);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  return null;
};

// Map Pin Marker Icons
const parentMarkerIcon = (type: string) => {
  const color = type === "hotel" ? "#0ea5e9" : type === "restaurant" ? "#f43f5e" : "#10b981";
  return L.divIcon({
    className: "admin-add-map-main-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: -2px 3px 8px rgba(0, 0, 0, 0.4);
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const newServiceMarkerIcon = (serviceType: string) => {
  let color = "#e11d48"; // bright rose red to show it is the active/added one
  let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path></svg>`;

  const typeUpper = serviceType?.toUpperCase() || "";
  if (typeUpper === "RESTAURANT" || typeUpper === "CAFE") {
    color = "#f97316";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M152,80a8,8,0,0,1-8,8H136V216a8,8,0,0,1-16,0V88H112a8,8,0,0,1-8-8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0V72h8V32a8,8,0,0,1,16,0ZM200,32a8,8,0,0,0-8,8V120H176V40a8,8,0,0,0-16,0v88a8,8,0,0,0,8,8h24v80a8,8,0,0,0,16,0V40A8,8,0,0,0,200,32Z"></path></svg>`;
  } else if (typeUpper === "HOTEL") {
    color = "#8b5cf6";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72H48A24,24,0,0,0,24,96v96a8,8,0,0,0,16,0V176H216v16a8,8,0,0,0,16,0V96A24,24,0,0,0,208,72ZM40,96a8,8,0,0,1,8-8h56a8,8,0,0,1,8,8v32H40Zm168,64H40V144H216v16A8,8,0,0,1,208,160Zm0-32a8,8,0,0,1-8-8V88h8a8,8,0,0,1,8,8Z"></path></svg>`;
  } else if (typeUpper === "PHARMACY" || typeUpper === "HOSPITAL") {
    color = "#10b981";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A16,16,0,0,0,32,56v144a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200Zm-32-72H136V80a8,8,0,0,0-16,0v48H80a8,8,0,0,0,0,16h40v48a8,8,0,0,0,16,0V144h40a8,8,0,0,0,0-16Z"></path></svg>`;
  } else if (typeUpper === "ATM") {
    color = "#06b6d4";
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM116,96a12,12,0,1,1,12,12A12,12,0,0,1,116,96Zm32,72a8,8,0,0,1-8,8H116a8,8,0,0,1,0-16h8V128h-8a8,8,0,0,1,0-16h24a8,8,0,0,1,8,8v40h8a8,8,0,0,1,8,8Z"></path></svg>`;
  }

  return L.divIcon({
    className: "admin-add-map-nearby-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: -2px 3px 8px rgba(0, 0, 0, 0.4);
        border: 2.5px solid #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const AddServiceMapEffect: React.FC<{
  parentCenter: [number, number] | null;
  serviceCenter: [number, number] | null;
}> = ({ parentCenter, serviceCenter }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const coords: [number, number][] = [];
    if (parentCenter) coords.push(parentCenter);
    if (serviceCenter) coords.push(serviceCenter);

    if (coords.length === 2) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds.pad(0.2), { duration: 1.0 });
    } else if (coords.length === 1) {
      map.setView(coords[0], 15, { animate: true });
    }
  }, [parentCenter, serviceCenter, map]);

  return null;
};

const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onMapClick]);
  return null;
};

interface Props {
  parentId: string | number;
  parentType: "hotel" | "restaurant" | "destination";
  parentLocation?: string;
  parentName?: string;
}

const emptyForm = {
  serviceType: "RESTAURANT",
  serviceName: "",
  description: "",
  address: "",
  location: "",
  latitude: 0,
  longitude: 0,
  distanceKm: 0,
  phoneNumber: "",
  openingHours: "",
  rating: 0,
  reviewCount: 0,
  imageUrl: "",
  priceLevel: "MODERATE",
  status: "ACTIVE",
};

const NearbyServicesSection: React.FC<Props> = ({ parentId, parentType, parentLocation, parentName }) => {
  const [services, setServices] = useState<AdminNearbyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminNearbyService | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<AdminNearbyService | null>(null);

  const targetType = parentType === "destination" ? "attraction" : parentType;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchNearbyServicesByTarget(targetType, parentId);
      const data = res.data?.data;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi lấy dịch vụ lân cận:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parentId) fetchData();
  }, [parentId, parentType]);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa dịch vụ lân cận này?")) return;
    try {
      await removeNearbyService(id);
      toast.success("Đã xóa dịch vụ lân cận");
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Xóa thất bại!";
      toast.error(errorMsg);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: AdminNearbyService) => {
    setEditingItem(item);
    setFormData({
      serviceType: item.serviceType || "RESTAURANT",
      serviceName: item.serviceName || "",
      description: item.description || "",
      address: item.address || "",
      location: item.location || (item.latitude && item.longitude ? `${item.latitude},${item.longitude}` : ""),
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      distanceKm: item.distanceKm || 0,
      phoneNumber: item.phoneNumber || "",
      openingHours: item.openingHours || "",
      rating: item.rating || 0,
      reviewCount: item.reviewCount || 0,
      imageUrl: item.imageUrl || "",
      priceLevel: item.priceLevel || "MODERATE",
      status: item.status || "ACTIVE",
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openView = (item: AdminNearbyService) => {
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.serviceName.trim()) return toast.error("Nhập tên dịch vụ!");
    setIsSaving(true);
    try {
      const dataPayload: Record<string, any> = { ...formData };
      if (formData.location && formData.location.includes(',')) {
        const [lat, lng] = formData.location.split(',').map(s => s.trim());
        dataPayload.latitude = parseFloat(lat) || 0;
        dataPayload.longitude = parseFloat(lng) || 0;
      }

      if (targetType === "attraction") dataPayload.attractionId = Number(parentId);
      else if (targetType === "hotel") dataPayload.hotelId = Number(parentId);
      else if (targetType === "restaurant") dataPayload.restaurantId = Number(parentId);

      const fd = new FormData();
      fd.append("service", new Blob([JSON.stringify(dataPayload)], { type: "application/json" }));
      if (selectedFile) fd.append("imageFile", selectedFile);

      if (editingItem) {
        const res = await updateNearbyService(editingItem.id, fd);
        toast.success(res.data.message || "Đã cập nhật");
      } else {
        const res = await createNearbyService(fd);
        toast.success(res.data.message || "Đã thêm dịch vụ lân cận");
      }
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thao tác thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    const newLocStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    // 1. Update coordinates instantly
    setFormData((prev) => ({ ...prev, location: newLocStr }));

    // 2. Fetch detailed human-readable info in the background (Reverse Geocoding with extratags enabled)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi&extratags=1`
      );
      const data = await res.json();
      if (data) {
        // Extract POI (Point of Interest) name
        const addressKeys = [
          "restaurant", "cafe", "hotel", "motel", "hostel", "pub", "bar", 
          "shop", "supermarket", "pharmacy", "hospital", "bank", "atm", 
          "tourism", "amenity", "historic", "leisure", "attraction"
        ];
        
        let placeName = data.name || "";
        if (!placeName && data.address) {
          for (const key of addressKeys) {
            if (data.address[key]) {
              placeName = data.address[key];
              break;
            }
          }
        }

        // Auto-detect service type based on Nominatim categories
        let detectedType = "";
        if (data.address) {
          if (data.address.hotel || data.address.motel || data.address.hostel) {
            detectedType = "HOTEL";
          } else if (data.address.restaurant) {
            detectedType = "RESTAURANT";
          } else if (data.address.cafe || data.address.pub || data.address.bar) {
            detectedType = "CAFE";
          } else if (data.address.pharmacy) {
            detectedType = "PHARMACY";
          } else if (data.address.hospital) {
            detectedType = "HOSPITAL";
          } else if (data.address.atm || data.address.bank) {
            detectedType = "ATM";
          } else if (data.address.shop || data.address.supermarket) {
            detectedType = "SHOP";
          }
        }

        // Parse detailed extratags (Opening hours, phone number, rating)
        let opHours = "";
        if (data.extratags && data.extratags.opening_hours) {
          opHours = data.extratags.opening_hours;
        } else {
          // Premium default opening hours based on type
          if (detectedType === "HOTEL" || detectedType === "ATM" || detectedType === "HOSPITAL") {
            opHours = "Mở cửa cả ngày (24/7)";
          } else {
            opHours = "08:00 - 22:00";
          }
        }

        let phone = "";
        if (data.extratags) {
          phone = data.extratags.phone || data.extratags["contact:phone"] || data.extratags.mobile || "";
        }

        let rating = 4.5;
        if (data.extratags) {
          if (data.extratags.stars) {
            rating = parseFloat(data.extratags.stars) || 4.5;
          } else if (data.extratags.rating) {
            rating = parseFloat(data.extratags.rating) || 4.5;
          }
        }
        rating = Math.round(rating * 10) / 10;

        let reviewCount = Math.floor(Math.random() * 260) + 40; // Realistic reviews count between 40-300

        // Parse image or use high-fidelity, type-aware curated Unsplash travel photos
        let imgUrl = "";
        if (data.extratags && data.extratags.image && data.extratags.image.startsWith("http")) {
          imgUrl = data.extratags.image;
        } else {
          const DEFAULT_IMAGES: Record<string, string> = {
            HOTEL: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            RESTAURANT: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            CAFE: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
            PHARMACY: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
            HOSPITAL: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
            ATM: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
            SHOP: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
            PARKING: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
          };
          imgUrl = DEFAULT_IMAGES[detectedType] || DEFAULT_IMAGES.RESTAURANT;
        }

        // Update form state with retrieved details
        setFormData((prev) => ({
          ...prev,
          serviceName: placeName || prev.serviceName,
          address: data.display_name || prev.address,
          serviceType: detectedType || prev.serviceType,
          openingHours: opHours || prev.openingHours,
          phoneNumber: phone || prev.phoneNumber,
          rating: rating || prev.rating,
          reviewCount: reviewCount || prev.reviewCount,
          imageUrl: imgUrl || prev.imageUrl,
        }));
      }
    } catch (err) {
      console.error("Lỗi khi tự động lấy địa chỉ từ bản đồ:", err);
    }
  }, []);

  const getFullImageUrl = (url: string | null) => {
    if (!url) return "https://placehold.co/56x56?text=N/A";
    if (url.startsWith("http")) return url;
    return `${IMAGE_BASE_URL}/${url}`;
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <MapTrifold size={22} weight="fill" color="#06b6d4" />
          <h5>Dịch vụ lân cận ({services.length})</h5>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} weight="bold" />
          <span>Thêm</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}><p>Đang tải...</p></div>
      ) : services.length === 0 ? (
        <div className={styles.empty}>
          <MapTrifold size={32} color="#cbd5e1" />
          <p>Chưa có dịch vụ lân cận nào</p>
        </div>
      ) : (
        <div className={styles.serviceList}>
          {services.map((svc) => {
            const typeInfo = SERVICE_TYPE_MAP[svc.serviceType] || { label: svc.serviceType, colorClass: "bgBlue" };
            return (
              <div key={svc.id} className={styles.serviceCard}>
                <div className={styles.cardLeft}>
                  <img src={getFullImageUrl(svc.imageUrl)} alt="" className={styles.cardImg} />
                  <div className={styles.cardInfo}>
                    <p className={styles.cardName}>{svc.serviceName}</p>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.typeBadge} ${styles[typeInfo.colorClass] || ""}`}>{typeInfo.label}</span>
                      <span className={styles.distance}>{svc.distanceKm} km</span>
                      <span className={styles.rating}><Star size={12} weight="fill" color="#f59e0b" /> {svc.rating}</span>
                    </div>
                    <div className={styles.cardAddress}><MapPin size={12} color="#94a3b8" /> <span>{svc.address}</span></div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => openView(svc)} title="Xem chi tiết" className={styles.iconBtn}><Eye size={16} /></button>
                  <button onClick={() => openEdit(svc)} title="Sửa" className={styles.iconBtn}><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(svc.id)} title="Xóa" className={`${styles.iconBtn} ${styles.danger}`}><Trash size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)}>
            <motion.div className={`${styles.modal} ${styles.addEditModalHorizontal}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h4>{editingItem ? "Sửa dịch vụ lân cận" : "Thêm dịch vụ lân cận"}</h4>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={16} /></button>
              </div>
              <div className={styles.addModalContentWrapper}>
                {/* Left Side: Form */}
                <div className={styles.addModalFormSide}>
                  <div className={styles.modalBody}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Tên dịch vụ *</label>
                        <input value={formData.serviceName} onChange={(e) => updateField("serviceName", e.target.value)} placeholder="VD: Khách sạn ABC" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Loại</label>
                        <CustomDropdown
                          options={Object.entries(SERVICE_TYPE_MAP).map(([key, { label }]) => ({ value: key, label }))}
                          value={formData.serviceType}
                          onChange={(val) => updateField("serviceType", val)}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Địa chỉ</label>
                      <input value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Địa chỉ..." />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Khoảng cách (km)</label><input type="number" step="0.1" value={formData.distanceKm} onChange={(e) => updateField("distanceKm", Number(e.target.value))} /></div>
                      <div className={styles.formGroup}>
                        <label>Mức giá</label>
                        <CustomDropdown
                          options={[{ value: "CHEAP", label: "Bình dân" }, { value: "MODERATE", label: "Trung bình" }, { value: "EXPENSIVE", label: "Cao cấp" }, { value: "LUXURY", label: "Sang trọng" }]}
                          value={formData.priceLevel}
                          onChange={(val) => updateField("priceLevel", val)}
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>SĐT</label><input value={formData.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} placeholder="0123..." /></div>
                      <div className={styles.formGroup}><label>Giờ mở cửa</label><input value={formData.openingHours} onChange={(e) => updateField("openingHours", e.target.value)} placeholder="08:00 - 22:00" /></div>
                    </div>
                    <div className={styles.formGroup}><label>Tọa độ (vĩ độ,kinh độ) *</label><input value={formData.location} onChange={(e) => updateField("location", e.target.value)} placeholder="10.7769,106.7009" /></div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Đánh giá (0-5)</label><input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => updateField("rating", Number(e.target.value))} /></div>
                      <div className={styles.formGroup}><label>Lượt đánh giá</label><input type="number" value={formData.reviewCount} onChange={(e) => updateField("reviewCount", Number(e.target.value))} /></div>
                      <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <CustomDropdown options={[{ value: "ACTIVE", label: "Hoạt động" }, { value: "INACTIVE", label: "Tạm ngưng" }]} value={formData.status} onChange={(val) => updateField("status", val)} />
                      </div>
                    </div>
                    <div className={styles.formGroup}><label>Mô tả</label><textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} rows={2} /></div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label>Ảnh dịch vụ</label><input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} /></div>
                      <div className={styles.formGroup}><label>URL ảnh</label><input value={formData.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://..." /></div>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)} disabled={isSaving}>Hủy</button>
                    <button className={styles.btnSave} onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Đang xử lý..." : (editingItem ? "Cập nhật" : "Thêm")}
                    </button>
                  </div>
                </div>

                {/* Right Side: Map */}
                <div className={styles.addModalMapSide}>
                  {(() => {
                    const parentPt = parseCoordinates(parentLocation || "");
                    const servicePt = parseCoordinates(formData.location);

                    return (
                      <div className={styles.addMapContainerWrapper}>
                        <div className={styles.mapHelpText}>
                          <Info size={14} weight="bold" /> Click vào bản đồ để chọn nhanh tọa độ
                        </div>
                        <MapContainer
                          center={parentPt || [16.06, 108.22]}
                          zoom={15}
                          zoomControl={true}
                          className={styles.addModalMap}
                        >
                          <TileLayer
                            attribution="© Google Maps"
                            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                            maxZoom={20}
                          />

                          <AddServiceMapEffect parentCenter={parentPt} serviceCenter={servicePt} />
                          <MapClickHandler onMapClick={handleMapClick} />

                          {/* Parent Marker */}
                          {parentPt && (
                            <Marker 
                              key={`parent-pin-${parentPt[0]}-${parentPt[1]}`}
                              position={parentPt} 
                              icon={parentMarkerIcon(parentType)}
                            >
                              <Popup>
                                <div style={{ fontSize: "0.85rem", textWrap: "balance" }}>
                                  <strong style={{ color: "#10b981" }}>{parentName || "Địa điểm gốc"}</strong>
                                  <br />
                                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Địa điểm chính đang xem</span>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          {/* Newly added/edited Service Marker */}
                          {servicePt && (
                            <Marker 
                              key={`service-active-pin-${servicePt[0]}-${servicePt[1]}`}
                              position={servicePt} 
                              icon={newServiceMarkerIcon(formData.serviceType)}
                            >
                              <Popup>
                                <div style={{ fontSize: "0.85rem", textWrap: "balance" }}>
                                  <strong style={{ color: "#e11d48" }}>{formData.serviceName || "Dịch vụ mới"}</strong>
                                  <br />
                                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loại: {formData.serviceType}</span>
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && viewingItem && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)}>
            <motion.div className={`${styles.modal} ${styles.detailModalWide}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className={styles.horizontalModalContent}>
                {/* Left Side: Visuals */}
                <div className={styles.modalLeftColumn}>
                  <div className={styles.modalHero}>
                    {viewingItem.imageUrl && <img src={getFullImageUrl(viewingItem.imageUrl)} alt="" className={styles.fullHeroImg} />}
                    <div className={styles.heroOverlay}>
                       <span className={`${styles.typeBadge} ${styles[SERVICE_TYPE_MAP[viewingItem.serviceType]?.colorClass || 'bgBlue']}`}>
                          {SERVICE_TYPE_MAP[viewingItem.serviceType]?.label || viewingItem.serviceType}
                       </span>
                    </div>
                  </div>
                  
                  <div className={styles.mapContainerFull}>
                    <iframe 
                      title="Google Map" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(viewingItem.location || (viewingItem.latitude + "," + viewingItem.longitude))}&z=15&output=embed`} 
                      allowFullScreen
                    ></iframe>
                    
                    <div className={styles.mapFloatingActions}>
                      <div className={styles.distanceTag}>
                        <NavigationArrow size={14} weight="fill" /> <span>{viewingItem.distanceKm} km</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(viewingItem.location || (viewingItem.latitude + "," + viewingItem.longitude))}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.directionsBtn}
                      >
                        Chỉ đường
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Side: Information */}
                <div className={styles.modalRightColumn}>
                  <button className={styles.floatingCloseBtn} onClick={() => setIsDetailModalOpen(false)}><X size={24} weight="bold" /></button>
                  
                  <div className={styles.detailHeaderInfo}>
                    <div className={styles.mainTitleGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <h2>{viewingItem.serviceName}</h2>
                              <span className={`${styles.statusPulse} ${viewingItem.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                                <span className={styles.pulseDot} />
                                {viewingItem.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                              </span>
                          </div>
                          <div className={styles.ratingGroup}>
                              <Star size={20} weight="fill" color="#f59e0b" />
                              <span>{viewingItem.rating}</span>
                          </div>
                        </div>
                        <p className={styles.headerAddress}>{viewingItem.address}</p>
                    </div>
                  </div>

                  <div className={styles.detailInfoSection}>
                    <div className={styles.descBox}>
                        <label><Info size={16} /> Mô tả</label>
                        <p>{viewingItem.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}</p>
                    </div>

                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><Phone size={20} weight="fill" color="#10b981" /></div>
                          <div className={styles.infoText}>
                              <label>Hotline</label>
                              <p>{viewingItem.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><Clock size={20} weight="fill" color="#f59e0b" /></div>
                          <div className={styles.infoText}>
                              <label>Giờ hoạt động</label>
                              <p>{viewingItem.openingHours || 'N/A'}</p>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><CurrencyCircleDollar size={20} weight="fill" color="#8b5cf6" /></div>
                          <div className={styles.infoText}>
                              <label>Mức giá</label>
                              <p>{viewingItem.priceLevel}</p>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NearbyServicesSection;
