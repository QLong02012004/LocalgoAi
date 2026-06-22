import React from 'react';
import styles from './DashboardView.module.scss';
import StatCard, { type IconName } from '../StatCard/StatCard';
import { Download, Calendar } from "@phosphor-icons/react";
import * as Icons from "@phosphor-icons/react";
import { motion } from 'framer-motion';
import { useDashboardStats, usePopularLocations } from '../../hooks/useAdminData';
import { ErrorBanner, LoadingRows, SkeletonCards } from '../_shared/AdminFeedback';

// ─── Constants ──────────────────────────────────────────────────────────────
const PROVINCE_COLORS: Record<number, string> = {
  1: '#7c3aed', // Huế - Purple
  2: '#0ea5e9', // Đà Nẵng - Blue
  3: '#f59e0b'  // Quảng Nam - Orange
};

const CHART_COLORS = ['#33d7d1', '#a855f7', '#f59e0b', '#3b82f6', '#ef4444', '#10b981'];

// ─── PieChart Component ───────────────────────────────────────────────────────
const PieChart = ({ data, valueKey }: { data: any[], valueKey: string }) => {
  const total = data.reduce((acc, item) => acc + (item[valueKey] || 0), 0);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number, radius = 50) {
    const x = 50 + radius * Math.cos(2 * Math.PI * percent);
    const y = 50 + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const hoveredItem = data.find(d => d.provinceId === hoveredId);
  const hoveredIndex = data.findIndex(d => d.provinceId === hoveredId);
  const hoveredColor = hoveredItem 
    ? (hoveredItem.color || PROVINCE_COLORS[hoveredItem.provinceId] || CHART_COLORS[hoveredIndex % CHART_COLORS.length]) 
    : '';

  return (
    <div 
      style={{ position: 'relative', width: '280px', height: '280px' }}
      onMouseMove={handleMouseMove}
    >
      <svg viewBox="-20 -20 140 140" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Background Track */}
        <circle cx="50" cy="50" r="42.5" fill="none" stroke="#f1f5f9" strokeWidth="15" />
        
        {data.map((item, index) => {
          const itemColor = item.color || PROVINCE_COLORS[item.provinceId] || CHART_COLORS[index % CHART_COLORS.length];
          const percent = total > 0 ? item[valueKey] / total : 0;
          if (percent === 0) return null;
          
          const startPercent = cumulativePercent;
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          cumulativePercent += percent;
          const endPercent = cumulativePercent;
          const [endX, endY] = getCoordinatesForPercent(endPercent);
          
          const largeArcFlag = percent > 0.5 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`,
            `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 50 50`,
          ].join(' ');

          const midPercent = startPercent + (percent / 2);
          const [p1X, p1Y] = getCoordinatesForPercent(midPercent, 45); 
          const [p2X, p2Y] = getCoordinatesForPercent(midPercent, 62); 
          
          const isRightSide = midPercent < 0.25 || midPercent > 0.75;
          const lineEndX = isRightSide ? p2X + 12 : p2X - 12;

          const angle = 2 * Math.PI * midPercent;
          const offsetX = Math.cos(angle) * 8;
          const offsetY = Math.sin(angle) * 8;

           const isHovered = hoveredId === item.provinceId;
           const isOtherHovered = hoveredId !== null && !isHovered;
 
           return (
             <motion.g 
               key={item.provinceId}
               onMouseEnter={() => setHoveredId(item.provinceId)}
               onMouseLeave={() => setHoveredId(null)}
              animate={{ 
                x: isHovered ? offsetX : 0, 
                y: isHovered ? offsetY : 0,
                opacity: isOtherHovered ? 0.3 : 1
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.path 
                d={pathData} 
                fill={itemColor} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ 
                  scale: 1.05,
                  filter: `brightness(1.2) drop-shadow(0 0 15px ${itemColor})`
                }}
                style={{ cursor: 'pointer', transformOrigin: '50% 50%' }}
              />
              <motion.polyline
                points={`${p1X},${p1Y} ${p2X},${p2Y} ${lineEndX},${p2Y}`}
                fill="none"
                stroke={itemColor}
                strokeWidth="0.8"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              />
              <motion.text
                x={lineEndX + (isRightSide ? 3 : -3)}
                y={p2Y}
                fill="#1e293b"
                fontSize="6.5"
                fontWeight="900"
                textAnchor={isRightSide ? "start" : "end"}
                dominantBaseline="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                style={{ transform: 'rotate(90deg)', transformOrigin: `${lineEndX}px ${p2Y}px` }}
              >
                {Math.round(percent * 100)}%
              </motion.text>
            </motion.g>
          );
        })}
        <circle cx="50" cy="50" r="35" fill="white" />
      </svg>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100px',
        pointerEvents: 'none'
      }}>
        <span style={{ 
          fontSize: '26px', 
          fontWeight: 900, 
          color: '#1e293b',
          lineHeight: 1,
          letterSpacing: '-1px'
        }}>
          {total.toLocaleString()}
        </span>
        <span style={{ 
          fontSize: '8px', 
          fontWeight: 800, 
          color: '#94a3b8', 
          marginTop: '6px', 
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Tổng lịch trình
        </span>
      </div>

      {/* Tooltip Overlay */}
      {hoveredItem && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            left: mousePos.x + 10,
            top: mousePos.y - 110,
            zIndex: 9999,
            pointerEvents: 'none',
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(4px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1.5px solid ${hoveredColor}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            minWidth: '160px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hoveredColor }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>{hoveredItem.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Giá trị:</span>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>{(hoveredItem[valueKey] || 0).toLocaleString()} lượt</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '4px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Tỷ lệ:</span>
            <span style={{ color: hoveredColor, fontWeight: 900, fontSize: '0.75rem' }}>
              {total > 0 ? Math.round(((hoveredItem[valueKey] || 0) / total) * 100) : 0}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const;

const DashboardView: React.FC = () => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: locations, loading: locLoading, error: locError, refetch: refetchLoc } = usePopularLocations();

  const dashboardError = statsError || locError;
  const handleRefresh = () => { refetchStats(); refetchLoc(); };

  return (
    <motion.div className={styles.contentArea} initial="hidden" animate="visible" variants={containerVariants}>
      {/* ─── Header ─────────────────────── */}
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Bảng điều khiển tổng quan</h2>
          <p>Theo dõi hiệu suất hệ thống và hoạt động người dùng theo thời gian thực</p>
        </div>
        <div className={styles.pageActions}>
          <div className={styles.datePickerBox}>
            <Calendar size={18} color="#94a3b8" />
            <span>30 ngày qua</span>
          </div>
          {/* <button className={styles.btnPrimary}>
            <Download size={17} weight="bold" />
            <span>Xuất báo cáo</span>
          </button> */}
        </div>
      </motion.div>

      {/* ─── Error Banner ────────────────── */}
      {dashboardError && <ErrorBanner message={dashboardError} onRetry={handleRefresh} />}

      {/* ─── Stats Grid ─────────────────── */}
      <motion.div variants={rowVariants} className={styles.statsGrid}>
        {statsLoading
          ? <SkeletonCards count={3} />
          : stats.map(stat => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              trendUp={stat.trendUp}
              icon={stat.icon as IconName}
              colorClass={stat.colorClass}
              footerText={stat.footerText}
            />
          ))
        }
      </motion.div>

      {/* ─── Charts Row ─────────────────── */}
      <motion.div variants={rowVariants} className={styles.chartsRow}>
        {/* Line Chart — static SVG */}

        {/* Popular Locations — Comparison Pie Charts */}
        <div className={styles.locationCard}>
          <div className={styles.locationCardHeader}>
            <div>
              <h3>Thống kê số lượng tạo lịch trình theo địa điểm</h3>
              <p>So sánh tỉ lệ tạo lịch trình giữa tuần này và tuần trước</p>
            </div>
            <div className={styles.legendContainer}>
              {locations.map(loc => (
                <div key={loc.provinceId} className={styles.legendItem}>
                  <div className={styles.legendInfo}>
                    <div className={styles.legendHeader}>
                      <span className={styles.legendName}>{loc.name}</span>
                      <span className={styles.legendPercent}>
                        {(() => {
                          const totalValue = locations.reduce((a, b) => a + (b.value || 0), 0);
                          return totalValue > 0 ? Math.round((loc.value || 0) / totalValue * 100) : 0;
                        })()}%
                      </span>
                    </div>
                    <span className={styles.legendDot} style={{ background: loc.color }}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {locLoading ? (
            <div className={styles.shimmerBox} style={{ height: '300px' }} />
          ) : (
            <div className={styles.chartsComparison}>
              <div className={styles.pieContainer}>
                <h4>Tuần này</h4>
                <div className={styles.svgWrapper}>
                  <PieChart data={locations} valueKey="value" />
                </div>
              </div>

              {/* Growth Indicator */}
              <div className={styles.growthIndicator}>
                {(() => {
                  const thisTotal = locations.reduce((a, b) => a + (b.value || 0), 0);
                  const lastTotal = locations.reduce((a, b) => a + (b.lastWeekValue || 0), 0);
                  const diff = thisTotal - lastTotal;
                  const pct = lastTotal > 0 ? (diff / lastTotal) * 100 : 0;
                  const isUp = pct >= 0;
                  
                  return (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                      className={`${styles.growthBadge} ${isUp ? styles.up : styles.down}`}
                    >
                      {isUp ? <Icons.ArrowUp weight="bold" /> : <Icons.ArrowDown weight="bold" />}
                      <span>{isUp ? '+' : ''}{pct.toFixed(1)}%</span>
                    </motion.div>
                  );
                })()}
                <div className={styles.growthLine} />
              </div>

              <div className={styles.pieContainer}>
                <h4>Tuần trước</h4>
                <div className={styles.svgWrapper}>
                  <PieChart data={locations} valueKey="lastWeekValue" />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardView;
