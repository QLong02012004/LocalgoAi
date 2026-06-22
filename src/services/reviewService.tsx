import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import type { BackendResponse } from "../types/backend";

export interface ReviewItem {
  id: number;
  userName: string;
  avatar: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface BackendReview {
  id: number;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
  isVerified?: boolean;
  nameService?: string;
  provinceName?: string;
  type?: string;
}

export interface PaginationInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface ReviewPayload {
  userId: number;
  hotelId?: number | null;
  restaurantId?: number | null;
  attractionId?: number | null;
  type: "HOTEL" | "RESTAURANT" | "ATTRACTION" | "WEBSITE" | "TRIP";
  rating: number;
  comment: string;
}



export const getReviews = async (page = 0, size = 10): Promise<AxiosResponse<BackendResponse<{ content: BackendReview[]; page: PaginationInfo }>>> => {
  // If the backend doesn't support pagination for the public reviews endpoint, we call it without params.
  const url = page === 0 && size >= 10 ? "/reviews" : `/reviews?page=${page}&size=${size}`;
  return await instance.get<BackendResponse<{ content: BackendReview[]; page: PaginationInfo }>>(url);
};

export const createReview = async (
  reviewData: ReviewPayload,
  imageFiles?: File[]
): Promise<AxiosResponse<BackendResponse<BackendReview>>> => {
  try {
    const formData = new FormData();
    
    // Tạo Blob cho phần JSON review để set Content-Type là application/json
    const reviewBlob = new Blob([JSON.stringify(reviewData)], {
      type: "application/json",
    });
    formData.append("review", reviewBlob);

    // Thêm các file ảnh nếu có
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("imageFiles", file);
      });
    }

    const response = await instance.post<BackendResponse<BackendReview>>("/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch {
    console.warn("Lỗi khi gửi đánh giá");
    throw new Error("Lỗi khi gửi đánh giá");
  }
};

export const updateReview = async (
  id: number | string,
  reviewData: Partial<ReviewPayload>,
  imageFiles?: File[]
): Promise<AxiosResponse<BackendResponse<BackendReview>>> => {
  try {
    const formData = new FormData();
    const reviewBlob = new Blob([JSON.stringify(reviewData)], {
      type: "application/json",
    });
    formData.append("review", reviewBlob);

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("imageFiles", file);
      });
    }

    const response = await instance.put<BackendResponse<BackendReview>>(`/reviews/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch {
    console.error("Lỗi khi cập nhật đánh giá");
    throw new Error("Lỗi khi cập nhật đánh giá");
  }
};

export const getUserReviews = async (userId?: number): Promise<AxiosResponse<BackendResponse<BackendReview[]>>> => {
  try {
    const url = userId ? `/reviews/user/${userId}` : "/reviews/user";
    const response = await instance.get<BackendResponse<BackendReview[]>>(url);
    return response;
  } catch {
    console.warn("Lấy review user thất bại");
    throw new Error("Lấy review user thất bại");
  }
};

export const getReviewsByTarget = async (
  type: "restaurant" | "hotel" | "attraction",
  id: number | string,
  page = 0,
  size = 10
): Promise<AxiosResponse<BackendResponse<{ content: BackendReview[]; page: PaginationInfo }>>> => {
  return await instance.get<BackendResponse<{ content: BackendReview[]; page: PaginationInfo }>>(
    `/reviews/${type.toLowerCase()}/${id}?page=${page}&size=${size}`
  );
};

