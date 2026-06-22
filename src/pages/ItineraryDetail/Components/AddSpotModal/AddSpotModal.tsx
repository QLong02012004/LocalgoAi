import React, { useState, useEffect } from "react";
import { type RoutePoint } from "../../types";
import styles from "./AddSpotModal.module.scss";
import axios from "axios";
import { X, MapPin, Clock, CalendarBlank, Notepad, MagnifyingGlass, Plus, CheckCircle, Bed, ForkKnife, Sparkle, Money, Compass, House } from "@phosphor-icons/react";
import Select, { type StylesConfig } from "react-select";
import { 
  searchAttractionsByKeyword, 
  searchHotelsByKeyword, 
  searchRestaurantsByKeyword 
} from "../../../../services/adminService";
import { toast } from "react-toastify";

// Leaflet imports for Google Map inside Modal
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  onClose: () => void;
  onAdd: (point: Omit<RoutePoint, "id">) => void;
  onPreviewSpot?: (point: Partial<RoutePoint> | null) => void;
  maxDays?: number;
  currentDay?: number;
  initialData?: Partial<RoutePoint> | null;
  parentPoint?: RoutePoint | null;
}

interface Suggestion {
  id: number | string;
  display_name: string;
  name?: string;
  lat: string | number;
  lon: string | number;
  source: 'attraction' | 'hotel' | 'restaurant' | 'osm';
  imageUrl?: string;
  averagePrice?: number;
  rating?: number;
  description?: string;
  address?: string;
  tips?: string[];
  costBreakdown?: any;
}


const customSelectStyles: StylesConfig<any, false> = {
  control: (base, state) => ({
    ...base,
    paddingLeft: '32px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: state.isFocused ? '1px solid #0ea5e9' : '1px solid #e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.1)' : 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
    minHeight: '45px',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: state.isFocused ? '#0ea5e9' : '#cbd5e1'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 16px'
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    zIndex: 10001
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#f1f5f9' : 'transparent',
    color: state.isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#0ea5e9',
      color: 'white'
    }
  }),
  placeholder: (base) => ({ ...base, color: '#94a3b8' }),
  singleValue: (base) => ({ ...base, color: '#1e293b' }),
  dropdownIndicator: (base) => ({ ...base, color: '#94a3b8' }),
  indicatorSeparator: () => ({ display: 'none' })
};

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${String(i).padStart(2, '0')} giờ`
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${String(i).padStart(2, '0')} phút`
}));

const durationOptions = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1 giờ 30 phút' },
  { value: 120, label: '2 giờ' },
  { value: 180, label: '3 giờ' },
];

// Custom Leaflet Marker Icons
const parentIcon = L.divIcon({
  className: 'modal-map-parent-marker',
  html: `
    <div style="
      background-color: #ef4444;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      border: 2px solid white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,120a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"></path>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const serviceIcon = L.divIcon({
  className: 'modal-map-service-marker',
  html: `
    <div style="
      background-color: #0ea5e9;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      border: 2px solid white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,64a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,64Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,144Zm96-32A96,96,0,1,1,128,16,96.11,96.11,0,0,1,224,112Zm-16,0a80,80,0,1,0-80,80A80.09,80.09,0,0,0,208,112Z"></path>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom map effect manager for fitting bounds
const ModalMapEffect: React.FC<{
  parentLatLng: { lat: number; lng: number } | null;
  selectedLatLng: { lat: number; lng: number } | null;
}> = ({ parentLatLng, selectedLatLng }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const coords: [number, number][] = [];
    if (parentLatLng) coords.push([parentLatLng.lat, parentLatLng.lng]);
    if (selectedLatLng) coords.push([selectedLatLng.lat, selectedLatLng.lng]);

    if (coords.length === 2) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds.pad(0.35), { duration: 1.2 });
    } else if (coords.length === 1) {
      map.setView(coords[0], 15, { animate: true });
    }
  }, [parentLatLng, selectedLatLng, map]);

  return null;
};

