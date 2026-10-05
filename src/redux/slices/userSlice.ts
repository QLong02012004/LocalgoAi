import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { UserData } from "../../services/userService";

export interface UserState {
  userInfo: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const DEFAULT_USER: UserData = {
  id: 1,
  email: "admin@localgo.ai",
  fullName: "Quản trị viên",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  role: "ADMIN",
  isActive: true,
  address: "Đà Nẵng, Việt Nam",
  createdAt: "2026-01-01T00:00:00Z",
  phone: "0905 123 456",
  bio: "Quản trị viên hệ thống TravelAI & Localgo",
  googleId: null,
  facebookId: null,
  isGoogleLinked: false,
  isFacebookLinked: false,
  isEmailVerified: true,
};

// Khởi tạo state từ localStorage hoặc mặc định đã đăng nhập
const getInitialUser = (): UserData => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch {
      // ignore
    }
  }
  // Tự động lưu user mặc định vào localStorage
  localStorage.setItem("user", JSON.stringify(DEFAULT_USER));
  localStorage.setItem("accessToken", "mock-token-travelai-2026");
  localStorage.setItem("username", DEFAULT_USER.fullName);
  localStorage.setItem("avatar", DEFAULT_USER.avatarUrl || "");
  localStorage.setItem("surveyCompleted", "true");
  return DEFAULT_USER;
};

const initialUser = getInitialUser();

const initialState: UserState = {
  userInfo: initialUser,
  isAuthenticated: true,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<UserData>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.userInfo = action.payload;
      state.error = null;
      // Đồng bộ với localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.userInfo = DEFAULT_USER;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(DEFAULT_USER));
      localStorage.setItem("accessToken", "mock-token-travelai-2026");
      localStorage.setItem("username", DEFAULT_USER.fullName);
      localStorage.setItem("avatar", DEFAULT_USER.avatarUrl || "");
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.userInfo));
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;
