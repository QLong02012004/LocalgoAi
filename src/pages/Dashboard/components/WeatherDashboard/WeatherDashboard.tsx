import React from "react";
import styles from "./WeatherDashboard.module.scss";
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  MapPin, 
  Wind, 
  Drop, 
  Thermometer, 
  MagnifyingGlass,
  Cloud,
  CloudLightning,
  CloudFog,
  CircleNotch,
  Gauge,
  Compass,
  ChartBar,
  CaretDown,
  House,
  DownloadSimple
} from "@phosphor-icons/react";
import { getWeatherForecast, type WeatherForecastResponse } from "../../../../services/weatherService";

type CityKey = "danang" | "hue" | "quangnam";
type ViewType = "overview" | "map" | "forecast" | "stats";

interface CityConfig {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: Record<CityKey, CityConfig> = {
  danang: { name: "Đà Nẵng", lat: 16.0544, lng: 108.2022 },
  hue: { name: "Huế", lat: 16.4637, lng: 107.5909 },
  quangnam: { name: "Quảng Nam", lat: 15.5667, lng: 108.4833 }
};

const WeatherDashboard: React.FC = () => {
  const [activeCity, setActiveCity] = React.useState<CityKey>("danang");
  const [activeView, setActiveView] = React.useState<ViewType>("overview");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const [cityData, setCityData] = React.useState<Record<CityKey, WeatherForecastResponse | null>>({
    danang: null,
    hue: null,
    quangnam: null
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeHour, setActiveHour] = React.useState(0);
  const [activeDay, setActiveDay] = React.useState(0);

  React.useEffect(() => {
    fetchAllWeatherData();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllWeatherData = async () => {
    try {
      setIsLoading(true);
      const [dnRes, hueRes, qnRes] = await Promise.all([
        getWeatherForecast(CITIES.danang.lat, CITIES.danang.lng),
        getWeatherForecast(CITIES.hue.lat, CITIES.hue.lng),
        getWeatherForecast(CITIES.quangnam.lat, CITIES.quangnam.lng)
      ]);

      setCityData({
        danang: dnRes,
        hue: hueRes,
        quangnam: qnRes
      });
    } catch (error) {
      console.error("Lỗi khi tải thời tiết:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun weight="fill" />;
    if (code <= 3) return <CloudSun weight="fill" />;
    if (code <= 48) return <CloudFog weight="fill" />;
    if (code <= 65) return <CloudRain weight="fill" />;
    if (code <= 82) return <CloudRain weight="fill" />;
    if (code <= 99) return <CloudLightning weight="fill" />;
    return <Cloud weight="fill" />;
  };

  const getWeatherLabel = (code: number) => {
    if (code === 0) return "Trời quang đãng";
    if (code <= 3) return "Trời nhiều mây";
    if (code <= 48) return "Có sương mù";
    if (code <= 65) return "Mưa nhỏ";
    if (code <= 82) return "Mưa lớn";
    if (code <= 99) return "Có giông bão";
    return "Thời tiết ổn định";
  };

  const getTravelSuggestion = (code: number, city: string) => {
    if (code <= 3) {
      return {
        title: "Trời nắng đẹp",
        desc: city === "Đà Nẵng" ? "Lên đồ đi biển Mỹ Khê ngay thôi!" : "Thăm Đại Nội hoặc dạo lăng tẩm thôi nào.",
        icon: <Sun weight="fill" />
      };
    }
    if (code >= 51 && code <= 82) {
      return {
        title: "Trời đang mưa",
        desc: city === "Huế" ? "Mưa Huế rất tình, ghé quán trà cung đình thôi." : "Ghé quán cafe view biển nghe tiếng mưa.",
        icon: <CloudRain weight="fill" />
      };
    }
    return {
      title: "Khám phá thôi",
      desc: "Thời tiết ổn định, dạo quanh phố cổ hoặc thưởng thức ẩm thực địa phương.",
      icon: <MapPin weight="fill" />
    };
  };

  const getWeatherGlow = (code: number) => {
    if (code <= 3) return { background: "radial-gradient(circle at top right, rgba(255, 157, 108, 0.4), transparent 70%)" };
    if (code >= 51) return { background: "radial-gradient(circle at top right, rgba(100, 116, 139, 0.4), transparent 70%)" };
    return { background: "radial-gradient(circle at top right, rgba(64, 123, 255, 0.3), transparent 70%)" };
  };

  if (isLoading || !cityData[activeCity]) {
    return (
      <div className={styles.loadingContainer}>
        <CircleNotch className={styles.spinner} size={40} />
        <p>Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const activeWeatherData = cityData[activeCity]!;
  const { current, daily, hourly } = activeWeatherData;
  
  // Logic to determine what weather to display in the main card
  const getDisplayedWeather = () => {
    const dailyKeys = Object.keys(daily);
    // If a day is selected (other than today), show daily overview
    if (activeDay > 0) {
      const dayData = daily[dailyKeys[activeDay]];
      return {
        temp: dayData.tempMax,
        condition: dayData.condition,
        weatherCode: dayData.weatherCode,
        high: dayData.tempMax,
        low: dayData.tempMin,
        humidity: dayData.humidity || 60,
        windSpeed: dayData.windSpeed || 15,
        pressure: dayData.pressure || 1012,
        label: new Date(dailyKeys[activeDay]).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
      };
    }
    // If an hour is selected (other than 'now'), show hourly data
    if (activeHour > 0) {
      const filteredHourly = hourly.filter((_, i) => i % 3 === 0).slice(0, 8);
      const hourData = filteredHourly[activeHour];
      return {
        temp: hourData.temp,
        condition: getWeatherLabel(hourData.weatherCode),
        weatherCode: hourData.weatherCode,
        high: daily[dailyKeys[0]].tempMax,
        low: daily[dailyKeys[0]].tempMin,
        humidity: hourData.humidity,
        windSpeed: hourData.windSpeed,
        pressure: hourData.pressure,
        label: `Dự báo lúc ${new Date(hourData.time).getHours()}h`
      };
    }
    // Default to current weather
    return {
      temp: current.temp,
      condition: current.condition,
      weatherCode: current.weatherCode,
      high: daily[dailyKeys[0]].tempMax,
      low: daily[dailyKeys[0]].tempMin,
      humidity: current.humidity || 78,
      windSpeed: current.windSpeed || 12,
      pressure: current.pressure || 1012,
      label: "Hiện tại"
    };
  };

  const displayed = getDisplayedWeather();
  const suggestion = getTravelSuggestion(displayed.weatherCode, CITIES[activeCity].name);
  const glowStyle = getWeatherGlow(displayed.weatherCode);

  const CircularGauge = ({ value, max, label, icon, unit }: any) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;

    return (
      <div className={styles.gaugeItem}>
        <div className={styles.gaugeCircle}>
          <svg width="80" height="80">
            <circle className={styles.gaugeBg} cx="40" cy="40" r={radius} />
            <circle 
              className={styles.gaugeProgress} 
              cx="40" cy="40" r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className={styles.gaugeIcon}>{icon}</div>
        </div>
        <div className={styles.gaugeText}>
          <div className={styles.label}>{label}</div>
          <div className={styles.value}>{value}{unit}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.weatherDashboard}>
      <div className={styles.weatherGlow} style={glowStyle} />
      
      <div className={styles.miniSidebar}>
        <div className={styles.avatar}>AD</div>
        <div className={styles.navIcons}>
          <button className={`${styles.navBtn} ${activeView === "overview" ? styles.active : ""}`} onClick={() => setActiveView("overview")}><House /></button>
          <button className={`${styles.navBtn} ${activeView === "map" ? styles.active : ""}`} onClick={() => setActiveView("map")}><MapPin /></button>
          <button className={`${styles.navBtn} ${activeView === "forecast" ? styles.active : ""}`} onClick={() => setActiveView("forecast")}><Compass /></button>
          <button className={`${styles.navBtn} ${activeView === "stats" ? styles.active : ""}`} onClick={() => setActiveView("stats")}><ChartBar /></button>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.topControls}>
          <div className={styles.locationHeader}>
            <div className={styles.cityDropdownWrapper} ref={dropdownRef}>
              <div className={styles.city} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <MapPin size={24} weight="fill" color="#407bff" />
                {CITIES[activeCity].name}, Việt Nam
                <CaretDown className={`${styles.arrow} ${isDropdownOpen ? styles.rotated : ""}`} />
              </div>
              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {Object.entries(CITIES).map(([key, city]) => (
                    <div key={key} className={`${styles.dropdownItem} ${activeCity === key ? styles.activeItem : ""}`} onClick={() => { setActiveCity(key as CityKey); setIsDropdownOpen(false); }}>
                      {city.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.date}>
              {new Date(Object.keys(daily)[activeDay]).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
          
          <div className={styles.rightActions}>
            <div className={styles.iconBtn}><MagnifyingGlass size={20} /></div>
            <div className={styles.iconBtn}><DownloadSimple size={20} /></div>
          </div>
        </div>

        <div className={styles.dashboardBody}>
          <div className={styles.leftCol}>
            <div className={styles.heroCard}>
              <div className={styles.heroMain}>
                <div className={styles.tempLarge}>{displayed.temp}°</div>
                <div className={styles.conditionInfo}>
                  <div className={styles.conditionTitle}>{displayed.condition}</div>
                  <div className={styles.conditionSub}>{displayed.label}</div>
                  <div className={styles.minMaxRow}>
                    <span>Cao: {displayed.high}°</span>
                    <span>Thấp: {displayed.low}°</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroDesc}>
                {activeDay > 0 ? `Xem dự báo chi tiết cho ${displayed.label}.` : `Dữ liệu thời tiết cho ${CITIES[activeCity].name}.`}
              </div>
            </div>

            <div className={styles.hourlySection}>
              {hourly.filter((_, i) => i % 3 === 0).slice(0, 8).map((h, i) => (
                <div 
                  key={i} 
                  className={`${styles.hourItem} ${activeHour === i && activeDay === 0 ? styles.active : ""}`}
                  onClick={() => { setActiveHour(i); setActiveDay(0); }}
                >
                  <span className={styles.time}>{i === 0 ? "Bây giờ" : new Date(h.time).getHours() + "h"}</span>
                  <span className={styles.icon}>{getWeatherIcon(h.weatherCode)}</span>
                  <span className={styles.temp}>{h.temp}°</span>
                </div>
              ))}
            </div>

            <div className={styles.weeklySection}>
               {Object.entries(daily).slice(0, 7).map(([date, data], i) => (
                 <div 
                   key={i} 
                   className={`${styles.weeklyItem} ${activeDay === i ? styles.active : ""}`}
                   onClick={() => { setActiveDay(i); setActiveHour(0); }}
                 >
                   <span className={styles.day}>{new Date(date).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                   <span className={styles.icon} style={{ color: (data.tempMax ?? 0) > 30 ? '#f59e0b' : '#407bff' }}>{getWeatherIcon(data.weatherCode)}</span>
                   <div className={styles.weeklyTemp}>
                      <div className={styles.high}>{data.tempMax ?? 0}°</div>
                      <div className={styles.low}>{data.tempMin ?? 0}°</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={`${styles.liveConditions} ${styles.glassCard}`}>
              <div className={styles.cardTitle}>Chỉ số trực tiếp</div>
              <div className={styles.gaugesRow}>
                <CircularGauge value={displayed.humidity} max={100} label="Độ ẩm" unit="%" icon={<Drop weight="fill" />} />
                <CircularGauge value={displayed.windSpeed} max={50} label="Gió" unit=" km/h" icon={<Wind weight="fill" />} />
                <CircularGauge value={displayed.pressure ? (displayed.pressure / 10).toFixed(0) : 101} max={110} label="Áp suất" unit=" hPa" icon={<Gauge weight="fill" />} />
              </div>
            </div>

            <div className={`${styles.suggestionWidget} ${styles.glassCard}`}>
              <div className={styles.cardTitle}>Gợi ý thông minh</div>
              <div className={styles.suggestionContent}>
                <div className={styles.sugIcon}>{suggestion.icon}</div>
                <div className={styles.sugText}>
                  <div className={styles.sugTitle}>{suggestion.title}</div>
                  <div className={styles.sugDesc}>{suggestion.desc}</div>
                </div>
              </div>
            </div>

            <div className={`${styles.recentSearches} ${styles.glassCard}`}>
              <div className={styles.cardTitle}>Khu vực lân cận</div>
              <div className={styles.searchList}>
                {Object.entries(CITIES).filter(([key]) => key !== activeCity).map(([key, city]) => (
                  <div key={key} className={styles.searchCard} onClick={() => setActiveCity(key as CityKey)}>
                    <div className={styles.searchLeft}>
                      <div className={styles.cityName}>{city.name}</div>
                      <div className={styles.cityCondition}>{cityData[key as CityKey]?.current.condition || "---"}</div>
                    </div>
                    <div className={styles.cityTemp}>{cityData[key as CityKey]?.current.temp || 0}°</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
