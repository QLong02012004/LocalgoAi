import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import type { BackendResponse } from "../types/backend";
import { getRestaurants } from "./restaurantService";

// --- Interfaces ---
export interface HighlightItem {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  type: string;
  category: string;
  averagePrice: number;
  provinceId: number;
  status?: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  previewVideo?: string;
  isHot?: boolean;
  uniqueId?: string;
  isService?: boolean;
}
export interface PaginatedData<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface BackendItem {
  id: number | string;
  name?: string;
  provinceId?: number;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  description?: string;
  addressDetailed?: string;
  category?: string;
  cuisine?: string;
  type?: string;
  distance?: string | number;
  previewVideo?: string;
  averagePrice?: number;
  status?: string;
  gallery?: string[];
  latitude?: number;
  longitude?: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

// Lập mapper chung cho cấu trúc dữ liệu của Attractions/Restaurants
const mapBackendToHighlightItem = (item: BackendItem, type: "pin" | "food"): HighlightItem => {
  const finalName = item.name || "";

  const extractCoords = (raw: string) => {
    const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  };

  const rawStr = item.location || item.addressDetailed || "";
  const coords = item.coordinates?.lat ? { lat: item.coordinates.lat, lng: item.coordinates.lng } : extractCoords(rawStr);

  return {
    id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
    name: finalName,
    location: 
    item.addressDetailed || 
    (item.provinceId === 1 ? "Thừa Thiên Huế" : 
     item.provinceId === 2 ? "Đà Nẵng" : 
     item.provinceId === 3 ? "Quảng Nam" : `Khu vực ${item.provinceId} (Đang cập nhật)`),
    rating: item.rating || 0,
    reviewCount: item.reviewCount || 0,
    imageUrl: item.imageUrl || "https://placehold.co/600x400?text=BE+dang+thieu+imageUrl",
    description: item.description || `BE đang thiếu trường description cho ${item.name}`,
    type: type,
    category: item.category || item.cuisine || item.type || "Địa điểm",
    distance: item.distance?.toString() || (item as BackendItem).distance?.toString(),
    previewVideo: item.previewVideo || undefined,
    averagePrice: item.averagePrice || 0,
    provinceId: item.provinceId || 0,
    status: item.status || "ACTIVE",
    latitude: coords?.lat,
    longitude: coords?.lng
  };
};

/**
 * Lấy danh sách địa điểm tham quan từ API thật (Hỗ trợ lọc theo Tỉnh thành)
 */
export const getAttractions = async (page = 0, size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>> => {
  let url = `/attractions?page=${page}&size=${size}`;
  if (provinceId && provinceId !== "all") {
    url += `&provinceId=${provinceId}`;
  }
  
  const response = await instance.get<BackendResponse<PaginatedData<BackendItem>>>(url);
  
  const mappedContent = (response.data.data?.content || []).map((item: BackendItem) => mapBackendToHighlightItem(item, "pin"));

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        content: mappedContent
      } as PaginatedData<HighlightItem>
    }
  } as AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>;
};

/**
 * Lấy danh sách địa điểm tham quan nổi bật (cho trang chủ/explore)
 */
export const getHighlightLocations = async (size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<HighlightItem[]>>> => {
  const response = await getAttractions(0, size, provinceId);
  return {
    ...response,
    data: {
      ...response.data,
      data: response.data.data?.content || []
    }
  } as AxiosResponse<BackendResponse<HighlightItem[]>>;
};

/**
 * Lấy danh sách nhà hàng nổi bật (cho trang chủ/explore)
 */
export const getHighlightRestaurants = async (size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<HighlightItem[]>>> => {
  const response = await getRestaurants(0, size, provinceId);
  
  return {
    ...response,
    data: {
      ...response.data,
      data: response.data.data?.content || []
    }
  } as AxiosResponse<BackendResponse<HighlightItem[]>>;
};

/**
 * Lấy danh sách địa điểm nổi bật (API mới đã được BE tối ưu)
 */
export const getFeaturedAttractions = async (limit = 5): Promise<AxiosResponse<BackendResponse<HighlightItem[]>>> => {
  const response = await instance.get<BackendResponse<BackendItem[]>>(`/attractions/featured?limit=${limit}`);
  const mappedData = (response.data.data || []).map((item: BackendItem) => mapBackendToHighlightItem(item, "pin"));

  return {
    ...response,
    data: {
      ...response.data,
      data: mappedData
    }
  } as AxiosResponse<BackendResponse<HighlightItem[]>>;
};

/**
 * Tìm kiếm địa điểm theo từ khóa (Tên hoặc Vị trí)
 */
export const getHighlightAttractionsByKeyword = async (keyword: string, page = 0, size = 10): Promise<AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>> => {
  const response = await instance.get<BackendResponse<PaginatedData<BackendItem>>>(`/attractions/search/by-keyword?keyword=${keyword}&page=${page}&size=${size}`);
  const mappedContent = (response.data.data?.content || []).map((item: BackendItem) => mapBackendToHighlightItem(item, "pin"));

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        content: mappedContent
      } as PaginatedData<HighlightItem>
    }
  } as AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>;
};

/**
 * Tìm kiếm nhà hàng theo từ khóa (Tên hoặc Vị trí)
 */
export const getHighlightRestaurantsByKeyword = async (keyword: string, page = 0, size = 10): Promise<AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>> => {
  const response = await instance.get<BackendResponse<PaginatedData<BackendItem>>>(`/restaurants/search/by-keyword?keyword=${keyword}&page=${page}&size=${size}`);
  const mappedContent = (response.data.data?.content || []).map((item: BackendItem) => mapBackendToHighlightItem(item, "food"));

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        content: mappedContent
      } as PaginatedData<HighlightItem>
    }
  } as AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>;
};
