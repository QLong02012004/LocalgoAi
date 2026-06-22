import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, 
  Mountains, 
  Bank, 
  Island, 
  ForkKnife, 
  Crown, 
  ShoppingBag,
  WarningCircle,
  Selection,
  Cookie,
  Car,
  Timer,
  CaretLeft,
  Check,
  Users
} from "@phosphor-icons/react";
import styles from "./PreferenceModal.module.scss";
import { usePreferenceModal } from "./hooks/usePreferenceModal";
import type { PreferenceModalProps } from "./types";
import type { TravelStyle, DietPreference, TastePreference, TransportPreference, TravelPace } from "../../../services/userService";

const TRAVEL_STYLES: { id: TravelStyle; label: string; icon: React.ReactNode }[] = [
  { id: "Chill" as any, label: "Chill & Nghỉ dưỡng", icon: <Leaf /> },
  { id: "Mạo hiểm" as any, label: "Khám phá mạo hiểm", icon: <Mountains /> },
  { id: "Văn hóa" as any, label: "Văn hóa lịch sử", icon: <Bank /> },
  { id: "Thiên nhiên" as any, label: "Biển đảo & Nắng", icon: <Island /> },
  { id: "Lịch sử" as any, label: "Di tích & Kiến trúc", icon: <Crown /> },
  { id: "Ẩm thực" as any, label: "Thiên đường ẩm thực", icon: <ForkKnife /> },
  { id: "Mua sắm" as any, label: "Mua sắm & Thành phố", icon: <ShoppingBag /> },
  { id: "Gia đình" as any, label: "Gia đình & Trẻ em", icon: <Users /> },
];

const FOOD_TASTES: { id: string; label: string }[] = [
  { id: "TRADITIONAL", label: "Ẩm thực truyền thống" },
  { id: "STREET_FOOD", label: "Đồ ăn đường phố" },
  { id: "FINE_DINING", label: "Nhà hàng cao cấp" },
  { id: "VEGETARIAN", label: "Ăn chay" },
  { id: "SEAFOOD", label: "Hải sản" },
  { id: "SPICY", label: "Cay nồng" },
  { id: "SWEET", label: "Ẩm thực ngọt" },
  { id: "FUSION", label: "Fusion & Hiện đại" },
];

const TRANSPORT_OPTIONS: { id: string; label: string }[] = [
  { id: "DRIVING", label: "Lái xe" },
  { id: "WALKING", label: "Đi bộ" },
  { id: "TRANSIT", label: "Phương tiện công cộng" },
  { id: "BICYCLE", label: "Đi xe đạp" },
];

const PreferenceModal: React.FC<PreferenceModalProps> = ({ userId, onClose, onComplete }) => {
  const {
    step,
    selectedStyles,
    selectedFoodTastes,
    transportation,
    setTransportation,
    toggleStyle,
    toggleFoodTaste,
    handleNext,
    handleBack,
  } = usePreferenceModal({ userId, onComplete });

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>Cá nhân hóa trải nghiệm</h2>
          <p>Hãy để AI giúp bạn thiết kế chuyến đi hoàn hảo nhất</p>
        </div>

        <div className={styles.stepper}>
          <div className={styles.stepLine}>
            <motion.div 
              className={styles.stepProgress} 
              initial={{ width: 0 }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`${styles.stepItem} ${step >= s ? styles.active : ""} ${
                step > s ? styles.completed : ""
              }`}
            >
              <motion.div 
                className={styles.stepNumber}
                initial={false}
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: step > s ? "#33d7d1" : step === s ? "#ff4c94" : "#ffffff",
                  borderColor: step >= s ? "transparent" : "#e2e8f0",
                  color: step >= s ? "#ffffff" : "#94a3b8",
                  boxShadow: step === s 
                    ? "0 8px 20px rgba(255, 76, 148, 0.4)" 
                    : step > s 
                      ? "0 4px 12px rgba(51, 215, 209, 0.3)" 
                      : "0 0 0 rgba(0,0,0,0)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {step > s ? (
                  <Check weight="bold" />
                ) : s}
              </motion.div>
              <span className={styles.stepLabel}>
                {s === 1 ? "Phong cách" : s === 2 ? "Khẩu vị" : "Di chuyển"}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className={styles.tagsGrid}>
                  {TRAVEL_STYLES.map((style) => (
                    <div
                      key={style.id}
                      className={`${styles.tagCard} ${
                        selectedStyles.includes(style.id) ? styles.selected : ""
                      }`}
                      onClick={() => toggleStyle(style.id)}
                    >
                      <div className={styles.iconWrapper}>{style.icon}</div>
                      <span>{style.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className={styles.selectionGroup}>
                  <h3><ForkKnife weight="bold" /> Khẩu vị yêu thích</h3>
                  <p className={styles.subHint}>Chọn các loại ẩm thực bạn muốn AI ưu tiên gợi ý</p>
                  <div className={styles.tagsGrid} style={{ marginTop: '20px' }}>
                    {FOOD_TASTES.map((taste) => (
                      <div
                        key={taste.id}
                        className={`${styles.tagCard} ${
                          selectedFoodTastes.includes(taste.id) ? styles.selected : ""
                        }`}
                        style={{ height: 'auto', padding: '15px' }}
                        onClick={() => toggleFoodTaste(taste.id)}
                      >
                        <span style={{ fontWeight: 600 }}>{taste.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className={styles.selectionGroup}>
                  <h3><Car weight="bold" /> Phương tiện di chuyển chính</h3>
                  <p className={styles.subHint}>Phương tiện bạn dự định sử dụng để di chuyển giữa các điểm</p>
                  <div className={styles.options} style={{ marginTop: '20px' }}>
                    {TRANSPORT_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        className={`${styles.optionChip} ${
                          transportation === opt.id ? styles.active : ""
                        }`}
                        onClick={() => setTransportation(opt.id)}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.summaryBox}>
                  "Hệ thống sẽ dựa vào những lựa chọn này để gợi ý các địa điểm và lộ trình phù hợp nhất với con người bạn."
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.footer}>
          {step > 1 ? (
            <button className={styles.btnBack} onClick={handleBack}>
              <CaretLeft weight="bold" className={styles.iconLeft} />
              Quay lại
            </button>
          ) : (
            <button className={styles.btnBack} onClick={onClose}>Bỏ qua</button>
          )}

          <button
            className={styles.btnNext}
            onClick={handleNext}
            disabled={step === 1 && selectedStyles.length === 0}
          >
            {step === 3 ? (
              <>Hoàn tất <Check weight="bold" className={styles.iconRight} /></>
            ) : (
              "Tiếp tục"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceModal;
