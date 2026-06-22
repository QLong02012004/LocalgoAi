import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styles from './ItineraryDetail.module.scss';
import ItinerarySidebar from './Components/ItinerarySidebar/ItinerarySidebar';
import ItineraryMap from './Components/ItineraryMap/ItineraryMap';
import AddSpotModal from './Components/AddSpotModal/AddSpotModal';
import { toast } from 'react-toastify';
import { 
  getAISuggestedRoute, 
  getTravelMetrics, 
  updateTravelPlan,
  getSampleItineraryById,
  getItineraryById,
  getRoutePolyline,
  getDailyRoutePolyline,
  publishItinerary,
  reverseGeocode,
  itineraryService,
  type DayItinerary,
  type ItineraryActivity,
  type ItineraryType,
  type GeneratedItinerary,
  type GeneratedDay,
  type GeneratedActivity,
  type GeneratedHotel
} from '../../services/itineraryService';
import { 
  fetchHotelsList, 
  fetchRestaurantsList, 
  fetchAttractionsList,
  fetchNearbyServicesByTarget
} from '../../services/adminService';
import PlaceDetailPanel from './Components/PlaceDetailPanel/PlaceDetailPanel';
import NavigationModal from './Components/NavigationModal/NavigationModal';
import EditSpotModal from './Components/EditSpotModal/EditSpotModal';
import { CaretRight, Compass, X } from '@phosphor-icons/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { type RoutePoint } from './types';
import Navbar from '../../components/Layout/Navbar/Navbar';

const beautifyName = (name: string, location?: string): string => {
  if (!name || name.toLowerCase().includes("unknown attraction") || name.toLowerCase().includes("be đang thiếu")) {
    if (location && !location.toLowerCase().includes("unknown")) {
      return location.split(',')[0].trim();
    }
    return "Địa điểm tham quan";
  }
  return name;
};

const formatTime = (time: any): string => {
  if (Array.isArray(time)) {
    const h = String(time[0]).padStart(2, '0');
    const m = String(time[1]).padStart(2, '0');
    return `${h}:${m}`;
  }
  if (typeof time === 'string') return time.substring(0, 5);
  return "08:00";
};

