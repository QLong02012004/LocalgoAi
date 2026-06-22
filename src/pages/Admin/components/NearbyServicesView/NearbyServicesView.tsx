import React, { useState, useMemo } from 'react';
import styles from './NearbyServicesView.module.scss';
import StatCard from '../StatCard/StatCard';
import { MapPin, Star, Pencil, Plus, CaretLeft, CaretRight, Trash, MagnifyingGlass, FileArrowDown, Eye, X, NavigationArrow, Clock, Phone, CurrencyCircleDollar, Info } from "@phosphor-icons/react";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNearbyServices, deleteRecord, type AdminNearbyService } from '../../hooks/useAdminData';
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";


const PAGE_SIZE = 8;

const SERVICE_TYPE_MAP: Record<string, { label: string; colorClass: string }> = {
  ALL: { label: "Tất cả", colorClass: "bgBlue" },
  RESTAURANT: { label: "Nhà hàng", colorClass: "bgOrange" },
  CAFE: { label: "Quán cà phê", colorClass: "bgAmber" },
  HOTEL: { label: "Khách sạn", colorClass: "bgBlue" },
  PHARMACY: { label: "Nhà thuốc", colorClass: "bgEmerald" },
  HOSPITAL: { label: "Bệnh viện", colorClass: "bgRose" },
  ATM: { label: "ATM", colorClass: "bgCyan" },
  SHOP: { label: "Cửa hàng", colorClass: "bgPurple" },
  PARKING: { label: "Bãi đỗ xe", colorClass: "bgBlue" },
};

const SERVICE_TABS = ['ALL', 'RESTAURANT', 'CAFE', 'HOTEL', 'PHARMACY', 'HOSPITAL', 'ATM', 'SHOP', 'PARKING'] as const;

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } } as const;
const rowVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } } as const;

