import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  CalendarBlank, 
  Money, 
  Users, 
  Heart, 
  CaretRight, 
  CaretLeft, 
  Sparkle,
  X,
  ShieldCheck,
  Clock,
  CheckCircle,
  Lightning,
  Bank,
  ForkKnife,
  MaskHappy,
  Tree,
  ShoppingBag,
  Compass
} from "@phosphor-icons/react";
import VoltageButton from "../../../../components/Ui/VoltageButton/VoltageButton";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import InterestItem from "../../../Planner/components/InterestItem/InterestItem";
import styles from "./OptimizeConfigModal.module.scss";

// Tách các sở thích ra hằng số để dễ quản lý
const INTEREST_OPTIONS = [
  { id: "HISTORY", label: "Lịch sử", icon: <Bank size={32} weight="duotone" />, color: "#8b949e" },
  { id: "FOOD", label: "Ẩm thực", icon: <ForkKnife size={32} weight="duotone" />, color: "#f5a623" },
  { id: "CULTURE", label: "Văn hóa", icon: <MaskHappy size={32} weight="duotone" />, color: "#8492a6" },
  { id: "NATURE", label: "Thiên nhiên", icon: <Tree size={32} weight="duotone" />, color: "#27ae60" },
  { id: "SHOPPING", label: "Mua sắm", icon: <ShoppingBag size={32} weight="duotone" />, color: "#a0aec0" },
  { id: "ADVENTURE", label: "Khám phá", icon: <Compass size={32} weight="duotone" />, color: "#718096" },
];

interface OptimizeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: any) => void;
  provinceName?: string;
}

const OptimizeConfigModal: React.FC<OptimizeConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  provinceName = "Đà Nẵng"
}) => {
  const [configStep, setConfigStep] = useState(1);
  
  const [optimizeConfig, setOptimizeConfig] = useState({
    title: "Chuyến đi của tôi",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    budget: "Tiêu chuẩn",
    peopleGroup: "3",
    interests: [] as string[],
  });

  // Ẩn/Hiện Navbar và khóa cuộn khi mở Modal
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hide-app-navbar');
      document.body.style.overflow = 'hidden'; // Khóa cuộn trang
      setConfigStep(1); // Reset step khi mở lại
    } else {
      document.body.classList.remove('hide-app-navbar');
      document.body.style.overflow = ''; // Mở lại cuộn trang
    }
    return () => {
      document.body.classList.remove('hide-app-navbar');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(optimizeConfig);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.configModal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} weight="bold" />
        </button>

        <div className={styles.configModalHeader}>
          <div className={styles.headerIcon}>
            <Sparkle size={48} weight="fill" color="#33d7d1" />
          </div>
          <h2>Cấu hình lộ trình thông minh</h2>
          <p>Hãy cho AI biết thêm về nhu cầu của bạn để có lộ trình tốt nhất.</p>
        </div>
        
        <div className={styles.configStepWrapper}>
          {/* Progress Bar */}
          <div className={styles.stepProgress}>
            <div className={`${styles.step} ${configStep >= 1 ? styles.active : ''}`}>1</div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${configStep >= 2 ? styles.active : ''}`}>2</div>
          </div>

          <div className={styles.configFormWizard}>
            {configStep === 1 ? (
              <div className={styles.wizardPage}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <MapPin size={24} weight="fill" /> 01. Điểm đến & Thời gian
                  </h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>ĐIỂM ĐẾN</label>
                      <div className={styles.inputWrapper}>
                        <MapPin size={20} weight="duotone" color="#ff6b6b" />
                        <input 
                          type="text" 
                          value={provinceName}
                          readOnly
                          className={styles.readOnlyInput}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <div className={styles.dateRow}>
                        <div className={styles.miniFormGroup}>
                          <span className={styles.inputLabel}>Ngày đi</span>
                          <div className={styles.inputWrapper}>
                            <CalendarBlank size={18} weight="duotone" color="#33d7d1" />
                            <input 
                              type="date" 
                              value={optimizeConfig.startDate}
                              onChange={e => setOptimizeConfig({...optimizeConfig, startDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className={styles.miniFormGroup}>
                          <span className={styles.inputLabel}>Ngày về</span>
                          <div className={styles.inputWrapper}>
                            <CalendarBlank size={18} weight="duotone" color="#33d7d1" />
                            <input 
                              type="date" 
                              value={optimizeConfig.endDate}
                              onChange={e => setOptimizeConfig({...optimizeConfig, endDate: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Money size={24} weight="fill" /> 02. Ngân sách & Đồng hành
                  </h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>NGÂN SÁCH DỰ KIẾN</label>
                      <CustomDropdown
                        options={[
                          { value: "Dưới 5 triệu", label: "Tiết kiệm" },
                          { value: "5 - 10 triệu", label: "Tiêu chuẩn" },
                          { value: "10 - 20 triệu", label: "Thoải mái" },
                          { value: "Trên 20 triệu", label: "Cao cấp" },
                        ]}
                        value={optimizeConfig.budget}
                        onChange={(val) => setOptimizeConfig({ ...optimizeConfig, budget: val })}
                        placeholder="Chọn ngân sách..."
                        icon={<Money size={20} weight="duotone" />}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>SỐ LƯỢNG NGƯỜI</label>
                      <div className={styles.inputWrapper}>
                        <Users size={20} weight="duotone" />
                        <input 
                          type="number" 
                          min="1"
                          value={optimizeConfig.peopleGroup}
                          onChange={e => setOptimizeConfig({...optimizeConfig, peopleGroup: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className={styles.wizardPage}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <Heart size={24} weight="fill" /> 03. Phong cách du lịch
                  </h3>
                  <p className={styles.sectionSub}>Chọn những gì bạn muốn trải nghiệm (chọn nhiều)</p>
                  <div className={styles.interestsGridCompact}>
                    {INTEREST_OPTIONS.map((item) => (
                      <InterestItem
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        color={item.color}
                        isActive={optimizeConfig.interests.includes(item.id)}
                        onClick={() => {
                          const exists = optimizeConfig.interests.includes(item.id);
                          if (exists) {
                            setOptimizeConfig({
                              ...optimizeConfig,
                              interests: optimizeConfig.interests.filter((i) => i !== item.id),
                            });
                          } else {
                            setOptimizeConfig({
                              ...optimizeConfig,
                              interests: [...optimizeConfig.interests, item.id],
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooterCentered}>
          {configStep === 1 ? (
            <button className={styles.nextBtn} onClick={() => setConfigStep(2)}>
              Tiếp theo <CaretRight size={20} weight="bold" />
            </button>
          ) : (
            <div className={styles.finalActions}>
              <div className={styles.wizardButtons}>
                <button className={styles.backBtn} onClick={() => setConfigStep(1)}>
                  <CaretLeft size={20} weight="bold" /> Quay lại
                </button>
                <button className={styles.cyanOptimizeBtn} onClick={handleConfirm}>
                  <Lightning size={24} weight="fill" /> TỐI ƯU HÓA LỘ TRÌNH AI
                </button>
              </div>
              
              <div className={styles.modalSubFooter}>
                <div className={styles.subFooterItem}>
                  <ShieldCheck size={16} weight="fill" /> <span>Bảo mật thông tin</span>
                </div>
                <div className={styles.subFooterItem}>
                  <Clock size={16} weight="fill" /> <span>Tiết kiệm 2 giờ tìm kiếm</span>
                </div>
                <div className={styles.subFooterItem}>
                  <CheckCircle size={16} weight="fill" /> <span>100% Cá nhân hóa</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizeConfigModal;
