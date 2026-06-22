import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import type { BackendResponse } from "../types/backend";
import { type HighlightItem } from "./highlightService";
import { type Destination } from "./destinationService";
import { DEFAULT_TRAVEL_TIPS } from "./hotelService";

export interface BackendRestaurant {
  id: number;
  name: string;
  description: string | null;
  location?: string | null;
  addressDetailed?: string | null;
  rating: number;
  reviewCount: number | null;
  category: string | null; // Đổi từ cuisine
  status: string | null;
  averagePrice: number | null;
  estimatedDuration: number | null;
  imageUrl: string | null;
  previewVideo: string | null;
  provinceId: number;
  gallery?: string[];
  coordinates?: { lat: number; lng: number };
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

const CUISINE_MAP: Record<string, string> = {
  "MON_VIET": "Món Việt",
  "HAI_SAN": "Hải sản",
  "CHAY": "Món chay",
  "A_DONG": "Á Đông",
  "AU_MY": "Âu Mỹ",
};

/**
 * Lấy danh sách nhà hàng từ API và map sang HighlightItem (Hỗ trợ lọc theo Tỉnh thành)
 */
export const getRestaurants = async (page = 0, size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>> => {
  let url = `/restaurants?page=${page}&size=${size}`;
  if (provinceId && provinceId !== "all") {
    url += `&provinceId=${provinceId}`;
  }
  
  const response = await instance.get<BackendResponse<PaginatedData<BackendRestaurant>>>(url);
  
  const mappedContent: HighlightItem[] = (response.data.data?.content || []).map(rest => ({
    id: typeof rest.id === 'string' ? parseInt(rest.id, 10) : rest.id,
    name: rest.name || "",
    location: 
      rest.addressDetailed || 
      (rest.provinceId === 1 ? "Thừa Thiên Huế" : 
       rest.provinceId === 2 ? "Đà Nẵng" : 
       rest.provinceId === 3 ? "Quảng Nam" : `Khu vực ${rest.provinceId} (Đang cập nhật)`),
    rating: rest.rating || 0,
    reviewCount: rest.reviewCount || 0,
    imageUrl: rest.imageUrl || "https://placehold.co/600x400?text=Hình+ảnh+đang+cập+nhật",
    description: rest.description || `Thông tin về ${rest.name} đang được cập nhật.`,
    type: "food",
    category: CUISINE_MAP[rest.category || ""] || rest.category || "Ẩm thực",
    previewVideo: rest.previewVideo || undefined,
    status: rest.status || "OPENING",
    averagePrice: rest.averagePrice || 0,
    provinceId: rest.provinceId || 0,
    latitude: (() => {
      const extractCoords = (raw: string) => {
        const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        return null;
      };
      if (rest.coordinates?.lat) return rest.coordinates.lat;
      const raw = rest.location || rest.addressDetailed || "";
      const coords = extractCoords(raw);
      return coords?.lat;
    })(),
    longitude: (() => {
      const extractCoords = (raw: string) => {
        const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        return null;
      };
      if (rest.coordinates?.lng) return rest.coordinates.lng;
      const raw = rest.location || rest.addressDetailed || "";
      const coords = extractCoords(raw);
      return coords?.lng;
    })()
  }));

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        ...response.data.data,
        content: mappedContent
      }
    }
  } as AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>;
};

/**
 * Mapper chuyển đổi dữ liệu từ BackendRestaurant sang định dạng Destination (dùng cho DestinationDetail)
 */
