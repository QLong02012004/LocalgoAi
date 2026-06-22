import React, { useState, useMemo } from "react";
import styles from "../UsersView/UsersView.module.scss";
import StatCard from "../StatCard/StatCard";
import {
  CaretLeft,
  CaretRight,
  Star,
  MapPin,
  Lock,
  LockOpen,
  ShieldCheck,
  Eye,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  useAdminReviews,
  deleteRecord,
} from "../../hooks/useAdminData";
import * as adminService from "../../../../services/adminService";
import { ErrorBanner, LoadingRows } from "../_shared/AdminFeedback";
import DetailModal from "../_shared/DetailModal";
import ProtectedImage from "../../../../components/ProtectedImage/ProtectedImage";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import { Tag, Shield } from "@phosphor-icons/react";
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

const ReviewsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const {
    data: reviews,
    pagination,
    loading,
    error,
    refetch,
  } = useAdminReviews();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const typeOptions = [
    { value: "All", label: "Tất cả loại hình" },
    { value: "HOTEL", label: "Khách sạn" },
    { value: "RESTAURANT", label: "Nhà hàng" },
    { value: "ATTRACTION", label: "Địa điểm" },
    { value: "WEBSITE", label: "Website" },
    { value: "TRIP", label: "Chuyến đi" },
  ];

  const statusOptions = [
    { value: "All", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Đã duyệt (Active)" },
    { value: "HIDDEN", label: "Đã khóa (Hidden)" },
  ];

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      refetch(page - 1, PAGE_SIZE, search, typeFilter, statusFilter);
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [page, search, typeFilter, statusFilter]);

  // Remove client-side filter
  const items = reviews;

  const totalPages = pagination.totalPages || 1;



  const handleToggleVerify = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
      await adminService.updateReviewStatus(
        id,
        nextStatus as "ACTIVE" | "HIDDEN",
      );
      toast.success(
        nextStatus === "ACTIVE"
          ? "Đã duyệt đánh giá!"
          : "Đã gỡ trạng thái duyệt!",
      );
      refetch();
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleViewDetail = (id: string | number) => {
    setSelectedId(id);
    setIsDetailOpen(true);
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
          <h2>Quản lý Đánh giá</h2>
          <p>Theo dõi và quản lý các phản hồi từ người dùng về các địa điểm</p>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard
          label="TỔNG ĐÁNH GIÁ"
          value={
            loading ? "..." : String(pagination.totalElements || reviews.length)
          }
          icon="ChatCircleText"
          colorClass="bgBlue"
        />
        <StatCard
          label="ĐÁNH GIÁ 5 SAO"
          value={
            loading
              ? "..."
              : String(reviews.filter((r) => r.rating === 5).length)
          }
          icon="Star"
          colorClass="bgEmerald"
        />
        <StatCard
          label="CẦN XỬ LÝ"
          value="0"
          icon="ShieldWarning"
          colorClass="bgAmber"
        />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterRow}>
          <div className={styles.searchGroup}>
            <AdminSearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên người dùng ..."
              className={styles.adminSearchInput}
            />
          </div>
          <CustomDropdown
            options={typeOptions}
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            icon={<Tag size={18} weight="duotone" />}
            placeholder="Lọc theo loại"
            size="small"
            className={styles.filterDropdown}
          />

          <CustomDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            icon={<Shield size={18} weight="duotone" />}
            placeholder="Lọc trạng thái"
            size="small"
            className={styles.filterDropdown}
          />
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.w60}>STT</th>
              <th>NGƯỜI DÙNG</th>
              <th>DỊCH VỤ / TỈNH THÀNH</th>
              <th>ĐÁNH GIÁ</th>
              <th>TRẠNG THÁI</th>
              <th className={styles.thActions}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Không tìm thấy đánh giá nào
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <motion.tr key={item.id} variants={rowVariants} custom={idx}>
                    <td className={`${styles.fw600} ${styles.textSlate500}`}>
                      #{(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className={styles.infoCol}>
                        <ProtectedImage
                          src={item.userImage || ""}
                          fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName)}&background=random`}
                          alt=""
                          className={styles.userAvatarSmall}
                        />
                        <div className={styles.textInfo}>
                          <p className={styles.fw600}>{item.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.ratingFlex}>
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} size={14} weight="fill" />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.serviceCol}>
                        <p className={styles.serviceName}>
                          {item.nameService || "N/A"}
                        </p>
                        <p className={styles.serviceLoc}>
                          <MapPin
                            size={12}
                            weight="fill"
                            className={styles.textBlue}
                          />
                          {item.provinceName || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div
                        className={`${styles.statusBadge} ${item.status === "ACTIVE" ? styles.active : styles.hidden}`}
                      >
                        {item.status === "ACTIVE" ? (
                          <ShieldCheck size={14} weight="fill" />
                        ) : (
                          <Lock size={14} weight="fill" />
                        )}
                        <span>
                          {item.status === "ACTIVE" ? "Đã duyệt" : "Đã khóa"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleViewDetail(item.id)}
                          title="Xem chi tiết"
                        >
                          <div className={styles.actionBtnIcon}>
                            <Eye size={17} />
                          </div>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${item.status === "ACTIVE" ? styles.actionBtnWarning : styles.actionBtnSuccess}`}
                          onClick={() =>
                            handleToggleVerify(item.id, item.status)
                          }
                          title={
                            item.status === "ACTIVE"
                              ? "Khóa đánh giá"
                              : "Duyệt đánh giá"
                          }
                        >
                          {item.status === "ACTIVE" ? (
                            <div className={styles.actionBtnIcon}>
                              <LockOpen size={17} />
                            </div>
                          ) : (
                            <div className={styles.actionBtnIcon}>
                              <ShieldCheck size={17} />
                            </div>
                          )}
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
                  <CaretRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedId(null);
        }}
        id={selectedId}
        type="review"
      />
    </motion.div>
  );
};

export default ReviewsView;
