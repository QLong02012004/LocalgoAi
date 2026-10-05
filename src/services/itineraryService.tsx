import instance from "../utils/AxiosCustomize";
import type { AxiosResponse } from "axios";
import type { BackendResponse } from "../types/backend";
import axios from "axios";
import type { PageInfo } from "./adminService";

export interface CostBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  services: number;
  total: number;
}

export interface ItineraryActivity {
  time: string;
  location: string;
  note: string;
  lat?: number;
  lng?: number;
}

export interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface ItineraryType {
  id: string | number;
  itineraryId?: string;
  trip_name: string;
  img: string; 
  price: number;
  maxPeople: number;
  location: string;
  duration: string;
  rating: number;
  category: string;
  type?: string; 
  previewVideo?: string; 
  itinerary: DayItinerary[];
  itineraryDays?: GeneratedDay[]; // Compatibility with GeneratedItinerary
  status?: 'DRAFT' | 'PUBLISHED';
  provinceName?: string;
  totalDistance?: number;
  totalEstimatedCost?: number;
  province?: string;
  startDate?: string;
  reasonRecommended?: string;
  costBreakdown?: Record<string, number> | null;
  title?: string;
  budget?: string;
  provinceId?: number;
}

// --- New AI Planner Interfaces ---
export interface SelectedLocation {
  id: number;
  type: string;
  name: string;
}

export interface GenerateItineraryRequest {
  userId: number;
  provinceId: number;
  days: number;
  budget: number;
  interests: string[];
  startDate: string;
  numberOfPeople: number;
  selectedLocations: SelectedLocation[];
}

export interface GeneratedActivity {
  order: number;
  startTime: number[] | string;
  endTime: number[] | string;
  durationMinutes: number;
  type: string;
  entityId: number; // Đổi từ id/entityId để khớp BE
  name: string;
  description: string | null;
  address: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  estimatedCost: number;
  imageUrl: string | null;
  gallery: string[]; // Mảng chuỗi ảnh
  tips: string[];    // Mảng chuỗi tips
  reviewCount?: number;
  costBreakdown?: CostBreakdown | null;
}


export interface GeneratedDay {
  dayNumber: number;
  date: number[] | string;
  theme: string;
  activities: GeneratedActivity[];
}

export interface GeneratedHotel {
  hotelId: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  checkInDay: number;
  checkOutDay: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  rating: number;
  imageUrl: string;
}

export interface GeneratedItinerary {
  id: number;
  itineraryId: string;
  userId: number;
  title: string;
  provinceId: number;
  provinceName: string;
  days: number;
  budget: string;
  interests: string[];
  totalEstimatedCost: number;
  totalDistance: number;
  averageRating: number | null;
  reasonRecommended: string;
  startDate: number[] | string;
  itineraryDays: GeneratedDay[];
  hotels: GeneratedHotel[];
  imageUrl?: string;
  img?: string;
  costBreakdown: CostBreakdown | Record<string, number> | null;
  status?: 'DRAFT' | 'PUBLISHED';

  itinerary?: DayItinerary[]; // For compatibility with legacy ItineraryType
  location?: string; // For AI suggestions
  province?: string;
}

export interface NearbyService {
  id: number;
  attractionId: number | null;
  hotelId: number | null;
  restaurantId: number | null;
  provinceId?: number | null;
  serviceType: string;
  serviceName: string;
  description: string;
  address: string;
  location?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phoneNumber: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  priceLevel: string;
  status: string;
}

export interface SampleItineraryFilter {
  provinceId?: number;
  minBudget?: number;
  maxBudget?: number;
  days?: number;
  interests?: string[];
  page?: number;
  size?: number;
}

export interface UpdateItineraryRequest {
  title: string;
  budget: number;
  startDate: string;
  itineraryDays: {
    dayNumber: number;
    theme: string;
    activities: {
      order: number;
      startTime: string;
      endTime: string;
      type: string;
      entityId: number;
      name: string;
      location: string;
      estimatedCost: number;
      note: string;
      rating?: number;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      tips?: string;
      costBreakdown?: CostBreakdown | null;
    }[];
  }[];

  hotels: {
    hotelId: number;
    checkInDay: number;
    checkOutDay: number;
  }[];
}

