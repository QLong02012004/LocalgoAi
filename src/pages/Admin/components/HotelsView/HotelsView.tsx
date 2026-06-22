import React, { useState, useMemo } from "react";
import styles from "./HotelsView.module.scss";
import StatCard from "../StatCard/StatCard";
import {
  MapPin,
  Star,
  Pencil,
  Plus,
  CaretLeft,
  CaretRight,
  Trash,
  MagnifyingGlass,
  FileArrowDown,
  Eye,
  X,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  useHotels,
  deleteRecord,
  createRecord,
  updateRecord,
  type Hotel,
} from "../../hooks/useAdminData";
import { ErrorBanner, LoadingRows } from "../_shared/AdminFeedback";
import AddEditModal from "../_shared/AddEditModal";
import DetailModal from "../_shared/DetailModal";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import { toast } from "react-toastify";
import AddressDisplay from '../../../../components/Ui/AddressDisplay/AddressDisplay';

const PAGE_SIZE = 10;
const FETCH_SIZE = 1000;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

const HotelsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);
  const { data: hotels, pagination, loading, error, refetch } = useHotels();
  const [search, setSearch] = useState("");

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

  const [activeTab, setActiveTab] = useState<"all" | "ACTIVE" | "MAINTENANCE">(
    "ACTIVE",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Hotel | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);

  // ─── derived stats ───────────────────────────────────────────────────────────
  const totalActive = hotels.filter((h) => h.status === "ACTIVE").length;
  const totalClosed = hotels.filter((h) => h.status !== "ACTIVE").length;

  const filtered = useMemo(() => {
    let list = [...hotels];
    if (activeTab !== "all") {
      list = list.filter((h) => h.status === activeTab);
    }
    if (provinceId) {
      list = list.filter((h) => h.provinceId === provinceId);
    }
    return list;
  }, [hotels, activeTab, provinceId]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc muốn xóa khách sạn này không?")) return;
    try {
      const res = await deleteRecord("hotels", id);
      toast.success(res.message || "Đã xóa khách sạn");
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại!");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Tên khách sạn",
      "Vị trí",
      "Đánh giá",
      "Lượt reviews",
      "Loại hình",
      "Giá",
      "Trạng thái",
    ];
    const rows = filtered.map((h) => [
      h.id,
      `"${h.name}"`,
      `"${h.addressDetailed || h.location}"`,
      h.rating,
      h.reviewCount,
      `"${h.category || "N/A"}"`,
      `"${Number(h.averagePrice || 0).toLocaleString('vi-VN')} VNĐ"`,
      h.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `hotels_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (data: FormData | Record<string, unknown>) => {
    try {
      if (editingItem) {
        const res = await updateRecord("hotels", editingItem.id, data);
        toast.success(res.message || "Cập nhật khách sạn thành công");
      } else {
        const res = await createRecord("hotels", data);
        toast.success(res.message || "Thêm khách sạn thành công");
      }
      setIsModalOpen(false);
      setEditingItem(undefined);
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const categoryMap: Record<string, string> = {
    LUXURY: "Hạng sang",
    RESORT: "Nghỉ dưỡng",
    BOUTIQUE: "Độc đáo",
    BUDGET: "Bình dân",
    BUSINESS: "Công tác",
    HOMESTAY: "Homestay",
    VILLA: "Biệt thự",
  };

  return (
    <motion.div
      className={styles.contentArea}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={rowVariants} className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <h2>Quản lý Khách sạn</h2>
          <p>Theo dõi và quản lý toàn bộ cơ sở lưu trú trên hệ thống</p>
        </div>
        <div className={styles.pageActions}>
          <button
            className={styles.btnExport}
            onClick={handleExportCSV}
            title="Xuất CSV"
          >
            <FileArrowDown size={22} weight="bold" />
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setEditingItem(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} weight="bold" />
            <span>Thêm khách sạn</span>
          </button>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard
          label="TỔNG KHÁCH SẠN"
          value={
            loading ? "..." : String(pagination.totalElements || hotels.length)
          }
          trend="+12% tháng này"
          trendUp={true}
          icon="BedIcon"
          colorClass="bgBlue"
        />
        <StatCard
          label="HOẠT ĐỘNG"
          value={loading ? "..." : String(totalActive)}
          footerText="Đang vận hành"
          icon="CheckCircle"
          colorClass="bgEmerald"
        />
        <StatCard
          label="ĐÓNG CỬA"
          value={loading ? "..." : String(totalClosed)}
          trend="Tạm ngưng đón khách"
          trendUp={false}
          icon="XCircle"
          colorClass="bgAmber"
        />
        <StatCard
          label="YÊU CẦU MỚI"
          value="92"
          trend="Chờ phê duyệt"
          trendUp={true}
          icon="Storefront"
          colorClass="bgPurple"
        />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
            >
              Tất cả ({pagination.totalElements || hotels.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "ACTIVE" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("ACTIVE");
                setPage(1);
              }}
            >
              Đang hoạt động
            </button>
            <button
              className={`${styles.tab} ${activeTab === "MAINTENANCE" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("MAINTENANCE");
                setPage(1);
              }}
            >
              Bảo trì
            </button>
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
                placeholder="Tìm theo tên ..."
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
              <th className={styles.w60}>STT</th>
              <th>THÔNG TIN KHÁCH SẠN</th>
              <th>ĐỊA ĐIỂM</th>
              <th>ĐÁNH GIÁ</th>
              <th>PHONG CÁCH</th>
              <th>TRẠNG THÁI</th>
              <th className={styles.textRight}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={4} />
          ) : (
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`${styles.textCenter} ${styles.p40} ${styles.textSlate400} ${styles.fw600}`}
                  >
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              ) : (
                paged.map((hotel, idx) => (
                  <motion.tr key={hotel.id} variants={rowVariants} custom={idx}>
                    <td className={`${styles.fw600} ${styles.textSlate500}`}>
                      #{(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className={styles.infoCol}>
                        <div className={styles.imgWrapper}>
                          <img src={hotel.imageUrl} alt="" />
                          <span
                            className={styles.statusIndicator}
                            style={
                              {
                                "--bg-color":
                                  hotel.status === "ACTIVE" ? "#10b981" : "#ef4444",
                              } as React.CSSProperties
                            }
                          ></span>
                        </div>
                        <div className={styles.textInfo}>
                          <p>{hotel.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.locationCol}>
                        <MapPin size={16} color="#94a3b8" />
                        <span><AddressDisplay address={hotel.addressDetailed || hotel.location} /></span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.ratingCol}>
                        <Star size={16} weight="fill" color="#f59e0b" />
                        <span>{hotel.rating}</span>
                        <span>({hotel.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.bgPurple}`}>
                        {hotel.category && categoryMap[hotel.category]
                          ? categoryMap[hotel.category]
                          : hotel.category || "PHỔ THÔNG"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${hotel.status === "ACTIVE" ? styles.bgEmerald : styles.bgAmber}`}
                      >
                        <span
                          className={styles.dot}
                          style={
                            {
                              "--bg-color":
                                hotel.status === "ACTIVE" ? "#10b981" : "#ef4444",
                            } as React.CSSProperties
                          }
                        ></span>
                        {hotel.status === "ACTIVE" ? "HOẠT ĐỘNG" : "ĐÓNG CỬA"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.flexEnd}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setDetailId(hotel.id);
                            setIsDetailOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setEditingItem(hotel);
                            setIsModalOpen(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} weight="bold" />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(hotel.id)}
                          title="Xóa"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          )}
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <p className={styles.paginationInfo}>
            Hiển thị{" "}
            <span>
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{" "}
            của <span>{filtered.length}</span> kết quả
          </p>
          <div className={styles.paginationBtns}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
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
        type="hotel"
      />
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? "Cập nhật khách sạn" : "Thêm khách sạn mới"}
        type="hotel"
        initialData={editingItem}
      />
    </motion.div>
  );
};

export default HotelsView;
