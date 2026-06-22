import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import { type BackendResponse } from "../types/backend";

export interface AIRecommendation {
  id: number;
  name: string;
  matchPercentage: number;
  image: string;
  rank?: number;
}

/**
 * Lấy danh sách gợi ý địa điểm từ AI
 */
export const getAIRecommendations = async (): Promise<AxiosResponse<BackendResponse<AIRecommendation[]>>> => {
  return await instance.get<BackendResponse<AIRecommendation[]>>("/aiRecommendations");
};
