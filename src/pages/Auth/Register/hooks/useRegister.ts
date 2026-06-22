import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  postSignUp,
  postLoginGoogle,
  postLoginFacebook,
  type AuthResponseData,
  type BackendResponse,
} from "../../../../services/userService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../../redux/slices/userSlice";

// --- Constants ---
const VALID_EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;

interface UseRegisterProps {
  onToggle: () => void;
}

export const useRegister = ({ onToggle }: UseRegisterProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", pass: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Lưu thông tin xác thực (Tokens, User info) vào LocalStorage sau khi đăng nhập/đăng ký thành công
   */
  const saveAuthData = useCallback((data: AuthResponseData) => {
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

    const { user } = data;
    dispatch(loginSuccess(user));
    localStorage.setItem("user", JSON.stringify(user));
    if (user.fullName) localStorage.setItem("username", user.fullName);
    if (user.email) localStorage.setItem("email", user.email);
    if (user.avatarUrl) localStorage.setItem("avatar", user.avatarUrl);
    if (user.createdAt) localStorage.setItem("createdAt", user.createdAt);
  }, [dispatch]);

  /**
   * Xử lý đăng ký/đăng nhập thông qua Google hoặc Facebook
   * @param provider 'google' | 'facebook'
   * @param token Mã xác thực từ nhà cung cấp
   */
  const handleSocialSuccess = async (provider: "google" | "facebook", token: string) => {
    try {
      setIsLoading(true);
      const fetcher = provider === "google" ? postLoginGoogle : postLoginFacebook;
      const response = await fetcher(token);

      if (response.data?.status === 200 && response.data.data) {
        saveAuthData(response.data.data);
        toast.success(`Đăng ký qua ${provider === "google" ? "Google" : "Facebook"} thành công!`);
        navigate("/");
      } else {
        toast.error(response.data?.message || `Đăng ký qua ${provider} thất bại!`);
      }
    } catch (error) {
      console.error(`${provider} Auth Error:`, error);
      toast.error(`Lỗi xác thực ${provider}!`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý thay đổi dữ liệu trong các ô Input của Form
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Kiểm tra tính hợp lệ của toàn bộ Form đăng ký trước khi gửi lên Server
   * @returns string | null (Thông báo lỗi hoặc null nếu hợp lệ)
   */
  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (name.length < 4) return "Tên quá ngắn, không hợp lệ";
    if (!VALID_EMAIL_REGEX.test(email)) return "Email không đúng định dạng";
    if (!PASSWORD_REGEX.test(formData.pass))
      return "Mật khẩu phải từ 8-32 ký tự, bao gồm chữ hoa, chữ thường và số";
    if (formData.pass !== formData.confirm) return "Mật khẩu xác nhận không khớp!";
    if (!terms) return "Bạn cần đồng ý với điều khoản!";
    return null;
  };

  /**
   * Hàm chính xử lý sự kiện submit Form đăng ký bằng Email
   */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) return toast.error(errorMsg);

    setIsLoading(true);
    try {
      // Gọi API đăng ký với các trường khớp Backend
      const res = await postSignUp(
        formData.name.trim(), 
        formData.email.trim(), 
        formData.pass
      );
      
      if (res.data?.status === 200) {
        toast.success(res.data.message || "Đăng ký thành công!");
        setTimeout(onToggle, 1500); // Chuyển sang khung Đăng nhập sau 1.5s
      } else {
        toast.error(res.data?.message || "Đăng ký thất bại!");
      }
    } catch (error: unknown) {
      let msg = "Đã xảy ra lỗi không xác định";
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as BackendResponse;
        msg = errorData?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPass,
    setShowPass,
    showConfirm,
    setShowConfirm,
    terms,
    setTerms,
    isLoading,
    handleChange,
    handleRegister,
    handleSocialSuccess,
  };
};
