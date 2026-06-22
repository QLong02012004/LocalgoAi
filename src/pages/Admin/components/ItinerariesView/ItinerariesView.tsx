import React, { useState, useMemo } from 'react';
import styles from './ItinerariesView.module.scss';
import StatCard from '../StatCard/StatCard';
import { motion } from 'framer-motion';
import { useAdminItineraries, deleteRecord, type AdminItinerary } from '../../hooks/useAdminData';
import { ErrorBanner, LoadingRows } from '../_shared/AdminFeedback';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../hooks/useAdminData';
import * as Icons from "@phosphor-icons/react";
import AddEditModal from '../_shared/AddEditModal'; 
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";

const PAGE_SIZE = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const;

const ItinerariesView: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedItineraryId, setSelectedItineraryId] = useState<number | null>(null);
  const { data: itineraries, pagination, loading, error, refetch } = useAdminItineraries();
  const { data: detailData, loading: detailLoading } = adminService.useAdminItineraryDetail(selectedItineraryId);
  
  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const confirmMsg = currentStatus === 'PUBLISHED' 
      ? 'Bạn có chắc muốn gỡ lộ trình này xuống bản nháp?' 
      : 'Bạn có chắc muốn công khai lộ trình này?';
      
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await adminService.updateItineraryStatus(id, newStatus);
      toast.success(newStatus === 'PUBLISHED' ? 'Đã công khai lộ trình!' : 'Đã chuyển về bản nháp');
      refetch(page - 1, PAGE_SIZE, debouncedSearch, activeTab);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeTab, setActiveTab] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);

  const provinceOptions = [
    { value: "", label: "Tất cả tỉnh thành" },
    { value: "1", label: "Thừa Thiên Huế" },
    { value: "2", label: "Đà Nẵng" },
    { value: "3", label: "Quảng Nam" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "PUBLISHED", label: "Công khai" },
    { value: "DRAFT", label: "Bản nháp" },
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    refetch(page - 1, PAGE_SIZE, debouncedSearch, activeTab, provinceId);
  }, [page, debouncedSearch, activeTab, provinceId]);

  const stats = useMemo(() => {
    const total = itineraries.length;
    const published = itineraries.filter(i => i.status === 'PUBLISHED').length;
    const draft = itineraries.filter(i => i.status === 'DRAFT').length;
    return { total, published, draft };
  }, [itineraries]);

  const filtered = useMemo(() => {
    return itineraries.filter(iti => {
      // 1. Lọc theo trạng thái (activeTab)
      const matchesStatus = activeTab === 'all' || iti.status === activeTab;
      
      // 2. Lọc theo tỉnh thành (provinceId)
      const getProvinceNameById = (id: number) => {
        if (id === 1) return "Huế";
        if (id === 2) return "Đà Nẵng";
        if (id === 3) return "Quảng Nam";
        return "";
      };
      
      const provinceNameKeyword = provinceId ? getProvinceNameById(provinceId) : "";
      const matchesProvince = !provinceId || 
        (iti.provinceId === provinceId) || 
        (iti.provinceName && iti.provinceName.toLowerCase().includes(provinceNameKeyword.toLowerCase()));
        
      return matchesStatus && matchesProvince;
    });
  }, [itineraries, activeTab, provinceId]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Bạn có chắc muốn xóa lộ trình này không?')) return;
    try {
      const res = await deleteRecord('itineraries', id);
      toast.success(res.message || 'Đã xóa lộ trình thành công');
      refetch(page - 1, PAGE_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Tiêu đề', 'Người dùng', 'Tỉnh thành', 'Số ngày', 'Ngân sách', 'Trạng thái', 'Ngày tạo'];
    const rows = filtered.map(i => [
      i.itineraryId,
      `"${i.title}"`,
      `"${i.userName || i.userId}"`,
      `"${i.provinceName}"`,
      i.days,
      `"${i.totalEstimatedCost}"`,
      i.status,
      i.createdAt
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `itineraries_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <motion.div className={styles.contentArea} initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Quản lý Lộ trình</h2>
          <p>Theo dõi và quản lý các lịch trình du lịch được tạo bởi AI và người dùng</p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.btnExport} onClick={handleExportCSV} title="Xuất CSV">
            <Icons.FileArrowDown size={22} weight="bold" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard 
          label="TỔNG LỘ TRÌNH" 
          value={loading ? '...' : String(pagination.totalElements || itineraries.length)} 
          trend="+12% tuần này" 
          trendUp={true} 
          icon="Signpost" 
          colorClass="bgBlue" 
          onClick={() => { setActiveTab('all'); setPage(1); }}
          isActive={activeTab === 'all'}
          showSparkline
        />
        <StatCard 
          label="ĐÃ XUẤT BẢN" 
          value={loading ? '...' : String(stats.published)} 
          footerText="Hiển thị công khai" 
          icon="Globe" 
          colorClass="bgEmerald" 
          trendUp={true}
          onClick={() => { setActiveTab('PUBLISHED'); setPage(1); }}
          isActive={activeTab === 'PUBLISHED'}
          showSparkline
        />
        <StatCard 
          label="BẢN NHÁP" 
          value={loading ? '...' : String(stats.draft)} 
          footerText="Chờ hoàn thiện" 
          icon="FileText" 
          colorClass="bgAmber" 
          trendUp={false}
          onClick={() => { setActiveTab('DRAFT'); setPage(1); }}
          isActive={activeTab === 'DRAFT'}
          showSparkline
        />
        <StatCard 
          label="XU HƯỚNG" 
          value="Huế" 
          trend="Tỉnh được quan tâm" 
          trendUp={true} 
          icon="TrendUp" 
          colorClass="bgPurple" 
          showSparkline
        />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('all'); setPage(1); }}
            >Tất cả</button>
            <button
              className={`${styles.tab} ${activeTab === 'PUBLISHED' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('PUBLISHED'); setPage(1); }}
            >Công khai</button>
            <button
              className={`${styles.tab} ${activeTab === 'DRAFT' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('DRAFT'); setPage(1); }}
            >Bản nháp</button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Bộ lọc:</span>
          <CustomDropdown
            options={provinceOptions}
            value={String(provinceId || "")}
            onChange={(val) => {
              setProvinceId(val ? Number(val) : undefined);
              setPage(1);
            }}
            placeholder="Khu vực"
            icon={<Icons.MapPin size={18} weight="duotone" color="#0ea5e9" />}
            size="small"
            className={styles.filterDropdown}
          />
          <CustomDropdown
            options={statusOptions}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as 'all' | 'PUBLISHED' | 'DRAFT');
              setPage(1);
            }}
            placeholder="Trạng thái"
            icon={<Icons.Shield size={18} weight="duotone" color="#f59e0b" />}
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
              placeholder="Tìm theo tiêu đề..."
              className={styles.adminSearchInput}
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>LỘ TRÌNH</th>
              <th style={{ textAlign: 'center' }}>ĐIỂM ĐẾN</th>
              <th>VÙNG MIỀN</th>
              <th style={{ textAlign: 'right' }}>NGÂN SÁCH</th>
              <th style={{ textAlign: 'center' }}>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>Không tìm thấy lộ trình nào</td>
                </tr>
              ) : filtered.map((iti, idx) => (
                <motion.tr key={iti.itineraryId} variants={rowVariants}>
                  <td>
                    <div className={styles.itiInfo}>
                      <div className={styles.itiText}>
                        <p className={styles.itiTitle}>{iti.title}</p>
                        <div className={styles.itiMeta}>
                          <span>ID: {(page - 1) * PAGE_SIZE + idx + 1}</span>
                          <span className={styles.dot}>•</span>
                          <span>{iti.days} ngày</span>
                          {iti.startDate && (
                            <>
                              <span className={styles.dot}>•</span>
                              <span>{iti.startDate[2].toString().padStart(2, '0')}/{iti.startDate[1].toString().padStart(2, '0')}/{iti.startDate[0]}</span>
                            </>
                          )}
                        </div>
                        {iti.interests && iti.interests.length > 0 && (
                          <div className={styles.interestsList}>
                            {iti.interests.map((interest, idx) => (
                              <span key={idx} className={styles.interestMiniTag}>#{interest}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                      <div className={styles.activityCount}>
                        <span className={styles.countNum}>
                          {iti.itineraryDays?.reduce((acc: number, day: any) => acc + (day.activities?.length || 0), 0) || 0}
                        </span>
                        <span className={styles.countLabel}>điểm đến</span>
                      </div>
                    </td>
                  <td>
                    <span className={`${styles.regionTag} ${
                      iti.provinceName?.includes('Đà Nẵng') ? styles.tagBlue : 
                      iti.provinceName?.includes('Huế') ? styles.tagPurple : 
                      iti.provinceName?.includes('Hà Nội') ? styles.tagRed : 
                      styles.tagGray
                    }`}>
                      {iti.provinceName}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.budgetCol}>
                      <span>{Number(iti.totalEstimatedCost).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${iti.status === 'PUBLISHED' ? styles.bgEmerald : styles.bgAmber}`}>
                      {iti.status === 'PUBLISHED' ? 'CÔNG KHAI' : 'NHÁP'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCol}>
                      <button 
                        className={styles.actionBtn} 
                        title={iti.status === 'PUBLISHED' ? "Gỡ bài" : "Duyệt bài"}
                        onClick={() => handleUpdateStatus(iti.itineraryId, iti.status)}
                      >
                        {iti.status === 'PUBLISHED' ? (
                          <Icons.EyeSlash size={18} weight="bold" />
                        ) : (
                          <Icons.CloudArrowUp size={18} weight="bold" />
                        )}
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => setSelectedItineraryId(iti.itineraryId)}
                        title="Xem chi tiết Admin"
                      >
                        <Icons.Eye size={18} weight="bold" />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                        onClick={() => handleDelete(iti.itineraryId)}
                        title="Xóa lộ trình"
                      >
                        <Icons.Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          )}
        </table>

        <div className={styles.pagination}>
          <p className={styles.paginationInfo}>
            Tổng cộng <span>{pagination.totalElements || filtered.length}</span> lộ trình
          </p>
          <div className={styles.paginationBtns}>
             <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
               <Icons.CaretLeft size={16} weight="bold" />
             </button>
             
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
               <button 
                 key={pageNum}
                 className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                 onClick={() => setPage(pageNum)}
               >
                 {pageNum}
               </button>
             ))}

             <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
               <Icons.CaretRight size={16} weight="bold" />
             </button>
          </div>
        </div>
      </motion.div>

      {/* Itinerary Detail Modal */}
      {selectedItineraryId && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItineraryId(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết lộ trình #{selectedItineraryId}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedItineraryId(null)}>
                <Icons.X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {detailLoading ? (
                <div className={styles.modalLoading}>
                  <div className={styles.spinner}></div>
                  <span>Đang truy xuất dữ liệu...</span>
                </div>
              ) : detailData ? (
                <div className={styles.detailContainer}>
                  <div className={styles.detailGrid}>
                    {/* Left Column: Info Card */}
                    <div className={styles.infoCard}>
                      <div className={styles.cardHeader}>
                        <Icons.Info size={20} weight="bold" />
                        <h4>THÔNG TIN CHUNG</h4>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Tiêu đề:</span>
                          <span className={styles.value}>{detailData.title}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Tỉnh thành:</span>
                          <span className={styles.value}>{detailData.provinceName}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Thời gian:</span>
                          <span className={styles.value}>{detailData.days} ngày</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Ngân sách:</span>
                          <span className={styles.valueHighlight}>{Number(detailData.budget).toLocaleString()}đ</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Trạng thái:</span>
                          <span className={`${styles.statusBadge} ${detailData.status === 'PUBLISHED' ? styles.statusPublic : styles.statusDraft}`}>
                            {detailData.status === 'PUBLISHED' ? 'Công khai' : 'Bản nháp'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column: Cost Card */}
                    <div className={styles.infoCard}>
                      <div className={styles.cardHeader}>
                        <Icons.Wallet size={20} weight="bold" />
                        <h4>PHÂN BỔ CHI PHÍ</h4>
                      </div>
                      <div className={styles.cardContent}>
                        {detailData.costBreakdown ? (
                          <div className={styles.costList}>
                            <div className={styles.costItem}>
                              <div className={styles.costLabel}>
                                <Icons.Bed size={16} />
                                <span>Chỗ ở</span>
                              </div>
                              <span className={styles.costValue}>{detailData.costBreakdown.accommodation?.toLocaleString()}đ</span>
                            </div>
                            <div className={styles.costItem}>
                              <div className={styles.costLabel}>
                                <Icons.ForkKnife size={16} />
                                <span>Ăn uống</span>
                              </div>
                              <span className={styles.costValue}>{detailData.costBreakdown.food?.toLocaleString()}đ</span>
                            </div>
                            <div className={styles.costItem}>
                              <div className={styles.costLabel}>
                                <Icons.MapPin size={16} />
                                <span>Hoạt động</span>
                              </div>
                              <span className={styles.costValue}>{detailData.costBreakdown.activities?.toLocaleString()}đ</span>
                            </div>
                            <div className={`${styles.costItem} ${styles.totalCost}`}>
                              <span>Tổng ước tính</span>
                              <span>{detailData.totalEstimatedCost?.toLocaleString()}đ</span>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.noData}>Dữ liệu chi phí chưa được cập nhật</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Schedule */}
                  <div className={styles.scheduleSection}>
                    <div className={styles.cardHeader}>
                      <Icons.Calendar size={20} weight="bold" />
                      <h4>LỊCH TRÌNH CHI TIẾT</h4>
                    </div>
                    <div className={styles.timeline}>
                      {detailData.itineraryDays?.map(day => (
                        <div key={day.dayNumber} className={styles.timelineDay}>
                          <div className={styles.dayMarker}>
                            <div className={styles.dayBadge}>NGÀY {day.dayNumber}</div>
                            <h5 className={styles.dayTheme}>{day.theme || 'Khám phá tự do'}</h5>
                          </div>
                          
                          <div className={styles.activitiesContainer}>
                            {day.activities?.length > 0 ? (
                              day.activities.map((act: any, idx: number) => (
                                <div key={idx} className={styles.actTimelineItem}>
                                  <div className={styles.actTimeSlot}>
                                    <span className={styles.timeText}>
                                      {act.startTime ? `${act.startTime[0]}:${act.startTime[1].toString().padStart(2, '0')}` : '--:--'}
                                    </span>
                                    <div className={styles.timelineDot}></div>
                                  </div>
                                  
                                  <div className={`${styles.actCardNew} ${act.type === 'RESTAURANT' ? styles.actRestaurant : styles.actAttraction}`}>
                                    <div className={styles.actIcon}>
                                      {act.type === 'RESTAURANT' ? <Icons.ForkKnife size={18} /> : <Icons.MapPin size={18} />}
                                    </div>
                                    <div className={styles.actInfo}>
                                      <div className={styles.actHeader}>
                                        <span className={styles.actName}>{act.name}</span>
                                        <span className={styles.actTypeBadge}>{act.type}</span>
                                      </div>
                                      {act.estimatedPrice > 0 && (
                                        <div className={styles.actPriceTag}>
                                          <Icons.CurrencyCircleDollar size={14} />
                                          <span>Dự tính: {act.estimatedPrice?.toLocaleString()}đ</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className={styles.noActivities}>Chưa có kế hoạch cụ thể</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.modalError}>
                  <Icons.Warning size={40} />
                  <p>Không tìm thấy dữ liệu lộ trình này</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setSelectedItineraryId(null)}>Đóng</button>
              {detailData && (
                <button 
                  className={detailData.status === 'PUBLISHED' ? styles.btnDanger : styles.btnSuccess}
                  onClick={() => {
                    handleUpdateStatus(detailData.itineraryId, detailData.status);
                    setSelectedItineraryId(null);
                  }}
                >
                  {detailData.status === 'PUBLISHED' ? 'Gỡ bài' : 'Duyệt bài'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ItinerariesView;
