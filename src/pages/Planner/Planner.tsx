import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import styles from "./Planner.module.scss";

import StepProgressBar from "./components/StepProgressBar/StepProgressBar";
import InterestItem from "./components/InterestItem/InterestItem";
import type { PlannerFormData, InterestOption } from "./types";
import { postTravelPlan } from "../../services/plannerService";
import CustomDropdown from "../../components/Ui/CustomDropdown/CustomDropdown";
import VoltageButton from "../../components/Ui/VoltageButton/VoltageButton";
import { 
  Users, Money, MapPin, CalendarBlank, MapTrifold, 
  Lightning, Spinner, MagicWand, MapPinLine, CloudSun, 
  ShieldCheck, Clock, Sparkle, Heart,
  CastleTurret, CookingPot, MaskHappy, Tree, ShoppingBag, Compass
} from "@phosphor-icons/react";
import { generateItinerary } from "../../services/itineraryService";

const INTEREST_OPTIONS: InterestOption[] = [
  { id: "history", label: "Lịch sử", icon: <CastleTurret size={32} weight="duotone" />, color: "#6366f1" },
  { id: "food", label: "Ẩm thực", icon: <CookingPot size={32} weight="duotone" />, color: "#f59e0b" },
  { id: "culture", label: "Văn hóa", icon: <MaskHappy size={32} weight="duotone" />, color: "#ec4899" },
  { id: "nature", label: "Thiên nhiên", icon: <Tree size={32} weight="duotone" />, color: "#10b981" },
  { id: "shopping", label: "Mua sắm", icon: <ShoppingBag size={32} weight="duotone" />, color: "#8b5cf6" },
  { id: "adventure", label: "Khám phá", icon: <Compass size={32} weight="duotone" />, color: "#ef4444" },
];

const PROVINCE_OPTIONS = [
  { value: "1", label: "Thừa Thiên Huế" },
  { value: "2", label: "Đà Nẵng" },
  { value: "3", label: "Quảng Nam" },
];


