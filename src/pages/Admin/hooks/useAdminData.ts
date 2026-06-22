import React, { useState, useEffect, useRef } from "react";
import * as adminService from "../../../services/adminService";

// Re-export types from service so view components don't break
export type {
  Hotel,
  Restaurant,
  DbUser,
  DashboardStat,
  PopularLocation,
  Destination,
  NewsItem,
  AdminReview,
  AdminNearbyService,
  AdminItinerary,
  BackendResponse,
} from "../../../services/adminService";

// ─── Generic hook ─────────────────────────────────────────────────────────────

function useCollection<T, Args extends any[] = any[]>(
  fetchFn: (...args: Args) => Promise<unknown>,
  fallbackData?: T[]
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    currentPage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastArgs = useRef<Args>([] as unknown as Args);

  const fetchData = async (...args: Args) => {
    try {
      setLoading(true);
      setError(null);

      // Nếu gọi refetch() không tham số, dùng lại tham số cũ (để giữ page/search)
      const currentArgs = args.length > 0 ? args : lastArgs.current;
      lastArgs.current = currentArgs;

      const response = (await fetchFn(...currentArgs)) as {
        data?:
          | { data?: unknown; [key: string]: unknown }
          | unknown;
      };

      const resBody = response.data as { data?: unknown };
      const resData = resBody.data;

      // Kiểm tra nếu là dữ liệu phân trang (có content) hay mảng đơn thuần
      if (resData && typeof resData === "object" && "content" in resData) {
        const pagedData = resData as any;
        setData(pagedData.content || []);
        
        // Tìm kiếm thông tin phân trang linh hoạt (ở root hoặc trong object page)
        const totalPages = pagedData.page?.totalPages ?? pagedData.totalPages ?? 1;
        const totalElements = pagedData.page?.totalElements ?? pagedData.totalElements ?? (pagedData.content?.length || 0);
        const currentPage = pagedData.page?.number ?? pagedData.number ?? 0;

        setPagination({
          totalPages: totalPages,
          totalElements: totalElements,
          currentPage: currentPage,
        });
      } else {
        const list = Array.isArray(resData) ? resData : [];
        setData(list as T[]);
        setPagination({
          totalPages: 1,
          totalElements: list.length,
          currentPage: 0,
        });
      }
    } catch (err: any) {
      setError("Không thể kết nối tới máy chủ.");
      
      // Nếu có dữ liệu fallback, dùng nó khi API lỗi
      if (fallbackData) {
        setData(fallbackData);
        setPagination({
          totalPages: 1,
          totalElements: fallbackData.length,
          currentPage: 0,
        });
      }

      if (import.meta.env.DEV) {
        console.warn(`[useAdminData] Fetch failed. Using fallback if provided.`, err.message);
      } else {
        console.error(`[useAdminData] Fetch failed:`, err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(...([] as unknown as Args));
  }, []); // Chỉ gọi lần đầu, việc fetch phân trang sẽ do View gọi refetch với args

  const toggleUserStatus = async (
    id: string | number,
    currentStatus: boolean,
  ) => {
    if (currentStatus) {
      return await adminService.lockUser(id);
    } else {
      return await adminService.unlockUser(id);
    }
  };

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    toggleUserStatus,
    setData,
    setError,
  };
}

// ─── Shared CRUD Helpers ──────────────────────────────────────────────────────

export const updateItineraryStatus = async (id: number | string, status: string) => {
  return await adminService.updateItineraryStatus(id, status);
};

// ─── Specific hooks ───────────────────────────────────────────────────────────

export const useAttractions = () =>
  useCollection<adminService.Destination>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchAttractionsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchAttractionsList(page, size, provinceId);
  });

export const useRestaurants = () =>
  useCollection<adminService.Restaurant>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchRestaurantsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchRestaurantsList(page, size, provinceId);
  });

export const useDbUsers = () =>
  useCollection<adminService.DbUser>((page?: number, size?: number, keyword?: string, isActive?: boolean) => {
    if (isActive !== undefined && isActive !== null)
      return adminService.fetchUsersByStatus(isActive, page, size);
    if (keyword) return adminService.searchUsersByKeyword(keyword, page, size);
    return adminService.fetchUsersList(page, size);
  });
export const useDashboardStats = () => {
  const [data, setData] = useState<adminService.DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = (res: adminService.DashboardStatResponse): adminService.DashboardStat[] => {
    const mapStat = (key: keyof adminService.DashboardStatResponse, label: string, icon: string, colorClass: string): adminService.DashboardStat => {
      const { value, lastMonthValue } = res[key];
      const diff = value - lastMonthValue;
      const pct = lastMonthValue > 0 ? Math.round((diff / lastMonthValue) * 100) : 0;
      return {
        id: key,
        label,
        value: value.toLocaleString('vi-VN'),
        trend: `${diff >= 0 ? '+' : ''}${pct}% so với tháng trước`,
        trendUp: diff >= 0,
        icon,
        colorClass,
        footerText: `Tháng trước: ${lastMonthValue.toLocaleString('vi-VN')}`
      };
    };

    return [
      mapStat('users', 'TỔNG NGƯỜI DÙNG', 'Users', 'bgBlue'),
      mapStat('itineraries', 'TỔNG LỊCH TRÌNH', 'Signpost', 'bgPurple'),
      mapStat('reviews', 'TỔNG ĐÁNH GIÁ', 'ChatCircleText', 'bgEmerald'),
    ];
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await adminService.fetchDashboardStats();
      if (res.data && res.data.data) {
        setData(transformData(res.data.data));
      }
    } catch (err: any) {
      setError("Không thể lấy dữ liệu thống kê.");
      // Fallback
      const mock: adminService.DashboardStatResponse = {
        users: { value: 12845, lastMonthValue: 11000 },
        itineraries: { value: 8432, lastMonthValue: 7800 },
        reviews: { value: 24592, lastMonthValue: 21000 }
      };
      setData(transformData(mock));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, []);

  return { data, loading, error, refetch };
};

