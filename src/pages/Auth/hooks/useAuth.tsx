import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Sparkle, UsersThree, ShieldCheck, MagicWand, 
  MapPinLine, CurrencyCircleDollar 
} from "phosphor-react";
import type { AuthConfig } from "../types";

const AUTH_CONFIG: AuthConfig = {
  register: {
    title: <>Bắt đầu hành trình <br /> tuyệt vời ngay.</>,
    description: "Tham gia cộng đồng du lịch thông minh để mở khóa toàn bộ tính năng độc quyền:",
    features: [
      { icon: <Sparkle weight="duotone" />, text: "Lên kế hoạch chuyến đi chỉ trong giây lát" },
      { icon: <UsersThree weight="duotone" />, text: "Chia sẻ và lưu trữ hành trình cá nhân" },
      { icon: <ShieldCheck weight="duotone" />, text: "Nhận gợi ý địa điểm chính xác từ chuyên gia AI" },
    ]
  },
  login: {
    title: <>Chào mừng bạn <br /> quay trở lại.</>,
    description: "Tiếp tục hành trình khám phá thế giới cùng TravelAi. Mọi kế hoạch của bạn vẫn đang chờ đợi:",
    features: [
      { icon: <MagicWand weight="duotone" />, text: "Tiếp tục các lịch trình đang dang dở" },
      { icon: <MapPinLine weight="duotone" />, text: "Xem lại các địa điểm yêu thích đã lưu" },
      { icon: <CurrencyCircleDollar weight="duotone" />, text: "Đồng bộ hóa ngân sách trên mọi thiết bị" },
    ]
  }
};

export const useAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignUp = searchParams.get("mode") === "register";
  
  // Lấy cấu trúc nội dung dựa trên mode hiện tại
  const content = useMemo(() => isSignUp ? AUTH_CONFIG.register : AUTH_CONFIG.login, [isSignUp]);

  const toggleMode = () => {
    navigate(`/auth?mode=${isSignUp ? "login" : "register"}`);
  };

  return {
    isSignUp,
    content,
    toggleMode
  };
};
