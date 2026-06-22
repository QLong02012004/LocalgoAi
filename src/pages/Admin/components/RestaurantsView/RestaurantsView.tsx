import React, { useState, useMemo } from "react";
import styles from "./RestaurantsView.module.scss";
import StatCard from "../StatCard/StatCard";
import {
  MapPin,
  Star,
  Pencil,
  Plus,
  MagnifyingGlass,
  Trash,
  CaretLeft,
  CaretRight,
  FileArrowDown,
  Eye,
  X,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  useRestaurants,
  deleteRecord,
  createRecord,
  updateRecord,
  type Restaurant,
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

const RestaurantsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);
  const {
    data: restaurants,
    pagination,
    loading,
    error,
    refetch,
  } = useRestaurants();

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

  const [activeTab, setActiveTab] = useState<"all" | "ACTIVE" | "CLOSED">(
    "ACTIVE",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Restaurant | undefined>(
    undefined,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);

  // ─── derived stats ──────────────────────────────────────────────────────────
  const totalOpen = restaurants.filter((r) => r.status === "ACTIVE").length;
  const totalClosed = restaurants.filter((r) => r.status !== "ACTIVE").length;

  // ─── filtered & paginated ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...restaurants];
    if (activeTab !== "all") list = list.filter((r) => r.status === activeTab);
    if (provinceId) {
      list = list.filter((r) => r.provinceId === provinceId);
    }
    return list;
  }, [restaurants, activeTab, provinceId]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc muốn xóa nhà hàng này không?")) return;
    try {
      const res = await deleteRecord("restaurants", id);
      toast.success(res.message || "Đã xóa nhà hàng");
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại!");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Tên nhà hàng",
      "Vị trí",
      "Đánh giá",
      "Lượt reviews",
      "Ẩm thực",
      "Khoảng giá",
      "Trạng thái",
    ];
    const rows = filtered.map((r) => [
      r.id,
      `"${r.name}"`,
      `"${r.addressDetailed || r.location}"`,
      r.rating,
      `"${r.reviewCount}"`,
      `"${r.category}"`,
      `"${Number(r.averagePrice || 0).toLocaleString('vi-VN')} VNĐ"`,
      r.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `restaurants_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (data: FormData | Record<string, unknown>) => {
    try {
      if (editingItem) {
        const res = await updateRecord("restaurants", editingItem.id, data);
        toast.success(res.message || "Cập nhật nhà hàng thành công");
      } else {
        const res = await createRecord("restaurants", data);
        toast.success(res.message || "Thêm nhà hàng thành công");
      }
      setIsModalOpen(false);
      setEditingItem(undefined);
      refetch(0, FETCH_SIZE, debouncedSearch);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Restaurant) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const categoryMap: Record<string, string> = {
    VIETNAMESE: "Món Việt",
    SEAFOOD: "Hải sản",
    DESSERT: "Tráng miệng",
    WESTERN: "Món Âu",
    ASIAN: "Món Á",
    VEGETARIAN: "Món chay",
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
          <h2>Quản lý Nhà hàng</h2>
          <p>
            Quản lý danh mục nhà hàng và địa điểm ẩm thực trên toàn hệ thống
          </p>
        </div>
        <div className={styles.pageActions}>
          <button
            className={styles.btnExport}
            onClick={handleExportCSV}
            title="Xuất CSV"
          >
            <FileArrowDown size={22} weight="bold" />
          </button>
          <button className={styles.btnPrimary} onClick={openAddModal}>
            <Plus size={18} weight="bold" />
            <span>Thêm nhà hàng</span>
          </button>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard
          label="TỔNG NHÀ HÀNG"
          value={loading ? "..." : String(restaurants.length)}
          trend="+8% tháng này"
          trendUp={true}
          icon="ForkKnife"
          colorClass="bgBlue"
        />
        <StatCard
          label="ĐANG HOẠT ĐỘNG"
          value={loading ? "..." : String(totalOpen)}
          footerText="Đang phục vụ"
          icon="CheckCircle"
          colorClass="bgEmerald"
        />
        <StatCard
          label="TẠM ĐÓNG"
          value={loading ? "..." : String(totalClosed)}
          trend="Theo dõi lịch"
          trendUp={true}
          icon="Storefront"
          colorClass="bgAmber"
        />
        <StatCard
          label="YÊU CẦU MỚI"
          value="156"
          trend="Chờ phê duyệt"
          trendUp={true}
          icon="PlusCircle"
          colorClass="bgBlue"
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
              Tất cả ({pagination.totalElements || restaurants.length})
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
              className={`${styles.tab} ${activeTab === "CLOSED" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("CLOSED");
                setPage(1);
              }}
            >
              Đóng cửa
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
              <th>THÔNG TIN NHÀ HÀNG</th>
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
                paged.map((res, idx) => (
                  <motion.tr key={res.id} variants={rowVariants} custom={idx}>
                    <td className={`${styles.fw600} ${styles.textSlate500}`}>
                      #{(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className={styles.infoCol}>
                        <div className={styles.imgWrapper}>
                          <img src={res.imageUrl} alt="" />
                          <span
                            className={styles.statusIndicator}
                            style={
                              {
                                "--bg-color":
                                  res.status === "ACTIVE" ? "#10b981" : "#ef4444",
                              } as React.CSSProperties
                            }
                          ></span>
                        </div>
                        <div className={styles.textInfo}>
                          <p>{res.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.locationCol}>
                        <MapPin size={16} color="#94a3b8" />
                        <span><AddressDisplay address={res.addressDetailed || res.location} /></span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.ratingCol}>
                        <Star size={16} weight="fill" color="#f59e0b" />
                        <span>{res.rating}</span>
                        <span>({res.reviewCount})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.bgPurple}`}>
                        {res.category && categoryMap[res.category]
                          ? categoryMap[res.category]
                          : res.category || "ẨM THỰC"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          res.status === "ACTIVE" ? styles.bgEmerald : styles.bgAmber
                        }`}
                      >
                        <span
                          className={styles.dot}
                          style={
                            {
                              "--bg-color":
                                res.status === "ACTIVE" ? "#10b981" : "#ef4444",
                            } as React.CSSProperties
                          }
                        ></span>
                        {res.status === "ACTIVE" ? "MỞ CỬA" : "ĐÓNG CỬA"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.flexEnd}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setDetailId(res.id);
                            setIsDetailOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <Eye size={18} weight="bold" />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEditModal(res)}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={18} weight="bold" />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(res.id)}
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
            
            {/* Render danh sách các số trang */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              // Chỉ hiển thị các trang gần trang hiện tại để tránh quá dài
              if (
                totalPages > 7 &&
                p !== 1 &&
                p !== totalPages &&
                Math.abs(p - page) > 2
              ) {
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
        type="restaurant"
      />
      <AddEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? "Cập nhật nhà hàng" : "Thêm nhà hàng mới"}
        type="restaurant"
        initialData={editingItem}
      />
    </motion.div>
  );
};

export default RestaurantsView;
