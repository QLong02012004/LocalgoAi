import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import instance from "../utils/AxiosCustomize";
import type { BackendResponse } from "../types/backend";
export { type BackendResponse } from "../types/backend";

export type TravelStyle = "Chill" | "Mạo hiểm" | "Văn hóa" | "Thiên nhiên" | "Lịch sử" | "Ẩm thực" | "Mua sắm" | "Gia đình";
export type DietPreference = "Chay" | "Mặn" | "Thuần chay" | "Không kiêng";
export type TastePreference = "Cay" | "Ngọt" | "Nhạt" | "Đậm đà";
export type TransportPreference = "Máy bay" | "Tàu hỏa" | "Xe khách" | "Ô tô cá nhân" | "Xe máy";
export type TravelPace = "Chậm rãi (Nghỉ dưỡng)" | "Vừa phải (Cân bằng)" | "Nhanh (Khám phá tối đa)";

export interface UserPreferences {
  travelStyles: TravelStyle[];    // Các phong cách du lịch yêu thích
  allergies: string[];            // Dị ứng
  diet: DietPreference;           // Chế độ ăn uống
  taste: TastePreference;         // Khẩu vị
  transport: TransportPreference; // Phương tiện di chuyển yêu thích
  travelPace: TravelPace;         // Nhịp độ di chuyển
}

/**
 * Cấu trúc sở thích người dùng mới (Dựa trên API POST /users/preferences)
 */
export interface UserTravelPreference {
  travelStyles: string[];
  foodTastes: string[];
  transportation: string;
}

/**
 * Thông tin chi tiết của người dùng
 */
export interface UserData {
  id: number | string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  address: string | null;
  createdAt: string;
  phone: string | null;
  bio: string | null;
  googleId: string | null;
  facebookId: string | null;
  isGoogleLinked: boolean;
  isFacebookLinked: boolean;
  isEmailVerified: boolean;
  preferences?: UserPreferences;
}

/**
 * Dữ liệu trả về sau khi xác thực thành công (Login/Register)
 */
export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  type: string | null;
  user: UserData;
}

/**
 * 1. Đăng ký tài khoản mới bằng Email
 */
export const postSignUp = (
  fullName: string,
  email: string,
  password: string,
): Promise<AxiosResponse<BackendResponse<AuthResponseData>>> => {
  return instance.post<BackendResponse<AuthResponseData>>(
    "/auth/register",
    {
      full_name: fullName,
      email,
      password,
    },
  );
};

/**
 * 2. Đăng nhập bằng Email và Mật khẩu
 */
export const postLogin = (
  email: string,
  password: string,
): Promise<AxiosResponse<BackendResponse<AuthResponseData>>> => {
  return instance.post<BackendResponse<AuthResponseData>>(
    "/auth/login",
    {
      email,
      password,
    },
  );
};

/**
 * 3. Đăng nhập bằng tài khoản Google
 */
export const postLoginGoogle = (
  token: string,
): Promise<AxiosResponse<BackendResponse<AuthResponseData>>> => {
  return instance.post<BackendResponse<AuthResponseData>>(
    "/auth/google",
    {
      token,
    },
  );
};

/**
 * 3.1. Đăng nhập bằng tài khoản Facebook
 */
export const postLoginFacebook = (
  accessToken: string,
): Promise<AxiosResponse<BackendResponse<AuthResponseData>>> => {
  return instance.post<BackendResponse<AuthResponseData>>(
    "/auth/facebook",
    {
      accessToken,
    },
  );
};

/**
 * 4. Cập nhật mật khẩu mới thông qua Email (Dùng trong luồng quên mật khẩu)
 */
export const updatePasswordByEmail = async (
  email: string,
  password: string,
): Promise<AxiosResponse<BackendResponse<UserData | null>>> => {
  const res = await instance.get<BackendResponse<UserData[]>>(
    `/users?email=${email}`,
  );
  const users = res.data.data;

  if (users && users.length > 0) {
    const user = users[0];
    return instance.patch<BackendResponse<UserData>>(`/users/${user.id}`, {
      password,
    });
  } else {
    return {
      data: {
        status: 404,
        message: "Email không tồn tại trên hệ thống!",
        data: null,
      },
    } as AxiosResponse<BackendResponse<null>>;
  }
};

/**
 * 5. Đăng xuất và vô hiệu hóa Refresh Token
 */
export const postLogout = (
  refreshToken: string,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  return instance.post<BackendResponse<unknown>>("/auth/logout", {
    refresh_token: refreshToken,
  });
};

/**
 * 6. Làm mới Access Token bằng Refresh Token
 */
export const postRefreshToken = (
  refreshToken: string,
): Promise<AxiosResponse<BackendResponse<AuthResponseData>>> => {
  return instance.post<BackendResponse<AuthResponseData>>(
    "/auth/refresh-token",
    {
      refreshToken: refreshToken,
    },
  );
};

export interface SendOtpResponseData {
  expiresIn: number;
  email: string;
  status: string;
}

/**
 * 7. Gửi mã OTP về Email người dùng
 */
export const postSendOTP = (
  email: string,
): Promise<AxiosResponse<BackendResponse<SendOtpResponseData>>> => {
  return instance.post<BackendResponse<SendOtpResponseData>>(
    "/auth/send-otp",
    {
      email,
    },
  );
};

/**
 * 8. Xác minh mã OTP đã gửi
 */
export const postVerifyOTP = (
  email: string,
  otp: number,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  return instance.post<BackendResponse<unknown>>("/auth/verify-otp", {
    email,
    otp,
  });
};

/**
 * 9. Đặt lại mật khẩu mới sau khi xác thực OTP thành công
 */
export const postResetPassword = (
  email: string,
  new_password: string,
): Promise<AxiosResponse<BackendResponse<unknown>>> => {
  return instance.post<BackendResponse<unknown>>(
    "/auth/reset-password-otp",
    {
      email,
      new_password,
    },
  );
};

/**
 * 10. Cập nhật sở thích (Preferences) của người dùng sau khảo sát
 * Có cơ chế Fallback nếu Backend chưa sẵn sàng API
 */
export const updateUserPreferences = async (
  userId: number | string,
  preferences: UserPreferences,
): Promise<AxiosResponse<BackendResponse<UserData>>> => {
  try {
    return await instance.put<BackendResponse<UserData>>(`/users/${userId}/preferences`, preferences);
  } catch (error) {
    console.warn("API updateUserPreferences chưa sẵn sàng, sử dụng fallback:", error);
    // Trả về mock response để FE không bị chặn nếu lỗi 403/404 từ BE
    return {
      data: {
        status: 200,
        message: "Fallback success",
        data: { id: userId, email: "", preferences } as UserData,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as unknown as InternalAxiosRequestConfig
    } as AxiosResponse<BackendResponse<UserData>>;
  }
};

/**
 * 11. Lưu sở thích người dùng (Mới - Dùng POST /users/preferences)
 */
export const postUserPreferences = (
  preferences: UserTravelPreference,
): Promise<AxiosResponse<BackendResponse<UserTravelPreference>>> => {
  return instance.post<BackendResponse<UserTravelPreference>>(
    "/users/preferences",
    preferences,
  );
};
