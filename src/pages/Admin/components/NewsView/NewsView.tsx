import React, { useState, useMemo } from "react";
import styles from "../UsersView/UsersView.module.scss";
import StatCard from "../StatCard/StatCard";
import {
  Pencil,
  Trash,
  CaretLeft,
  CaretRight,
  FilePlus,
  Star,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  useNews,
  deleteRecord,
  updateRecord,
  createRecord,
  toggleNewsFeatured,
  type NewsItem,
} from "../../hooks/useAdminData";
import { ErrorBanner, LoadingRows } from "../_shared/AdminFeedback";
import AddEditModal from "../_shared/AddEditModal";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import * as Icons from "@phosphor-icons/react";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

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

const NewsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: news, pagination, loading, error, refetch } = useNews();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");

  const categoryOptions = [
    { value: "All", label: "Tất cả danh mục" },
    { value: "Điểm đến", label: "Điểm đến" },
    { value: "Ẩm thực", label: "Ẩm thực" },
    { value: "Mẹo du lịch", label: "Mẹo du lịch" },
    { value: "Sự kiện", label: "Sự kiện" },
  ];

  React.useEffect(() => {
    refetch(page - 1, PAGE_SIZE);
  }, [page]);

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case "Điểm đến":
        return styles.bgBlue;
      case "Ẩm thực":
        return styles.bgOrange;
      case "Mẹo du lịch":
        return styles.bgEmerald;
      case "Sự kiện":
        return styles.bgPurple;
      default:
        return styles.bgSlate;
    }
  };

  const filtered = useMemo(() => {
    let list = [...news];
    if (activeCategoryFilter !== "All") {
      list = list.filter((n) => n.category === activeCategoryFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.excerpt.toLowerCase().includes(s),
      );
    }
    return list;
  }, [news, activeCategoryFilter, search]);

  const totalPages = pagination.totalPages || 1;

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      const res = await deleteRecord("news", id);
      toast.success(res.message || "Xóa bài viết thành công!");
      refetch(page - 1, PAGE_SIZE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại!");
    }
  };

  const handleEdit = (item: NewsItem) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  const handleSave = async (formData: FormData | Record<string, unknown>) => {
    try {
      if (editItem) {
        const res = await updateRecord("news", editItem.id, formData);
        toast.success(res.message || "Cập nhật bài viết thành công!");
      } else {
        const res = await createRecord("news", formData);
        toast.success(res.message || "Thêm bài viết thành công!");
      }
      setIsEditOpen(false);
      setEditItem(undefined);
      refetch(page - 1, PAGE_SIZE);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await toggleNewsFeatured(id);
      toast.success("Cập nhật trạng thái nổi bật thành công!");
      refetch(page - 1, PAGE_SIZE);
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
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
          <h2>Quản lý Bài viết</h2>
          <p>
            Tạo và chỉnh sửa các tin tức, mẹo du lịch và cảm hứng cho người dùng
          </p>
        </div>
        <div className={styles.pageActions}>
          <button
            className={styles.btnPrimary}
            onClick={() => {
              setEditItem(undefined);
              setIsEditOpen(true);
            }}
            title="Viết bài mới"
          >
            <FilePlus size={18} weight="bold" />
            <span>Viết bài mới</span>
          </button>
        </div>
      </motion.div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => refetch(page - 1, PAGE_SIZE)}
        />
      )}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard
          label="TỔNG BÀI VIẾT"
          value={loading ? "..." : String(news.length)}
          icon="Article"
          colorClass="bgBlue"
        />
        <StatCard
          label="BÀI VIẾT NỔI BẬT"
          value={
            loading ? "..." : String(news.filter((n) => n.isFeatured).length)
          }
          icon="Star"
          colorClass="bgAmber"
        />
        <StatCard
          label="LƯỢT XEM THÁNG"
          value="4.2k"
          trend="+12%"
          trendUp={true}
          icon="Eye"
          colorClass="bgEmerald"
        />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Lọc bài viết:</span>
          <CustomDropdown
            options={categoryOptions}
            value={activeCategoryFilter}
            onChange={(val) => {
              setActiveCategoryFilter(val);
              setPage(1);
            }}
            placeholder="Chuyên mục"
            icon={<Icons.Tag size={18} weight="duotone" color="#0ea5e9" />}
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
              placeholder="Tìm theo tiêu đề ..."
              className={styles.adminSearchInput}
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.w60}>STT</th>
              <th>BÀI VIẾT</th>
              <th>CHUYÊN MỤC</th>
              <th>NGÀY ĐĂNG</th>
              <th className={styles.textCenter}>NỔI BẬT</th>
              <th className={styles.thActions}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Không tìm thấy bài viết nào
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <motion.tr key={item.id} variants={rowVariants} custom={idx}>
                    <td className={`${styles.fw600} ${styles.textSlate500}`}>
                      #{(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className={styles.infoCol}>
                        <img
                          src={item.image}
                          alt=""
                          className={styles.newsThumb}
                        />
                        <div className={styles.textInfo}>
                          <p className={styles.fw600}>{item.title}</p>
                          <span className={styles.readTime}>
                            {item.readTime && !isNaN(Number(item.readTime)) 
                              ? `${item.readTime} phút đọc` 
                              : item.readTime || "---"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${getCategoryStyle(item.category)}`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const dateVal = item.createdAt || item.date;
                        if (!dateVal) return "---";
                        if (Array.isArray(dateVal)) {
                          const [year, month, day] = dateVal;
                          return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                        }
                        const parsedDate = new Date(dateVal);
                        return !isNaN(parsedDate.getTime()) 
                          ? parsedDate.toLocaleDateString("vi-VN") 
                          : String(dateVal);
                      })()}
                    </td>
                    <td
                      className={`${styles.textCenter} ${styles.pointer}`}
                      onClick={() => handleToggleFeatured(item.id)}
                    >
                      {item.isFeatured ? (
                        <Star
                          size={20}
                          weight="fill"
                          className={`${styles.textAmber} ${styles.starIcon}`}
                        />
                      ) : (
                        <Star
                          size={20}
                          className={`${styles.textSlate400} ${styles.starIcon}`}
                        />
                      )}
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEdit(item)}
                          title="Chỉnh sửa"
                        >
                          <div className={styles.actionBtnIcon}>
                            {" "}
                            <Pencil size={17} />
                          </div>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(item.id)}
                          title="Xóa"
                        >
                          <div className={styles.actionBtnIcon}>
                            {" "}
                            <Trash size={17} />
                          </div>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          )}
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationBtns}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={styles.pageBtn}
                title="Trang trước"
              >
                <div className={styles.actionBtnIcon}>
                  {" "}
                  <CaretLeft size={16} />
                </div>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={styles.pageBtn}
                title="Trang sau"
              >
                <div className={styles.actionBtnIcon}>
                  {" "}
                  <CaretRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AddEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        title={editItem ? "Chỉnh sửa bài viết" : "Viết bài mới"}
        type="news"
        initialData={editItem}
      />
    </motion.div>
  );
};

export default NewsView;