export const DEFAULT_MOCK_ITINERARY: GeneratedItinerary = {
  id: 1001,
  itineraryId: "1001",
  userId: 1,
  title: "Khám Phá Đà Nẵng - Hội An 3N2Đ Siêu Chill",
  provinceName: "Đà Nẵng & Quảng Nam",
  provinceId: 2,
  days: 3,
  interests: ["Cảnh đẹp", "Ẩm thực", "Nghỉ dưỡng"],
  startDate: "2026-05-20",
  budget: "4.500.000đ",
  totalEstimatedCost: 4500000,
  totalDistance: 45.2,
  averageRating: 4.9,
  reasonRecommended: "Lộ trình tối ưu kết hợp giữa bãi biển xanh ngắt, biểu tượng Cầu Vàng Bà Nà Hills và vẻ đẹp lung linh huyền ảo của phố cổ Hội An.",
  costBreakdown: {
    accommodation: 1800000,
    food: 1200000,
    activities: 1000000,
    services: 500000,
    total: 4500000
  },
  hotels: [
    {
      hotelId: 9996,
      name: "Novotel Danang Premier Han River",
      address: "36 Bạch Đằng, Hải Châu, Đà Nẵng",
      latitude: 16.0768,
      longitude: 108.2241,
      checkInDay: 1,
      checkOutDay: 3,
      nights: 2,
      pricePerNight: 900000,
      totalPrice: 1800000,
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    }
  ],
  itineraryDays: [
    {
      dayNumber: 1,
      date: "2026-05-20",
      theme: "Chào Đà Nẵng - Biển Mỹ Khê & Cầu Rồng",
      activities: [
        {
          order: 1,
          startTime: "08:30",
          endTime: "11:30",
          durationMinutes: 180,
          type: "attraction",
          entityId: 9994,
          name: "Bãi Biển Mỹ Khê",
          description: "Tắm biển, dạo bộ trên bãi cát trắng mịn và thưởng thức nước dừa tươi mát.",
          address: "Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
          location: "16.0592, 108.2460",
          latitude: 16.0592,
          longitude: 108.2460,
          rating: 4.8,
          estimatedCost: 50000,
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          gallery: [],
          tips: ["Nên bôi kem chống nắng và thuê ghế tựa sát biển."]
        },
        {
          order: 2,
          startTime: "12:00",
          endTime: "13:30",
          durationMinutes: 90,
          type: "restaurant",
          entityId: 9998,
          name: "Nhà hàng Hải sản Bé Mặn",
          description: "Thưởng thức hải sản tươi ngon đánh bắt trong ngày tại quán ăn nổi tiếng bậc nhất Đà Nẵng.",
          address: "Lô 11 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
          location: "16.0694, 108.2472",
          latitude: 16.0694,
          longitude: 108.2472,
          rating: 4.6,
          estimatedCost: 350000,
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
          gallery: [],
          tips: ["Nên thử tôm sú nướng muối ớt và mực cơm hấp."]
        },
        {
          order: 3,
          startTime: "19:30",
          endTime: "21:30",
          durationMinutes: 120,
          type: "attraction",
          entityId: 9993,
          name: "Cầu Rồng Đà Nẵng",
          description: "Ngắm sông Hàn về đêm và xem màn trình diễn phun lửa, phun nước ấn tượng.",
          address: "Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng",
          location: "16.0610, 108.2260",
          latitude: 16.0610,
          longitude: 108.2260,
          rating: 4.7,
          estimatedCost: 0,
          imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
          gallery: [],
          tips: ["Chọn vị trí đón gió phía đầu cầu để xem phun lửa đẹp nhất."]
        }
      ]
    },
    {
      dayNumber: 2,
      date: "2026-05-21",
      theme: "Khám Phá Bà Nà Hills - Cầu Vàng",
      activities: [
        {
          order: 1,
          startTime: "08:00",
          endTime: "14:00",
          durationMinutes: 360,
          type: "attraction",
          entityId: 9991,
          name: "Cầu Vàng & Bà Nà Hills",
          description: "Check-in đôi bàn tay khổng lồ, đi cáp treo đạt kỷ lục và dạo chơi làng Pháp.",
          address: "Hòa Phú, Hòa Vang, Đà Nẵng",
          location: "15.9950, 107.9940",
          latitude: 15.9950,
          longitude: 107.9940,
          rating: 4.9,
          estimatedCost: 850000,
          imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
          gallery: [],
          tips: ["Nên mang theo áo khoác nhẹ vì trên đỉnh núi khá mát."]
        }
      ]
    },
    {
      dayNumber: 3,
      date: "2026-05-22",
      theme: "Phố Cổ Hội An Lung Linh Sắc Màu",
      activities: [
        {
          order: 1,
          startTime: "09:00",
          endTime: "16:00",
          durationMinutes: 420,
          type: "attraction",
          entityId: 8881,
          name: "Phố Cổ Hội An",
          description: "Tản bộ qua các dãy nhà cổ vàng ươm, thưởng thức nước Mót và bánh mì Phượng.",
          address: "Minh An, Hội An, Quảng Nam",
          location: "15.8794, 108.3282",
          latitude: 15.8794,
          longitude: 108.3282,
          rating: 4.9,
          estimatedCost: 150000,
          imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
          gallery: [],
          tips: ["Đừng quên thả đèn hoa đăng trên sông Hoài vào buổi tối."]
        }
      ]
    }
  ]
};

