import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.scss";
import {
  MapPin,
  Wallet,
  Users,
  MagnifyingGlass,
  Minus,
  Plus,
} from "phosphor-react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

import { toast } from "react-toastify";
import SearchField from "./SearchField";
import DropdownContent from "./DropdownContent";
import { VIETNAM_PROVINCES, BUDGET_OPTIONS } from "./Hero.constants";

interface HeroProps {
  userName?: string | null;
}

const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({ to, duration = 4, suffix = "", decimals = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return latest.toFixed(decimals) + suffix;
  });
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, duration, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const Hero: React.FC<HeroProps> = () => {
  const navigate = useNavigate();
  const [dest, setDest] = useState("");
  const [destId, setDestId] = useState("");
  const [budget, setBudget] = useState("");

  const budgetInputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);
  const prevValueRef = useRef<string>("");

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
  }, [budget]);

  const formatVND = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(rawValue));
  };
  const [guests, setGuests] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<
    "dest" | "budget" | "guests" | null
  >(null);

  const destRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        destRef.current?.contains(target) ||
        budgetRef.current?.contains(target) ||
        guestsRef.current?.contains(target)
      )
        return;
      setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProvinces = useMemo(() => {
    if (dest.trim() === "") return VIETNAM_PROVINCES;
    const searchStr = normalizeText(dest);
    return VIETNAM_PROVINCES.filter((p) =>
      normalizeText(p.name).includes(searchStr),
    );
  }, [dest]);



  const performSearch = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.warn("Vui lòng đăng nhập để bắt đầu hành trình của bạn! 👋");
      return navigate("/auth");
    }
    if (!dest) {
      toast.info("Vui lòng chọn điểm đến bạn muốn khám phá! 📍");
      return setActiveDropdown("dest");
    }
    navigate("/planner", {
      state: {
        destination: destId || dest, // Send ID if available, otherwise name
        destinationName: dest,
        budget,
        totalGuests: guests,
        searchAt: new Date().toISOString(),
      },
    });
  }, [navigate, dest, destId, budget, guests]);

  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay} />

      <div className={styles.container} data-aos="zoom-in">
        {/* <div
          className={styles.heroBadge}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <span className={styles.badgeIcon}>🏔️</span>
          <span>KHÁM PHÁ THIÊN NHIÊN HÙNG VĨ</span>
        </div> */}

        <h1
          className={styles.heroTitle}
        >
          Khám phá điểm đến <br /> Tuyệt vời & Tận hưởng
        </h1>

        <p
          className={styles.heroDescription}
        >
          Lên kế hoạch cho chuyến đi mơ ước của bạn tại Đà Nẵng, Huế, Quảng Nam{" "}
          <br />
          với sự trợ giúp hoàn hảo từ trí tuệ nhân tạo.
        </p>

        <div
          className={styles.heroButtons}
        >
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={performSearch}
          >
            Bắt đầu hành trình
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => navigate("/explore")}
          >
            Khám phá ngay
          </button>
        </div>

        <div
          className={`${styles.heroSearchWrapper} ${activeDropdown ? styles.hasActiveDropdown : ""}`}
        >
          <form
            className={styles.premiumSearchWidget}
            onSubmit={(e) => {
              e.preventDefault();
              performSearch();
            }}
          >
            {/* Điểm đến */}
            <SearchField
              label="Điểm đến"
              icon={<MapPin weight="bold" />}
              innerRef={destRef}
              onClick={() => setActiveDropdown("dest")}
            >
              <div className={styles.customSelectTrigger}>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  onFocus={() => setActiveDropdown("dest")}
                />
              </div>
              <DropdownContent show={activeDropdown === "dest"}>
                <div className={styles.suggestionsHeader}>
                  Gợi ý điểm đến phổ biến
                </div>
                <div className={styles.suggestionsList}>
                  {filteredProvinces.length > 0 ? (
                    filteredProvinces.map((p) => (
                      <div
                        key={p.id}
                        className={`${styles.suggestionItem} ${destId === p.id ? styles.active : ""}`}
                        onClick={() => {
                          setDest(p.name);
                          setDestId(p.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <div className={styles.optionIcon}>{p.icon}</div>
                        <div className={styles.optionText}>
                          <span className={styles.optionTitle}>{p.name}</span>
                          <span className={styles.optionDesc}>{p.desc}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResult}>
                      Không tìm thấy điểm đến
                    </div>
                  )}
                </div>
              </DropdownContent>
            </SearchField>

            <div className={styles.searchDivider} />

            {/* Ngân sách */}
            <SearchField
              label="Ngân sách"
              icon={<Wallet weight="bold" />}
              innerRef={budgetRef}
            >
              <div className={styles.customSelectTrigger}>
                <div className={styles.inputContainer}>
                  <input
                    ref={budgetInputRef}
                    type="text"
                    placeholder="Nhập số tiền (VNĐ)..."
                    value={budget ? formatVND(budget) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.replace(/\D/g, "");
                      if (budgetInputRef.current) {
                        cursorRef.current = budgetInputRef.current.selectionStart;
                        prevValueRef.current = val;
                      }
                      setBudget(clean);
                    }}
                    spellCheck={false}
                  />
                  {budget && <span className={styles.vndSuffix}>VNĐ</span>}
                </div>
              </div>
            </SearchField>

            <div className={styles.searchDivider} />

            {/* Số khách */}
            <SearchField
              label="Số khách"
              icon={<Users weight="bold" />}
              innerRef={guestsRef}
              onClick={() => setActiveDropdown("guests")}
            >
              <div className={styles.customSelectTrigger}>
                <span className={styles.activeValue}>{guests} khách</span>
              </div>
              <DropdownContent
                show={activeDropdown === "guests"}
                className={styles.dropdownGuests}
              >
                <div className={styles.suggestionsHeader}>
                  Số lượng thành viên
                </div>
                <div className={styles.guestCounter}>
                  <div className={styles.guestInfo}>
                    <span className={styles.guestTitle}>Người đi cùng</span>
                  </div>
                  <div className={styles.counterControls}>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (guests > 1) setGuests(guests - 1);
                      }}
                      disabled={guests <= 1}
                      title="Giảm số lượng khách"
                      aria-label="Giảm số lượng khách"
                    >
                      <div className={styles.counterBtnInner}>
                        {" "}
                        <Minus weight="bold" size={16} />
                      </div>
                    </button>
                    <span className={styles.counterValue}>{guests}</span>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuests(guests + 1);
                      }}
                      title="Tăng số lượng khách"
                      aria-label="Tăng số lượng khách"
                    >
                      <div className={styles.counterBtnInner}>
                        <Plus weight="bold" size={16} />
                      </div>{" "}
                    </button>
                  </div>
                </div>
              </DropdownContent>
            </SearchField>

            <button 
              type="submit" 
              className={styles.btnSearchSubmit}
              title="Tìm kiếm hành trình"
              aria-label="Tìm kiếm hành trình"
            >
              <MagnifyingGlass weight="bold" size={24} />
            </button>
          </form>
        </div>

        <div
          className={`${styles.heroStats} ${activeDropdown ? styles.statsPushed : ""}`}
          data-aos="fade-up"
          data-aos-delay="1200"
        >
          <div className={styles.statBox}>
            <span><CountUp to={150} suffix="K+" /></span>
            <p>Chuyến đi</p>
          </div>
          <div className={styles.statBox}>
            <span><CountUp to={100} suffix="K+" /></span>
            <p>Khách hàng</p>
          </div>
          <div className={styles.statBox}>
            <span><CountUp to={4.9} decimals={1} /></span>
            <p>Đánh giá</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