const AddSpotModal: React.FC<Props> = ({ onClose, onAdd, onPreviewSpot, maxDays = 3, currentDay = 1, initialData, parentPoint }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [estimatedCost, setEstimatedCost] = useState(initialData?.estimatedCost || 0);
  const costInputRef = React.useRef<HTMLInputElement | null>(null);
  const [cursorPos, setCursorPos] = useState<number | null>(null);

  // Helper to format number to dot notation: e.g. 3000000 -> 3.000.000
  const formatNumberWithDots = (val: number | string) => {
    if (!val) return "";
    const num = String(val).replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat('vi-VN').format(Number(num));
  };

  // Preserve cursor position on format
  React.useLayoutEffect(() => {
    if (costInputRef.current && cursorPos !== null) {
      costInputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [estimatedCost]);

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    const rawVal = value.replace(/\D/g, "");
    
    const selectionStart = input.selectionStart || 0;
    const digitsBeforeCursor = value.slice(0, selectionStart).replace(/\D/g, "").length;
    
    setEstimatedCost(rawVal ? Number(rawVal) : 0);
    
    // Calculate new cursor position
    const formatted = formatNumberWithDots(rawVal);
    let newPos = 0;
    let digitCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
      }
      newPos++;
      if (digitCount === digitsBeforeCursor) {
        break;
      }
    }
    setCursorPos(newPos);
  };

  const [address, setAddress] = useState(initialData?.address || "");
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    initialData?.lat && initialData?.lng ? { lat: initialData.lat, lng: initialData.lng } : null
  );
  const [type, setType] = useState<RoutePoint["type"]>(initialData?.type || "attraction");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState("");
  const [daySelect, setDaySelect] = useState(currentDay);
  const [entityId, setEntityId] = useState<number | string>(initialData?.entityId || 0);
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [description, setDescription] = useState(initialData?.description || "");
  const [tips, setTips] = useState<string[]>(initialData?.tips && Array.isArray(initialData.tips) ? initialData.tips : []);
  const [costBreakdown, setCostBreakdown] = useState<any>(initialData?.costBreakdown || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateEndTime = (startH: string, startM: string, durMins: number) => {
    const totalMins = parseInt(startH) * 60 + parseInt(startM) + durMins;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const calculatedEndTime = calculateEndTime(hour, minute, duration);

  const dayOptions = Array.from({ length: maxDays }, (_, i) => ({
    value: i + 1,
    label: `Ngày ${i + 1}`
  }));

  // Auto-search on type with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const [attRes, hotelRes, restRes] = await Promise.all([
            searchAttractionsByKeyword(searchQuery, 0, 5),
            searchHotelsByKeyword(searchQuery, 0, 5),
            searchRestaurantsByKeyword(searchQuery, 0, 5)
          ]);

          const extractCoords = (item: any) => {
            if (item.coordinates?.lat && item.coordinates?.lng) return { lat: item.coordinates.lat, lng: item.coordinates.lng };
            if (item.latitude && item.longitude) return { lat: item.latitude, lng: item.longitude };
            const raw = item.location || item.addressDetailed || "";
            const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
            if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            return { lat: 0, lng: 0 };
          };

          const localAtts: Suggestion[] = (attRes.data.data?.content || []).map(a => {
            const coords = extractCoords(a);
            const id = a.id || (a as any).attractionId || (a as any).entityId;
            return {
              id: id,
              name: a.name || (a as any).title || "",
              display_name: a.addressDetailed || a.location || "Đà Nẵng",
              lat: coords.lat,
              lon: coords.lng,
              source: 'attraction',
              imageUrl: a.imageUrl || (a as any).image || (a as any).img || "",
              averagePrice: (a as any).averagePrice || (a as any).entranceFee || (a as any).price || 0,
              rating: a.rating || (a as any).reviews || 0,
              description: a.description || (a as any).desc || (a as any).content || (a as any).summary || "",
              address: a.addressDetailed || a.location || "",
              tips: typeof (a as any).tips === 'string' ? ((a as any).tips.startsWith('[') ? JSON.parse((a as any).tips) : [(a as any).tips]) : ((a as any).tips || []),
              costBreakdown: (a as any).costBreakdown || null
            };
          });

          const localHotels: Suggestion[] = (hotelRes.data.data?.content || []).map(h => {
            const coords = extractCoords(h);
            const id = h.id || (h as any).hotelId || (h as any).entityId;
            return {
              id: id,
              name: h.name,
              display_name: h.addressDetailed || h.location || "Đà Nẵng",
              lat: coords.lat,
              lon: coords.lng,
              source: 'hotel',
              imageUrl: h.imageUrl || "",
              averagePrice: (h as any).averagePrice || (h as any).minPrice || (h as any).pricePerNight || 0,
              rating: h.rating || 0,
              description: h.description || (h as any).desc || (h as any).content || (h as any).summary || "",
              address: h.addressDetailed || h.location || "",
              tips: typeof (h as any).tips === 'string' ? ((h as any).tips.startsWith('[') ? JSON.parse((h as any).tips) : [(h as any).tips]) : ((h as any).tips || []),
              costBreakdown: (h as any).costBreakdown || null
            };
          });

          const localRests: Suggestion[] = (restRes.data.data?.content || []).map(r => {
            const coords = extractCoords(r);
            const id = r.id || (r as any).restaurantId || (r as any).entityId;
            return {
              id: id,
              name: r.name,
              display_name: r.addressDetailed || r.location || "Đà Nẵng",
              lat: coords.lat,
              lon: coords.lng,
              source: 'restaurant',
              imageUrl: r.imageUrl || "",
              averagePrice: (r as any).averagePrice || (r as any).pricePerPerson || 0,
              rating: r.rating || 0,
              description: r.description || (r as any).desc || (r as any).content || (r as any).summary || "",
              address: r.addressDetailed || r.location || "",
              tips: typeof (r as any).tips === 'string' ? ((r as any).tips.startsWith('[') ? JSON.parse((r as any).tips) : [(r as any).tips]) : ((r as any).tips || []),
              costBreakdown: (r as any).costBreakdown || null
            };
          });

          setSuggestions([...localAtts, ...localHotels, ...localRests]);
        } catch (e) {
          console.error("Search error:", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectSuggestion = (item: Suggestion) => {
    const selectedName = item.name || item.display_name.split(",")[0];
    setName(selectedName);
    setAddress(item.display_name);
    setImageUrl(item.imageUrl || "");
    setEstimatedCost(item.averagePrice || 0);
    setLatLng({ lat: Number(item.lat), lng: Number(item.lon) });
    setEntityId(item.id);
    setRating(item.rating || 0);
    setDescription(item.description || "");
    setTips(item.tips || []);
    setCostBreakdown(item.costBreakdown || null);
    setSuggestions([]);
    setSearchQuery("");
    
    if (onPreviewSpot) {
      onPreviewSpot({
        name: selectedName,
        lat: Number(item.lat),
        lng: Number(item.lon),
        imageUrl: item.imageUrl,
        estimatedCost: item.averagePrice || 0,
        type: item.source === 'hotel' ? 'hotel' : item.source === 'restaurant' ? 'restaurant' : 'attraction',
        entityId: item.id,
        rating: item.rating || 0,
        address: item.address || item.display_name,
        description: item.description || "",
        tips: item.tips || [],
        costBreakdown: item.costBreakdown || null
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const pointData = {
        name: name.trim(),
        lat: latLng?.lat || 0,
        lng: latLng?.lng || 0,
        time: `${hour}:${minute}`,
        endTime: calculatedEndTime,
        durationMinutes: duration,
        type: type,
        imageUrl: imageUrl,
        estimatedCost: estimatedCost,
        address: address || undefined,
        description: description || "",
        note: note.trim() || undefined,
        day: daySelect,
        entityId: entityId,
        rating: rating,
        tips: tips || [],
        costBreakdown: costBreakdown || null,
        latitude: latLng?.lat,
        longitude: latLng?.lng
      };

      
      console.log(">>> Adding new spot to itinerary:", pointData);
      
      onAdd(pointData);
      onClose();
    } catch {
      setError("Có lỗi xảy ra khi thêm địa điểm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${parentPoint ? styles.hasMap : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Thêm địa điểm</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Chỉ chọn các địa danh, khách sạn, nhà hàng có trên hệ thống
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className={styles.modalBodyWrapper}>
          <form onSubmit={handleSubmit} className={styles.addSpotForm}>
            <div className={styles.formBody}>
              {/* Search Section */}
              <div className={styles.searchSection}>
                <label>Tìm kiếm trong hệ thống</label>
                <div className={styles.searchInputWrapper}>
                  <MagnifyingGlass size={20} className={styles.searchIcon} weight="bold" />
                  <input
                    type="text"
                    placeholder="Nhập tên khách sạn, nhà hàng, địa danh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {isSearching && <div className={styles.miniSpinner}></div>}
                </div>

                {suggestions.length > 0 && (
                  <div className={styles.suggestionsList}>
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggestion(item)}
                        onMouseEnter={() => {
                          if (onPreviewSpot) {
                            onPreviewSpot({
                              name: item.name,
                              lat: Number(item.lat),
                              lng: Number(item.lon),
                              type: item.source === 'hotel' ? 'hotel' : item.source === 'restaurant' ? 'restaurant' : 'attraction'
                            });
                          }
                        }}
                      >
                        <div className={styles.sugIcon}>
                          {item.source === 'hotel' && <House size={18} weight="fill" color="#8b5cf6" />}
                          {item.source === 'restaurant' && <ForkKnife size={18} weight="fill" color="#f59e0b" />}
                          {item.source === 'attraction' && <Sparkle size={18} weight="fill" color="#ec4899" />}
                        </div>
                        <div className={styles.sugText}>
                          <div className={styles.sugName}>
                            {item.name}
                            <span className={styles.sugBadge}>
                              {item.source === 'hotel' ? 'Khách sạn' : item.source === 'restaurant' ? 'Nhà hàng' : 'Địa danh'}
                            </span>
                          </div>
                          <div className={styles.sugAddr}>{item.display_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Địa điểm đã chọn</label>
                  <div className={styles.inputWrapper}>
                    <MapPin size={18} weight="fill" className={styles.inputIcon} />
                    <input
                      type="text"
                      value={name}
                      readOnly
                      placeholder="Chọn địa điểm từ danh sách gợi ý..."
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Giá dự kiến (VNĐ)</label>
                  <div className={styles.inputWrapper}>
                    <Money size={18} weight="fill" className={styles.inputIcon} color="#10b981" />
                    <input
                      ref={costInputRef}
                      type="text"
                      value={estimatedCost ? formatNumberWithDots(estimatedCost) : ""}
                      onChange={handleCostChange}
                      placeholder="Ví dụ: 200.000"
                      style={{ paddingRight: '55px' }}
                    />
                    <span className={styles.currencySuffix}>VNĐ</span>
                  </div>
                </div>
              </div>

              {latLng && (
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '4px', marginTop: '-12px', marginBottom: '12px' }}>
                  ✓ Đã xác định vị trí trên bản đồ
                </p>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày</label>
                  <div className={styles.inputWrapper}>
                    <CalendarBlank size={18} weight="fill" className={styles.inputIcon} />
                    <div style={{ width: '100%' }}>
                      <Select 
                        options={dayOptions}
                        value={dayOptions.find(opt => opt.value === daySelect)}
                        onChange={(opt) => setDaySelect(opt?.value || 1)}
                        styles={customSelectStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Giờ bắt đầu</label>
                  <div className={styles.timeSelectRow}>
                     <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <Clock size={18} weight="fill" className={styles.inputIcon} />
                      <div style={{ width: '100%' }}>
                        <Select 
                          options={hourOptions}
                          value={hourOptions.find(opt => opt.value === hour)}
                          onChange={(opt) => setHour(opt?.value || '09')}
                          styles={customSelectStyles}
                          isSearchable={false}
                        />
                      </div>
                    </div>
                    <span className={styles.timeSeparator}>:</span>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <div style={{ width: '100%' }}>
                        <Select 
                          options={minuteOptions}
                          value={minuteOptions.find(opt => opt.value === minute)}
                          onChange={(opt) => setMinute(opt?.value || '00')}
                          styles={customSelectStyles}
                          isSearchable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Thời lượng dự kiến</label>
                  <div className={styles.inputWrapper}>
                    <Clock size={18} weight="bold" className={styles.inputIcon} />
                    <div style={{ width: '100%' }}>
                      <Select 
                        options={durationOptions}
                        value={durationOptions.find(opt => opt.value === duration)}
                        onChange={(opt) => setDuration(opt?.value || 60)}
                        styles={customSelectStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Kết thúc (dự kiến)</label>
                  <div className={styles.endTimeDisplay}>
                    <Clock size={20} weight="fill" />
                    {calculatedEndTime}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Ghi chú riêng cho địa điểm này</label>
                <div className={styles.textareaWrapper}>
                  <Notepad size={18} weight="fill" className={styles.textareaIcon} />
                  <textarea
                    placeholder="Ví dụ: Ăn thử món bún mắm, Chụp ảnh ở cổng chính..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
              <button 
                type="submit" 
                className={styles.saveBtn} 
                disabled={loading || !latLng}
                title={!latLng ? "Vui lòng chọn địa điểm từ danh sách gợi ý" : ""}
              >
                {loading ? "Đang xử lý..." : <><Plus size={20} weight="bold" /> Thêm vào lộ trình</>}
              </button>
            </div>
          </form>

          {parentPoint && (
            <div className={styles.modalMapContainer}>
              <div className={styles.mapTitle}>
                <Compass size={18} weight="fill" color="#0ea5e9" />
                Vị trí dịch vụ & Điểm chính
              </div>
              <MapContainer 
                center={[parentPoint.lat, parentPoint.lng]} 
                zoom={14} 
                zoomControl={true} 
                className={styles.modalMap}
              >
                <TileLayer
                  attribution="© Google Maps"
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  maxZoom={20}
                />
                
                <ModalMapEffect 
                  parentLatLng={{ lat: parentPoint.lat, lng: parentPoint.lng }} 
                  selectedLatLng={latLng} 
                />

                {/* Parent Point Marker */}
                <Marker position={[parentPoint.lat, parentPoint.lng]} icon={parentIcon}>
                  <Popup>
                    <div style={{ fontSize: '0.85rem', textWrap: 'balance' }}>
                      <strong style={{ color: '#ef4444' }}>Điểm chính hiện tại</strong>
                      <br />
                      {parentPoint.name}
                    </div>
                  </Popup>
                </Marker>

                {/* Selected Nearby Service Marker */}
                {latLng && (
                  <Marker position={[latLng.lat, latLng.lng]} icon={serviceIcon}>
                    <Popup>
                      <div style={{ fontSize: '0.85rem', textWrap: 'balance' }}>
                        <strong style={{ color: '#0ea5e9' }}>Dịch vụ lân cận đang chọn</strong>
                        <br />
                        {name || "Địa điểm mới"}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSpotModal;