export const getSampleItineraries = async (filters?: SampleItineraryFilter): Promise<
  AxiosResponse<BackendResponse<{ content: GeneratedItinerary[]; page: PageInfo }>>
> => {
  const params = {
    ...filters,
    interests: filters?.interests?.join(",")
  };
  try {
    const response = await instance.get<BackendResponse<{ content: GeneratedItinerary[]; page: PageInfo }>>("/itineraries/samples", {
      params
    });
    if (response.data && response.data.data && response.data.data.content && response.data.data.content.length > 0) {
      return response;
    }
    throw new Error("Empty sample itineraries from BE");
  } catch {
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: {
          content: [DEFAULT_MOCK_ITINERARY],
          page: {
            size: 10,
            number: 0,
            totalElements: 1,
            totalPages: 1
          }
        }
      }
    } as AxiosResponse<BackendResponse<{ content: GeneratedItinerary[]; page: PageInfo }>>;
  }
};

export const getSampleItineraryById = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<ItineraryType>>> => {
  try {
    return await instance.get<BackendResponse<ItineraryType>>(`/travel/itineraries/demo/${id}`);
  } catch {
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: {
          ...DEFAULT_MOCK_ITINERARY,
          trip_name: DEFAULT_MOCK_ITINERARY.title || "Lịch trình mẫu Đà Nẵng",
          img: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
          price: 4500000,
          maxPeople: 4,
          location: "Đà Nẵng",
          duration: "3 Ngày 2 Đêm",
          rating: 4.9,
          category: "Nghỉ dưỡng",
          itinerary: []
        }
      }
    } as AxiosResponse<BackendResponse<ItineraryType>>;
  }
};

export const getItineraryById = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<GeneratedItinerary>>> => {
  try {
    const res = await instance.get<BackendResponse<GeneratedItinerary>>(`/itineraries/${id}`);
    if (res.data && res.data.data) return res;
    throw new Error("No itinerary found");
  } catch {
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: {
          ...DEFAULT_MOCK_ITINERARY,
          id: id,
          itineraryId: String(id)
        }
      }
    } as AxiosResponse<BackendResponse<GeneratedItinerary>>;
  }
};

export const saveTravelPlan = async (planData: Partial<ItineraryType>): Promise<
  AxiosResponse<BackendResponse<ItineraryType>>
> => {
  return await instance.post<BackendResponse<ItineraryType>>("/travel-plans", planData);
};

export const updateTravelPlan = async (id: string | number, points: ItineraryActivity[]): Promise<
  AxiosResponse<BackendResponse<ItineraryType>>
> => {
  return await instance.put<BackendResponse<ItineraryType>>(`/travel-plans/${id}`, { points });
};

