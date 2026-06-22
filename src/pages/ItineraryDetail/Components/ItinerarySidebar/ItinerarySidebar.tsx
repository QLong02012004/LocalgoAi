import React, { useState, useRef, useEffect } from "react";
import { type RoutePoint, type TravelMetric } from "../../types";
import { toast } from "react-toastify";
import {
  type ItineraryType,
  type GeneratedItinerary,
} from "../../../../services/itineraryService";
import {
  getWeatherForecast,
  type WeatherData,
} from "../../../../services/weatherService";
import styles from "./ItinerarySidebar.module.scss";
import PlaceCard from "../PlaceCard/PlaceCard";
import {
  ChartBar,
  Money,
  CalendarBlank,
  MapPin,
  PlayCircle,
  StopCircle,
  PlusCircle,
  SunHorizon,
  MoonStars,
  RocketLaunch,
  X,
  DotsThreeOutlineVertical,
  CaretLeft,
  PersonSimpleWalk,
  Moped,
  Car,
  Sun,
  CloudSun,
  CloudRain,
  MagicWand,
  Info,
} from "@phosphor-icons/react";
import * as Icons from "@phosphor-icons/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  points: RoutePoint[];
  activePointId: string | null;
  onPointClick: (id: string) => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  onOpenAddModal: () => void;
  planData?: {
    destination: string;
    budget: string;
    peopleGroup: string;
    interests: string[];
    travelDate: string;
  };
  metrics?: Record<string, TravelMetric>;
  activeDay: number;
  setActiveDay: (day: number) => void;
  onOpenNavigation: (lat: number, lng: number, name: string) => void;
  onFetchSample?: () => void;
  fullItinerary?: GeneratedItinerary | ItineraryType | null;
  isMapExpanded?: boolean;
  onToggleMap?: () => void;
  status?: "DRAFT" | "PUBLISHED";
  onPublish?: () => void;
  isPublishing?: boolean;
  isLoading?: boolean;
  onDeleteSpot?: (id: string) => void;
  onEditSpot?: (point: RoutePoint) => void;
  onReorder?: (newPoints: RoutePoint[]) => void;
  hasOptimized?: boolean;
  showNearby?: boolean;
}

const parseBudgetValue = (budgetStr?: string | number) => {
  if (!budgetStr) return 0;
  const cleaned = String(budgetStr).replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
};

