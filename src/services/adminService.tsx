import instance from "../utils/AxiosCustomize";
import type { AxiosResponse } from "axios";
import type { BackendResponse } from "../types/backend";
export type { BackendResponse };

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface Hotel {
  id: string | number;
  name: string;
  location: string;
  addressDetailed: string | null;
  rating: number;
  reviewCount: number;
  category: string | null;
  status: "ACTIVE" | "MAINTENANCE" | string;
  imageUrl: string;
  gallery: string[];
  averagePrice: number;
  estimatedDuration: number;
  provinceId: number;
  description: string;
  previewVideo?: string | null;
}

export interface Restaurant {
  id: string | number;
  name: string;
  location: string;
  addressDetailed: string | null;
  rating: number;
  reviewCount: number;
  category: string | null;
  status: string;
  imageUrl: string;
  gallery: string[];
  averagePrice: number;
  estimatedDuration: number;
  provinceId: number;
  description: string;
  previewVideo?: string | null;
}

export interface ItineraryStep {
  time: string;
  activity: string;
  dist: string;
}

export interface Destination {
  id: string | number;
  name: string;
  title?: string; // Alternative from API
  location: string;
  addressDetailed: string | null;
  rating: number;
  reviewCount: number;
  reviews?: number; // Alternative from API
  category: string | null;
  status: string;
  imageUrl: string;
  image?: string; // Alternative from API
  img?: string;   // Alternative from API
  gallery: string[];
  averagePrice: number;
  price?: string | number; // Alternative from API
  estimatedDuration: number;
  provinceId: number;
  description: string;
  desc?: string;    // Alternative from API
  content?: string; // Alternative from API
  summary?: string; // Alternative from API
  previewVideo?: string | null;
}