export const getTravelMetrics = async (p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) => {
  // Safety check for valid coordinates
  if (!p1.lat || !p1.lng || !p2.lat || !p2.lng) {
    return { distance: "0.0", duration: 0 };
  }

  try {
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=false`,
      { timeout: 5000 }
    );
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: (route.distance / 1000).toFixed(1), // km
        duration: Math.round(route.duration / 60)   // minutes
      };
    }
    throw new Error("No route found");
  } catch {
    const R = 6371; 
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    
    return {
      distance: dist.toFixed(1),
      duration: Math.round(dist * 2) 
    };
  }
};

export interface AIPlanRequest {
  destination: string;
  budget: string;
  peopleGroup: string;
  interests: string[];
  travelDate: string;
}

export const getAISuggestedRoute = async (planData: AIPlanRequest): Promise<
  AxiosResponse<BackendResponse<unknown>>
> => {
  return await instance.post<BackendResponse<unknown>>("/travel-plans-ai", planData);
};

/**
 * [PRIVATE] Lấy danh sách lộ trình cá nhân của người dùng theo userId
 */
export const getUserItineraries = async (userId: number | string): Promise<
  AxiosResponse<BackendResponse<GeneratedItinerary[]>>
> => {
  return await instance.get<BackendResponse<GeneratedItinerary[]>>(`/itineraries/my-itineraries`, {
    params: { userId }
  });
};

export const getTravelPlans = async (): Promise<
  AxiosResponse<BackendResponse<ItineraryType[]>>
> => {
  return await instance.get<BackendResponse<ItineraryType[]>>("/travel-plans");
};

/**
 * Lấy lộ trình đường bộ giữa hai điểm (polyline) từ OSRM
 */
export const getRoutePolyline = async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const res = await axios.get(url);
    if (res.data && res.data.routes && res.data.routes.length > 0) {
      return res.data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    }
    return null;
  } catch (error) {
    console.error("OSRM Routing error:", error);
    return null;
  }
};

/**
 * Gọi AI để tối ưu hóa lộ trình
 */
export const generateItinerary = async (
  data: GenerateItineraryRequest
): Promise<AxiosResponse<BackendResponse<GeneratedItinerary>>> => {
  return await instance.post<BackendResponse<GeneratedItinerary>>("/itineraries/generate", data);
};

export const publishItinerary = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  return await instance.put<BackendResponse<unknown>>(`/itineraries/${id}/publish`);
};

export const updateItinerary = async (
  id: string | number,
  data: UpdateItineraryRequest
): Promise<AxiosResponse<BackendResponse<GeneratedItinerary>>> => {
  return await instance.put<BackendResponse<GeneratedItinerary>>(`/itineraries/${id}`, data);
};

export const getNearbyServiceById = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<NearbyService>>> => {
  try {
    return await instance.get<BackendResponse<NearbyService>>(`/nearby-services/${id}`);
  } catch {
    const mockService: NearbyService = {
      id: typeof id === 'string' ? parseInt(id, 10) || 101 : id,
      attractionId: null,
      hotelId: null,
      restaurantId: null,
      provinceId: 2,
      serviceType: "RESTAURANT",
      serviceName: "Nhà hàng Đặc sản Miền Trung LocalGo",
      description: "Không gian ẩm thực đậm đà bản sắc Đà Nẵng - Hội An với các món đặc sản tươi ngon phục vụ du khách.",
      address: "120 Bạch Đằng, Hải Châu, Đà Nẵng",
      location: "16.0678, 108.2208",
      latitude: 16.0678,
      longitude: 108.2208,
      distanceKm: 0.5,
      phoneNumber: "0905 123 456",
      openingHours: "07:00 - 22:30",
      rating: 4.8,
      reviewCount: 320,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      priceLevel: "MODERATE",
      status: "ACTIVE"
    };

    return {
      data: {
        status: 200,
        message: "Lấy chi tiết dịch vụ mẫu thành công",
        data: mockService,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse<unknown>["config"],
    };
  }
};

/**
 * Lấy thông tin địa danh từ tọa độ (Reverse Geocoding)
 */
export const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'vi',
        },
      }
    );
    const data = await response.json();
    if (!data || !data.display_name) return null;
    
    return {
      name: data.display_name.split(',')[0],
      address: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};
/**
 * Lấy lộ trình đường bộ chính xác nối tất cả các điểm trong ngày từ OSRM
 */
export const getDailyRoutePolyline = async (pointsList: {lat: number, lng: number}[]) => {
  if (pointsList.length < 2) return null;
  try {
    const coordsString = pointsList.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    const res = await axios.get(url);
    if (res.data && res.data.routes && res.data.routes.length > 0) {
      return res.data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    }
    return null;
  } catch (error) {
    console.error("OSRM Multi-point Routing error:", error);
    return null;
  }
};
export const itineraryService = {
  getSampleItineraries,
  getSampleItineraryById,
  getItineraryById,
  saveTravelPlan,
  updateTravelPlan,
  getAISuggestedRoute,
  getUserItineraries,
  getTravelPlans,
  generateItinerary,
  publishItinerary,
  updateItinerary,
  getNearbyServiceById,
  getDailyRoutePolyline
};