const parseCoords = (loc: any, defaultLat: number, defaultLng: number) => {
  if (!loc || typeof loc !== 'string') return { lat: defaultLat, lng: defaultLng };
  const parts = loc.split(',').map(p => parseFloat(p.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return { lat: defaultLat, lng: defaultLng };
};

const ItineraryDetail: React.FC = () => {
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [detailPointId, setDetailPointId] = useState<string | null>(null);
  const [dayRouteCoords, setDayRouteCoords] = useState<[number, number][]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [previewPoint, setPreviewPoint] = useState<Partial<RoutePoint> | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, { distance: string; duration: number }>>({});
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState<any | null>(null);
  const [contextualServices, setContextualServices] = useState<any[]>([]);
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [navDestination, setNavDestination] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [navRoute, setNavRoute] = useState<[number, number][] | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [activeDay, setActiveDay] = useState(1);
  const [fullItinerary, setFullItinerary] = useState<GeneratedItinerary | ItineraryType | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const planData = location.state?.planData;
  const itineraryDataFromState = location.state?.itineraryData;

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      const segmentRequests = [];
      const keys: string[] = [];
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const key = `${p1.id}-${p2.id}`;
        if (!metrics[key]) {
          keys.push(key);
          segmentRequests.push(getTravelMetrics({ lat: p1.lat, lng: p1.lng }, { lat: p2.lat, lng: p2.lng }));
        }
      }
      if (segmentRequests.length > 0) {
        try {
          const results = await Promise.all(segmentRequests);
          const newMetrics = { ...metrics };
          results.forEach((res, index) => { newMetrics[keys[index]] = res; });
          setMetrics(newMetrics);
        } catch (err) {
          console.error("Error fetching metrics:", err);
        }
      }
    };
    if (points.length > 1) fetchMetrics();
  }, [points, metrics]);

  useEffect(() => {
    if (points.length === 0) return;

    let adjusted = false;
    const newPoints = [...points];

    // Nhóm các điểm theo ngày để tính toán độc lập từng ngày
    const days = Array.from(new Set(points.map(p => p.day || 1))).sort((a, b) => a - b);

    days.forEach(dayNum => {
      // Lọc các điểm của ngày này theo thứ tự hiện tại của points
      const dayPoints = newPoints.filter(p => (p.day || 1) === dayNum);
      if (dayPoints.length === 0) return;

      let lastEndMins = -1;

      dayPoints.forEach((p, idx) => {
        const isRestaurant = p.type === 'restaurant';
        const isHotel = p.type === 'hotel';
        const duration = isHotel ? 30 : (isRestaurant ? 90 : (p.durationMinutes || 60));

        // Phân tích thời gian hiện tại của điểm
        const [h, m] = p.time.split(':').map(Number);
        let startMins = isNaN(h) ? 8 * 60 : h * 60 + m;

        // Đảm bảo không bắt đầu trước 08:00 sáng cho điểm đầu tiên
        if (idx === 0) {
          startMins = Math.max(startMins, 8 * 60);
        }

        // Tự động đẩy lùi thời gian nếu điểm này bị đè lên bởi điểm trước + thời gian di chuyển
        if (lastEndMins !== -1 && startMins < lastEndMins) {
          startMins = lastEndMins;
        }

        // Nhích giờ ăn uống cho nhà hàng (nếu thời gian mới chưa tới giờ ăn)
        if (isRestaurant) {
          if (startMins < 11 * 60 && idx > 0) {
            startMins = Math.max(startMins, 11 * 60 + 30); 
          } else if (startMins < 18 * 60 && startMins > 14 * 60) {
            startMins = Math.max(startMins, 18 * 60 + 30);
          }
        }

        // Định dạng startTime mới
        const startH = Math.floor(startMins / 60) % 24;
        const startM = startMins % 60;
        const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

        // Định dạng endTime mới
        const endTimeMins = startMins + duration;
        const endH = Math.floor(endTimeMins / 60) % 24;
        const endM = endTimeMins % 60;
        const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        // Cập nhật điểm trong danh sách tổng
        const originalPointIdx = newPoints.findIndex(op => op.id === p.id);
        if (originalPointIdx !== -1) {
          const original = newPoints[originalPointIdx];
          if (original.time !== timeStr || original.endTime !== endTimeStr) {
            adjusted = true;
            newPoints[originalPointIdx] = {
              ...original,
              time: timeStr,
              endTime: endTimeStr,
              durationMinutes: duration
            };
          }
        }

        // Tính thời gian di chuyển tới điểm tiếp theo để làm mốc cho điểm sau
        if (idx < dayPoints.length - 1) {
          const nextPoint = dayPoints[idx + 1];
          let travelDuration = 30; // Mặc định 30 phút

          const key = `${p.id}-${nextPoint.id}`;
          if (metrics[key] && metrics[key].duration) {
            travelDuration = metrics[key].duration;
          } else if (p.lat && p.lng && nextPoint.lat && nextPoint.lng) {
            // Haversine fallback
            const R = 6371;
            const dLat = (nextPoint.lat - p.lat) * Math.PI / 180;
            const dLng = (nextPoint.lng - p.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p.lat * Math.PI / 180) * Math.cos(nextPoint.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            travelDuration = Math.round((distance / 25) * 60) + 5;
            travelDuration = Math.max(5, Math.min(travelDuration, 120));
          }

          lastEndMins = endTimeMins + travelDuration;
        }
      });
    });

    if (adjusted) {
      setPoints(newPoints);
      setIsDirty(true);
    }
  }, [points, metrics]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && !id) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng này!');
      navigate('/auth');
    }
  }, [navigate, id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch nearby places based on province
  useEffect(() => {
    const fetchNearby = async () => {
      if (!fullItinerary?.provinceId) return;
      
      try {
        const [hotels, rests, atts] = await Promise.all([
          fetchHotelsList(0, 50, fullItinerary.provinceId),
          fetchRestaurantsList(0, 50, fullItinerary.provinceId),
          fetchAttractionsList(0, 50, fullItinerary.provinceId)
        ]);

        const allNearby = [
          ...(hotels.data.data?.content || []).map(h => ({ ...h, serviceType: 'hotel' })),
          ...(rests.data.data?.content || []).map(r => ({ ...r, serviceType: 'restaurant' })),
          ...(atts.data.data?.content || []).map(a => ({ ...a, serviceType: 'attraction' }))
        ];

        setNearbyPlaces(allNearby);
      } catch (err) {
        console.error("Error fetching nearby places:", err);
      }
    };

    fetchNearby();
  }, [fullItinerary?.provinceId]);

  useEffect(() => {
    const fetchDayRoute = async () => {
      const dailyPoints = points.filter(p => (p.day || 1) === activeDay && p.lat && p.lng);
      if (dailyPoints.length < 2) {
        setDayRouteCoords([]);
        return;
      }
      try {
        const coords = await getDailyRoutePolyline(dailyPoints);
        if (coords && coords.length > 0) {
          setDayRouteCoords(coords);
        } else {
          setDayRouteCoords(dailyPoints.map(p => [p.lat, p.lng] as [number, number]));
        }
      } catch (err) {
        console.error("Error fetching day route polyline:", err);
        setDayRouteCoords(dailyPoints.map(p => [p.lat, p.lng] as [number, number]));
      }
    };
    fetchDayRoute();
  }, [points, activeDay]);

  useEffect(() => {
    let adjusted = false;
    const newPoints = points.map(p => {
      if (p.type === "attraction" && p.time) {
        const [h, m] = p.time.split(":").map(Number);
        const timeInMins = h * 60 + m;
        // Nếu địa điểm tham quan bắt đầu từ 07:00 đến dưới 08:00, tự động cộng thêm 1 tiếng (bật sớm quá)
        if (timeInMins >= 7 * 60 && timeInMins < 8 * 60) {
          adjusted = true;
          const newH = (h + 1) % 24;
          const newTime = `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          
          let newEndTime = p.endTime;
          if (p.endTime) {
            const [eh, em] = p.endTime.split(":").map(Number);
            const newEh = (eh + 1) % 24;
            newEndTime = `${String(newEh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
          }
          
          return {
            ...p,
            time: newTime,
            endTime: newEndTime
          };
        }
      }
      return p;
    });

    if (adjusted) {
      setPoints(newPoints);
    }
  }, [points]);

  useEffect(() => {
    const fetchData = async () => {
      if (itineraryDataFromState) {
        setIsOptimizing(true);
        try {
          const data = itineraryDataFromState;
          if (data.itineraryDays) {
            const flattened: RoutePoint[] = [];
            data.itineraryDays.forEach((dayPlan: GeneratedDay) => {
              dayPlan.activities.forEach((act: GeneratedActivity) => {
                const coords = parseCoords(act.location, act.latitude || 16.467, act.longitude || 107.59);
                flattened.push({
                  id: `ai-${data.itineraryId || 'new'}-${dayPlan.dayNumber}-${act.order}`,
                  name: beautifyName(act.name, act.address),
                  lat: coords.lat,
                  lng: coords.lng,
                  time: formatTime(act.startTime),
                  endTime: act.endTime ? formatTime(act.endTime) : undefined,
                  type: act.type.toLowerCase() as RoutePoint["type"],
                  note: Array.isArray(act.tips) ? act.tips[0] : act.description || "",
                  day: dayPlan.dayNumber,
                  description: act.description || "",
                  address: act.address || "",
                  imageUrl: act.imageUrl || "",
                  rating: act.rating || (act as any).reviews || 0,
                  estimatedCost: act.estimatedCost || 0,
                  tips: (() => {
                    if (Array.isArray(act.tips)) return act.tips;
                    if (typeof act.tips === 'string' && act.tips.startsWith('[')) {
                      try { return JSON.parse(act.tips); } catch { return [act.tips]; }
                    }
                    return act.tips ? [act.tips] : [];
                  })(),
                  galleryImages: act.gallery || [],
                  reviewCount: act.reviewCount || 0,
                    entityId: act.entityId || (act as any).id,
                  costBreakdown: act.costBreakdown || undefined,
                  latitude: act.latitude || coords.lat,
                  longitude: act.longitude || coords.lng
                });
              });
            });
            if (data.hotels && data.hotels.length > 0) {
              const uniqueDays = Array.from(new Set(data.itineraryDays.map((d: any) => d.dayNumber || d.day || 1))) as number[];
              data.hotels.forEach((hotel: GeneratedHotel) => {
                uniqueDays.forEach((dayNum) => {
                  const dailyCost = hotel.pricePerNight || (hotel.totalPrice ? Math.round(hotel.totalPrice / (hotel.nights || uniqueDays.length || 1)) : 0);
                  flattened.push({
                    id: `hotel-${hotel.hotelId}-day-${dayNum}`,
                    name: hotel.name,
                    lat: hotel.latitude || 16.047,
                    lng: hotel.longitude || 108.206,
                    time: dayNum === 1 ? "14:00" : "08:00",
                    type: 'hotel',
                    day: dayNum,
                    durationMinutes: 60,
                    endTime: dayNum === 1 ? "15:00" : "09:00",
                    description: hotel.address,
                    address: hotel.address,
                    imageUrl: hotel.imageUrl,
                    rating: hotel.rating || 0,
                    estimatedCost: dailyCost,
                    pricePerNight: hotel.pricePerNight || dailyCost || 0,
                    nights: hotel.nights || uniqueDays.length || 1,
                    tips: "Chỗ nghỉ chân của bạn.",
                    entityId: hotel.hotelId
                  });
                });
              });
            }
            flattened.sort((a, b) => {
              if (a.day !== b.day) return a.day - b.day;
              if (a.type === 'hotel' && b.type !== 'hotel') return -1;
              if (a.type !== 'hotel' && b.type === 'hotel') return 1;
              return 0;
            });
            setPoints(flattened);
            setFullItinerary({
              ...data,
              reasonRecommended: data.reasonRecommended || `Chào mừng bạn đến với ${data.provinceName || 'điểm đến'}! Đây là lộ trình tuyệt vời được thiết kế dành riêng cho bạn.`
            });
          }
            setIsOptimizing(false);
        } catch (e) { console.error(e); setIsOptimizing(false); }
        return;
      }

      if (id) {
        setIsOptimizing(true);
        try {
          let response;
          try { response = await getItineraryById(id); }
          catch { response = await getSampleItineraryById(id); }
          const data = response.data.data;
          if (data) {
            const flattened: RoutePoint[] = [];
            if (data.itineraryDays) {
              data.itineraryDays.forEach((dayPlan: GeneratedDay) => {
                dayPlan.activities.forEach((act: GeneratedActivity) => {
                  const coords = parseCoords(act.location, act.latitude || 16.467, act.longitude || 107.59);
                  flattened.push({
                    id: `db-${data.itineraryId || data.id}-${dayPlan.dayNumber}-${act.order}`,
                    name: beautifyName(act.name, act.address),
                    lat: coords.lat,
                    lng: coords.lng,
                    time: formatTime(act.startTime),
                    type: act.type.toLowerCase() as RoutePoint["type"],
                    day: dayPlan.dayNumber,
                    address: act.address || "",
                    imageUrl: act.imageUrl || "",
                    rating: act.rating || (act as any).reviews || 0,
                    estimatedCost: act.estimatedCost || 0,
                    description: act.description || "",
                    tips: (() => {
                      if (Array.isArray(act.tips)) return act.tips;
                      if (typeof act.tips === 'string' && act.tips.startsWith('[')) {
                        try { return JSON.parse(act.tips); } catch { return [act.tips]; }
                      }
                      return act.tips ? [act.tips] : [];
                    })(),
                    galleryImages: act.gallery || [],
                    entityId: act.entityId || (act as any).id,
                    costBreakdown: act.costBreakdown || undefined,
                    latitude: act.latitude || coords.lat,
                    longitude: act.longitude || coords.lng
                  });
                });
              });
            } else if (data.itinerary) {
              data.itinerary.forEach((dayPlan: DayItinerary) => {
                dayPlan.activities.forEach((act: ItineraryActivity, idx: number) => {
                  flattened.push({
                    id: `sample-${data.id}-${dayPlan.day}-${idx}`,
                    name: beautifyName(act.location, act.location),
                    lat: act.lat || 16.05,
                    lng: act.lng || 108.2,
                    time: act.time,
                    type: 'attraction',
                    day: dayPlan.day,
                  });
                });
              });
            }
            if (data.hotels && data.hotels.length > 0) {
              const uniqueDays = Array.from(new Set(data.itineraryDays.map((d: any) => d.dayNumber || d.day || 1))) as number[];
              data.hotels.forEach((hotel: GeneratedHotel) => {
                uniqueDays.forEach((dayNum) => {
                  const dailyCost = hotel.pricePerNight || (hotel.totalPrice ? Math.round(hotel.totalPrice / (hotel.nights || uniqueDays.length || 1)) : 0);
                  flattened.push({
                    id: `hotel-${hotel.hotelId}-day-${dayNum}`,
                    name: hotel.name,
                    lat: hotel.latitude || 16.047,
                    lng: hotel.longitude || 108.206,
                    time: dayNum === 1 ? "14:00" : "08:00",
                    type: 'hotel',
                    day: dayNum,
                    durationMinutes: 60,
                    endTime: dayNum === 1 ? "15:00" : "09:00",
                    description: hotel.address,
                    address: hotel.address,
                    imageUrl: hotel.imageUrl,
                    rating: hotel.rating || 0,
                    estimatedCost: dailyCost,
                    pricePerNight: hotel.pricePerNight || dailyCost || 0,
                    nights: hotel.nights || uniqueDays.length || 1,
                    tips: "Chỗ nghỉ chân của bạn.",
                    entityId: hotel.hotelId
                  });
                });
              });
            }
            flattened.sort((a, b) => {
              if (a.day !== b.day) return a.day - b.day;
              if (a.type === 'hotel' && b.type !== 'hotel') return -1;
              if (a.type !== 'hotel' && b.type === 'hotel') return 1;
              return 0;
            });
            setPoints(flattened);
            setFullItinerary({
              ...data,
              reasonRecommended: data.reasonRecommended || `Chào mừng bạn đến với ${data.provinceName || 'điểm đến'}! Đây là lộ trình tuyệt vời được thiết kế dành riêng cho bạn.`
            });
          }
          setIsOptimizing(false);
        } catch (e) { console.error(e); setIsOptimizing(false); }
        return;
      }

      if (planData) {
        setIsOptimizing(true);
        try {
          const res = await getAISuggestedRoute(planData);
          if (res.data.status === 200 && Array.isArray(res.data.data)) {
            interface AISuggestedPoint {
              name: string;
              location?: string;
              address?: string;
              latitude?: number;
              lat?: number;
              longitude?: number;
              lng?: number;
              startTime?: string;
              time?: string;
              type?: string;
              day?: number;
              description?: string;
              imageUrl?: string;
              estimatedCost?: number;
              rating?: number;
            }
            const cleaned: RoutePoint[] = res.data.data.map((p: AISuggestedPoint, idx: number) => ({
              id: `ai-suggested-${idx}`,
              name: beautifyName(p.name, p.location || p.address),
              lat: p.latitude || p.lat || 16.047,
              lng: p.longitude || p.lng || 108.206,
              time: p.startTime || p.time || "09:00",
              type: (p.type?.toLowerCase() || 'attraction') as RoutePoint["type"],
              day: p.day || 1,
              address: p.location || p.address || "",
              description: p.description || "",
              imageUrl: p.imageUrl || "",
              estimatedCost: p.estimatedCost || 0,
              rating: p.rating || 0,
              galleryImages: (p as any).gallery || [],
              tips: (p as any).tips || [],
              entityId: (p as any).entityId
            }));
            setPoints(cleaned);
            
            // Set a synthesized fullItinerary for AI suggestions
            setFullItinerary({
              id: 0,
              itineraryId: "ai-generated",
              userId: 0,
              title: `Lộ trình tại ${planData.destination}`,
              provinceId: 0,
              provinceName: planData.destination,
              days: parseInt(planData.peopleGroup) || 1, 
              budget: planData.budget,
              interests: planData.interests,
              totalEstimatedCost: cleaned.reduce((acc, p) => acc + (p.estimatedCost || 0), 0),
              totalDistance: 0,
              averageRating: 4.5,
              reasonRecommended: `Chào mừng bạn đến với ${planData.destination}! Đây là lộ trình tuyệt vời được thiết kế dành riêng cho bạn.`,
              startDate: planData.travelDate,
              itineraryDays: [],
              hotels: [],
              costBreakdown: null,
              status: 'DRAFT'
            });

            setIsOptimizing(false);
            toast.success(`Đã chuẩn bị lộ trình tại ${planData.destination}!`);
          }
        } catch (e) {
          console.error(e);
          setIsOptimizing(false);
        }
      }
    };
    fetchData();
  }, [id, planData, itineraryDataFromState]);

  const syncItineraryWithBackend = async (currentPoints: RoutePoint[], showToast: boolean = true) => {
    const syncId = fullItinerary?.id || (fullItinerary as any)?.itineraryId || id;
    if (!syncId || syncId === 'ai-generated') return;

    const formatBackendDate = (date: any): string => {
      if (Array.isArray(date)) {
        return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
      }
      if (typeof date === 'string') return date.split('T')[0];
      return new Date().toISOString().split('T')[0];
    };

    try {
      const dayNumbers = Array.from(new Set(currentPoints.map(p => p.day))).sort((a, b) => a - b);
      
      const itineraryDays = dayNumbers.map(dayNum => {
        const dayPoints = currentPoints.filter(p => p.day === dayNum && p.type !== 'hotel');
        const existingDay = (fullItinerary as any)?.itineraryDays?.find((d: any) => d.dayNumber === dayNum);
        
        return {
          dayNumber: dayNum,
          theme: existingDay?.theme || `Ngày ${dayNum}: Khám phá`,
          activities: dayPoints.map((p, index) => ({
            order: index + 1,
            startTime: p.time,
            endTime: p.endTime || p.time,
            type: p.type.toUpperCase(),
            entityId: Number(p.entityId) || 0,
            name: p.name,
            location: `${p.lat},${p.lng}`,
            estimatedCost: p.estimatedCost || 0,
            note: p.note || "",
            description: p.description || "",
            imageUrl: p.imageUrl || "",
            latitude: p.latitude || p.lat,
            longitude: p.longitude || p.lng,
            address: p.address || "",
            rating: p.rating || 0,
            tips: JSON.stringify(Array.isArray(p.tips) ? p.tips : p.tips ? [p.tips] : [])
          }))
        };
      });

      const hotelPoints = currentPoints.filter(p => p.type === 'hotel');
      const finalHotels = hotelPoints.length > 0 
        ? hotelPoints.map(h => ({
            hotelId: Number(h.entityId) || 0,
            checkInDay: h.day,
            checkOutDay: h.day + 1
          }))
        : (fullItinerary as any)?.hotels?.map((h: any) => ({
            hotelId: h.hotelId,
            checkInDay: h.checkInDay,
            checkOutDay: h.checkOutDay
          })) || [];

      const requestData = {
        title: fullItinerary?.title || "Lộ trình của tôi",
        budget: typeof fullItinerary?.budget === 'string' 
          ? parseInt(fullItinerary.budget.replace(/\D/g, '')) 
          : (Number(fullItinerary?.budget) || 0),
        startDate: formatBackendDate(fullItinerary?.startDate),
        itineraryDays,
        hotels: finalHotels,
        costBreakdown: fullItinerary?.costBreakdown || null
      };

      console.log(">>> Syncing Itinerary with Backend:", requestData);

      await itineraryService.updateItinerary(syncId, requestData as any);
      if (showToast) {
        toast.success("Đã đồng bộ lịch trình!");
      }
    } catch (e: any) {
      console.error("Sync error:", e);
    }
  };

  // Debounced Sync Effect removed as per request. 
  // Sync now only happens during Optimization.

  const generateCheaperAlternatives = (p: RoutePoint): Omit<RoutePoint, 'id' | 'day' | 'time' | 'endTime'>[] => {
    const type = p.type;
    if (type === 'restaurant') {
      return [
        {
          name: "Mì Quảng Bà Mua (Đặc sản xứ Quảng)",
          lat: p.lat + 0.002,
          lng: p.lng - 0.002,
          estimatedCost: 45000,
          type: 'restaurant',
          description: "Quán mì Quảng gia truyền nổi tiếng với sợi mì dai, nước lèo đậm đà và giá cả cực kỳ bình dân.",
          address: "95A Nguyễn Tri Phương, Thanh Khê, Đà Nẵng"
        },
        {
          name: "Bún Chả Cá Nguyễn Chí Thanh",
          lat: p.lat - 0.001,
          lng: p.lng + 0.001,
          estimatedCost: 35000,
          type: 'restaurant',
          description: "Món ngon trứ danh Đà Nẵng với chả cá thu dai ngọt tự nhiên, nước dùng thơm vị thơm ngon ngọt.",
          address: "109 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng"
        }
      ];
    } else if (type === 'hotel') {
      return [
        {
          name: "Hanami Hotel Danang (3 sao Premium)",
          lat: p.lat + 0.005,
          lng: p.lng - 0.004,
          estimatedCost: 450000,
          type: 'hotel',
          description: "Khách sạn phong cách Hàn Quốc hiện đại, đầy đủ tiện nghi, chỉ cách biển Mỹ Khê 3 phút đi bộ.",
          address: "61-63 Hoàng Kế Viêm, Ngũ Hành Sơn, Đà Nẵng"
        },
        {
          name: "Sofia Boutique Hotel Danang",
          lat: p.lat - 0.003,
          lng: p.lng + 0.003,
          estimatedCost: 550000,
          type: 'hotel',
          description: "Khách sạn dịch vụ chuyên nghiệp, nội thất ấm cúng, view ngắm biển cực đẹp và giá thành hợp lý.",
          address: "I9 Phạm Văn Đồng, Sơn Trà, Đà Nẵng"
        }
      ];
    } else {
      return [
        {
          name: "Danh thắng Ngũ Hành Sơn (Cảnh sắc tâm linh)",
          lat: p.lat + 0.01,
          lng: p.lng - 0.01,
          estimatedCost: 40000,
          type: 'attraction',
          description: "Khám phá quần thể 5 ngọn núi đá vôi hội tụ hang động, đền chùa cổ kính linh thiêng và view ngắm cảnh tuyệt đẹp.",
          address: "81 Huyền Trân Công Chúa, Ngũ Hành Sơn, Đà Nẵng"
        },
        {
          name: "Bán đảo Sơn Trà & Chùa Linh Ứng (Vé vào cửa 0đ)",
          lat: p.lat - 0.012,
          lng: p.lng + 0.012,
          estimatedCost: 0,
          type: 'attraction',
          description: "Ngắm tượng Phật Bà Quan Âm cao nhất Việt Nam, hòa mình vào không gian rừng nguyên sinh xanh mát, ngắm toàn cảnh vịnh Đà Nẵng hoàn toàn miễn phí.",
          address: "Bán đảo Sơn Trà, Thọ Quang, Sơn Trà, Đà Nẵng"
        }
      ];
    }
  };

  const handleOptimize = async () => {
    if (points.length <= 2) {
      toast.info("Cần ít nhất 3 địa điểm để tối ưu lộ trình.");
      return;
    }
    
    setIsOptimizing(true);
    
    try {
      // Simulate AI calculation delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const dayPoints = points.filter(p => p.day === activeDay);
      const otherPoints = points.filter(p => p.day !== activeDay);
      
      if (dayPoints.length <= 1) {
         setIsOptimizing(false);
         return;
      }

      // --- INTELLECTUAL BUDGET BALANCING ---
      const totalCost = points.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
      const plannedBudget = planData?.budget ? Number(planData.budget) : 5000000;
      
      let optimizedDayPoints = [...dayPoints];
      let currentTotalCost = totalCost;

      if (currentTotalCost > plannedBudget) {
        toast.info("AI phát hiện tổng chi phí vượt quá ngân sách! Đang tiến hành tìm kiếm các giải pháp thay thế tiết kiệm hơn...");
        
        // Loop through and swap with cheaper alternatives
        for (let i = 0; i < optimizedDayPoints.length; i++) {
          const p = optimizedDayPoints[i];
          // Ensure we have alternatives to look at. If empty, generate them dynamically!
          const altsList = (p.alternatives && p.alternatives.length > 0) 
            ? p.alternatives 
            : generateCheaperAlternatives(p);

          // Find the cheapest alternative that is cheaper than the current spot
          const cheaperAlts = altsList
            .filter(alt => (alt.estimatedCost || 0) < (p.estimatedCost || 0))
            .sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0));

          if (cheaperAlts.length > 0) {
            const bestAlt = cheaperAlts[0];
            const costSavings = (p.estimatedCost || 0) - (bestAlt.estimatedCost || 0);
            
            // Perform the swap!
            const swappedPoint: RoutePoint = {
              ...p,
              name: bestAlt.name,
              lat: bestAlt.lat,
              lng: bestAlt.lng,
              imageUrl: bestAlt.imageUrl || p.imageUrl,
              estimatedCost: bestAlt.estimatedCost || 0,
              address: bestAlt.address || p.address,
              description: bestAlt.description || p.description,
              rating: bestAlt.rating || p.rating,
              // Store the expensive original spot as an alternative so the user can easily swap back if they want!
              alternatives: [
                {
                  name: p.name,
                  lat: p.lat,
                  lng: p.lng,
                  imageUrl: p.imageUrl,
                  estimatedCost: p.estimatedCost,
                  address: p.address,
                  description: p.description,
                  rating: p.rating,
                  type: p.type
                },
                ...altsList.filter(alt => alt.name !== bestAlt.name)
              ]
            };

            optimizedDayPoints[i] = swappedPoint;
            currentTotalCost -= costSavings;
            
            toast.success(`AI đã tự động thay thế '${p.name}' bằng '${bestAlt.name}' để giảm ${(costSavings).toLocaleString()}đ!`);
            
            if (currentTotalCost <= plannedBudget) {
              toast.success("Đã tối ưu ngân sách thành công về mức cho phép!");
              break; // Budget balanced!
            }
          }
        }
      }

      // Greedy Nearest Neighbor Algorithm prioritizing Hotels first
      let hotelSpot = optimizedDayPoints.find(p => p.type === 'hotel');
      
      // Nếu ngày này chưa có khách sạn nhưng toàn lộ trình có khách sạn ở ngày khác, mượn khách sạn đó làm điểm đầu cho ngày này luôn!
      if (!hotelSpot) {
        const anyHotel = points.find(p => p.type === 'hotel');
        if (anyHotel) {
          hotelSpot = {
            ...anyHotel,
            id: `hotel-day-${activeDay}`,
            day: activeDay,
            time: "08:00",
            endTime: "08:30"
          };
        }
      }

      const otherDaySpots = optimizedDayPoints.filter(p => p.type !== 'hotel');

      let current: RoutePoint;
      let remaining: RoutePoint[];

      if (hotelSpot) {
        current = hotelSpot;
        remaining = [...otherDaySpots];
      } else {
        const sortedByTime = [...optimizedDayPoints].sort((a, b) => a.time.localeCompare(b.time));
        current = sortedByTime[0];
        remaining = sortedByTime.slice(1);
      }

      const optimized = [current];
      let currentEndTimeMins = 8 * 60 + (current.type === 'hotel' ? 30 : (current.type === 'restaurant' ? 90 : (current.durationMinutes || 60)));

      while (remaining.length > 0) {
        let bestIdx = 0;
        let bestScore = Infinity;
        
        for (let i = 0; i < remaining.length; i++) {
          const candidate = remaining[i];
          
          // 1. Calculate travel duration to candidate
          let travelDuration = 30;
          const key = `${current.id}-${candidate.id}`;
          if (metrics[key] && metrics[key].duration) {
            travelDuration = metrics[key].duration;
          } else if (current.lat && current.lng && candidate.lat && candidate.lng) {
            const R = 6371;
            const dLat = (candidate.lat - current.lat) * Math.PI / 180;
            const dLng = (candidate.lng - current.lng) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(current.lat * Math.PI / 180) * Math.cos(candidate.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            travelDuration = Math.round((distance / 25) * 60) + 5;
            travelDuration = Math.max(5, Math.min(travelDuration, 120));
          }
          
          const projectedStartTimeMins = currentEndTimeMins + travelDuration;
          
          // 2. Distance in degrees
          const distDegrees = Math.sqrt(
            Math.pow(candidate.lat - current.lat, 2) + 
            Math.pow(candidate.lng - current.lng, 2)
          );
          const distanceWeight = distDegrees * 200; 

          // 3. Time Suitability Penalty
          const isRestaurant = candidate.type === 'restaurant';
          let timePenalty = 0;

          if (isRestaurant) {
            // Trưa: 11:30 - 13:30 (690 - 810)
            // Tối: 18:00 - 20:00 (1080 - 1200)
            const isLunchHour = projectedStartTimeMins >= 11 * 60 + 30 && projectedStartTimeMins <= 13 * 60 + 30;
            const isDinnerHour = projectedStartTimeMins >= 18 * 60 && projectedStartTimeMins <= 20 * 60;
            
            if (isLunchHour || isDinnerHour) {
              timePenalty = -150; // Cực kỳ ưu tiên ăn uống đúng giờ
            } else {
              timePenalty = 300; // Phạt nặng nếu ăn lệch giờ
            }
          } else {
            const isLunchHour = projectedStartTimeMins >= 11 * 60 + 30 && projectedStartTimeMins <= 13 * 60 + 30;
            const isDinnerHour = projectedStartTimeMins >= 18 * 60 && projectedStartTimeMins <= 20 * 60;
            
            if (isLunchHour || isDinnerHour) {
              const hasRemainingRestaurants = remaining.some(rp => rp.type === 'restaurant');
              if (hasRemainingRestaurants) {
                timePenalty = 200; // Nhường chỗ cho nhà hàng ăn uống
              }
            }
          }

          // Không bao giờ ăn liên tiếp 2 nhà hàng! Nếu điểm hiện tại là nhà hàng và điểm tiếp theo cũng là nhà hàng, phạt cực nặng.
          if (current.type === 'restaurant' && isRestaurant) {
            timePenalty += 1000;
          }

          const score = distanceWeight + timePenalty;
          if (score < bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
        
        current = remaining.splice(bestIdx, 1)[0];
        optimized.push(current);

        // Update currentEndTimeMins for next iteration
        let travelDuration = 30;
        const key = `${optimized[optimized.length - 2].id}-${current.id}`;
        if (metrics[key] && metrics[key].duration) {
          travelDuration = metrics[key].duration;
        } else if (optimized[optimized.length - 2].lat && optimized[optimized.length - 2].lng && current.lat && current.lng) {
          const R = 6371;
          const dLat = (current.lat - optimized[optimized.length - 2].lat) * Math.PI / 180;
          const dLng = (current.lng - optimized[optimized.length - 2].lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(optimized[optimized.length - 2].lat * Math.PI / 180) * Math.cos(current.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          travelDuration = Math.round((distance / 25) * 60) + 5;
          travelDuration = Math.max(5, Math.min(travelDuration, 120));
        }

        const duration = current.type === 'hotel' ? 30 : (current.type === 'restaurant' ? 90 : (current.durationMinutes || 60));
        currentEndTimeMins = currentEndTimeMins + travelDuration + duration;
      }

      // Intelligent Time Assignment (Prioritizing meal times for restaurants)
      let currentTimeMins = 8 * 60; // Start at 08:00 AM
      
      const finalizedDayPoints = optimized.map((p, idx) => {
        const isRestaurant = p.type === 'restaurant';
        const isHotel = p.type === 'hotel';
        
        // If it's a restaurant, try to align with standard meal times
        if (isRestaurant) {
          if (currentTimeMins < 11 * 60 && idx > 0) {
            // If it's early but close to lunch, push to lunch time
            currentTimeMins = Math.max(currentTimeMins, 11 * 60 + 30); 
          } else if (currentTimeMins < 18 * 60 && currentTimeMins > 14 * 60) {
            // If it's afternoon, push to dinner time
            currentTimeMins = Math.max(currentTimeMins, 18 * 60 + 30);
          }
        }

        const h = Math.floor(currentTimeMins / 60) % 24;
        const m = currentTimeMins % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        // Hotels usually take 30 mins (leaving/entering), restaurants 90m, attractions 60-120m
        const duration = isHotel ? 30 : (isRestaurant ? 90 : (p.durationMinutes || 60));
        const totalMins = currentTimeMins + duration;
        
        const endH = Math.floor(totalMins / 60) % 24;
        const endM = totalMins % 60;
        const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        // Prepare for next point: add 30 mins for travel/buffer
        currentTimeMins = totalMins + 30; 

        return { ...p, time: timeStr, endTime: endTimeStr, durationMinutes: duration };
      });

      const newPoints = [...otherPoints, ...finalizedDayPoints].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.time.localeCompare(b.time);
      });

      setPoints(newPoints);
      setHasOptimized(true);
      setIsDirty(true);

      // Trigger Sync with Backend after optimization silently
      await syncItineraryWithBackend(newPoints, false);

      toast.success("Đã tối ưu và đồng bộ lộ trình thành công!", {
        position: "top-right",
        autoClose: 5000
      });
    } catch (e) {
      console.error(e);
      toast.error("Không thể tối ưu lộ trình.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const autoReschedulePoints = (pts: RoutePoint[]) => {
    // 1. Group by day
    const dayGroups: Record<number, RoutePoint[]> = {};
    pts.forEach(p => {
      if (!dayGroups[p.day]) dayGroups[p.day] = [];
      dayGroups[p.day].push(p);
    });

    const processedPoints: RoutePoint[] = [];

    // 2. Process each day
    Object.keys(dayGroups).sort((a, b) => Number(a) - Number(b)).forEach(dayNumStr => {
      const dayNum = Number(dayNumStr);
      const dayPoints = dayGroups[dayNum].sort((a, b) => a.time.localeCompare(b.time));
      
      let lastEndMins = -1;

      const updatedDayPoints = dayPoints.map((p, idx) => {
        const [h, m] = p.time.split(':').map(Number);
        let startMins = h * 60 + m;

        // If this activity starts before the previous one ends, shift it
        if (lastEndMins !== -1 && startMins < lastEndMins) {
          startMins = lastEndMins + 15; // Add 15 min buffer
        }

        const newH = Math.floor(startMins / 60) % 24;
        const newM = startMins % 60;
        const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

        const duration = p.durationMinutes || (p.type === 'restaurant' ? 90 : 60);
        const endMins = startMins + duration;
        
        const newEndH = Math.floor(endMins / 60) % 24;
        const newEndM = endMins % 60;
        const newEndTime = `${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`;

        lastEndMins = endMins;

        return { ...p, time: newTime, endTime: newEndTime, durationMinutes: duration };
      });

      processedPoints.push(...updatedDayPoints);
    });

    return processedPoints;
  };

  const handleAddSpot = (newPoint: Omit<RoutePoint, 'id'>) => {
    const point: RoutePoint = {
      ...newPoint,
      id: Math.random().toString(36).substr(2, 9)
    };
    const newPoints = autoReschedulePoints([...points, point]);
    setPoints(newPoints);
    setIsDirty(true);
    setActivePointId(point.id);
    setDetailPointId(null);
    setPreviewPoint(null);
    
    // Clear discovery states after successful add but KEEP discovery mode active!
    setSelectedNearbyPlace(null);
    setContextualServices([]);
  };

  const handleDeleteSpot = (pointId: string) => {
    const newPoints = autoReschedulePoints(points.filter(p => p.id !== pointId));
    setPoints(newPoints);
    setIsDirty(true);
    if (activePointId === pointId) setActivePointId(null);
    if (detailPointId === pointId) setDetailPointId(null);
    toast.info("Đã xóa địa điểm và cập nhật lại thời gian.");
  };

  const handleEditSpot = (point: RoutePoint) => {
    setEditingPoint(point);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedPoint: RoutePoint) => {
    const newPoints = autoReschedulePoints(points.map(p => p.id === updatedPoint.id ? updatedPoint : p));
    setPoints(newPoints);
    setIsDirty(true);
    toast.success("Đã cập nhật địa điểm và sắp xếp lại thời gian!");
  };

  const handleReorder = (newPoints: RoutePoint[]) => {
    setPoints(newPoints);
    setIsDirty(true);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    toast.info("Đang lấy thông tin địa điểm...", { autoClose: 1000 });
    const placeData = await reverseGeocode(lat, lng);
    if (placeData) {
      setPreviewPoint({
        name: placeData.name,
        address: placeData.address,
        lat: lat,
        lng: lng,
        type: 'other'
      });
      setIsModalOpen(true);
    } else {
      setPreviewPoint({ lat, lng, name: "Địa điểm mới", type: 'other' });
      setIsModalOpen(true);
    }
  };

  const handlePublish = async () => {
    const publishId = fullItinerary?.id || fullItinerary?.itineraryId || id;
    if (!publishId) return;
    try {
      setIsPublishing(true);
      
      // Sync current points before publishing silently to ensure all edits/deletes are saved
      await syncItineraryWithBackend(points, false);
      
      const res = await publishItinerary(publishId);
      if (res.data.status === 200) {
        toast.success("Lộ trình đã được lưu và xuất bản thành công!");
        setFullItinerary((p) => p ? ({ ...p, status: 'PUBLISHED' }) : null);
        setIsDirty(false);
      }
    } catch (e) { console.error(e); toast.error("Lỗi khi lưu và xuất bản."); }
    finally { setIsPublishing(false); }
  };


  const handleOpenNavigation = async (lat: number, lng: number, name: string) => {
    setNavDestination({ lat, lng, name });
    if (userLocation) {
      setIsNavigating(true);
      const route = await getRoutePolyline(userLocation, { lat, lng });
      if (route) setNavRoute(route);
    } else {
      setIsNavOpen(true);
    }
  };

  return (
    <div className={styles.detailPageContainer}>
      <Navbar />
      {isOptimizing && (
        <div className={styles.optimizingOverlay}>
          <div className={styles.loaderContent}>
            <h2>AI đang sắp xếp & tối ưu lại lộ trình...</h2>
            <div className={styles.progressBar}><div className={styles.progressInner}></div></div>
          </div>
        </div>
      )}

      {isNavigating && (
        <div className={styles.navStatusFloating}>
          <div className={styles.navInfo}>
            <Compass size={22} weight="fill" />
            <span>Đang dẫn đường đến <b>{navDestination?.name}</b></span>
          </div>
          <button className={styles.stopNavBtn} onClick={() => { setIsNavigating(false); setNavRoute(null); }}>
            <X size={16} weight="bold" />
            <span>Dừng</span>
          </button>
        </div>
      )}

      <div className={styles.splitViewContainer}>
        {!isMapExpanded && (
          <ItinerarySidebar 
            points={points} 
            activePointId={activePointId}
            onPointClick={(id) => {
              if (activePointId === id) {
                setActivePointId(null);
                setDetailPointId(null);
              } else {
                setActivePointId(id);
                setDetailPointId(null);
                setShowNearby(true); // Auto-enable nearby scanning on click!
              }
            }}
            isPreviewing={isPreviewing}
            onTogglePreview={() => setIsPreviewing(!isPreviewing)}
            onOpenAddModal={() => {
              const newState = !showNearby;
              setShowNearby(newState);
              if (newState) {
                setActivePointId(null); // Clear active point to show ALL dining places and services when adding new!
                setDetailPointId(null);
                toast.info("Chế độ khám phá đã bật! Hãy chọn địa điểm trên bản đồ hoặc nhấn nút Tìm kiếm.");
              } else {
                setSelectedNearbyPlace(null);
                setContextualServices([]);
              }
            }}
            onFetchSample={handleOptimize}
            planData={planData}
            metrics={metrics}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            onOpenNavigation={handleOpenNavigation}
            fullItinerary={fullItinerary}
            isMapExpanded={isMapExpanded}
            onToggleMap={() => setIsMapExpanded(!isMapExpanded)}
            status={fullItinerary?.status || 'DRAFT'}
            onPublish={handlePublish}
            isPublishing={isPublishing}
            isLoading={isOptimizing}
            onDeleteSpot={handleDeleteSpot}
            onEditSpot={handleEditSpot}
            onReorder={handleReorder}
            hasOptimized={hasOptimized}
            showNearby={showNearby}
          />
        )}
        
        <div className={`${styles.mapWrapper} ${isMapExpanded ? styles.mapExpanded : ''}`}>
          {isMapExpanded && (
             <button className={styles.showSidebarBtn} onClick={() => setIsMapExpanded(false)} title="Hiện Sidebar">
                <CaretRight size={20} weight="bold" />
             </button>
          )}
          <ItineraryMap 
            points={points} 
            activePointId={activePointId} 
            onPointClick={(id) => {
              if (activePointId === id) {
                setActivePointId(null);
                setDetailPointId(null);
              } else {
                setActivePointId(id);
                setDetailPointId(id);
                setShowNearby(true); // Auto-enable nearby scanning on click!
              }
            }}
            isPreviewing={isPreviewing}
            previewPoint={previewPoint}
            onOpenNavigation={handleOpenNavigation}
            activeDay={activeDay}
            dayRouteCoords={dayRouteCoords}
            userLocation={userLocation}
            navRoute={navRoute}
            isMapExpanded={isMapExpanded}
            nearbyPlaces={nearbyPlaces}
            showNearby={showNearby}
            onToggleNearby={() => {
              const newState = !showNearby;
              setShowNearby(newState);
              if (!newState) {
                setSelectedNearbyPlace(null);
                setContextualServices([]);
              }
            }}
            onOpenSearch={() => setIsModalOpen(true)}
            selectedNearby={selectedNearbyPlace}
            contextualServices={contextualServices}
            onSelectNearby={async (place) => {
              setSelectedNearbyPlace(place);
              try {
                const targetType = place.serviceType === 'hotel' ? 'hotel' : 
                                  place.serviceType === 'restaurant' ? 'restaurant' : 'attraction';
                const res = await fetchNearbyServicesByTarget(targetType, place.id);
                setContextualServices(res.data.data || []);
              } catch (err) {
                console.error("Error fetching contextual services:", err);
                setContextualServices([]);
              }
            }}
            onAddNearby={(place) => {
              setPreviewPoint({
                name: place.name || place.serviceName,
                lat: place.latitude || (place.location && parseFloat(place.location.split(',')[0])) || 0,
                lng: place.longitude || (place.location && parseFloat(place.location.split(',')[1])) || 0,
                address: place.addressDetailed || place.location || place.address,
                imageUrl: place.imageUrl,
                estimatedCost: place.averagePrice || 0,
                type: (place.serviceType || 'attraction').toLowerCase() as any,
                entityId: place.id || (place as any).attractionId || (place as any).hotelId || (place as any).restaurantId,
                description: place.description || "",
                rating: place.rating || 0
              });
              setIsModalOpen(true);
            }}
          />
        </div>

        {isModalOpen && (
          <AddSpotModal 
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddSpot}
            onPreviewSpot={setPreviewPoint}
            initialData={previewPoint}
            parentPoint={points.find(p => p.id === activePointId) || null}
          />
        )}

        {isEditModalOpen && editingPoint && (
          <EditSpotModal 
            point={editingPoint}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
            maxDays={
              (fullItinerary as any)?.days || 
              (fullItinerary as any)?.itinerary?.length || 
              (fullItinerary as any)?.itineraryDays?.length || 
              3
            }
          />
        )}

        <PlaceDetailPanel 
          pointId={detailPointId} 
          points={points} 
          onClose={() => setDetailPointId(null)} 
          onOpenNavigation={handleOpenNavigation}
          userLocation={userLocation}
          isSidebarCollapsed={isMapExpanded}
          onAddNearby={(place) => {
            setPreviewPoint({
              name: place.name || place.serviceName,
              lat: place.latitude || (place.location && parseFloat(place.location.split(',')[0])) || 0,
              lng: place.longitude || (place.location && parseFloat(place.location.split(',')[1])) || 0,
              address: place.addressDetailed || place.location || place.address,
              imageUrl: place.imageUrl,
              estimatedCost: place.averagePrice || 0,
              type: (place.serviceType || 'attraction').toLowerCase() as any,
              entityId: place.id || (place as any).attractionId || (place as any).hotelId || (place as any).restaurantId,
              description: place.description || "",
              rating: place.rating || 0
            });
            setIsModalOpen(true);
          }}
        />

        {isNavOpen && navDestination && (
          <NavigationModal 
            onClose={() => setIsNavOpen(false)}
            destination={navDestination}
            userLocation={userLocation ? `${userLocation.lat},${userLocation.lng}` : null}
          />
        )}
      </div>
    </div>
  );
};

export default ItineraryDetail;