const ItinerarySidebar: React.FC<Props> = ({
  points,
  activePointId,
  onPointClick,
  isPreviewing,
  onTogglePreview,
  onOpenAddModal,
  planData,
  metrics = {},
  activeDay,
  setActiveDay,
  onOpenNavigation,
  onFetchSample,
  fullItinerary,
  onToggleMap,
  status = "DRAFT",
  onPublish,
  isPublishing = false,
  isLoading = false,
  onDeleteSpot,
  onEditSpot,
  onReorder,
  hasOptimized = false,
  showNearby = false,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const statsRef = useRef<HTMLDivElement>(null);

  const totalCost = points.reduce((acc, p) => acc + (p.estimatedCost || 0), 0);
  const plannedBudget = parseBudgetValue(
    fullItinerary?.budget || planData?.budget,
  );
  const isOverBudget = plannedBudget > 0 && totalCost > plannedBudget;
  const budgetProgress =
    plannedBudget > 0 ? (totalCost / plannedBudget) * 100 : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = points.findIndex((p) => p.id === active.id);
    const newIndex = points.findIndex((p) => p.id === over.id);

    if (onReorder) {
      const newPoints = arrayMove(points, oldIndex, newIndex);
      onReorder(newPoints);
    }
  };

  const getConflict = (point: RoutePoint, nextPoint?: RoutePoint) => {
    const [h, m] = point.time.split(":").map(Number);
    const timeInMins = h * 60 + m;

    // 1. Business hours (Simulated)
    if (point.type === "attraction") {
      if (timeInMins >= 20 * 60)
        return "Địa điểm tham quan có thể đã đóng cửa sau 20h.";
      if (timeInMins < 8 * 60)
        return "Hầu hết các địa điểm tham quan chỉ mở cửa sau 08:00.";
    }

    // 2. Overlap with next
    if (nextPoint && nextPoint.day === point.day) {
      const [nh, nm] = nextPoint.time.split(":").map(Number);
      const nextTimeInMins = nh * 60 + nm;
      if (timeInMins >= nextTimeInMins) {
        return "Thời gian trùng lặp với địa điểm tiếp theo. Nhấn 'Tối ưu' để sắp xếp lại.";
      }
    }

    return null;
  };

  const hasConflicts = points.some((p, i) => {
    // We need to find the next point in the same day for this check
    const nextInDay = points.slice(i + 1).find(next => next.day === p.day);
    return getConflict(p, nextInDay) !== null;
  });

  const handleSaveClick = () => {
    if (isOverBudget || hasConflicts) {
      toast.warning(
        isOverBudget 
          ? "Tổng chi phí đang vượt quá ngân sách! Hãy nhấn 'Tối ưu' để cân đối lại."
          : "Lịch trình đang có sự trùng lặp thời gian! Hãy nhấn 'Tối ưu' để sắp xếp lại.",
        { position: "top-right", autoClose: 5000 }
      );
      return;
    }
    onPublish?.();
  };

  useEffect(() => {
    const fetchRealWeather = async () => {
      try {
        const lat = points[0]?.lat || 16.047;
        const lng = points[0]?.lng || 108.206;
        console.log("Fetching weather for:", lat, lng);
        const data = await getWeatherForecast(lat, lng);
        console.log("Weather data received:", data);
        setWeatherMap(data.daily);
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };
    if (points.length > 0) {
      fetchRealWeather();
    }
  }, [points]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showStats &&
        statsRef.current &&
        !statsRef.current.contains(event.target as Node)
      ) {
        setShowStats(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStats]);

  const dailyPoints = points.filter(
    (p) => Number(p.day || 1) === Number(activeDay),
  );

  const handleTabClick = (day: number) => {
    setActiveDay(day);
    setShowStats(false);
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={14} weight="fill" />;
    if (code <= 3) return <CloudSun size={14} weight="fill" />;
    if (code <= 65 || (code >= 80 && code <= 82))
      return <CloudRain size={14} weight="fill" />;
    if (code >= 95) return <CloudRain size={14} weight="fill" />; // Thunderstorm
    return <CloudSun size={14} weight="fill" />;
  };

  const getDayWeather = (dayIndex: number) => {
    const baseDateStr = fullItinerary?.startDate || planData?.travelDate;
    if (!baseDateStr) return null;

    const date = Array.isArray(baseDateStr)
      ? new Date(baseDateStr[0], baseDateStr[1] - 1, baseDateStr[2])
      : new Date(baseDateStr as string);

    if (isNaN(date.getTime())) return null;

    date.setDate(date.getDate() + dayIndex - 1);
    const dateKey = date.toISOString().split("T")[0];

    // 1. Try exact date match
    if (weatherMap[dateKey]) return weatherMap[dateKey];

    // 2. Fallback: If no exact match (e.g. trip in past/future),
    // show weather for the corresponding day of the current week for demo
    const forecastDates = Object.keys(weatherMap).sort();
    if (forecastDates.length > 0) {
      const fallbackKey = forecastDates[(dayIndex - 1) % forecastDates.length];
      return weatherMap[fallbackKey];
    }

    return null;
  };

  const getSmartInsights = (dayPoints: RoutePoint[]) => {
    const tips = [];
    if (dayPoints.length === 0)
      return [
        "Hôm nay là ngày nghỉ ngơi của bạn. Hãy tận hưởng không khí tại khách sạn!",
      ];

    const hasOutdoor = dayPoints.some(
      (p) => p.type === "attraction" || p.type === "other",
    );
    const hasDining = dayPoints.some((p) => p.type === "restaurant");
    const hasBeach = dayPoints.some(
      (p) =>
        p.name.toLowerCase().includes("biển") ||
        p.name.toLowerCase().includes("bãi"),
    );
    const isLongDay = dayPoints.length > 3;

    if (hasOutdoor)
      tips.push(
        "Sáng nay bạn nên mang theo kem chống nắng và mũ vì sẽ tham quan ngoài trời nhiều.",
      );
    if (hasDining)
      tips.push(
        "Các nhà hàng tại đây thường rất đông vào giờ cao điểm, bạn nên đặt bàn trước.",
      );
    if (hasBeach)
      tips.push(
        "Chuẩn bị đồ bơi và khăn tắm nếu bạn có ý định xuống tắm biển Đà Nẵng.",
      );
    if (isLongDay)
      tips.push(
        "Lịch trình hôm nay di chuyển khá nhiều, đừng quên sạc đầy pin điện thoại và mang theo sạc dự phòng.",
      );

    // Fallback if no specific tips
    if (tips.length === 0)
      tips.push(
        "Hãy kiểm tra kỹ thời gian mở cửa của các địa điểm trước khi khởi hành.",
      );

    return tips.slice(0, 2);
  };

  const dailyInsights = getSmartInsights(dailyPoints);

  const renderTimelineGroup = (
    title: string,
    groupPoints: RoutePoint[],
    icon: React.ReactNode,
    color: string,
  ) => {
    if (groupPoints.length === 0) return null;

    return (
      <div className={styles.timeGroup}>
        <div className={styles.groupHeader}>
          <div
            className={styles.iconBox}
            style={{ color: color, background: `${color}15` }}
          >
            {icon}
          </div>
          <h3 className={styles.groupTitle}>{title}</h3>
          <span className={styles.countBadge}>
            {groupPoints.length} địa điểm
          </span>
        </div>

        <div className={styles.groupContent}>
          <SortableContext
            items={groupPoints.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {groupPoints.map((point, idx) => {
              const globalIdx = points.findIndex((p) => p.id === point.id) + 1;
              return (
                <React.Fragment key={point.id}>
                  <PlaceCard
                    point={point}
                    index={globalIdx}
                    isActive={activePointId === point.id}
                    onClick={() => onPointClick(point.id)}
                    onOpenNavigation={onOpenNavigation}
                    onEdit={onEditSpot}
                    onDelete={onDeleteSpot}
                    conflictMsg={getConflict(point, groupPoints[idx + 1])}
                  />

                  {idx < groupPoints.length - 1 && (
                    <div className={styles.timelineConnector}>
                      <div
                        className={styles.flowingLine}
                        style={{ background: color }}
                      ></div>
                      <div className={styles.distanceBubble}>
                        {(() => {
                          const nextPoint = groupPoints[idx + 1];
                          const metric = metrics[`${point.id}-${nextPoint.id}`];

                          if (!metric)
                            return (
                              <span className={styles.calculating}>...</span>
                            );

                          const dist = parseFloat(metric.distance);
                          let TransportIcon = Car;
                          if (dist < 1) TransportIcon = PersonSimpleWalk;
                          else if (dist < 5) TransportIcon = Moped;

                          return (
                            <>
                              <TransportIcon size={14} weight="fill" />
                              <span>
                                <b>{metric.distance} km</b> • {metric.duration} phút
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </SortableContext>
        </div>
      </div>
    );
  };

  return (
    <aside className={styles.itinerarySidebar}>
      <div className={styles.itiSidebarHeader}>
        <div className={styles.topBar}>
          <div className={styles.locationTag}>
            <MapPin size={14} weight="fill" />
            <span>
              {fullItinerary?.provinceName ||
                fullItinerary?.province ||
                planData?.destination ||
                "Việt Nam"}
            </span>
          </div>
          <div className={styles.dateTag}>
            <span>
              {fullItinerary?.startDate ||
                planData?.travelDate ||
                "Tháng 5, 2024"}
            </span>
          </div>
          {!!fullItinerary?.totalDistance &&
            fullItinerary.totalDistance > 0 && (
              <div className={styles.distanceTag}>
                <span>{fullItinerary.totalDistance.toFixed(1)} km</span>
              </div>
            )}

          <div className={styles.headerRight}>
            <div
              className={`${styles.budgetWidget} ${isOverBudget ? styles.overBudget : ""}`}
              title={`Tổng chi phí dự kiến: ${totalCost.toLocaleString()}đ / Ngân sách: ${plannedBudget.toLocaleString()}đ`}
            >
              {isOverBudget ? (
                <Info size={18} weight="fill" color="#ef4444" />
              ) : (
                <Money size={18} weight="duotone" color="#10b981" />
              )}
              <span>
                {plannedBudget > 0
                  ? plannedBudget.toLocaleString("vi-VN")
                  : totalCost.toLocaleString("vi-VN")}
                đ
              </span>
              {isOverBudget && (
                <span className={styles.warningText}>Vượt!</span>
              )}
            </div>

            {/*  <button 
                type="button"
                className={styles.topActionBtn}
                onClick={onToggleMap}
                title="Chế độ xem bản đồ"
              >
                <div className={styles.statsIcon}><MapPin size={20} weight="bold" /></div>
              </button> */}

            <button
              type="button"
              className={`${styles.topActionBtn} ${showStats ? styles.active : ""}`}
              onClick={() => setShowStats(!showStats)}
              title="Xem ngân sách dự kiến"
            >
              <div className={styles.statsIcon}>
                <ChartBar size={20} weight="fill" />
              </div>
            </button>
          </div>
        </div>

        <h1 className={styles.itiMainTitle}>
          {fullItinerary?.title || "Lộ trình khám phá"}
        </h1>

        <div className={styles.itiDaysTabs}>
          <div className={styles.tabsTrack}>
            {(() => {
              const maxDay =
                points.length > 0
                  ? Math.max(...points.map((p) => p.day || 1))
                  : 1;
              const tabs = [];
              for (let i = 1; i <= maxDay; i++) {
                tabs.push(
                  <button
                    type="button"
                    key={`day-${i}`}
                    className={`${styles.dayTab} ${!showStats && activeDay === i ? styles.dayTabActive : ""}`}
                    onClick={() => handleTabClick(i)}
                    title={`Xem lịch trình ngày ${i}`}
                  >
                    <span className={styles.dayNum}>Ngày {i}</span>
                    <span className={styles.dayDate}>
                      {(() => {
                        const baseDateStr =
                          fullItinerary?.startDate || planData?.travelDate;
                        if (!baseDateStr) return "--/--";

                        const date = Array.isArray(baseDateStr)
                          ? new Date(
                              baseDateStr[0],
                              baseDateStr[1] - 1,
                              baseDateStr[2],
                            )
                          : new Date(baseDateStr as string);

                        if (isNaN(date.getTime())) return "--/--";

                        date.setDate(date.getDate() + i - 1);

                        try {
                          const weekday = new Intl.DateTimeFormat("vi-VN", {
                            weekday: "short",
                          }).format(date);
                          const dayMonth = new Intl.DateTimeFormat("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          }).format(date);
                          return `${weekday}, ${dayMonth}`;
                        } catch {
                          return "--/--";
                        }
                      })()}
                    </span>
                    <div className={styles.tabWeather}>
                      {(() => {
                        const weather = getDayWeather(i);
                        if (weather) {
                          return (
                            <>
                              {getWeatherIcon(weather.weatherCode)}
                              <span>{weather.temp}°C</span>
                            </>
                          );
                        }
                        // Default fallback if no data
                        return (
                          <>
                            <Sun size={14} weight="fill" />
                            <span>--°C</span>
                          </>
                        );
                      })()}
                    </div>
                    <div className={styles.dayCost}>
                      {(() => {
                        const dayCost = points
                          .filter((p) => Number(p.day || 1) === i)
                          .reduce((sum, p) => sum + (Number(p.estimatedCost) || 0), 0);
                        return <span>{dayCost > 0 ? `${dayCost.toLocaleString("vi-VN")}đ` : "0đ"}</span>;
                      })()}
                    </div>
                  </button>,
                );
              }
              return tabs;
            })()}
          </div>
        </div>

        <button
          type="button"
          className={styles.collapseSidebarBtn}
          onClick={onToggleMap}
          title="Thu gọn danh sách"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
      </div>

      <div className={styles.itiContentScrollable}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {isLoading ? (
            <div className={styles.loadingSkeleton}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.sImg}></div>
                  <div className={styles.sInfo}>
                    <div className={`${styles.sLine} ${styles.sTitle}`}></div>
                    <div className={`${styles.sLine} ${styles.sMeta}`}></div>
                    <div className={`${styles.sLine} ${styles.sNote}`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {fullItinerary?.reasonRecommended && !showStats && (
                <div className={styles.aiInsightsBox}>
                  <div className={styles.insightHeader}>
                    <div className={styles.aiIcon}>
                      <MagicWand size={20} weight="fill" />
                    </div>
                    <div className={styles.insightTitle}>
                      Gợi ý thông minh (AI Insights)
                    </div>
                  </div>
                  <div className={styles.insightContent}>
                    {dailyInsights.map((tip, idx) => (
                      <div key={idx} className={styles.insightItem}>
                        <Info
                          size={16}
                          weight="bold"
                          className={styles.infoIcon}
                        />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.insightFooter}>
                    Dựa trên lịch trình ngày {activeDay} của bạn
                  </div>
                </div>
              )}
              {!showStats ? (
                <div className={styles.itineraryTimeline} key={activeDay}>
                  {(() => {
                    const dayInfo = fullItinerary?.itineraryDays?.find(
                      (d) => Number(d.dayNumber) === Number(activeDay),
                    );
                    if (dayInfo?.theme) {
                      const dayPoints = points.filter(
                        (p) => Number(p.day) === Number(activeDay),
                      );
                      const themeImage = dayPoints.find(
                        (p) => p.imageUrl,
                      )?.imageUrl;

                      return (
                        <div
                          className={styles.dayThemeCard}
                          style={{
                            backgroundImage: themeImage
                              ? `url(${themeImage})`
                              : `url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop')`,
                          }}
                        >
                          <div className={styles.themeGlass}>
                            <div className={styles.themeLabel}>
                              Chủ đề ngày {activeDay}
                            </div>
                            <div className={styles.themeValue}>
                              {dayInfo.theme}
                            </div>
                            <div className={styles.dayCostBadge}>
                              {(() => {
                                const dayCost = points
                                  .filter((p) => Number(p.day || 1) === Number(activeDay))
                                  .reduce((sum, p) => sum + (Number(p.estimatedCost) || 0), 0);
                                return `Chi phí ngày: ${dayCost.toLocaleString("vi-VN")}đ`;
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {renderTimelineGroup(
                    `Lộ trình Ngày ${activeDay}`,
                    dailyPoints,
                    <CalendarBlank size={20} weight="fill" />,
                    "#0ea5e9",
                  )}




                  {dailyPoints.length === 0 && (
                    <div className={styles.emptyDay}>
                      <div className={styles.emptyIcon}>
                        <CalendarBlank size={32} weight="bold" />
                      </div>
                      <p>Hôm nay chưa có lịch trình nào.</p>
                      <div className={styles.emptyActions}>
                        <span onClick={onOpenAddModal}>Thêm địa điểm ngay</span>
                        {onFetchSample && (
                          <>
                            <div className={styles.dot}></div>
                            <span onClick={onFetchSample}>
                              Lấy lộ trình mẫu
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={styles.statsBox}
                  data-aos="zoom-in"
                  ref={statsRef}
                >
                  <div className={styles.statsGlass}>
                    <h3 className={styles.statsTitle}>Kiểm tra ngân sách</h3>

                    <div className={styles.budgetStatusInfo}>
                      <div className={styles.progressContainer}>
                        <div
                          className={`${styles.progressBar} ${isOverBudget ? styles.barOver : ""}`}
                          style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                        ></div>
                      </div>
                      <div className={styles.budgetMeta}>
                        <span>
                          Tiến độ ngân sách: <b>{budgetProgress.toFixed(1)}%</b>
                        </span>
                        {isOverBudget && (
                          <span className={styles.overWarning}>
                            Cảnh báo: Đã vượt{" "}
                            {(totalCost - plannedBudget).toLocaleString()}đ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.statsList}>
                      {plannedBudget > 0 && (
                        <div className={styles.row}>
                          <span>🎯 Ngân sách dự kiến</span>
                          <b style={{ color: "#0ea5e9" }}>
                            {plannedBudget.toLocaleString()}₫
                          </b>
                        </div>
                      )}

                      {(() => {
                        const categories = {
                          "Lưu trú": { amount: 0, icon: <Icons.House size={16} />, color: "#8b5cf6" },
                          "Ăn uống": { amount: 0, icon: <Icons.ForkKnife size={16} />, color: "#f59e0b" },
                          "Hoạt động": { amount: 0, icon: <Icons.Ticket size={16} />, color: "#ec4899" },
                        };

                        points.forEach(p => {
                          const cost = p.estimatedCost || 0;
                          if (p.type === 'hotel') categories["Lưu trú"].amount += cost;
                          else if (p.type === 'restaurant') categories["Ăn uống"].amount += cost;
                          else categories["Hoạt động"].amount += cost;
                        });

                        return Object.entries(categories).map(([label, data]) => {
                          const percentage = totalCost > 0 ? (data.amount / totalCost) * 100 : 0;
                          return (
                            <div key={label} className={styles.categoryRow}>
                              <div className={styles.catInfo}>
                                <div className={styles.catLabel}>
                                  <span
                                    className={styles.catIcon}
                                    style={{
                                      background: `${data.color}15`,
                                      color: data.color,
                                    }}
                                  >
                                    {data.icon}
                                  </span>
                                  <span className={styles.catName}>{label}</span>
                                </div>
                                <b className={styles.catValue}>
                                  {data.amount.toLocaleString()}₫
                                </b>
                              </div>
                              <div className={styles.catProgressTrack}>
                                <div
                                  className={styles.catProgressBar}
                                  style={{
                                    width: `${percentage}%`,
                                    background: data.color,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                      })()}

                      <div className={styles.divider}></div>
                      <div className={styles.totalRow}>
                        <div className={styles.totalInfo}>
                          <span className={styles.totalLabel}>
                            Tổng cộng hiện tại
                          </span>
                          <span className={styles.totalPoints}>
                            ({points.length} địa điểm)
                          </span>
                        </div>
                        <b
                          style={{
                            color: isOverBudget ? "#ef4444" : "#10b981",
                          }}
                        >
                          {totalCost.toLocaleString()}₫
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DndContext>
      </div>

      <div
        className={`${styles.footerActions} ${showFooter ? styles.footerVisible : styles.footerHidden}`}
      >
        <button
          type="button"
          className={`${styles.btnPreview} ${isPreviewing ? styles.active : ""}`}
          onClick={onTogglePreview}
          title={
            isPreviewing
              ? "Dừng xem trước lộ trình"
              : "Xem trước lộ trình tự động"
          }
        >
          {isPreviewing ? (
            <>
              <StopCircle size={22} weight="bold" /> Dừng phát
            </>
          ) : (
            <>
              <PlayCircle size={22} weight="fill" /> Xem trước
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.btnAdd} ${showNearby ? styles.active : ""}`}
          onClick={onOpenAddModal}
          title={showNearby ? "Tắt chế độ khám phá" : "Thêm địa điểm hoặc ghi chú"}
        >
          {showNearby ? (
            <>
              <X size={22} weight="bold" /> Đóng
            </>
          ) : (
            <>
              <PlusCircle size={22} weight="bold" /> Thêm mới
            </>
          )}
        </button>

        <button
          type="button"
          className={`${styles.btnMagic} ${isLoading ? styles.isOptimizing : ""}`}
          onClick={onFetchSample}
          disabled={isLoading}
          title="Tối ưu hóa lộ trình bằng AI"
        >
          {isLoading ? (
            <div className={styles.spinner}></div>
          ) : (
            <>
              <MagicWand size={22} weight="fill" /> Tối ưu
            </>
          )}
        </button>

        {status === "DRAFT" && (
          <div className={styles.publishWrapper}>
            {hasOptimized && !isPublishing && (
              <div className={styles.optimizeHint}>
                <span>✨ Đã tối ưu!</span>
              </div>
            )}
            <button
              type="button"
              className={`${styles.btnPublish} ${hasOptimized ? styles.btnPulse : ""}`}
              onClick={handleSaveClick}
              disabled={isPublishing}
              title="Xuất bản lộ trình này cho mọi người"
            >
              {isPublishing ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  <RocketLaunch size={22} weight="fill" /> LƯU
                </>
              )}
            </button>
          </div>
        )}

        <button
          type="button"
          className={styles.btnCloseFooter}
          onClick={() => setShowFooter(false)}
          title="Ẩn thanh công cụ"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {!showFooter && (
        <button
          className={styles.footerTrigger}
          onClick={() => setShowFooter(true)}
          title="Hiện thanh công cụ"
        >
          <DotsThreeOutlineVertical size={24} weight="fill" />
        </button>
      )}
    </aside>
  );
};

export default ItinerarySidebar;
