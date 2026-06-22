import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../../redux/slices/userSlice";
import {
  postLogin,
  postLoginGoogle,
  postLoginFacebook,
  type AuthResponseData,
  type BackendResponse,
} from "../../../../services/userService";

/**
 * Custom hook quản lý toàn bộ state và logic của tính năng Đăng nhập.
 * Bao gồm đăng nhập truyền thống (email/password) và đăng nhập mạng xã hội (Google/Facebook).
 * 
 * @returns Các state (email, password...) và các hàm xử lý sự kiện (handleLogin, handleSocialSuccess...).
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hàm lưu trữ thông tin xác thực sau khi đăng nhập thành công.
   * - Lưu accessToken và refreshToken vào localStorage để giữ phiên đăng nhập.
   * - Dispatch action lưu thông tin user vào Redux store.
   * - Lưu thông tin cơ bản của user vào localStorage.
   * 
   * @param data - Dữ liệu xác thực trả về từ API (chứa user info và tokens).
   */
  const saveAuthData = (data: AuthResponseData) => {
    const { user, accessToken, refreshToken } = data;
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    
    // Dispatch to Redux
    dispatch(loginSuccess(user));
    
    localStorage.setItem("user", JSON.stringify(user));
    if (user.fullName) localStorage.setItem("username", user.fullName);
    if (user.email) localStorage.setItem("email", user.email);
    if (user.avatarUrl) localStorage.setItem("avatar", user.avatarUrl);
    if (user.createdAt) localStorage.setItem("createdAt", user.createdAt);
  };

  /**
   * Hàm xử lý logic đăng nhập thông qua mạng xã hội (Social Login).
   * Gửi token nhận được từ SDK của Google/Facebook xuống Backend để xác thực.
   * 
   * @param provider - Nền tảng đăng nhập ('google' hoặc 'facebook').
   * @param token - Credential/Access token nhận được từ nền tảng.
   */
  const handleSocialSuccess = async (provider: 'google' | 'facebook', token: string) => {
    try {
      setIsLoading(true);
      const fetcher = provider === 'google' ? postLoginGoogle : postLoginFacebook;
      const res = await fetcher(token);
      if (res.data && res.data.status === 200 && res.data.data) {
        saveAuthData(res.data.data);
        toast.success(`Đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'} thành công!`);
        navigate("/");
      } else {
        toast.error(res.data?.message || `Đăng nhập ${provider} thất bại!`);
      }
    } catch (error) {
      console.error(`${provider} Login Error:`, error);
      toast.error(`Lỗi đăng nhập ${provider}!`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Hàm xử lý logic đăng nhập bằng tài khoản (Email & Mật khẩu).
   * Gọi API đăng nhập, xử lý loading, lỗi và thông báo (toast).
   * 
   * @param e - Sự kiện submit form.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return toast.error("Vui lòng nhập đầy đủ thông tin!");

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(cleanEmail)) return toast.error("Email không đúng định dạng!");

    setIsLoading(true);
    try {
      const response = await postLogin(cleanEmail, password);
      if (response.data && response.data.status === 200 && response.data.data) {
        saveAuthData(response.data.data);
        toast.success(`Chào mừng ${response.data.data.user.fullName || cleanEmail} trở lại!`);
        navigate("/");
      } else {
        toast.error(response.data?.message || "Email hoặc mật khẩu không chính xác!");
      }
    } catch (error: any) {
      let msg = "Đã xảy ra lỗi không xác định!";
      if (axios.isAxiosError(error)) {
        // Lấy message từ cấu trúc BackendResponse { status, message, data }
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    handleLogin,
    handleSocialSuccess,
  };
};