export interface DbUser {
  id: number;
  email: string;
  fullName: string;
  address: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  googleId: string | null;
  facebookId: string | null;
  isGoogleLinked: boolean;
  isFacebookLinked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatResponse {
  users: { value: number; lastMonthValue: number };
  itineraries: { value: number; lastMonthValue: number };
  reviews: { value: number; lastMonthValue: number };
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: string;
  colorClass: string;
  footerText?: string;
}

export interface PopularLocation {
  provinceId: number;
  name: string;
  value: number;
  lastWeekValue: number;
  color?: string; // Optional for UI coloring
  image?: string; // Optional for UI display
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  isFeatured: boolean;
  authorId?: number;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminReview {
  id: number;
  userId: number;
  userName: string;
  userImage: string;
  hotelId: number | null;
  restaurantId: number | null;
  attractionId: number | null;
  type: "HOTEL" | "RESTAURANT" | "ATTRACTION" | "WEBSITE" | "TRIP";
  rating: number;
  comment: string;
  status: "ACTIVE" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  images: string[];
  provinceName?: string;
  nameService?: string;
}



// ─── API Methods ───────────────────────────────────────────────────────────

// Dashboard
export const fetchDashboardStats = (): Promise<
  AxiosResponse<BackendResponse<DashboardStatResponse>>
> => instance.get<BackendResponse<DashboardStatResponse>>("/dashboard_stats");


export const fetchPopularLocations = (): Promise<
  AxiosResponse<BackendResponse<PopularLocation[]>>
> => instance.get<BackendResponse<PopularLocation[]>>("/popular_locations");

// Hotels
export const fetchHotelsList = (page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Hotel[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Hotel[]; page: PageInfo }>>(`/hotels?page=${page}&size=${size}${provinceParam}`);
};

export const searchHotelsByKeyword = (keyword: string, page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Hotel[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Hotel[]; page: PageInfo }>>(`/hotels/search/by-keyword?keyword=${keyword}&page=${page}&size=${size}${provinceParam}`);
};

export const removeHotel = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> =>
  instance.delete<BackendResponse<unknown>>(`/hotels/${id}`);

export const createHotel = (
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Hotel>>> =>
  instance.post<BackendResponse<Hotel>>("/hotels", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateHotel = (
  id: string | number,
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Hotel>>> =>
  instance.put<BackendResponse<Hotel>>(`/hotels/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchHotelDetail = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<Hotel>>> =>
  instance.get<BackendResponse<Hotel>>(`/hotels/${id}`);

export const deleteHotelGalleryImage = (
  id: string | number,
  index: number,
): Promise<AxiosResponse<BackendResponse<Hotel>>> =>
  instance.delete<BackendResponse<Hotel>>(`/hotels/${id}/gallery/${index}`);

// Restaurants
export const fetchRestaurantsList = (page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Restaurant[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Restaurant[]; page: PageInfo }>>(`/restaurants?page=${page}&size=${size}${provinceParam}`);
};

export const searchRestaurantsByKeyword = (keyword: string, page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Restaurant[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Restaurant[]; page: PageInfo }>>(`/restaurants/search/by-keyword?keyword=${keyword}&page=${page}&size=${size}${provinceParam}`);
};

export const createRestaurant = (
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Restaurant>>> =>
  instance.post<BackendResponse<Restaurant>>("/restaurants", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRestaurant = (
  id: string | number,
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Restaurant>>> =>
  instance.put<BackendResponse<Restaurant>>(`/restaurants/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const removeRestaurant = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> =>
  instance.delete<BackendResponse<unknown>>(`/restaurants/${id}`);

export const fetchRestaurantDetail = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<Restaurant>>> =>
  instance.get<BackendResponse<Restaurant>>(`/restaurants/${id}`);

export const deleteRestaurantGalleryImage = (
  id: string | number,
  index: number,
): Promise<AxiosResponse<BackendResponse<Restaurant>>> =>
  instance.delete<BackendResponse<Restaurant>>(`/restaurants/${id}/gallery/${index}`);

// Users
export const fetchUsersList = (page = 0, size = 10): Promise<
  AxiosResponse<BackendResponse<{ content: DbUser[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: DbUser[]; page: PageInfo }>>(`/admin/users?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const searchUsersByKeyword = (keyword: string, page = 0, size = 10): Promise<
  AxiosResponse<BackendResponse<{ content: DbUser[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: DbUser[]; page: PageInfo }>>(
    `/admin/users/search?keyword=${keyword}&page=${page}&size=${size}`, 
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const fetchUsersByStatus = (isActive: boolean, page = 0, size = 10): Promise<
  AxiosResponse<BackendResponse<{ content: DbUser[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: DbUser[]; page: PageInfo }>>(
    `/admin/users/filter/status?isActive=${isActive}&page=${page}&size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const fetchUserDetail = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<DbUser>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<DbUser>>(`/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const createUser = (
  data: Partial<DbUser>,
): Promise<AxiosResponse<BackendResponse<DbUser>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.post<BackendResponse<DbUser>>("/admin/users", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateUser = (
  id: string | number,
  data: Partial<DbUser>,
): Promise<AxiosResponse<BackendResponse<DbUser>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.put<BackendResponse<DbUser>>(`/admin/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const lockUser = (id: string | number): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.put(`/admin/users/${id}/lock`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const unlockUser = (id: string | number): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.put(`/admin/users/${id}/unlock`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const removeUser = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.delete<BackendResponse<unknown>>(`/admin/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Attractions (Địa điểm)
export const fetchAttractionsList = (page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Destination[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Destination[]; page: PageInfo }>>(`/attractions?page=${page}&size=${size}${provinceParam}`);
};

export const searchAttractionsByKeyword = (keyword: string, page = 0, size = 10, provinceId?: number): Promise<
  AxiosResponse<BackendResponse<{ content: Destination[]; page: PageInfo }>>
> => {
  const provinceParam = provinceId ? `&provinceId=${provinceId}` : '';
  return instance.get<BackendResponse<{ content: Destination[]; page: PageInfo }>>(`/attractions/search/by-keyword?keyword=${keyword}&page=${page}&size=${size}${provinceParam}`);
};

export const createAttraction = (
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Destination>>> =>
  instance.post<BackendResponse<Destination>>("/attractions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAttraction = (
  id: string | number,
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<Destination>>> =>
  instance.put<BackendResponse<Destination>>(`/attractions/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const removeAttraction = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> =>
  instance.delete<BackendResponse<unknown>>(`/attractions/${id}`);

export const fetchAttractionDetail = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<Destination>>> =>
  instance.get<BackendResponse<Destination>>(`/attractions/${id}`);

export const deleteAttractionGalleryImage = (
  id: string | number,
  index: number,
): Promise<AxiosResponse<BackendResponse<Destination>>> =>
  instance.delete<BackendResponse<Destination>>(`/attractions/${id}/gallery/${index}`);



// News / Posts
export const fetchNewsList = (page = 0, size = 10): Promise<
  AxiosResponse<BackendResponse<{ content: NewsItem[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: NewsItem[]; page: PageInfo }>>(`/news/admin/all?page=${page}&size=${size}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createNews = (
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<NewsItem>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.post<BackendResponse<NewsItem>>("/news", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateNews = (
  id: string | number,
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<NewsItem>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.put<BackendResponse<NewsItem>>(`/news/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  });
};

export const removeNews = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> =>
  instance.delete<BackendResponse<unknown>>(`/news/${id}`);

export const toggleNewsFeatured = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.patch<BackendResponse<unknown>>(`/news/${id}/featured`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Reviews
export const fetchAdminReviewsList = (page = 0, size = 10): Promise<
  AxiosResponse<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>(
    `/admin/reviews?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const fetchReviewDetail = (
  id: string | number
): Promise<AxiosResponse<BackendResponse<AdminReview>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<AdminReview>>(`/admin/reviews/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateReviewStatus = (
  id: string | number,
  status: "ACTIVE" | "HIDDEN"
): Promise<AxiosResponse<BackendResponse<AdminReview>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.patch<BackendResponse<AdminReview>>(
    `/admin/reviews/${id}/status`,
    null,
    { 
      params: { status },
      headers: { Authorization: `Bearer ${token}` } 
    }
  );
};

export const removeReview   = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.delete<BackendResponse<unknown>>(`/admin/reviews/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};


export const fetchReviewsByTarget = (
  type: "hotel" | "restaurant" | "attraction",
  id: string | number,
  page = 0,
  size = 10
): Promise<AxiosResponse<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>(
    `/admin/reviews/${type}/${id}?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const searchReviewsByFilter = (
  keyword: string = "",
  type: string = "",
  status: string = "",
  page = 0,
  size = 10
): Promise<AxiosResponse<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>> => {
  const token = localStorage.getItem("accessToken");
  const typeParam = type && type !== "All" ? `&type=${type}` : "";
  const statusParam = status && status !== "All" ? `&status=${status}` : "";
  return instance.get<BackendResponse<{ content: AdminReview[]; page: PageInfo }>>(
    `/admin/reviews/search?keyword=${keyword}${typeParam}${statusParam}&page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const uploadAdminImage = async (
  file: File,
): Promise<AxiosResponse<BackendResponse<{ imageUrl: string }>>> => {
  const formData = new FormData();
  formData.append("file", file);
  return await instance.post<BackendResponse<{ imageUrl: string }>>(
    "/users/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

// ─── Nearby Services ──────────────────────────────────────────────────────────

export interface AdminNearbyService {
  id: number;
  attractionId: number | null;
  hotelId: number | null;
  restaurantId: number | null;
  provinceId: number | null;
  serviceType: string;
  serviceName: string;
  description: string;
  address: string;
  location: string; // New field from BE (lat,lng string)
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

export const fetchNearbyServicesByType = (
  serviceType: string,
  page = 0,
  size = 10,
): Promise<AxiosResponse<BackendResponse<{ content: AdminNearbyService[]; page: PageInfo }>>> =>
  instance.get<BackendResponse<{ content: AdminNearbyService[]; page: PageInfo }>>(
    `/nearby-services/type/${serviceType}?page=${page}&size=${size}`
  );

export const fetchAllNearbyServices = (
  page = 0,
  size = 10,
): Promise<AxiosResponse<BackendResponse<{ content: AdminNearbyService[]; page: PageInfo }>>> =>
  instance.get<BackendResponse<{ content: AdminNearbyService[]; page: PageInfo }>>(
    `/nearby-services?page=${page}&size=${size}`
  );

export const removeNearbyService = (
  id: string | number,
): Promise<AxiosResponse<BackendResponse<unknown>>> =>
  instance.delete<BackendResponse<unknown>>(`/nearby-services/${id}`);

export const createNearbyService = (
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<AdminNearbyService>>> =>
  instance.post<BackendResponse<AdminNearbyService>>("/nearby-services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateNearbyService = (
  id: string | number,
  formData: FormData,
): Promise<AxiosResponse<BackendResponse<AdminNearbyService>>> =>
  instance.put<BackendResponse<AdminNearbyService>>(`/nearby-services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchNearbyServicesByTarget = (
  targetType: "attraction" | "hotel" | "restaurant",
  targetId: string | number,
): Promise<AxiosResponse<BackendResponse<AdminNearbyService[]>>> =>
  instance.get<BackendResponse<AdminNearbyService[]>>(
    `/nearby-services/${targetType}/${targetId}`
  );
// Itineraries (Lộ trình)
export interface ItineraryActivity {
  order: number;
  startTime: string | number[];
  endTime: string | number[];
  type: "ATTRACTION" | "HOTEL" | "RESTAURANT";
  entityId?: number;
  name: string;
  address?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  estimatedCost?: number;
  note?: string;
}

export interface AdminItinerary {
  itineraryId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  title: string;
  provinceId?: number;
  provinceName: string;
  location?: string;
  days: number;
  budget: string | number;
  interests?: string[];
  totalEstimatedCost: number;
  totalDistance?: number;
  averageRating: number | null;
  status: 'DRAFT' | 'PUBLISHED';
  reasonRecommended?: string;
  startDate?: number[];
  createdAt?: string;
  itineraryDays?: {
    dayNumber: number;
    date?: number[];
    theme?: string;
    activities: ItineraryActivity[];
  }[];
  hotels?: Hotel[];
  costBreakdown?: Record<string, number>;
}

export const fetchItinerariesList = (page = 0, size = 10, status?: string): Promise<
  AxiosResponse<BackendResponse<{ content: AdminItinerary[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  const statusParam = status && status !== 'all' ? `&status=${status}` : '';
  return instance.get<BackendResponse<{ content: AdminItinerary[]; page: PageInfo }>>(
    `/admin/itineraries?page=${page}&size=${size}${statusParam}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const searchItinerariesByKeyword = (keyword: string, page = 0, size = 10, status?: string): Promise<
  AxiosResponse<BackendResponse<{ content: AdminItinerary[]; page: PageInfo }>>
> => {
  const token = localStorage.getItem("accessToken");
  const statusParam = status && status !== 'all' ? `&status=${status}` : '';
  return instance.get<BackendResponse<{ content: AdminItinerary[]; page: PageInfo }>>(
    `/admin/itineraries/search?keyword=${keyword}&page=${page}&size=${size}${statusParam}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const fetchItineraryDetail = (id: string | number): Promise<AxiosResponse<BackendResponse<AdminItinerary>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.get<BackendResponse<AdminItinerary>>(`/admin/itineraries/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const removeItinerary = (id: string | number): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.delete<BackendResponse<unknown>>(`/admin/itineraries/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateItineraryStatus = (id: string | number, status: string): Promise<AxiosResponse<BackendResponse<AdminItinerary>>> => {
  const token = localStorage.getItem("accessToken");
  return instance.patch<BackendResponse<AdminItinerary>>(`/admin/itineraries/${id}/status?status=${status}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
