import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudRain, 
  Thermometer, 
  Coffee, 
  ForkKnife, 
  BeachBall, 
  NavigationArrow 
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import styles from './ClockStation.module.scss';

const ClockStation: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { userInfo } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  const getGreetingData = () => {
    const hour = time.getHours();
    
    if (hour >= 5 && hour < 11) {
      return { 
        text: "Chào buổi sáng", 
        icon: <Sun size={32} weight="fill" color="#33d7d1" />,
        bgClass: styles.morningBg,
        suggestion: "Nhiệt độ hiện tại 24°C, một buổi sáng trong lành để bắt đầu hành trình!",
        temp: "24°C"
      };
    }
    if (hour >= 11 && hour < 15) {
      return { 
        text: "Chào buổi trưa", 
        icon: <Sun size={32} weight="fill" color="#33d7d1" />,
        bgClass: styles.noonBg,
        suggestion: "Nhiệt độ hiện tại 32°C, trời khá nắng. Hãy chọn một nhà hàng có máy lạnh nhé!",
        temp: "32°C"
      };
    }
    if (hour >= 15 && hour < 19) {
      return { 
        text: "Chào buổi chiều", 
        icon: <CloudSun size={32} weight="fill" color="#33d7d1" />,
        bgClass: styles.afternoonBg,
        suggestion: "Nhiệt độ hiện tại 28°C, trời rất đẹp để dạo phố Đà Nẵng lúc này!",
        temp: "28°C"
      };
    }
    return { 
      text: "Chào buổi tối", 
      icon: <Moon size={32} weight="fill" color="#33d7d1" />,
      bgClass: styles.nightBg,
      suggestion: "Nhiệt độ hiện tại 22°C, không khí đêm Đà Nẵng thật tuyệt để thư giãn.",
      temp: "22°C"
    };
  };

  const data = getGreetingData();

  const quickActions = [
    { icon: <Coffee size={18} />, label: "Cà phê" },
    { icon: <ForkKnife size={18} />, label: "Nhà hàng" },
    { icon: <BeachBall size={18} />, label: "Bãi biển" },
    { icon: <NavigationArrow size={18} />, label: "Khám phá" }
  ];

  return (
    <div className={`${styles.clockStation} ${data.bgClass}`}>
      {/* Background Decorative Patterns */}
      <div className={styles.abstractCircle1}></div>
      <div className={styles.abstractCircle2}></div>
      <div className={styles.abstractLine1}></div>
      <div className={styles.abstractLine2}></div>
      <div className={styles.mapVector}></div>

      {/* Golden Layout Header */}
      <div className={styles.topSection}>
        <div className={styles.greetingPart}>
          <div className={styles.iconWrapper}>
            <div className={styles.glowAura}></div>
            <div className={styles.statusIcon}>{data.icon}</div>
          </div>
          <div className={styles.greetingBox}>
            <span className={styles.prefix}>{data.text},</span>
            <h1 className={styles.userName}>{userInfo?.fullName?.split(' ').pop() || "bạn"}</h1>
          </div>
        </div>

        <div className={styles.timePart}>
          <div className={styles.bigClock}>
            {format(time.getHours())}:{format(time.getMinutes())}
          </div>
          <div className={styles.dateBox}>
            <span className={styles.dayName}>
              {new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(time)}
            </span>
            <span className={styles.fullDate}>
              {time.getDate()} tháng {time.getMonth() + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: AI Quote & Quick Actions */}
      <div className={styles.centerSection}>
        <div className={styles.quoteWrapper}>
          <div className={styles.hLine}></div>
          <p className={styles.aiQuote}>
            Đêm nay bạn muốn lên lịch trình đi đâu tại Đà Nẵng?
          </p>
          <div className={styles.hLine}></div>
        </div>
        
        <div className={styles.quickActions}>
          {quickActions.map((action, index) => (
            <div key={index} className={styles.actionItem}>
              <div className={styles.actionIcon}>{action.icon}</div>
              <span className={styles.actionLabel}>{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Weather & Info */}
      <div className={styles.footerSection}>
        <div className={styles.weatherStack}>
          <div className={styles.statusItem}>
            <Thermometer size={16} weight="bold" />
            <span>{data.temp}</span>
          </div>
          <div className={styles.vDivider}></div>
          <div className={styles.statusItem}>
            <span>Đà Nẵng</span>
          </div>
        </div>
        <p className={styles.aiMessage}>
          {data.suggestion.includes('.') ? data.suggestion.split('.').pop() : data.suggestion}
        </p>
      </div>
    </div>
  );
};

export default ClockStation;