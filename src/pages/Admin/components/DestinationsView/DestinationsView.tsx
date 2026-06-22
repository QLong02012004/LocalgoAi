import React, { useState, useMemo } from 'react';
import styles from './DestinationsView.module.scss';
import StatCard from '../StatCard/StatCard';
import { MapPin, Star, Pencil, Plus, CaretLeft, CaretRight, Trash, MagnifyingGlass, FileArrowDown, Eye, X } from "@phosphor-icons/react";
import { motion } from 'framer-motion';
import { useDestinations, deleteRecord, createRecord, updateRecord, type Destination } from '../../hooks/useAdminData';
import { ErrorBanner, LoadingRows } from '../_shared/AdminFeedback';
import AddEditModal from '../_shared/AddEditModal';
import DetailModal from '../_shared/DetailModal';
import CustomDropdown from '../../../../components/Ui/CustomDropdown/CustomDropdown';
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";
import { toast } from 'react-toastify';
import AddressDisplay from '../../../../components/Ui/AddressDisplay/AddressDisplay';

const PAGE_SIZE = 10;
const FETCH_SIZE = 1000;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const;

const DestinationsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);
  const { data: destinations, pagination, loading, error, refetch } = useDestinations();
  const [search, setSearch] = useState('');

  // Debounce search để tránh gọi API quá nhiều
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Gọi lại API khi search thay đổi - Lấy lượng lớn data để filter ở FE
  React.useEffect(() => {
    refetch(0, FETCH_SIZE, debouncedSearch);
  }, [debouncedSearch]);

  const [activeTab, setActiveTab] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Destination | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);

  // Stats
  const totalActive = destinations.filter(d => d.status === 'ACTIVE').length;
  const totalClosed = destinations.filter(d => d.status !== 'ACTIVE').length;

  // Filter & Pagination
  const filtered = useMemo(() => {
    let list = [...destinations];
    if (activeTab !== 'all') list = list.filter(d => d.status === activeTab);
    if (provinceId) {
      list = list.filter(d => d.provinceId === provinceId);
    }
    return list;
  }, [destinations, activeTab, provinceId]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const handleDelete = async (id: string | number) => {
    if (!confirm('Bạn có chắc muốn xóa địa điểm này không?')) return;
    try {
      const res = await deleteRecord('destinations', id);
      toast.success(res.message || 'Đã xóa địa điểm thành công');
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Tiêu đề', 'Vị trí', 'Đánh giá', 'Lượt reviews', 'Danh mục', 'Trạng thái'];
    const rows = filtered.map(d => [
      d.id,
      `"${d.name}"`,
      `"${d.addressDetailed || d.location}"`,
      d.rating,
      `"${d.reviewCount}"`,
      `"${d.category}"`,
      d.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `destinations_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (data: FormData | Record<string, unknown>) => {
    try {
      if (editingItem) {
        const res = await updateRecord('destinations', editingItem.id, data);
        toast.success(res.message || 'Cập nhật địa điểm thành công');
      } else {
        const res = await createRecord('destinations', data);
        toast.success(res.message || 'Thêm địa điểm mới thành công');
      }
      setIsModalOpen(false);
      setEditingItem(undefined);
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại!');
    }
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Destination) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const categoryMap: Record<string, string> = {
    'ATTRACTION': 'Điểm tham quan',
    'CULTURE': 'Văn hóa & Lịch sử',
    'NATURE': 'Thiên nhiên',
    'RELAX': 'Nghỉ dưỡng',
    'ENTERTAINMENT': 'Giải trí'
  };

  return (
    <motion.div className={styles.contentArea} initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Quản lý Địa điểm</h2>
          <p>Tùy chỉnh và cập nhật các điểm đến du lịch trên toàn lãnh thổ</p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.btnExport} onClick={handleExportCSV} title="Xuất CSV">
            <FileArrowDown size={22} weight="bold" />
          </button>
          <button className={styles.btnPrimary} onClick={openAddModal}>
            <Plus size={18} weight="bold" />
            <span>Thêm địa điểm</span>
          </button>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard label="TỔNG ĐIỂM ĐẾN" value={loading ? '...' : String(destinations.length)} trend="+5 tháng này" trendUp={true} icon="MapPin" colorClass="bgBlue" />
        <StatCard label="HOẠT ĐỘNG" value={loading ? '...' : String(totalActive)} footerText="Đang đón khách" icon="CheckCircle" colorClass="bgEmerald" />
        <StatCard label="ĐÓNG CỬA" value={loading ? '...' : String(totalClosed)} footerText="Tạm ngưng đón khách" icon="XCircle" colorClass="bgAmber" />
        <StatCard label="DI SẢN" value="8" trend="UNESCO công nhận" trendUp={true} icon="Buildings" colorClass="bgAmber" />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('all'); setPage(1); }}
            >Tất cả ({pagination.totalElements || destinations.length})</button>
            <button
              className={`${styles.tab} ${activeTab === 'ACTIVE' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('ACTIVE'); setPage(1); }}
            >Đang hoạt động</button>
            <button
              className={`${styles.tab} ${activeTab === 'INACTIVE' ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab('INACTIVE'); setPage(1); }}
            >Đóng cửa</button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Lọc theo khu vực:</span>
          <div className={styles.filterControls}>
            <div className={styles.dropdownWrapper}>
              <CustomDropdown
                options={[
                  { value: "", label: "Tất cả tỉnh thành" },
                  { value: "1", label: "Thừa Thiên Huế" },
                  { value: "2", label: "Đà Nẵng" },
                  { value: "3", label: "Quảng Nam" },
                ]}
                value={String(provinceId || "")}
                onChange={(val) => {
                  const numVal = val ? Number(val) : undefined;
                  setProvinceId(numVal);
                  setPage(1);
                }}
                placeholder="Chọn tỉnh thành..."
                icon={<MapPin size={20} weight="duotone" color="#0ea5e9" />}
              />
            </div>

            <div className={styles.searchGroup}>
              <AdminSearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm tên địa điểm "
                className={styles.adminSearchInput}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>STT</th>
              <th>THÔNG TIN ĐỊA ĐIỂM</th>
              <th>ĐỊA ĐIỂM</th>
              <th>ĐÁNH GIÁ</th>
              <th>PHONG CÁCH</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={4} />
          ) : (
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 600 }}>
                    Không tìm thấy địa điểm nào
                  </td>
                </tr>
              ) : paged.map((dest, idx) => (
                <motion.tr key={dest.id} variants={rowVariants} custom={idx}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>
                    #{(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td>
                    <div className={styles.infoCol}>
                      <div className={styles.imgWrapper}>
                        <img src={dest.imageUrl} alt="" />
                        <span 
                          className={styles.statusIndicator} 
                          style={{ backgroundColor: dest.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}
                        ></span>
                      </div>
                      <div className={styles.textInfo}>
                        <p>{dest.name}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.locationCol}>
                      <MapPin size={16} color="#94a3b8" />
                      <span><AddressDisplay address={dest.addressDetailed || dest.location} /></span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.ratingCol}>
                      <Star size={16} weight="fill" color="#f59e0b" />
                      <span>{dest.rating}</span>
                      <span>({dest.reviewCount})</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.bgPurple}`}>
                      {dest.category && categoryMap[dest.category] ? categoryMap[dest.category] : (dest.category || 'PHỔ THÔNG')}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${dest.status === 'ACTIVE' ? styles.bgEmerald : styles.bgAmber}`}>
                      <span className={styles.dot} style={{ backgroundColor: dest.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}></span>
                      {dest.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÓNG CỬA'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => { setDetailId(dest.id); setIsDetailOpen(true); }}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} weight="bold" />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => openEditModal(dest)}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} weight="bold" />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                        onClick={() => handleDelete(dest.id)}
                        title="Xóa"
                      >
                        <Trash size={18} weight="bold" />
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
            Hiển thị <span>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> của <span>{filtered.length}</span> kết quả
          </p>
          <div className={styles.paginationBtns}>
             <button 
               className={styles.pageBtn} 
               disabled={page === 1} 
               onClick={() => setPage(p => p - 1)}
               title="Trang trước"
             >
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

             <button 
               className={styles.pageBtn} 
               disabled={page === totalPages} 
               onClick={() => setPage(p => p + 1)}
               title="Trang sau"
             >
               <CaretRight size={16} weight="bold" />
             </button>
          </div>
        </div>
      </motion.div>

      <DetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        id={detailId} 
        type="destination" 
      />

      <AddEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        title={editingItem ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
        type="destination"
        initialData={editingItem}
      />
    </motion.div>
  );
};

export default DestinationsView;
