import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import { DEFAULT_TRAVEL_TIPS } from "./hotelService";
import { type BackendResponse } from "../types/backend";

export interface Destination {
  id: number | string;
  name: string;
  location: string;
  heroImage: string;
  rating: string;
  reviews: string;
  distance: string;
  price: string;
  time: string;
  category: string;
  description: string;
  gallery: string[];
  services: {
    id: number | string;
    type: "Khách sạn" | "Nhà hàng" | "Tour";
    name: string;
    location: string;
    price: string;
    unit: string;
    rating: number;
    image: string;
    buttonText: string;
  }[];
  reviewsData: {
    average: number;
    total: number;
    breakdown: { stars: number; percentage: number }[];
    list: {
      user: string;
      avatar: string;
      rating: number;
      date: string;
      tag: string;
      content: string;
      images?: string[];
    }[];
  };
  travelTips: {
    icon: string;
    title: string;
    content: string;
  }[];
  weatherCurrent: {
    temp: number;
    description: string;
    icon: string;
  };
  travelTimeFromHanoi: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  locationRaw: string;
  mapScreenshot: string;
  quickInfo: {
    id: number;
    label: string;
    value: string;
  }[];
  provinceId?: number;
}

export interface BackendAttraction {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  addressDetailed: string | null;
  rating: number;
  reviewCount: number | null;
  category: string | null;
  status: string | null;
  averagePrice: number | null;
  estimatedDuration: number | null;
  imageUrl: string | null;
  previewVideo: string | null;
  provinceId: number;
  gallery?: string[];
}

export interface NearbyService {
  id: number;
  attractionId: number | null;
  hotelId: number | null;
  restaurantId: number | null;
  provinceId: number | null;
  serviceType: string;
  serviceName: string;
  description: string;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phoneNumber: string | null;
  openingHours: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  priceLevel: string;
  status: string;
}

/**
 * Lấy danh sách dịch vụ lân cận theo ID đối tượng, Loại đối tượng và Loại dịch vụ (Mới từ BE)
 * @param targetId ID của Hotel/Restaurant/Attraction đang xem
 * @param targetType Loại của đối tượng đang xem ('hotel', 'restaurant', 'attraction')
 * @param serviceType Loại dịch vụ lân cận muốn tìm ('HOTEL', 'RESTAURANT', 'ATTRACTION', ...)
 */
export const getNearbyServicesByType = async (
  targetId: number | string, 
  targetType: "hotel" | "restaurant" | "attraction", 
  serviceType: string
): Promise<BackendResponse<NearbyService[]>> => {
  const response = await instance.get(`/nearby-services/${targetType}/${targetId}/type/${serviceType}`);
  return response.data;
};

/**
 * Lấy TẤT CẢ dịch vụ lân cận của một đối tượng
 */
export const getAllNearbyServices = async (
  targetId: number | string,
  targetType: "hotel" | "restaurant" | "attraction"
): Promise<BackendResponse<NearbyService[]>> => {
  const response = await instance.get(`/nearby-services/${targetType}/${targetId}`);
  return response.data;
};

/**
 * Mapper chuyển đổi dữ liệu từ BackendAttraction sang định dạng Destination hiển thị
 */
export const mapBackendAttractionToFullDestination = (att: BackendAttraction | null | undefined): Destination => {
  if (!att) {
    return {
      id: "error",
      name: "Dữ liệu địa điểm trống",
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

  const rawName = att.name || "";
  let finalName = rawName;
  if (!rawName || rawName.toLowerCase().includes("unknown attraction") || rawName.toLowerCase().includes("địa điểm chưa cập nhật")) {
    finalName = "Địa điểm tham quan";
  }

  return {
    id: att.id,
    name: finalName,
    location: 
      att.addressDetailed || (
        att.provinceId === 1 ? "Thừa Thiên Huế" : 
        att.provinceId === 2 ? "Đà Nẵng" : 
        att.provinceId === 3 ? "Quảng Nam" : "Toàn quốc"
      ),
    heroImage: att.imageUrl || "https://placehold.co/1920x1080?text=Hình+ảnh+đang+cập+nhật",
    rating: (att.rating || 0).toString(),
    reviews: att.reviewCount?.toString() || "0",
    distance: "Chưa xác định",
    price: att.averagePrice ? `${att.averagePrice.toLocaleString()}đ` : "Miễn phí",
    time: att.estimatedDuration ? `${att.estimatedDuration} phút` : "Đang cập nhật",
    category: att.category || "Địa điểm tham quan",
    description: att.description || `Mô tả về địa điểm ${att.name} đang được cập nhật.`,
    gallery: att.gallery && att.gallery.length > 0 
      ? att.gallery 
      : [
          att.imageUrl || "https://placehold.co/800x600?text=BE+dang+thieu+imageUrl",
          "https://placehold.co/800x600?text=BE+dang+thieu+gallery+2",
          "https://placehold.co/800x600?text=BE+dang+thieu+gallery+3",
        ],
    services: [], // Sẽ được FE tự động lọc trong DestinationDetail
    reviewsData: {
      average: att.rating || 0,
      total: att.reviewCount || 0,
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
    coordinates: { lat: 0, lng: 0 },
    locationRaw: att.location || "",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: att.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm đóng cửa' },
      { id: 2, label: "Thời lượng", value: att.estimatedDuration ? `${att.estimatedDuration} phút` : "Chưa cập nhật" },
      { id: 3, label: "Giá tham khảo", value: att.averagePrice ? `${att.averagePrice.toLocaleString()}đ` : "Miễn phí" },
    ],
    provinceId: att.provinceId,
  };
};

/**
 * Lấy chi tiết địa điểm tham quan theo ID
 */
export const getAttractionDetail = async (id: string | number): Promise<AxiosResponse<BackendResponse<Destination>>> => {
  const response = await instance.get<BackendResponse<BackendAttraction>>(`/attractions/${id}`);
  const attData = response.data.data;
  
  const fullData = mapBackendAttractionToFullDestination(attData);
  
  return {
    ...response,
    data: {
      ...response.data,
      data: fullData
    }
  } as AxiosResponse<BackendResponse<Destination>>;
};

/**
 * Xóa một ảnh khỏi thư viện (gallery) của địa điểm
 * @param attractionId ID của địa điểm
 * @param index Chỉ mục của ảnh trong mảng gallery
 */
export const deleteGalleryImage = async (attractionId: number | string, index: number): Promise<BackendResponse<BackendAttraction>> => {
  const response = await instance.delete(`/attractions/${attractionId}/gallery/${index}`);
  return response.data;
};
