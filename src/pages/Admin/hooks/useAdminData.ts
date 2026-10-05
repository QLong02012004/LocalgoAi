import React, { useState, useEffect, useRef } from "react";
import * as adminService from "../../../services/adminService";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_POPULAR_LOCATIONS,
  MOCK_DESTINATIONS,
  MOCK_HOTELS,
  MOCK_RESTAURANTS,
  MOCK_USERS,
  MOCK_NEWS,
  MOCK_REVIEWS,
  MOCK_NEARBY_SERVICES,
  MOCK_ITINERARIES,
} from "./mockAdminData";

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
  const [data, setData] = useState<T[]>(fallbackData || []);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: fallbackData ? fallbackData.length : 0,
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
        const items = pagedData.content || [];
        if (items.length === 0 && fallbackData && fallbackData.length > 0) {
          setData(fallbackData);
          setPagination({
            totalPages: 1,
            totalElements: fallbackData.length,
            currentPage: 0,
          });
        } else {
          setData(items);
          const totalPages = pagedData.page?.totalPages ?? pagedData.totalPages ?? 1;
          const totalElements = pagedData.page?.totalElements ?? pagedData.totalElements ?? items.length;
          const currentPage = pagedData.page?.number ?? pagedData.number ?? 0;

          setPagination({
            totalPages: totalPages,
            totalElements: totalElements,
            currentPage: currentPage,
          });
        }
      } else {
        const list = Array.isArray(resData) ? resData : [];
        if (list.length === 0 && fallbackData && fallbackData.length > 0) {
          setData(fallbackData);
          setPagination({
            totalPages: 1,
            totalElements: fallbackData.length,
            currentPage: 0,
          });
        } else {
          setData(list as T[]);
          setPagination({
            totalPages: 1,
            totalElements: list.length,
            currentPage: 0,
          });
        }
      }
    } catch (err: any) {
      // Nếu có dữ liệu fallback, dùng nó khi API lỗi
      if (fallbackData && fallbackData.length > 0) {
        setData(fallbackData);
        setPagination({
          totalPages: 1,
          totalElements: fallbackData.length,
          currentPage: 0,
        });
        setError(null);
      } else {
        setError("Không thể kết nối tới máy chủ.");
      }

      if (import.meta.env.DEV) {
        console.warn(`[useAdminData] Fetch failed. Using fallback if provided.`, err?.message);
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
  }, MOCK_DESTINATIONS);

export const useRestaurants = () =>
  useCollection<adminService.Restaurant>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchRestaurantsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchRestaurantsList(page, size, provinceId);
  }, MOCK_RESTAURANTS);

export const useDbUsers = () =>
  useCollection<adminService.DbUser>((page?: number, size?: number, keyword?: string, isActive?: boolean) => {
    if (isActive !== undefined && isActive !== null)
      return adminService.fetchUsersByStatus(isActive, page, size);
    if (keyword) return adminService.searchUsersByKeyword(keyword, page, size);
    return adminService.fetchUsersList(page, size);
  }, MOCK_USERS);

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
      } else {
        setData(transformData(MOCK_DASHBOARD_STATS));
      }
    } catch {
      setData(transformData(MOCK_DASHBOARD_STATS));
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, []);

  return { data, loading, error, refetch };
};

export const usePopularLocations = () => {
  return useCollection<adminService.PopularLocation>(adminService.fetchPopularLocations, MOCK_POPULAR_LOCATIONS);
};

export const useHotels = () =>
  useCollection<adminService.Hotel>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchHotelsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchHotelsList(page, size, provinceId);
  }, MOCK_HOTELS);

export const useDestinations = () =>
  useCollection<adminService.Destination>((page?: number, size?: number, keyword?: string, provinceId?: number) => {
    if (keyword)
      return adminService.searchAttractionsByKeyword(keyword, page, size, provinceId);
    return adminService.fetchAttractionsList(page, size, provinceId);
  }, MOCK_DESTINATIONS);

export const useNews = () =>
  useCollection<adminService.NewsItem>((page?: number, size?: number) => {
    return adminService.fetchNewsList(page, size);
  }, MOCK_NEWS);

export const useAdminReviews = () =>
  useCollection<adminService.AdminReview>((page?: number, size?: number, keyword?: string, type?: string, status?: string) => {
    if (keyword || (type && type !== "All") || (status && status !== "All")) {
      return adminService.searchReviewsByFilter(keyword, type, status, page, size);
    }
    return adminService.fetchAdminReviewsList(page, size);
  }, MOCK_REVIEWS);

export const useNearbyServices = () => {
  return useCollection<adminService.AdminNearbyService>((page?: number, size?: number, serviceType?: string) => {
    if (serviceType && serviceType !== 'ALL')
      return adminService.fetchNearbyServicesByType(serviceType, page, size);
    return adminService.fetchAllNearbyServices(page, size);
  }, MOCK_NEARBY_SERVICES);
};

export const useAdminItineraries = () => {
  return useCollection<adminService.AdminItinerary>((page?: number, size?: number, keyword?: string, status?: string) => {
    if (keyword) return adminService.searchItinerariesByKeyword(keyword, page, size, status);
    return adminService.fetchItinerariesList(page, size, status);
  }, MOCK_ITINERARIES);
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
      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        const found = MOCK_ITINERARIES.find(it => it.itineraryId === Number(targetId)) || MOCK_ITINERARIES[0];
        setData(found);
      }
    } catch {
      const found = MOCK_ITINERARIES.find(it => it.itineraryId === Number(targetId)) || MOCK_ITINERARIES[0];
      setData(found);
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
