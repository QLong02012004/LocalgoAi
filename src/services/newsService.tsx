import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import type { NewsItem } from "../pages/News/types";
import { type BackendResponse } from "../types/backend";

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface NewsResponse {
  content: NewsItem[];
  page: PageInfo;
}

// Helper to format date
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} Th${month}, ${year}`;
};

/**
 * Lấy danh sách tin tức
 */
export const getNewsList = async (page = 0, size = 100, category?: string, keyword?: string): Promise<AxiosResponse<BackendResponse<NewsResponse>>> => {
  let url = `/news?page=${page}&size=${size}`;
  
  if (keyword && keyword.trim() !== "") {
    url = `/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
  } else if (category && category !== "Tất cả") {
    url = `/news/category/${encodeURIComponent(category)}?page=${page}&size=${size}`;
  }
  
  const response = await instance.get<BackendResponse<NewsResponse>>(url);
  
  // Map dates and fallback images if needed
  if (response.data && response.data.data && response.data.data.content) {
    response.data.data.content = response.data.data.content.map(item => ({
      ...item,
      date: item.createdAt ? formatDate(item.createdAt) : "",
      image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
    }));
  }
  
  return response;
};

/**
 * Lấy danh sách tin tức nổi bật
 */
export const getFeaturedNewsList = async (page = 0, size = 5): Promise<AxiosResponse<BackendResponse<NewsResponse>>> => {
  const response = await instance.get<BackendResponse<NewsResponse>>(`/news/featured`);
  
  // Map dates and fallback images if needed
  const rawData = response.data.data;
  if (rawData) {
    const content = Array.isArray(rawData) ? rawData : (rawData as any).content;
    if (Array.isArray(content)) {
      const mapped = content.map(item => ({
        ...item,
        date: item.createdAt ? formatDate(item.createdAt) : "",
        image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
      }));
      if (Array.isArray(rawData)) (response.data as any).data = mapped;
      else (response.data.data as any).content = mapped;
    }
  }
  
  return response;
};

/**
 * Lấy chi tiết một tin tức
 */
export const getNewsDetail = async (id: number | string): Promise<AxiosResponse<BackendResponse<NewsItem>>> => {
  const response = await instance.get<BackendResponse<NewsItem>>(`/news/${id}`);
  
  if (response.data && response.data.data) {
    const item = response.data.data;
    response.data.data = {
      ...item,
      date: item.createdAt ? formatDate(item.createdAt) : "",
      image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
    };
  }
  
  return response;
};