const NearbyServicesView: React.FC = () => {
  const { data: services, pagination, loading, error, refetch } = useNearbyServices();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [provinceId, setProvinceId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Detail modal
  const [detailItem, setDetailItem] = useState<AdminNearbyService | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  React.useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch when page or tab changes
  React.useEffect(() => {
    refetch(page - 1, PAGE_SIZE, activeTab);
  }, [page, activeTab, debouncedSearch]);

  // Client-side search filter on current page data
  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return services;
    const kw = debouncedSearch.toLowerCase();
    return services.filter(d =>
      d.serviceName?.toLowerCase().includes(kw) ||
      d.address?.toLowerCase().includes(kw)
    );
  }, [services, debouncedSearch]);

  const totalPages = pagination.totalPages || 1;

  // Stats from current page
  const totalActive = services.filter(d => d.status === 'ACTIVE').length;
  const totalMaintenance = services.filter(d => d.status !== 'ACTIVE').length;

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    try {
      await deleteRecord('nearby-services', id);
      toast.success('Đã xóa dịch vụ lân cận');
      refetch(page - 1, PAGE_SIZE, activeTab);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Xóa thất bại!";
      toast.error(errorMsg);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Tên dịch vụ', 'Loại', 'Địa chỉ', 'Đánh giá', 'Lượt đánh giá', 'Trạng thái'];
    const rows = filtered.map(d => [d.id, `"${d.serviceName}"`, d.serviceType, `"${d.address}"`, d.rating, d.reviewCount, d.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nearby_services_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <motion.div className={styles.contentArea} initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header */}
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Quản lý Dịch vụ Lân cận</h2>
          <p>Quản lý các dịch vụ khách sạn, nhà hàng, điểm tham quan gần địa điểm</p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.btnExport} onClick={handleExportCSV} title="Xuất CSV">
            <FileArrowDown size={22} weight="bold" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard label="TỔNG HIỂN THỊ" value={loading ? '...' : String(pagination.totalElements || services.length)} trend="Trang hiện tại" trendUp icon="MapTrifold" colorClass="bgBlue" />
        <StatCard label="HOẠT ĐỘNG" value={loading ? '...' : String(totalActive)} footerText="Đang phục vụ" icon="CheckCircle" colorClass="bgEmerald" />
        <StatCard label="KHÁC" value={loading ? '...' : String(totalMaintenance)} footerText="Tạm ngưng / Khác" icon="Wrench" colorClass="bgAmber" />
        <StatCard label="LOẠI HIỆN TẠI" value={SERVICE_TYPE_MAP[activeTab]?.label || activeTab} footerText="Đang lọc theo loại" icon="ForkKnife" colorClass="bgOrange" />
      </motion.div>

      {/* Filter */}
      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.tabGroup}>
          {SERVICE_TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab(tab); setPage(1); }}
            >
              {SERVICE_TYPE_MAP[tab]?.label || tab}
            </button>
          ))}
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Lọc theo khu vực:</span>
          <CustomDropdown
            options={[
              { value: "", label: "Tất cả tỉnh thành" },
              { value: "1", label: "Thừa Thiên Huế" },
              { value: "2", label: "Đà Nẵng" },
              { value: "3", label: "Quảng Nam" },
            ]}
            value={provinceId}
            onChange={(val) => {
              setProvinceId(val);
              setPage(1);
            }}
            placeholder="Chọn tỉnh thành..."
            icon={<MapPin size={20} weight="duotone" color="#0ea5e9" />}
            size="small"
            className={styles.filterDropdown}
          />
          <div className={styles.searchGroup}>
            <AdminSearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên dịch vụ hoặc địa điểm..."
              className={styles.adminSearchInput}
            />
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={rowVariants} style={{ padding: 20, background: '#fef2f2', borderRadius: 16, color: '#dc2626', fontWeight: 600 }}>
          {error} — <button onClick={() => refetch(page - 1, PAGE_SIZE, activeTab)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Thử lại</button>
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>STT</th>
              <th>DỊCH VỤ</th>
              <th>LOẠI</th>
              <th>ĐÁNH GIÁ</th>
              <th>GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} style={{ padding: 20 }}>
                    <div style={{ height: 20, background: '#f1f5f9', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: 600 }}>
                    Không tìm thấy dịch vụ nào
                  </td>
                </tr>
              ) : filtered.map((item, idx) => {
                const typeInfo = SERVICE_TYPE_MAP[item.serviceType] || { label: item.serviceType, colorClass: 'bgBlue' };
                return (
                  <motion.tr key={item.id} variants={rowVariants}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>
                      <div className={styles.infoCol}>
                        <div className={styles.imgWrapper}>
                          <img src={item.imageUrl || 'https://placehold.co/64x64?text=No+Img'} alt="" />
                          <span className={styles.statusIndicator} style={{ backgroundColor: item.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <div className={styles.textInfo}>
                          <p>{item.serviceName}</p>
                          <p>{item.address}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.serviceTypeBadge} ${styles[typeInfo.colorClass]}`}>{typeInfo.label}</span>
                    </td>
                    <td>
                      <div className={styles.ratingCol}>
                        <Star size={16} weight="fill" color="#f59e0b" />
                        <span>{item.rating}</span>
                        <span>({item.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.priceBadge}>{item.priceLevel || '—'}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${item.status === 'ACTIVE' ? styles.bgEmerald : styles.bgAmber}`}>
                        <span className={styles.dot} style={{ backgroundColor: item.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }} />
                        {item.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : item.status || 'KHÁC'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className={styles.actionBtn} onClick={() => setDetailItem(item)} title="Xem chi tiết">
                          <Eye size={18} weight="bold" />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(item.id)} title="Xóa">
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          )}
        </table>

        <div className={styles.pagination}>
          <p className={styles.paginationInfo}>
            Hiển thị <span>{Math.min((page - 1) * PAGE_SIZE + 1, pagination.totalElements || filtered.length)}–{Math.min(page * PAGE_SIZE, pagination.totalElements || filtered.length)}</span> của <span>{pagination.totalElements || filtered.length}</span> kết quả
          </p>
          <div className={styles.paginationBtns}>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <CaretLeft size={16} weight="bold" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 2) {
                if (p === 2 || p === totalPages - 1) return <span key={p} className={styles.dots}>...</span>;
                return null;
              }
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailItem(null)}>
            <motion.div className={styles.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className={styles.horizontalModalContent}>
                {/* Left Side: Visuals */}
                <div className={styles.modalLeftColumn}>
                  <div className={styles.modalHero}>
                    {detailItem.imageUrl && <img src={detailItem.imageUrl} alt="" className={styles.fullHeroImg} />}
                    <div className={styles.heroOverlay}>
                       <span className={`${styles.typeBadge} ${styles[SERVICE_TYPE_MAP[detailItem.serviceType]?.colorClass || 'bgBlue']}`}>
                          {SERVICE_TYPE_MAP[detailItem.serviceType]?.label || detailItem.serviceType}
                       </span>
                    </div>
                  </div>
                  
                  <div className={styles.mapSectionCard}>
                    <div className={styles.mapContainer}>
                        <iframe 
                          title="Google Map" 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(detailItem.location || (detailItem.latitude + "," + detailItem.longitude))}&z=15&output=embed`} 
                          allowFullScreen
                        ></iframe>
                    </div>
                    <div className={styles.mapActions}>
                        <div className={styles.distanceTag}><NavigationArrow size={14} weight="fill" /> <span>{detailItem.distanceKm} km</span></div>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(detailItem.location || (detailItem.latitude + "," + detailItem.longitude))}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className={styles.directionsBtn}
                        >
                          Chỉ đường
                        </a>
                    </div>
                  </div>
                </div>

                {/* Right Side: Information */}
                <div className={styles.modalRightColumn}>
                  <button className={styles.floatingCloseBtn} onClick={() => setDetailItem(null)}><X size={24} weight="bold" /></button>
                  
                  <div className={styles.detailHeaderInfo}>
                    <div className={styles.mainTitleGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <h2>{detailItem.serviceName}</h2>
                              <span className={`${styles.statusPulse} ${detailItem.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                                <span className={styles.pulseDot} />
                                {detailItem.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                              </span>
                          </div>
                          <div className={styles.ratingGroup}>
                              <Star size={20} weight="fill" color="#f59e0b" />
                              <span>{detailItem.rating}</span>
                          </div>
                        </div>
                        <p className={styles.headerAddress}>{detailItem.address}</p>
                    </div>
                  </div>

                  <div className={styles.detailInfoSection}>
                    <div className={styles.descBox}>
                        <label><Info size={16} /> Mô tả</label>
                        <p>{detailItem.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}</p>
                    </div>

                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><Phone size={20} weight="fill" color="#10b981" /></div>
                          <div className={styles.infoText}>
                              <label>Hotline</label>
                              <p>{detailItem.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><Clock size={20} weight="fill" color="#f59e0b" /></div>
                          <div className={styles.infoText}>
                              <label>Giờ hoạt động</label>
                              <p>{detailItem.openingHours || 'N/A'}</p>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div className={styles.infoIcon}><CurrencyCircleDollar size={20} weight="fill" color="#8b5cf6" /></div>
                          <div className={styles.infoText}>
                              <label>Mức giá</label>
                              <p>{detailItem.priceLevel}</p>
                          </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NearbyServicesView;