export const mapBackendRestaurantToFullDestination = (rest: BackendRestaurant | null | undefined): Destination => {
  if (!rest) {
    return {
      id: "error",
      name: "Dữ liệu nhà hàng trống",
      location: "Đang cập nhật",
      heroImage: "https://placehold.co/1920x1080?text=Dữ+liệu+trống",
      rating: "0",
      reviews: "0",
      distance: "N/A",
      price: "N/A",
      time: "N/A",
      category: "N/A",
      description: "Không có mô tả.",
      gallery: [],
      services: [],
      reviewsData: { average: 0, total: 0, breakdown: [], list: [] },
      travelTips: DEFAULT_TRAVEL_TIPS,
      weatherCurrent: { temp: 28, description: "Nắng nhẹ", icon: "CloudSun" },
      travelTimeFromHanoi: "N/A",
      coordinates: { lat: 0, lng: 0 },
      locationRaw: "",
      mapScreenshot: "",
      quickInfo: []
    };
  }

  const category = CUISINE_MAP[rest.category || ""] || rest.category || "Ẩm thực";

  return {
    id: rest.id,
    name: rest.name || "Nhà hàng chưa cập nhật tên",
    location: 
      rest.addressDetailed || 
      rest.location || (
        rest.provinceId === 1 ? "Thừa Thiên Huế" : 
        rest.provinceId === 2 ? "Đà Nẵng" : 
        rest.provinceId === 3 ? "Quảng Nam" : "Toàn quốc"
      ),
    heroImage: rest.imageUrl || "https://placehold.co/1920x1080?text=Hình+ảnh+đang+cập+nhật",
    rating: (rest.rating || 0).toString(),
    reviews: rest.reviewCount?.toString() || "0",
    distance: "N/A",
    price: rest.averagePrice ? `${rest.averagePrice.toLocaleString()}đ` : "Giá từ 50k",
    time: rest.estimatedDuration ? `${rest.estimatedDuration} phút` : "Đang cập nhật",
    category: category,
    description: rest.description || `Mô tả về nhà hàng ${rest.name} đang được cập nhật.`,
    gallery: rest.gallery && rest.gallery.length > 0 
      ? rest.gallery 
      : [
          rest.imageUrl || "https://placehold.co/800x600?text=BE+dang+thieu+imageUrl",
          "https://placehold.co/800x600?text=BE+dang+thieu+gallery+2",
          "https://placehold.co/800x600?text=BE+dang+thieu+gallery+3",
        ],
    services: [], // Sẽ được FE tự động lọc trong DestinationDetail
    reviewsData: {
      average: rest.rating || 0,
      total: rest.reviewCount || 0,
      breakdown: [
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 },
      ],
      list: [],
    },
    travelTips: DEFAULT_TRAVEL_TIPS,
    weatherCurrent: {
      temp: 28,
      description: "Trời nắng đẹp",
      icon: "CloudSun"
    },
    travelTimeFromHanoi: "Đang cập nhật",
    coordinates: { 
      lat: (() => {
        if (rest.coordinates?.lat) return rest.coordinates.lat;
        if (rest.location && rest.location.includes(',')) {
          const lat = parseFloat(rest.location.split(',')[0]);
          return isNaN(lat) ? 0 : lat;
        }
        return 0;
      })(),
      lng: (() => {
        if (rest.coordinates?.lng) return rest.coordinates.lng;
        if (rest.location && rest.location.includes(',')) {
          const lng = parseFloat(rest.location.split(',')[1]);
          return isNaN(lng) ? 0 : lng;
        }
        return 0;
      })()
    },
    locationRaw: rest.location || "",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: rest.status === 'ACTIVE' ? 'Đang mở cửa' : 'Đóng cửa' },
      { id: 2, label: "Loại hình", value: category },
      { id: 3, label: "Giá bình quân", value: rest.averagePrice ? `${rest.averagePrice.toLocaleString()}đ/người` : "Chưa cập nhật" },
    ],
  };
};

/**
 * Lấy chi tiết nhà hàng theo ID
 */
export const getRestaurantDetail = async (id: string | number): Promise<AxiosResponse<BackendResponse<Destination>>> => {
  const response = await instance.get<BackendResponse<BackendRestaurant>>(`/restaurants/${id}`);
  const restData = response.data.data;
  
  const fullData = mapBackendRestaurantToFullDestination(restData);
  
  return {
    ...response,
    data: {
      ...response.data,
      data: fullData
    }
  } as AxiosResponse<BackendResponse<Destination>>;
};
