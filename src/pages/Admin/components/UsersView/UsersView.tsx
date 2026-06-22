import React, { useState, useMemo } from "react";
import styles from "./UsersView.module.scss";
import StatCard from "../StatCard/StatCard";
import {
  Envelope,
  Pencil,
  Trash,
  CheckCircle,
  Clock,
  UserPlus,
  CaretLeft,
  CaretRight,
  Eye,
  Lock,
  LockOpen,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import {
  useDbUsers,
  deleteRecord,
  updateRecord,
  createRecord,
  type DbUser,
} from "../../hooks/useAdminData";
import { ErrorBanner, LoadingRows } from "../_shared/AdminFeedback";
import DetailModal from "../_shared/DetailModal";
import AddEditModal from "../_shared/AddEditModal";
import AdminSearchInput from "../../../../components/Ui/AdminSearchInput/AdminSearchInput";
import CustomDropdown from "../../../../components/Ui/CustomDropdown/CustomDropdown";
import { UserList } from "@phosphor-icons/react";
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

const UsersView: React.FC = () => {
  const [page, setPage] = useState(1);
  const {
    data: users,
    pagination,
    loading,
    error,
    refetch,
    toggleUserStatus,
  } = useDbUsers();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<DbUser | undefined>(undefined);

  const [activeStatusFilter, setActiveStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [activeRoleFilter, setActiveRoleFilter] = useState<
    "All" | "ADMIN" | "USER"
  >("All");
  const [search, setSearch] = useState("");
  
  const roleOptions = [
    { value: "All", label: "Tất cả vai trò" },
    { value: "ADMIN", label: "Quản trị viên" },
    { value: "USER", label: "Người dùng" },
  ];

  // Gọi lại API khi trang, từ khóa tìm kiếm hoặc bộ lọc trạng thái thay đổi
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const isActive =
        activeStatusFilter === "Active"
          ? true
          : activeStatusFilter === "Inactive"
            ? false
            : undefined;
      refetch(page - 1, PAGE_SIZE, search, isActive);
    }, 400); // Debounce 400ms

    return () => clearTimeout(delayDebounceFn);
  }, [page, search, activeStatusFilter]);

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return styles.bgPurple;
      case "EDITOR":
        return styles.bgBlue;
      default:
        return styles.bgSlate;
    }
  };

  const getStatusStyle = (isActive: boolean) => {
    return isActive ? styles.bgEmerald : styles.bgAmber;
  };

  const StatusIcon = ({ isActive }: { isActive: boolean }) => {
    if (isActive) return <CheckCircle size={13} weight="fill" />;
    return <Clock size={13} weight="fill" />;
  };

  const getStatusLabel = (isActive: boolean) =>
    isActive ? "Hoạt động" : "Không hoạt động";

  // ─── Filtered (Chỉ lọc role local vì server-side search đã lo phần keyword) ───
  const filtered = useMemo(() => {
    let list = [...users];
    if (activeRoleFilter !== "All")
      list = list.filter((u) => u.roleName === activeRoleFilter);
    return list;
  }, [users, activeRoleFilter]);

  const totalPages = pagination.totalPages || 1;
  const paged = filtered;

  const handleDelete = async (id: string | number) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      const res = await deleteRecord("users", id);
      toast.success(res.message || "Đã xóa người dùng");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại!");
    }
  };

  const handleEdit = (user: DbUser) => {
    setEditUser(user);
    setIsEditOpen(true);
  };

  const handleSaveUser = async (
    formData: FormData | Record<string, unknown>,
  ) => {
    try {
      if (editUser) {
        const res = await updateRecord("users", editUser.id, formData);
        toast.success(res.message || "Cập nhật người dùng thành công!");
      } else {
        const res = await createRecord("users", formData);
        toast.success(res.message || "Thêm người dùng thành công!");
      }
      setIsEditOpen(false);
      setEditUser(undefined);
      refetch();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.EM ||
        "Thao tác thất bại!";
      toast.error(errorMsg);
    }
  };

  const handleToggleStatus = async (user: DbUser) => {
    try {
      const confirmMsg = user.isActive
        ? `Bạn có chắc muốn khóa tài khoản của ${user.fullName}?`
        : `Bạn có chắc muốn mở khóa tài khoản cho ${user.fullName}?`;

      if (window.confirm(confirmMsg)) {
        await toggleUserStatus(user.id, user.isActive);
        toast.success(`${user.isActive ? "Khóa" : "Mở khóa"} thành công!`);
        refetch();
      }
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string; EM?: string } };
      };
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.EM ||
        "Thao tác thất bại!";
      toast.error(errorMsg);
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
          <h2>Quản lý Người dùng</h2>
          <p>
            Xem và quản lý tài khoản người dùng trên toàn hệ thống Travel AI
          </p>
        </div>
        <div className={styles.pageActions}>
          <button
            className={styles.btnPrimary}
            title="Thêm người dùng mới"
            onClick={() => {
              setEditUser(undefined);
              setIsEditOpen(true);
            }}
          >
            <UserPlus size={18} weight="bold" />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <motion.div variants={rowVariants} className={styles.statsGrid}>
        <StatCard
          label="TỔNG NGƯỜI DÙNG"
          value={loading ? "..." : String(users.length)}
          trend="+156 tuần này"
          trendUp={true}
          icon="Users"
          colorClass="bgBlue"
        />
        <StatCard
          label="ĐANG HOẠT ĐỘNG"
          value={
            loading ? "..." : String(users.filter((u) => u.isActive).length)
          }
          footerText="Trong 30 ngày qua"
          icon="UserCheck"
          colorClass="bgEmerald"
        />
        <StatCard
          label="YÊU CẦU DUYỆT"
          value="12"
          trend="Chờ xử lý"
          trendUp={true}
          icon="ClockCounterClockwise"
          colorClass="bgAmber"
        />
        <StatCard
          label="KHÔNG HOẠT ĐỘNG"
          value={
            loading ? "..." : String(users.filter((u) => !u.isActive).length)
          }
          trend="-4% tháng trước"
          trendUp={false}
          icon="ShieldWarning"
          colorClass="bgPurple"
        />
      </motion.div>

      <motion.div variants={rowVariants} className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tab} ${activeStatusFilter === "All" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveStatusFilter("All");
                setPage(1);
              }}
            >
              Tất cả
            </button>
            <button
              className={`${styles.tab} ${activeStatusFilter === "Active" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveStatusFilter("Active");
                setPage(1);
              }}
            >
              Đang hoạt động
            </button>
            <button
              className={`${styles.tab} ${activeStatusFilter === "Inactive" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveStatusFilter("Inactive");
                setPage(1);
              }}
            >
              Ngừng hoạt động
            </button>
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Lọc theo vai trò:</span>
          <CustomDropdown
            options={roleOptions}
            value={activeRoleFilter}
            onChange={(val) => {
              setActiveRoleFilter(val as "All" | "ADMIN" | "USER");
              setPage(1);
            }}
            icon={<UserList size={18} weight="duotone" />}
            placeholder="Lọc vai trò"
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
              placeholder="Tìm theo tên hoặc địa chỉ email..."
              className={styles.adminSearchInput}
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={rowVariants} className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Danh sách người dùng</h3>
          <button
            className={styles.tableAction}
            title="Xuất danh sách người dùng"
          >
            Xuất danh sách
          </button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.w60}>STT</th>
              <th>NGƯỜI DÙNG</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY THAM GIA</th>
              <th className={styles.thActions}>THAO TÁC</th>
            </tr>
          </thead>
          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    Không tìm thấy người dùng phù hợp
                  </td>
                </tr>
              ) : (
                paged.map((user, idx) => (
                  <motion.tr key={user.id} variants={rowVariants} custom={idx}>
                    <td className={`${styles.fw600} ${styles.textSlate500}`}>
                      #{(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td>
                      <div className={styles.infoCol}>
                        <img
                          src={
                            user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`
                          }
                          alt=""
                        />
                        <div className={styles.textInfo}>
                          <p>{user.fullName}</p>
                          <div className={styles.emailBox}>
                            <Envelope size={12} color="#cbd5e1" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${getRoleStyle(user.roleName)}`}
                      >
                        {user.roleName}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${getStatusStyle(user.isActive)}`}
                      >
                        <StatusIcon isActive={user.isActive} />
                        {getStatusLabel(user.isActive)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateCol}>
                        <p>
                          {(() => {
                             const dateVal = user.createdAt;
                             if (Array.isArray(dateVal)) {
                               const [year, month, day] = dateVal;
                               return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                             }
                             return new Date(dateVal).toLocaleDateString(
                              "vi-VN",
                              { day: "2-digit", month: "2-digit", year: "numeric" },
                            );
                          })()}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => {
                            setDetailId(user.id);
                            setIsDetailOpen(true);
                          }}
                          title="Xem chi tiết"
                        >
                          <div className={styles.actionBtnIcon}>
                            <Eye size={17} />
                          </div>
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleEdit(user)}
                          title="Chỉnh sửa người dùng"
                        >
                          <div className={styles.actionBtnIcon}>
                            <Pencil size={17} />
                          </div>
                        </button>
                        <button
                          className={styles.actionBtn}
                          title={
                            user.isActive
                              ? "Khóa người dùng"
                              : "Mở khóa người dùng"
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          <div className={styles.actionBtnIcon}>
                            {user.isActive ? (
                              <Lock size={18} weight="bold" color="#f43f5e" />
                            ) : (
                              <LockOpen
                                size={18}
                                weight="bold"
                                color="#10b981"
                              />
                            )}
                          </div>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(user.id)}
                          title="Xóa người dùng"
                        >
                          <div className={styles.actionBtnIcon}>
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

        {/* Pagination */}
        <div className={styles.pagination}>
          <p className={styles.paginationInfo}>
            Hiển thị{" "}
            <span>
              {Math.min((page - 1) * PAGE_SIZE + 1, pagination.totalElements)}–
              {Math.min(page * PAGE_SIZE, pagination.totalElements)}
            </span>{" "}
            của <span>{pagination.totalElements}</span> người dùng
          </p>
          <div className={styles.paginationBtns}>
            <button
              className={styles.pageBtn}
              title="Trang trước"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
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
              className={styles.pageBtn}
              title="Trang tiếp theo"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <div className={styles.actionBtnIcon}>
                <CaretRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        id={detailId}
        type="user"
      />
      <AddEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveUser}
        title={editUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        type="user"
        initialData={editUser}
      />
    </motion.div>
  );
};

export default UsersView;