const Planner: React.FC = () => {
  const location = useLocation();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const budgetInputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);
  const prevValueRef = useRef<string>("");

  const formatVND = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(rawValue));
  };

  // Nhận dữ liệu từ trang Hero nếu có
  const heroData = location.state as {
    destination?: string;
    budget?: string;
    totalGuests?: string;
    destinationName?: string;
  } | null;

  const getInitialBudget = (val?: string) => {
    if (!val) return "";
    const budgetMap: Record<string, string> = {
      "Dưới 5 triệu": "4000000",
      "5 - 10 triệu": "7500000",
      "10 - 20 triệu": "15000000",
      "Trên 20 triệu": "25000000",
    };
    return budgetMap[val] || val;
  };

  const [formData, setFormData] = useState<PlannerFormData>({
    destination: heroData?.destination || "",
    destinationName: heroData?.destinationName || "",
    travelDate: "",
    interests: ["food", "nature"],
    budget: getInitialBudget(heroData?.budget),
    peopleGroup: heroData?.totalGuests?.toString() || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useLayoutEffect(() => {
    if (budgetInputRef.current && cursorRef.current !== null) {
      const input = budgetInputRef.current;
      const newVal = input.value;
      const oldVal = prevValueRef.current;
      const oldCursor = cursorRef.current;

      let digitsBefore = 0;
      for (let i = 0; i < oldCursor; i++) {
        if (/\d/.test(oldVal[i])) {
          digitsBefore++;
        }
      }

      let newCursor = 0;
      let digitsCount = 0;
      while (newCursor < newVal.length && digitsCount < digitsBefore) {
        if (/\d/.test(newVal[newCursor])) {
          digitsCount++;
        }
        newCursor++;
      }

      input.setSelectionRange(newCursor, newCursor);
      cursorRef.current = null;
    }
  }, [formData.budget]);

  useEffect(() => {
    if (heroData) {
      setFormData((prev) => ({
        ...prev,
        destination: heroData.destination || prev.destination,
        destinationName: heroData.destinationName || prev.destinationName,
        budget: getInitialBudget(heroData.budget) || prev.budget,
        peopleGroup: heroData.totalGuests?.toString() || prev.peopleGroup,
      }));
    }
  }, [heroData]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập để truy cập trang lập kế hoạch!");
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Khởi tạo Flatpickr một lần duy nhất
  useEffect(() => {
    let fp: Instance | undefined;
    if (dateInputRef.current) {
      fp = flatpickr(dateInputRef.current, {
        mode: "range",
        minDate: "today",
        dateFormat: "d/m/Y",
        locale: {
          rangeSeparator: " - ",
        },
        onChange: (_, dateStr) => {
          setFormData((prev) => ({ ...prev, travelDate: dateStr }));
        },
      });

      // Nếu có dữ liệu từ Hero truyền sang, set vào Flatpickr
      if (formData.travelDate) {
        fp.setDate(formData.travelDate);
      }
    }
    return () => {
      if (fp) fp.destroy();
    };
  }, []); // Chỉ chạy 1 lần khi mount

  // Đồng bộ lại Flatpickr nếu travelDate thay đổi từ bên ngoài (ví dụ từ heroData useEffect)
  useEffect(() => {
    if (dateInputRef.current) {
      const fp = (dateInputRef.current as HTMLInputElement & { _flatpickr?: Instance })._flatpickr;
      if (fp && formData.travelDate && fp.input.value !== formData.travelDate) {
        fp.setDate(formData.travelDate);
      }
    }
  }, [formData.travelDate]);


  const handleSubmit = async () => {
    // Basic validation
    if (!formData.destination || !formData.travelDate || !formData.budget || !formData.peopleGroup) {
      toast.warning("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (formData.interests.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sở thích!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Xử lý phân tách ngày
      const dateParts = formData.travelDate.split(" - ");
      const startDateStr = dateParts[0]; // d/m/Y
      const endDateStr = dateParts[1] || startDateStr;

      const [sD, sM, sY] = startDateStr.split("/").map(Number);
      const [eD, eM, eY] = endDateStr.split("/").map(Number);
      
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const formattedStartDate = `${sY}-${String(sM).padStart(2, '0')}-${String(sD).padStart(2, '0')}`;

      // 2. Ánh xạ ngân sách
      const getBudgetValue = (val: string) => {
        const parsed = Number(val);
        if (!isNaN(parsed) && parsed > 0) return parsed;
        const budgetMap: Record<string, number> = {
          "Dưới 5 triệu": 4000000,
          "5 - 10 triệu": 7500000,
          "10 - 20 triệu": 15000000,
          "Trên 20 triệu": 25000000,
        };
        return budgetMap[val] || 5000000;
      };

      const payload = {
        userId: Number(localStorage.getItem("userId")) || 1,
        provinceId: Number(formData.destination) || 1,
        days: diffDays,
        budget: getBudgetValue(formData.budget),
        interests: formData.interests,
        startDate: formattedStartDate,
        numberOfPeople: Number(formData.peopleGroup) || 1
      };

      // 3. Gọi API tạo lộ trình
      const res = await generateItinerary(payload);
      
      if (res.data.status === 201 || res.data.status === 200) {
        const data = res.data.data;
        if (!data) {
          toast.error("Lỗi dữ liệu: Backend không trả về nội dung lộ trình!");
          return;
        }

        // Lấy ID: BE đang trả về ID số ở trường itineraryId
        const finalId = data.id || data.itineraryId;

        if (!finalId) {
          toast.error("Lỗi dữ liệu: Backend không trả về ID lộ trình!");
          return;
        }

        toast.success(res.data.message || "AI đã hoàn thành lộ trình cho bạn!");
        navigate(`/itinerary-detail/${finalId}`, { 
          state: { 
            planData: formData,
            itineraryData: data
          } 
        });
      } else {
        toast.error(res.data.message || "Không thể tạo lộ trình, vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu kế hoạch chuyến đi:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra trong quá trình AI xử lý. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.plannerWrapper}>
      <div className={styles.bgDecoration}></div>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      
      <header className={styles.header} data-aos="fade-down">
        <div className={styles.badge}>AI-Powered Travel</div>
        <h1>Thiết kế hành trình <br/><span>cá nhân hóa</span></h1>
        <p>
          Hệ thống AI thông minh sẽ phân tích hàng triệu dữ liệu để tạo ra 
          lịch trình du lịch hoàn hảo nhất dành riêng cho bạn.
        </p>
      </header>

      <StepProgressBar currentStep={1} />

      <div className={styles.mainContent}>
        <main className={styles.formCard} data-aos="zoom-in" data-aos-delay="200">
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <MapTrifold size={28} weight="fill" /> 01. Điểm đến & Thời gian
            </h3>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>ĐIỂM ĐẾN</label>
                <CustomDropdown
                  options={PROVINCE_OPTIONS}
                  value={formData.destination}
                  onChange={(val) => {
                    const selected = PROVINCE_OPTIONS.find(opt => opt.value === val);
                    setFormData({ 
                      ...formData, 
                      destination: val,
                      destinationName: selected ? selected.label : val
                    });
                  }}
                  placeholder="Chọn điểm đến..."
                  icon={<MapPin size={24} weight="duotone" color="#ef4444" />}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>THỜI GIAN</label>
                <div className={styles.inputWrapper}>
                  <CalendarBlank size={22} weight="duotone" />
                  <input
                    type="text"
                    placeholder="Chọn ngày đi - về"
                    id="plan-dates"
                    ref={dateInputRef}
                    value={formData.travelDate}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Money size={28} weight="fill" /> 02. Ngân sách & Đồng hành
            </h3>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="budget">NGÂN SÁCH DỰ KIẾN</label>
                <div className={styles.inputWrapper}>
                  <Money size={24} weight="duotone" />
                  <div className={styles.inputContainer}>
                    <input
                      ref={budgetInputRef}
                      type="text"
                      id="budget"
                      placeholder="Ví dụ: 5.000.000 VNĐ"
                      value={formData.budget ? formatVND(formData.budget) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const clean = val.replace(/\D/g, "");
                        if (budgetInputRef.current) {
                          cursorRef.current = budgetInputRef.current.selectionStart;
                          prevValueRef.current = val;
                        }
                        setFormData({ ...formData, budget: clean });
                      }}
                      spellCheck={false}
                    />
                    {formData.budget && <span className={styles.vndSuffix}>VNĐ</span>}
                  </div>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>SỐ LƯỢNG NGƯỜI</label>
                <div className={styles.inputWrapper}>
                  <Users size={24} weight="duotone" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Nhập số người"
                    value={formData.peopleGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, peopleGroup: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Heart size={28} weight="fill" /> 03. Phong cách du lịch
            </h3>
            <p className={styles.sectionSub}>Chọn những gì bạn muốn trải nghiệm (chọn nhiều)</p>
            <div className={styles.interestsGrid}>
              {INTEREST_OPTIONS.map((item) => (
                <InterestItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  color={item.color}
                  isActive={formData.interests.includes(item.id)}
                  onClick={() => {
                    const exists = formData.interests.includes(item.id);
                    if (exists) {
                      setFormData({
                        ...formData,
                        interests: formData.interests.filter((i) => i !== item.id),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        interests: [...formData.interests, item.id],
                      });
                    }
                  }}
                />
              ))}
            </div>
          </section>

          <div className={styles.submitWrapper}>
            <VoltageButton 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.btnContent}><Spinner size={24} weight="bold" className="ph-spin" /> Đang xử lý...</span>
              ) : (
                <span className={styles.btnContent}><Lightning size={24} weight="bold" /> Tối ưu hóa lộ trình AI</span>
              )}
            </VoltageButton>
            <div className={styles.trustRow}>
              <span><ShieldCheck size={18} weight="fill" /> Bảo mật thông tin</span>
              <span><Clock size={18} weight="fill" /> Tiết kiệm 2 giờ tìm kiếm</span>
              <span><Sparkle size={18} weight="fill" /> 100% Cá nhân hóa</span>
            </div>
          </div>
        </main>

        <aside className={styles.featuresSide} data-aos="fade-left" data-aos-delay="400">
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}><MagicWand size={24} weight="fill" /></div>
            <div className={styles.featureText}>
              <h4>AI Phân tích sâu</h4>
              <p>Hệ thống tự động lọc các địa điểm phù hợp nhất với phong cách của bạn.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}><MapPinLine size={24} weight="fill" /></div>
            <div className={styles.featureText}>
              <h4>Tối ưu hóa quãng đường</h4>
              <p>Sắp xếp thứ tự tham quan giúp bạn di chuyển ít nhất, chơi được nhiều nhất.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}><CloudSun size={24} weight="fill" /></div>
            <div className={styles.featureText}>
              <h4>Thời tiết & Thời điểm</h4>
              <p>Cập nhật tình hình thời tiết thời gian thực để gợi ý hoạt động phù hợp.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Planner;
