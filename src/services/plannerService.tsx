import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import { type BackendResponse } from "../types/backend";

export interface PlannerFormData {
  destination: string;
  travelDate: string;
  interests: string[];
  budget: string;
  peopleGroup: string;
}

export interface TravelPlan extends PlannerFormData {
  id: number | string;
  createdAt: string;
  userId: string | null;
}

// Lưu lịch trình mới
export const postTravelPlan = async (
  data: PlannerFormData,
): Promise<AxiosResponse<BackendResponse<TravelPlan>>> => {
  const payload = {
    ...data,
    createdAt: new Date().toISOString(),
    userId: localStorage.getItem("username") || "Guest",
  };
  return await instance.post<BackendResponse<TravelPlan>>("/travel-plans", payload);
};

// Lấy danh sách lịch trình
export const getTravelPlans = async (): Promise<
  AxiosResponse<BackendResponse<TravelPlan[]>>
> => {
  return await instance.get<BackendResponse<TravelPlan[]>>("/travel-plans");
};
