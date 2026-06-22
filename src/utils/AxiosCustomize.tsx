import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { clearAuthData } from "./AuthUtils";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

const instance = axios.create({
  baseURL: "/api/v1/",
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    NProgress.start();
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        (config as any).headers = {
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return config;
  },
  (error: AxiosError) => {
    NProgress.done();
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done();
    return response;
  },
  async (error: AxiosError) => {
    NProgress.done();

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (originalRequest.url?.includes("/auth/logout")) {
        clearAuthData();
        window.location.href = "/auth?mode=login";
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post("/api/v1/auth/refresh-token", {
            refreshToken: refreshToken,
          });

          if (res.data && res.data.status === 200) {
            const data = res.data.data;
            if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            }
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          clearAuthData();
          window.location.href = "/auth?mode=login";
          return Promise.reject(refreshError);
        }
      } else {
        const url = originalRequest.url?.toLowerCase() || "";
        const isPublicGet =
          originalRequest.method?.toLowerCase() === "get" &&
          (url.includes("attractions") ||
            url.includes("hotels") ||
            url.includes("restaurants") ||
            url.includes("news") ||
            url.includes("highlight") ||
            url.includes("explore"));

        const isAuthRequest = url.includes("auth/login") || 
                              url.includes("auth/register") || 
                              url.includes("auth/google") || 
                              url.includes("auth/facebook");

        if (!isPublicGet && !isAuthRequest) {
          clearAuthData();
          window.location.href = "/auth?mode=login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