export const usePopularLocations = () => {
  const fallback: adminService.PopularLocation[] = [
    { provinceId: 1, name: 'Huế', value: 925, lastWeekValue: 850, color: '#7c3aed', image: 'https://images.unsplash.com/photo-1599708153386-62bf3f035a72?auto=format&fit=crop&q=80&w=200' },
    { provinceId: 2, name: 'Đà Nẵng', color: '#0ea5e9', value: 1250, lastWeekValue: 1100, image: 'https://images.unsplash.com/photo-1559592442-7e18ad73d800?auto=format&fit=crop&q=80&w=200' },
    { provinceId: 3, name: 'Quảng Nam', color: '#f59e0b', value: 845, lastWeekValue: 900, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=200' },
  ];
  return useCollection<adminService.PopularLocation>(adminService.fetchPopularLocations, fallback);
};

export const useHotels = () =>
  useCollection<adminService.Hotel>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchHotelsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchHotelsList(page, size, provinceId);
  });

export const useDestinations = () =>
  useCollection<adminService.Destination>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchAttractionsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchAttractionsList(page, size, provinceId);
  });

export const useNews = () =>
  useCollection<adminService.NewsItem>((page?: number, size?: number) => {
    return adminService.fetchNewsList(page, size);
  });

export const useAdminReviews = () =>
  useCollection<adminService.AdminReview>((page?: number, size?: number, keyword?: string, type?: string, status?: string) => {
    if (keyword || (type && type !== "All") || (status && status !== "All")) {
      return adminService.searchReviewsByFilter(keyword, type, status, page, size);
    }
    return adminService.fetchAdminReviewsList(page, size);
  });

export const useNearbyServices = () => {
  const collection = useCollection<adminService.AdminNearbyService>((page?: number, size?: number, serviceType?: string) => {
    if (serviceType && serviceType !== 'ALL')
      return adminService.fetchNearbyServicesByType(serviceType, page, size);
    return adminService.fetchAllNearbyServices(page, size);
  });
  return collection;
};

export const useAdminItineraries = () => {
  const collection = useCollection<adminService.AdminItinerary>((page?: number, size?: number, keyword?: string, status?: string) => {
    if (keyword) return adminService.searchItinerariesByKeyword(keyword, page, size, status);
    return adminService.fetchItinerariesList(page, size, status);
  });

  return collection;
};

export const useAdminItineraryDetail = (id: string | number | null) => {
  const [data, setData] = useState<adminService.AdminItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async (targetId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.fetchItineraryDetail(targetId);
      setData(res.data.data || null);
    } catch (err) {
      setError("Không thể tải chi tiết lộ trình");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id]);

  return { data, loading, error, refetch: () => id && fetchDetail(id) };
};

// ─── CRUD helpers (delegating to adminService) ────────────────────────────────

export const deleteRecord = async (
  endpoint: string,
  id: string | number,
): Promise<adminService.BackendResponse<unknown>> => {
  let response;
  switch (endpoint) {
    case "hotels":
      response = await adminService.removeHotel(id);
      break;
    case "restaurants":
      response = await adminService.removeRestaurant(id);
      break;
    case "users":
      response = await adminService.removeUser(id);
      break;
    case "attractions":
    case "destinations":
      response = await adminService.removeAttraction(id);
      break;
    case "news":
      response = await adminService.removeNews(id);
      break;
    case "reviews":
      response = await adminService.removeReview(id);
      break;
    case "itineraries":
      response = await adminService.removeItinerary(id);
      break;
    case "nearby-services":
      response = await adminService.removeNearbyService(id);
      break;
    default:
      throw new Error(`Endpoint ${endpoint} không hỗ trợ xóa`);
  }
  return response.data;
};

export const updateRecord = async <T>(
  endpoint: string,
  id: string | number,
  data: FormData | Record<string, unknown>,
): Promise<adminService.BackendResponse<T>> => {
  let response;
  if (endpoint === "hotels") {
    response = await adminService.updateHotel(id, data as FormData);
  } else if (endpoint === "restaurants") {
    response = await adminService.updateRestaurant(id, data as FormData);
  } else if (endpoint === "destinations") {
    response = await adminService.updateAttraction(id, data as FormData);
  } else if (endpoint === "users") {
    response = await adminService.updateUser(id, data as Partial<adminService.DbUser>);
  } else if (endpoint === "news") {
    response = await adminService.updateNews(id, data as FormData);
  } else {
    throw new Error(`Endpoint ${endpoint} không hỗ trợ cập nhật`);
  }
  return response.data as adminService.BackendResponse<T>;
};

export const createRecord = async <T>(
  endpoint: string,
  data: FormData | Record<string, unknown>,
): Promise<adminService.BackendResponse<T>> => {
  let response;
  if (endpoint === "hotels") {
    response = await adminService.createHotel(data as FormData);
  } else if (endpoint === "restaurants") {
    response = await adminService.createRestaurant(data as FormData);
  } else if (endpoint === "destinations") {
    response = await adminService.createAttraction(data as FormData);
  } else if (endpoint === "users") {
    response = await adminService.createUser(data as Partial<adminService.DbUser>);
  } else if (endpoint === "news") {
    response = await adminService.createNews(data as FormData);
  } else {
    throw new Error(`Endpoint ${endpoint} không hỗ trợ tạo mới`);
  }
  return response.data as adminService.BackendResponse<T>;
};

export const toggleNewsFeatured = async (
  id: string | number,
): Promise<void> => {
  await adminService.toggleNewsFeatured(id);
};
