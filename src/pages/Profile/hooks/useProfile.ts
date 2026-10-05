import { useEffect, useState } from "react";
import AOS from "aos";
import { useSelector, useDispatch } from "react-redux";
import { getProfile } from "../../../services/profileService";
import type { ProfileData } from "../../../services/profileService";
import { updateUserInfo } from "../../../redux/slices/userSlice";
import type { RootState } from "../../../redux/store";
import { anhmatdinh, cover } from "../../../assets/images/img";
import type { UserProfile } from "../types";

/**
 * Custom hook quản lý toàn bộ trạng thái và logic xử lý của trang Profile.
 * - Gọi API lấy thông tin người dùng.
 * - Quản lý state hiển thị (profile, activeTab).
 * - Cung cấp các hàm xử lý cập nhật ảnh và chỉnh sửa hồ sơ.
 */
export const useProfile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    /**
     * Hàm lấy dữ liệu Profile (Cơ chế 2 lớp: API & Fallback LocalStorage)
     * - Lớp 1: Gọi API `getProfile()`. Nếu thành công, map `ProfileData` sang `UserProfile`.
     * - Lớp 2: Nếu API lỗi, dùng `userInfo` từ Redux (localStorage) để hiển thị dự phòng.
     */
    const fetchData = async () => {
      try {
        let profileData: UserProfile | null = null;
        try {
          const res = await getProfile();
          const dt = res.data.data as ProfileData;
          
          if (dt) {
            let formattedJoinDate = "Mới tham gia";
            if (dt.createdAt) {
              const date = new Date(dt.createdAt);
              const month = (date.getMonth() + 1).toString().padStart(2, "0");
              const year = date.getFullYear();
              formattedJoinDate = `${month}/${year}`;
            }

            profileData = {
              fullName: dt.fullName || "Thành viên",
              email: dt.email || "",
              phone: dt.phone || "",
              address: dt.address || "",
              bio: dt.bio || "Sẵn sàng lên lịch trình tự động đi du lịch muôn nơi với TravelAI",
              avatarUrl: dt.avatarUrl || anhmatdinh,
              coverUrl: cover,
              badge: (dt.role || userInfo?.role) === "ADMIN" ? "Quản trị viên" : "Thành viên Mới",
              joinDate: formattedJoinDate,
              location: dt.address || userInfo?.address || "Việt Nam",
            } as UserProfile;
          }
        } catch (apiErr) {
          console.warn("Lỗi khi gọi API profile, dùng localStorage làm dự phòng:", apiErr);
        }

        if (!profileData && userInfo) {
          let formattedJoinDate = "Mới tham gia";
          if (userInfo.createdAt) {
            const date = new Date(userInfo.createdAt);
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            formattedJoinDate = `${month}/${year}`;
          }

          profileData = {
            fullName: userInfo.fullName || userInfo.email || "Thành viên",
            email: userInfo.email || "Không rõ email",
            phone: userInfo.phone || "",
            address: userInfo.address || "",
            bio: "Sẵn sàng lên lịch trình tự động đi du lịch muôn nơi với TravelAI",
            avatarUrl: userInfo.avatarUrl || anhmatdinh,
            coverUrl: cover,
            badge: userInfo.role === "ADMIN" ? "Quản trị viên" : "Thành viên Mới",
            joinDate: formattedJoinDate,
            location: userInfo.address || "Việt Nam",
          } as UserProfile;
        }

        if (!profileData) {
          profileData = {
            fullName: "Khách du lịch",
            email: "guest@travelai.vn",
            phone: "0905 123 456",
            address: "Đà Nẵng, Việt Nam",
            bio: "Sẵn sàng lên lịch trình tự động đi du lịch muôn nơi với TravelAI",
            avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            coverUrl: cover,
            badge: "Thành viên Khám phá",
            joinDate: "10/2026",
            location: "Đà Nẵng, Việt Nam",
          } as UserProfile;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Lỗi khi tải thông tin profile:", error);
      }
    };

    fetchData();
  }, [userInfo]);

  /**
   * Cập nhật ảnh đại diện (Avatar).
   * - Cập nhật state UI ngay lập tức.
   * - Dispatch action lưu vào Redux & localStorage để đồng bộ toàn ứng dụng.
   * @param newUrl URL ảnh mới sau khi upload thành công
   */
  const handleAvatarUpdate = (newUrl: string) => {
    setProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
    dispatch(updateUserInfo({ avatarUrl: newUrl }));
    localStorage.setItem("avatar", newUrl);
  };


  /**
   * Xử lý khi nhấn nút "Chỉnh sửa hồ sơ".
   * - Chuyển sang tab "info" (Thông tin).
   * - Tự động cuộn màn hình xuống form và focus vào ô nhập "Họ và tên".
   */
  const handleEditClick = () => {
    setActiveTab("info");
    setTimeout(() => {
      const element = document.getElementById("profile-info-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        const input = document.getElementById("fullNameInput");
        if (input) (input as HTMLInputElement).focus();
      }
    }, 100);
  };

  return {
    profile,
    activeTab,
    setActiveTab,
    handleAvatarUpdate,
    handleEditClick,
    showPasswordForm,
    setShowPasswordForm,
  };
};
