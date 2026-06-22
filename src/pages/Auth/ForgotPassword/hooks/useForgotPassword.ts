import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  postResetPassword,
  postSendOTP,
  postVerifyOTP,
} from "../../../../services/userService";
import type { Step } from "../types";

/**
 * Custom hook quản lý logic cho tính năng Quên Mật Khẩu
 */
export const useForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  /**
   * Xử lý gửi email để nhận OTP
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error("Vui lòng nhập email!");

    try {
      setIsLoading(true);
      const res = await postSendOTP(cleanEmail);
      if (res.data && res.data.status === 200) {
        setStep("otp");
        toast.success(
          res.data.message || "Mã OTP đã được gửi về Email của bạn! 📧",
        );
      } else {
        toast.error(res.data?.message || "Gửi mã OTP thất bại!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi kết nối Server khi gửi OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý khi nhập từng số OTP
   */
  const handleOtpChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
    const value = e.target.value;
    const char = value.length > 0 ? value[value.length - 1] : "";

    if (char && !/^\d$/.test(char)) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Xử lý xóa OTP bằng phím Backspace
   */
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  /**
   * Xử lý dán (paste) OTP
   */
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(data)) return;

    const digits = data.split("");
    setOtp(digits);
    otpRefs.current[5]?.focus();
  };

  /**
   * Xử lý submit mã OTP để xác minh
   */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      return toast.error("Vui lòng nhập đủ 6 số OTP!");
    }

    try {
      setIsLoading(true);
      const res = await postVerifyOTP(email, Number(fullOtp));

      if (res.data && (res.data.status === 200)) {
        setStep("reset");
        toast.success(res.data.message || "Xác minh danh tính thành công!");
      } else {
        toast.error(
          res.data?.message || "Mã OTP không đúng hoặc đã hết hạn!",
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi kết nối Server khi xác minh OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý đặt lại mật khẩu mới
   */
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quy tắc: 8-32 ký tự, bao gồm chữ hoa, chữ thường và số
    const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/;

    if (!PASSWORD_REGEX.test(newPassword)) {
      return toast.error(
        "Mật khẩu phải từ 8-32 ký tự, bao gồm chữ hoa, chữ thường và số!"
      );
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    try {
      setIsLoading(true);
      const res = await postResetPassword(email, newPassword);
      if (res.data && (res.data.status === 200)) {
        setStep("success");
        toast.success(res.data.message || "Cập nhật mật khẩu thành công!");
      } else {
        toast.error(
          res.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi kết nối Server!");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý gửi lại mã OTP
   */
  const handleResendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error("Vui lòng nhập email!");

    try {
      setIsLoading(true);
      const res = await postSendOTP(cleanEmail);
      if (res.data && res.data.status === 200) {
        toast.success(
          res.data.message || "Mã OTP mới đã được gửi về Email của bạn! 📧",
        );
      } else {
        toast.error(res.data?.message || "Gửi lại mã OTP thất bại!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi kết nối Server khi gửi lại OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    navigate,
    otpRefs,
    handleEmailSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleOtpSubmit,
    handleResetSubmit,
    handleResendOtp,
  };
};
