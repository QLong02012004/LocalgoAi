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
  serviceType: string;
  serviceName: string;
  description: string;
  address: string;
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

export const getSampleItineraries = async (filters?: SampleItineraryFilter): Promise<
  AxiosResponse<BackendResponse<{ content: GeneratedItinerary[]; page: PageInfo }>>
> => {
  const params = {
    ...filters,
    interests: filters?.interests?.join(",")
  };
  return await instance.get<BackendResponse<{ content: GeneratedItinerary[]; page: PageInfo }>>("/itineraries/samples", {
    params
  });
};

export const getSampleItineraryById = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<ItineraryType>>> => {
  return await instance.get<BackendResponse<ItineraryType>>(`/travel/itineraries/demo/${id}`);
};

export const getItineraryById = async (
  id: string | number
): Promise<AxiosResponse<BackendResponse<GeneratedItinerary>>> => {
  return await instance.get<BackendResponse<GeneratedItinerary>>(`/itineraries/${id}`);
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
  return await instance.get<BackendResponse<NearbyService>>(`/nearby-services/${id}`);
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
