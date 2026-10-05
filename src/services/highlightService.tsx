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
const MOCK_FEATURED_ATTRACTIONS: HighlightItem[] = [
  {
    id: 9991,
    name: "Cầu Vàng - Bà Nà Hills",
    location: "Hòa Phú, Hòa Vang, Đà Nẵng",
    rating: 4.9,
    reviewCount: 3520,
    imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
    description: "Cây cầu có thiết kế độc nhất vô nhị với đôi bàn tay khổng lồ bằng đá rêu phong nâng đỡ dải lụa vàng óng ả vắt ngang qua mây trời đỉnh Bà Nà.",
    type: "pin",
    category: "Địa điểm tham quan",
    averagePrice: 850000,
    provinceId: 2,
    status: "ACTIVE"
  },
  {
    id: 8881,
    name: "Phố Cổ Hội An",
    location: "Minh An, Hội An, Quảng Nam",
    rating: 4.9,
    reviewCount: 4200,
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
    description: "Đô thị cổ bảo tồn nguyên vẹn hơn 1.000 di tích kiến trúc mái ngói rêu phong, lung linh đèn lồng bên dòng sông Hoài thơ mộng.",
    type: "pin",
    category: "Di sản văn hóa",
    averagePrice: 0,
    provinceId: 3,
    status: "ACTIVE"
  },
  {
    id: 7771,
    name: "Đại Nội & Kinh Thành Huế",
    location: "Thuận Thành, TP. Huế, Thừa Thiên Huế",
    rating: 4.8,
    reviewCount: 2900,
    imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80",
    description: "Quần thể di tích cung đình nguy nga tráng lệ của triều Nguyễn với Ngọ Môn, Điện Thái Hòa và Cung Diên Thọ cổ kính.",
    type: "pin",
    category: "Di tích lịch sử",
    averagePrice: 200000,
    provinceId: 1,
    status: "ACTIVE"
  },
  {
    id: 9995,
    name: "Bán Đảo Sơn Trà & Chùa Linh Ứng",
    location: "Bãi Bụt, Sơn Trà, Đà Nẵng",
    rating: 4.9,
    reviewCount: 2200,
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    description: "Ngôi chùa linh thiêng với tượng Phật Bà Quan Thế Âm cao 67m hướng ra biển Đông và rừng nguyên sinh Sơn Trà xanh ngát.",
    type: "pin",
    category: "Địa điểm tâm linh",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE"
  },
  {
    id: 9993,
    name: "Cầu Rồng Đà Nẵng",
    location: "Hải Châu, Đà Nẵng",
    rating: 4.7,
    reviewCount: 1950,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    description: "Biểu tượng du lịch năng động của Đà Nẵng với kiến trúc rồng thép vươn ra biển lớn và trình diễn phun lửa cuối tuần.",
    type: "pin",
    category: "Địa điểm tham quan",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE"
  },
  {
    id: 9994,
    name: "Bãi Biển Mỹ Khê",
    location: "Sơn Trà, Đà Nẵng",
    rating: 4.8,
    reviewCount: 3100,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "Một trong những bãi biển đẹp nhất hành tinh với bờ cát trắng mịn màng, sóng êm và làn nước trong xanh biếc.",
    type: "pin",
    category: "Bãi biển",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE"
  },
  {
    id: 8883,
    name: "Rừng Dừa Bảy Mẫu",
    location: "Cẩm Thanh, Hội An",
    rating: 4.7,
    reviewCount: 1650,
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
    description: "Trải nghiệm đi thuyền thúng múa thúng điêu luyện giữa rừng dừa nước bạt ngàn đậm chất sông nước miền Trung.",
    type: "pin",
    category: "Sinh thái",
    averagePrice: 150000,
    provinceId: 3,
    status: "ACTIVE"
  }
];

/**
 * Lấy danh sách địa điểm tham quan từ API thật (Hỗ trợ lọc theo Tỉnh thành)
 */
export const getAttractions = async (page = 0, size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<PaginatedData<HighlightItem>>>> => {
  try {
    let url = `/attractions?page=${page}&size=${size}`;
    if (provinceId && provinceId !== "all") {
      url += `&provinceId=${provinceId}`;
    }
    
    const response = await instance.get<BackendResponse<PaginatedData<BackendItem>>>(url);
    const content = response.data.data?.content || [];
    if (content.length > 0) {
      const mappedContent = content.map((item: BackendItem) => mapBackendToHighlightItem(item, "pin"));
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
    }
    throw new Error("Empty attractions");
  } catch {
    return {
      data: {
        status: 200,
        message: "Lấy danh sách địa điểm mẫu thành công",
        data: {
          content: MOCK_FEATURED_ATTRACTIONS,
          page: {
            size: size,
            number: page,
            totalElements: MOCK_FEATURED_ATTRACTIONS.length,
            totalPages: 1
          }
        }
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse<unknown>["config"]
    };
  }
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
      data: response.data.data?.content || MOCK_FEATURED_ATTRACTIONS
    }
  } as AxiosResponse<BackendResponse<HighlightItem[]>>;
};

/**
 * Lấy danh sách nhà hàng nổi bật (cho trang chủ/explore)
 */
export const getHighlightRestaurants = async (size = 10, provinceId?: number | string): Promise<AxiosResponse<BackendResponse<HighlightItem[]>>> => {
  try {
    const response = await getRestaurants(0, size, provinceId);
    return {
      ...response,
      data: {
        ...response.data,
        data: response.data.data?.content || []
      }
    } as AxiosResponse<BackendResponse<HighlightItem[]>>;
  } catch {
    return {
      data: {
        status: 200,
        message: "Lấy danh sách nhà hàng nổi bật thành công",
        data: []
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse<unknown>["config"]
    };
  }
};

/**
 * Lấy danh sách địa điểm nổi bật (API mới đã được BE tối ưu)
 */
export const getFeaturedAttractions = async (limit = 5): Promise<AxiosResponse<BackendResponse<HighlightItem[]>>> => {
  try {
    const response = await instance.get<BackendResponse<BackendItem[]>>(`/attractions/featured?limit=${limit}`);
    const rawData = response.data.data || [];
    if (rawData.length > 0) {
      const mappedData = rawData.map((item: BackendItem) => mapBackendToHighlightItem(item, "pin"));
      return {
        ...response,
        data: {
          ...response.data,
          data: mappedData
        }
      } as AxiosResponse<BackendResponse<HighlightItem[]>>;
    }
    throw new Error("Empty featured");
  } catch {
    return {
      data: {
        status: 200,
        message: "Lấy địa điểm nổi bật mẫu thành công",
        data: MOCK_FEATURED_ATTRACTIONS.slice(0, limit)
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse<unknown>["config"]
    };
  }
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
