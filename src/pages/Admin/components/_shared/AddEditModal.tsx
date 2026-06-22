import React, { useState, useEffect, useRef, useCallback } from "react";

import styles from "./AddEditModal.module.scss";
import {
  X,
  Plus,
  Trash,
  Image as ImageIcon,
  InfoIcon,
  Cloud,
  Lightbulb,
  Airplane,
  Video,
  UploadSimple,
  House,
  Buildings,
  Tent,
  Storefront,
  ForkKnife,
  Fish,
  BowlFood,
  Coffee,
  Hamburger,
  Leaf,
  GlobeHemisphereWest,
  Mountains,
  Star,
  CheckCircle,
  Wrench,
  Clock,
  MapPin,
  Article,
} from "@phosphor-icons/react";
import CustomSelect from "./CustomSelect";
import { toast } from "react-toastify";
import { geocode } from "../../../../utils/mapUtils";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Hotel,
  Restaurant,
  Destination,
  DbUser,
  NewsItem,
} from "../../../../services/adminService";
import { 
  deleteHotelGalleryImage, 
  deleteRestaurantGalleryImage, 
  deleteAttractionGalleryImage 
} from "../../../../services/adminService";
type AdminEntity = Hotel | Restaurant | Destination | DbUser | NewsItem;

interface NormalizedData extends Record<string, unknown> {
  name?: string;
  title?: string;
  fullName?: string;
  imageUrl?: string;
  image?: string;
  img?: string;
  heroImage?: string;
  reviewCount?: number;
  rating?: number | string;
  reviews?: number | string;
  averagePrice?: number;
  priceRange?: string;
  price?: number | string;
  estimatedDuration?: number;
  duration?: number | string;
  time?: number | string;
  gallery?: string[];
  provinceId?: number | string;
  description?: string;
  location?: string;
  addressDetailed?: string;
  status?: string;
  category?: string;
  previewVideo?: string;
  email?: string;
  address?: string;
  phone?: string;
  bio?: string;
  roleId?: number | string;
  isEmailVerified?: boolean | string;
  isActive?: boolean | string;
  content?: string;
  excerpt?: string;
  readTime?: string;
  createdAt?: string;
  password?: string;
  isFeatured?: boolean | string;
}

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData | Record<string, unknown>) => void;
  title: string;
  type: "destination" | "hotel" | "restaurant" | "user" | "news";
  initialData?: AdminEntity;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  type,
  initialData,
}) => {
  // State để theo dõi prop thay đổi
  const [prevInitialData, setPrevInitialData] = useState<
    AdminEntity | undefined
  >(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Helper để lấy dữ liệu mặc định
  const getBaseData = useCallback(
    () => ({
      name: "",
      location: "",
      addressDetailed: "",
      provinceId: 1,
      status: "ACTIVE",
      rating: 5,
      reviews: "0",
      imageUrl: "",
      gallery: [],
      description: "",
      previewVideo: "",
      category:
        type === "hotel"
          ? "LUXURY"
          : type === "restaurant"
            ? "VIETNAMESE"
            : "ATTRACTION",
      price: type === "hotel" ? 0 : "",
      duration: type === "hotel" ? 1200 : "",
    }),
    [type],
  );

  // Helper để chuẩn hóa dữ liệu
  const getNormalizedData = useCallback(
    (initData: AdminEntity | undefined) => {
      if (!initData) return getBaseData();

      const data = initData as unknown as NormalizedData;
      
      // Helper để parse date từ string hoặc array [Y, M, D, H, m, s, n]
      const parseDate = (val: any) => {
        if (!val) return new Date().toISOString().split('T')[0];
        if (Array.isArray(val)) {
          const [year, month, day] = val;
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        try {
          const d = new Date(val);
          if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
        } catch (e) {}
        return new Date().toISOString().split('T')[0];
      };

      const unifiedData: Record<string, unknown> = {
        ...data,
        name: data.name || data.title || data.fullName || "",
        imageUrl: data.imageUrl || data.image || data.img || data.heroImage,
        reviews: data.reviewCount || data.reviews || 0,
        price: (data.averagePrice || data.priceRange || data.price || 0).toString().replace(/\D/g, ""),
        duration: data.estimatedDuration || data.time || 0,
        location: data.location || "",
        addressDetailed: data.addressDetailed || "",
        provinceId: data.provinceId || 1,
        status: data.status || "ACTIVE",
        category:
          data.category ||
          (type === "hotel"
            ? "LUXURY"
            : type === "restaurant"
              ? "VIETNAMESE"
              : "ATTRACTION"),
        email: data.email || "",
        fullName: data.fullName || "",
        address: data.address || "",
        phone: data.phone || "",
        bio: data.bio || "",
        roleId: data.roleId || 2,
        isEmailVerified: data.isEmailVerified ?? false,
        isActive: data.isActive ?? true,
        password: "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        description: data.description || "",
        isFeatured: data.isFeatured ?? false,
        readTime: data.readTime || "",
        createdAt: parseDate(data.createdAt),
      };
      return unifiedData;
    },
    [type, getBaseData],
  );

  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    getNormalizedData(initialData),
  );

  // Sync state khi mở modal hoặc đổi entity (Dùng useEffect thay vì render logic để tránh reset khi typing)
  // Sử dụng JSON.stringify để so sánh sâu initialData, tránh render lại khi reference thay đổi nhưng content giống nhau
  const initialDataStr = JSON.stringify(initialData);
  useEffect(() => {
    if (isOpen) {
      setFormData(getNormalizedData(initialData));
      // Reset file states to prevent data pollution between different items
      setMainImageFile(null);
      setTempGalleryFiles([]);
      
      // Cleanup previous preview URLs
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current = [];
    }
  }, [isOpen, initialDataStr, getNormalizedData]);
  // Cleanup ObjectURLs
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!fd.location || fd.location.length < 5) {
      toast.warn("Vui lòng nhập địa chỉ cụ thể để tìm tọa độ");
      return;
    }

    setIsGeocoding(true);
    try {
      // Tìm tên tỉnh từ provinceId
      const provinceName = provinceOptions.find(p => p.value === Number(fd.provinceId))?.label || "";
      
      const coords = await geocode(fd.location, provinceName);
      if (coords) {
        const coordString = `${coords.lat}, ${coords.lng}`;
        setFormData((prev) => ({ ...prev, location: coordString }));
        toast.success(`Đã tìm thấy tọa độ tại ${provinceName}: ${coordString}`);
      } else {
        toast.error(
          `Không tìm thấy tọa độ tại ${provinceName}. Vui lòng thử địa chỉ chi tiết hơn.`,
        );
      }
    } catch (error) {
      toast.error("Lỗi khi tìm tọa độ.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // State để lưu file thực tế trước khi gửi FormData
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [tempGalleryFiles, setTempGalleryFiles] = useState<{ file: File; url: string }[]>(
    [],
  );
  // Lưu trữ các ObjectURL để cleanup
  const previewUrls = useRef<string[]>([]);

  // Ép kiểu formData để sử dụng thuận tiện trong JSX
  const fd = formData as NormalizedData;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      // Lưu CHỈ số vào state, không lưu dấu chấm để tránh lỗi lặp số do IME/React sync
      let onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length > 1 && onlyNums.startsWith("0")) {
        onlyNums = onlyNums.replace(/^0+/, "");
      }
      setFormData((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => {
      const currentVal = prev[field];
      const safeArray = Array.isArray(currentVal)
        ? (currentVal as unknown[])
        : [];
      const newArray = [...safeArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: string, defaultValue: string | number = "") => {
    setFormData((prev) => {
      const currentVal = prev[field];
      const safeArray = Array.isArray(currentVal)
        ? (currentVal as unknown[])
        : [];
      return {
        ...prev,
        [field]: [...safeArray, defaultValue],
      };
    });
  };
  const removeArrayItem = async (field: string, index: number) => {
    const currentVal = formData[field];
    const safeArray = Array.isArray(currentVal) ? (currentVal as unknown[]) : [];
    const itemToRemove = safeArray[index];

    // Nếu xóa trong gallery và là ảnh blob (vừa upload), xóa khỏi hàng chờ tempGalleryFiles
    if (
      field === "gallery" &&
      typeof itemToRemove === "string" &&
      itemToRemove.startsWith("blob:")
    ) {
      setTempGalleryFiles((prevFiles) =>
        prevFiles.filter((f) => f.url !== itemToRemove),
      );
      URL.revokeObjectURL(itemToRemove);
    } else if (
      field === "gallery" &&
      (type === "destination" || type === "hotel" || type === "restaurant") &&
      initialData?.id &&
      typeof itemToRemove === "string" &&
      !itemToRemove.startsWith("blob:")
    ) {
      if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn ảnh này khỏi thư viện?")) {
        return;
      }

      try {
        let res;
        if (type === "destination") res = await deleteAttractionGalleryImage(initialData.id, index);
        else if (type === "hotel") res = await deleteHotelGalleryImage(initialData.id, index);
        else res = await deleteRestaurantGalleryImage(initialData.id, index);
        
        const resData = res.data;
        toast.success(resData.message || "Xóa ảnh gallery thành công");
        
        if (resData.data && Array.isArray(resData.data.gallery)) {
           const updatedGallery = resData.data.gallery;
           setFormData(prev => ({ ...prev, gallery: updatedGallery }));
           return;
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa ảnh gallery");
        return;
      }
    }

    setFormData((prev) => {
      const currentVal = prev[field];
      const safeArray = Array.isArray(currentVal)
        ? (currentVal as unknown[])
        : [];
      const newArray = [...safeArray];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "main" | "gallery",
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (
      type === "hotel" ||
      type === "restaurant" ||
      type === "destination" ||
      type === "news"
    ) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        return url;
      });

      if (field === "main") {
        setMainImageFile(newFiles[0]);
        setFormData((prev) => ({ ...prev, imageUrl: newPreviews[0] }));
      } else {
        const newGalleryEntries = newFiles.map((file, i) => ({
          file,
          url: newPreviews[i],
        }));
        setTempGalleryFiles((prev) => [...prev, ...newGalleryEntries]);
        setFormData((prev) => {
          const currentGallery = Array.isArray(prev.gallery)
            ? (prev.gallery as unknown[])
            : [];
          return {
            ...prev,
            gallery: [...currentGallery, ...newPreviews],
          };
        });
      }
      return;
    }
  };

  // Cleanup ObjectURLs khi đóng modal hoặc unmount
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current = [];
    };
  }, [isOpen]);

  const provinceOptions = [
    { value: 1, label: "Huế", icon: <MapPin size={18} /> },
    { value: 2, label: "Đà Nẵng", icon: <MapPin size={18} /> },
    { value: 3, label: "Quảng Nam", icon: <MapPin size={18} /> },
    { value: 4, label: "Hà Nội", icon: <MapPin size={18} /> },
    { value: 5, label: "TP. Hồ Chí Minh", icon: <MapPin size={18} /> },
  ];

  const getStatusOptions = () => {
    let inactiveValue = "INACTIVE";
    if (type === "restaurant") {
      inactiveValue = "CLOSED";
    } else if (type === "hotel") {
      inactiveValue = "MAINTENANCE";
    }

    return [
      {
        value: "ACTIVE",
        label: "Đang hoạt động (Active)",
        icon: <CheckCircle size={18} color="#10b981" />,
      },
      {
        value: inactiveValue,
        label: "Đang đóng cửa (Inactive/Closed)",
        icon: <X size={18} color="#f59e0b" />,
      },
    ];
  };

  const getCategoryOptions = () => {
    if (type === "hotel") {
      return [
        {
          value: "LUXURY",
          label: "Luxury (Hạng sang)",
          icon: <Buildings size={18} />,
        },
        {
          value: "RESORT",
          label: "Resort (Nghỉ dưỡng)",
          icon: <Mountains size={18} />,
        },
        {
          value: "BOUTIQUE",
          label: "Boutique (Độc đáo)",
          icon: <House size={18} />,
        },
        {
          value: "BUDGET",
          label: "Budget (Bình dân)",
          icon: <Storefront size={18} />,
        },
        {
          value: "BUSINESS",
          label: "Business (Công tác)",
          icon: <Buildings size={18} />,
        },
        { value: "HOMESTAY", label: "Homestay", icon: <Tent size={18} /> },
        {
          value: "VILLA",
          label: "Villa (Biệt thự)",
          icon: <House size={18} />,
        },
      ];
    } else if (type === "restaurant") {
      return [
        {
          value: "VIETNAMESE",
          label: "Món Việt (Vietnamese)",
          icon: <BowlFood size={18} />,
        },
        {
          value: "SEAFOOD",
          label: "Hải sản (Seafood)",
          icon: <Fish size={18} />,
        },
        {
          value: "DESSERT",
          label: "Tráng miệng/Cafe (Dessert)",
          icon: <Coffee size={18} />,
        },
        {
          value: "WESTERN",
          label: "Món Âu (Western)",
          icon: <Hamburger size={18} />,
        },
        {
          value: "ASIAN",
          label: "Món Á (Asian)",
          icon: <ForkKnife size={18} />,
        },
        {
          value: "VEGETARIAN",
          label: "Món chay (Vegetarian)",
          icon: <Leaf size={18} />,
        },
      ];
    } else {
      return [
        {
          value: "ATTRACTION",
          label: "Điểm tham quan",
          icon: <MapPin size={18} />,
        },
        {
          value: "CULTURE",
          label: "Văn hóa & Lịch sử",
          icon: <Buildings size={18} />,
        },
        {
          value: "NATURE",
          label: "Thiên nhiên & Sinh thái",
          icon: <Leaf size={18} />,
        },
        {
          value: "RELAX",
          label: "Nghỉ dưỡng & Thư giãn",
          icon: <Cloud size={18} />,
        },
        { value: "ENTERTAINMENT", label: "Giải trí", icon: <Star size={18} /> },
      ];
    }
  };

  const handleSaveInternal = () => {
    const finalData = { ...formData } as NormalizedData;

    // ─── VALIDATION ───
    if (type === "hotel" || type === "restaurant" || type === "destination") {
      const requiredFields = [
        { key: 'name', label: 'Tên/Tiêu đề' },
        { key: 'imageUrl', label: 'Hình ảnh đại diện' },
        { key: 'location', label: 'Tọa độ/Vị trí' },
        { key: 'addressDetailed', label: 'Địa chỉ chi tiết' },
        { key: 'description', label: 'Mô tả chi tiết' },
        { key: 'category', label: 'Danh mục/Loại hình' },
        { key: 'rating', label: 'Xếp hạng' },
        { key: 'reviews', label: 'Lượt đánh giá' },
        { key: 'price', label: 'Giá' },
        { key: 'duration', label: 'Thời gian' },
      ];

      for (const field of requiredFields) {
        const val = finalData[field.key];
        if (val === undefined || val === null || val === "" || (typeof val === 'number' && isNaN(val))) {
          toast.warn(`Vui lòng nhập trường: ${field.label}`);
          return;
        }
      }
    } else if (type === "user") {
      const requiredFields = [
        { key: 'fullName', label: 'Họ và tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại' },
        { key: 'address', label: 'Địa chỉ' },
      ];
      
      if (!initialData && !finalData.password) {
        requiredFields.push({ key: 'password', label: 'Mật khẩu' });
      }

      for (const field of requiredFields) {
        if (!finalData[field.key]) {
          toast.warn(`Vui lòng nhập trường: ${field.label}`);
          return;
        }
      }
    } else if (type === "news") {
      const requiredFields = [
        { key: 'name', label: 'Tiêu đề bài viết' },
        { key: 'imageUrl', label: 'Ảnh bìa' },
        { key: 'excerpt', label: 'Tóm tắt' },
        { key: 'content', label: 'Nội dung chi tiết' },
        { key: 'category', label: 'Chuyên mục' },
        { key: 'readTime', label: 'Thời gian đọc' },
      ];

      for (const field of requiredFields) {
        if (!finalData[field.key]) {
          toast.warn(`Vui lòng nhập trường: ${field.label}`);
          return;
        }
      }
    }

    // ─── DATA PREPARATION ───
    if (type === "hotel" || type === "restaurant" || type === "destination") {
      // 1. Chuẩn bị Metadata Key và Object
      const metadataKey =
        type === "hotel"
          ? "hotel"
          : type === "restaurant"
            ? "restaurant"
            : "attraction";

      const metadata: Partial<Hotel & Restaurant & Destination> = {
        name: finalData.name,
        description: finalData.description,
        location: finalData.location,
        addressDetailed: finalData.addressDetailed || "",
        rating: parseFloat(finalData.rating as string) || 5.0,
        reviewCount: parseInt(finalData.reviews as string) || 0,
        imageUrl: finalData.imageUrl,
        gallery: Array.isArray(finalData.gallery)
          ? finalData.gallery.filter(
              (url: unknown) =>
                typeof url === "string" && !url.startsWith("blob:"),
            )
          : [],
        previewVideo: finalData.previewVideo || null,
        category: finalData.category || null,
        status: finalData.status || "ACTIVE",
        averagePrice: parseInt((finalData.price as string || "0").replace(/\./g, "")) || 0,
        estimatedDuration: parseInt(finalData.duration as string) || 0,
        provinceId: parseInt(finalData.provinceId as string) || 1,
      };

      // 2. Tạo FormData theo cấu trúc Backend yêu cầu
      const fd = new FormData();
      const jsonBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      fd.append(metadataKey, jsonBlob);

      if (mainImageFile) {
        fd.append("imageFile", mainImageFile);
      }

      if (tempGalleryFiles.length > 0) {
        tempGalleryFiles.forEach((entry) => {
          fd.append("galleryFiles", entry.file);
        });
      }

      onSave(fd);
      return;
    }

    if (type === "user") {
      const userData: Record<string, any> = {
        email: finalData.email,
        fullName: finalData.fullName,
        address: finalData.address,
        phone: finalData.phone,
        bio: finalData.bio,
        roleId: parseInt(finalData.roleId as string) || 2,
        isEmailVerified:
          finalData.isEmailVerified === true ||
          finalData.isEmailVerified === "true",
      };

      // Chỉ gửi isActive nếu backend yêu cầu hoặc là đang tạo mới. 
      // User request body ví dụ không có isActive nên ta có thể bỏ qua để tránh conflict với logic /lock/unlock
      if (!initialData) {
        userData.password = finalData.password;
        userData.isActive = finalData.isActive === true || finalData.isActive === "true";
      }

      onSave(userData);
      return;
    }

    if (type === "news") {
      const newsData: Partial<NewsItem> = {
        title: finalData.name,
        excerpt: finalData.excerpt,
        content: finalData.content,
        // Bỏ qua image vì sẽ gửi qua imageFile. Có thể truyền imageUrl nếu không có file mới.
        // Nhưng backend thường không cần imageUrl nếu gửi file, hoặc chỉ gửi khi không có file.
        // Ta cứ giữ lại nếu backend cần, nhưng ở form-data sẽ không có imageFile nếu không upload
        category: finalData.category,
        readTime: finalData.readTime,
        createdAt: finalData.createdAt ? (finalData.createdAt.includes('T') ? finalData.createdAt : `${finalData.createdAt}T00:00:00`) : undefined,
        isFeatured:
          String(finalData.isFeatured) === "true",
      };

      const fd = new FormData();
      const jsonBlob = new Blob([JSON.stringify(newsData)], {
        type: "application/json",
      });
      fd.append("news", jsonBlob);

      if (mainImageFile) {
        fd.append("imageFile", mainImageFile);
      } else if (
        finalData.imageUrl &&
        typeof finalData.imageUrl === "string" &&
        !finalData.imageUrl.startsWith("blob:")
      ) {
        // Backend có thể không cần imageUrl, nhưng cứ thêm vào json nếu cần.
        // Ta đã có trong json blob ở trên (nhưng bỏ đi trong định nghĩa, nên add lại)
        newsData.image = finalData.imageUrl;
        // Phải cập nhật lại Blob vì đã thay đổi newsData
        const updatedJsonBlob = new Blob([JSON.stringify(newsData)], {
          type: "application/json",
        });
        fd.set("news", updatedJsonBlob);
      }

      onSave(fd);
      return;
    }

    onSave(finalData);
  };

  if (!isOpen) return null;

  // News Layout
  if (type === "news") {
    return (
      <AnimatePresence>
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className={styles.header}>
              <h3>{title}</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Đóng"
                title="Đóng"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className={styles.body}>
              <div className={styles.formGrid}>
                <div className={styles.sectionTitle}>
                  <InfoIcon size={18} weight="fill" /> Thông tin cơ bản
                </div>

                <div
                  className={`${styles.inputGroup} ${styles.fullWidth} ${styles.mb32}`}
                >
                  <div className={styles.mainImageHeader}>
                    <div className={styles.mainPreviewWrapper}>
                      {fd.imageUrl ? (
                        <img src={fd.imageUrl} alt="Preview" />
                      ) : (
                        <div className={styles.placeholderIcon}>
                          <ImageIcon size={48} weight="thin" />
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.uploadBtnOverlay}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadSimple size={20} weight="bold" />
                        <span>{fd.imageUrl ? "Đổi ảnh" : "Tải ảnh lên"}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "main")}
                      />
                    </div>
                    <div className={styles.imageMetaInfo}>
                      <label>Ảnh bìa bài viết (URL hoặc Tải lên)</label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={fd.imageUrl || ""}
                        onChange={handleChange}
                        placeholder="Dán URL hình ảnh tại đây hoặc nhấn nút Tải lên bên cạnh..."
                      />
                    </div>
                  </div>
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Tiêu đề bài viết</label>
                  <input
                    type="text"
                    name="name"
                    value={fd.name || ""}
                    onChange={handleChange}
                    placeholder="VD: 10 Địa điểm không thể bỏ qua tại Đà Nẵng..."
                    className={styles.titleInput}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label>Tóm tắt bài viết</label>
                  <textarea
                    name="excerpt"
                    value={fd.excerpt || ""}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                    className={styles.shortTextarea}
                  ></textarea>
                </div>

                <div className={styles.inputGroup}>
                  <CustomSelect
                    label="Chuyên mục"
                    options={[
                      {
                        value: "Điểm đến",
                        label: "Điểm đến",
                        icon: <MapPin size={18} />,
                      },
                      {
                        value: "Ẩm thực",
                        label: "Ẩm thực",
                        icon: <BowlFood size={18} />,
                      },
                      {
                        value: "Mẹo du lịch",
                        label: "Mẹo du lịch",
                        icon: <Airplane size={18} />,
                      },
                      {
                        value: "Sự kiện",
                        label: "Sự kiện",
                        icon: <Star size={18} />,
                      },
                    ]}
                    value={fd.category || "Điểm đến"}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, category: val }))
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Thời gian đọc (phút)</label>
                  <input
                    type="number"
                    name="readTime"
                    value={fd.readTime || ""}
                    onChange={handleChange}
                    placeholder="VD: 5"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Ngày đăng</label>
                  <input
                    type="date"
                    name="createdAt"
                    value={fd.createdAt || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <CustomSelect
                    label="Bài viết nổi bật"
                    options={[
                      {
                        value: true,
                        label: "Có, đặt làm nổi bật",
                        icon: <Star size={18} weight="fill" color="#f59e0b" />,
                      },
                      {
                        value: false,
                        label: "Không, bài viết thường",
                        icon: <Article size={18} />,
                      },
                    ]}
                    value={fd.isFeatured ?? false}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, isFeatured: val }))
                    }
                  />
                </div>

                <div className={styles.sectionTitle}>
                  <Article size={18} weight="fill" /> Nội dung chi tiết
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <textarea
                    name="content"
                    value={fd.content || ""}
                    onChange={handleChange}
                    placeholder="Viết nội dung HTML hoặc văn bản bài viết tại đây..."
                    className={styles.codeTextarea}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={styles.btnSave}
                onClick={handleSaveInternal}
              >
                Lưu bài viết
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={styles.header}>
            <h3>{title}</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
              title="Đóng"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.formGrid}>
              {type !== "user" ? (
                <>
                  <div className={styles.sectionTitle}>
                    <InfoIcon size={18} weight="fill" /> Thông tin cơ bản
                  </div>

                  <div
                    className={`${styles.inputGroup} ${styles.fullWidth} ${styles.mb32}`}
                  >
                    <div className={styles.mainImageHeader}>
                      <div className={styles.mainPreviewWrapper}>
                        {fd.imageUrl ? (
                          <img src={fd.imageUrl} alt="Preview" />
                        ) : (
                          <div className={styles.placeholderIcon}>
                            <ImageIcon size={48} weight="thin" />
                          </div>
                        )}
                        <button
                          type="button"
                          className={styles.uploadBtnOverlay}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadSimple size={20} weight="bold" />
                          <span>{fd.imageUrl ? "Đổi ảnh" : "Tải ảnh lên"}</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          hidden
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "main")}
                        />
                      </div>
                      <div className={styles.imageMetaInfo}>
                        <label>Hình ảnh đại diện (URL hoặc Tải lên)</label>
                        <input
                          type="text"
                          name="imageUrl"
                          value={fd.imageUrl || ""}
                          onChange={handleChange}
                          placeholder="Dán URL hình ảnh tại đây hoặc nhấn nút Tải lên bên cạnh..."
                        />
                        <div className={styles.statusBadges}>
                          <span className={styles.tipBadge}>
                            Chất lượng tốt nhất: 800x600px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>
                      Tên / Tiêu đề chính (
                      {type === "hotel"
                        ? "Khách sạn"
                        : type === "restaurant"
                          ? "Nhà hàng"
                          : "Địa điểm"}
                      )
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={fd.name || ""}
                      onChange={handleChange}
                      placeholder={`Nhập tên ${type === "hotel" ? "khách sạn" : type === "restaurant" ? "nhà hàng" : "địa điểm"}...`}
                      className={styles.titleInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label>Địa điểm / Vị trí</label>
                      <button 
                        type="button" 
                        onClick={handleGeocode}
                        disabled={isGeocoding}
                        style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: '#0ea5e9', 
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isGeocoding ? <div className={styles.spinnerSmall} style={{ width: '12px', height: '12px' }}></div> : <MapPin size={12} weight="fill" />}
                        {isGeocoding ? "Đang tìm..." : "Lấy tọa độ từ địa chỉ"}
                      </button>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={fd.location || ""}
                      onChange={handleChange}
                      placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh hoặc 16.05, 108.22"
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Địa chỉ chi tiết (addressDetailed)</label>
                    <input
                      type="text"
                      name="addressDetailed"
                      value={fd.addressDetailed || ""}
                      onChange={handleChange}
                      placeholder="VD: 68 Đường Phan Châu Trinh, Hải Châu, Đà Nẵng"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label="Tỉnh thành"
                      options={provinceOptions}
                      value={fd.provinceId || 1}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          provinceId: val,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label="Trạng thái hoạt động"
                      options={getStatusOptions()}
                      value={fd.status || ""}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, status: val }))
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Xếp hạng (Sao / Điểm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      name="rating"
                      value={fd.rating || ""}
                      onChange={handleChange}
                      placeholder="Ví dụ: 4.8"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Lượt đánh giá</label>
                    <input
                      type="number"
                      name="reviews"
                      value={fd.reviews || ""}
                      onChange={handleChange}
                      placeholder="Ví dụ: 1250"
                    />
                  </div>

                  <div className={styles.sectionTitle}>
                    <Lightbulb size={18} weight="fill" /> Thông tin bổ sung
                  </div>

                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label={
                        type === "restaurant"
                          ? "Loại hình ẩm thực"
                          : "Hạng mục / Danh mục"
                      }
                      options={getCategoryOptions()}
                      value={fd.category || ""}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, category: val }))
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      {type === "hotel"
                        ? "Giá trung bình (VNĐ/Đêm)"
                        : type === "restaurant"
                          ? "Khoảng giá (VNĐ)"
                          : "Giá vé tham quan (VNĐ)"}
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={String(fd.price || "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      onChange={handleChange}
                      placeholder="Ví dụ: 30.000"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      {type === "hotel"
                        ? "Thời gian trải nghiệm (phút)"
                        : "Thời gian tham quan ước tính (phút)"}
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={fd.duration || ""}
                      onChange={handleChange}
                      placeholder="Ví dụ: 120"
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Mô tả chi tiết</label>
                    <textarea
                      name="description"
                      value={fd.description || ""}
                      onChange={handleChange}
                      placeholder={`Nhập mô tả chi tiết về ${type === "hotel" ? "khách sạn" : type === "restaurant" ? "nhà hàng" : "địa điểm"} này...`}
                    ></textarea>
                  </div>

                  <div className={styles.sectionTitle}>
                    <ImageIcon size={18} weight="fill" /> Video & Thư viện ảnh
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>
                      <Video size={16} weight="fill" /> Video giới thiệu
                      (YouTube URL)
                    </label>
                    <input
                      type="text"
                      name="previewVideo"
                      value={fd.previewVideo || ""}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <div className={styles.galleryHeader}>
                      <div className={styles.galleryLabelWrapper}>
                        <label className={styles.m0}>
                          Thư viện hình ảnh (
                          {type === "hotel"
                            ? "khách sạn"
                            : type === "restaurant"
                              ? "nhà hàng"
                              : "địa điểm"}
                          )
                        </label>
                        <span className={styles.smallLabel}>
                          ({fd.gallery?.length || 0} ảnh)
                        </span>
                      </div>
                      <div className={styles.galleryActions}>
                        <button
                          type="button"
                          className={`${styles.addBtn} ${styles.uploadBtn}`}
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={false}
                        >
                          <UploadSimple size={14} weight="bold" /> Tải từ máy
                          tính
                        </button>
                        <button
                          type="button"
                          className={`${styles.addBtn} ${styles.addPathBtn}`}
                          onClick={() => addArrayItem("gallery")}
                        >
                          <Plus size={14} weight="bold" /> Thêm đường dẫn
                        </button>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={galleryInputRef}
                      hidden
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "gallery")}
                    />

                    <div className={styles.galleryManageList}>
                      {fd.gallery?.map((url: string, index: number) => (
                        <div
                          key={index}
                          className={`${styles.galleryInputRow} ${styles.galleryItemRow}`}
                        >
                          <div
                            className={`${styles.miniPreview} ${styles.thumbWrapper}`}
                          >
                            {url ? (
                              <img
                                src={url}
                                alt=""
                                className={styles.flex1}
                              />
                            ) : (
                              <ImageIcon
                                size={20}
                                weight="thin"
                                className={styles.m14}
                              />
                            )}
                          </div>
                          <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                              handleArrayChange(
                                "gallery",
                                index,
                                e.target.value,
                              )
                            }
                            placeholder="Dán URL hình ảnh..."
                            className={styles.flex1}
                          />
                          <button
                            type="button"
                            className={`${styles.removeBtn} ${styles.p8}`}
                            onClick={() => removeArrayItem("gallery", index)}
                            aria-label="Xóa ảnh"
                            title="Xóa ảnh"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      ))}

                      {(!fd.gallery || fd.gallery.length === 0) && (
                        <div className={styles.emptyGallery}>
                          Chưa có ảnh nào trong bộ sưu tập.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.sectionTitle}>
                    <Buildings size={18} weight="fill" /> Thông tin tài khoản
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={fd.fullName || ""}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={fd.email || ""}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  {!initialData && (
                    <div className={styles.inputGroup}>
                      <label>Mật khẩu</label>
                      <input
                        type="password"
                        name="password"
                        value={fd.password || ""}
                        onChange={handleChange}
                        placeholder="Mật khẩu ít nhất 8 ký tự..."
                      />
                    </div>
                  )}
                  <div className={styles.inputGroup}>
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={fd.phone || ""}
                      onChange={handleChange}
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={fd.address || ""}
                      onChange={handleChange}
                      placeholder="Hà Nội, Việt Nam"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label="Vai trò"
                      options={[
                        {
                          value: 1,
                          label: "Quản trị viên (Admin)",
                          icon: <Buildings size={18} />,
                        },
                        {
                          value: 2,
                          label: "Người dùng (User)",
                          icon: <GlobeHemisphereWest size={18} />,
                        },
                      ]}
                      value={fd.roleId || 2}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, roleId: val }))
                      }
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label="Xác minh Email"
                      options={[
                        {
                          value: true,
                          label: "Đã xác minh",
                          icon: <CheckCircle size={18} color="#10b981" />,
                        },
                        {
                          value: false,
                          label: "Chưa xác minh",
                          icon: <X size={18} color="#ef4444" />,
                        },
                      ]}
                      value={fd.isEmailVerified ?? false}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          isEmailVerified: val,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <CustomSelect
                      label="Trạng thái hoạt động"
                      options={[
                        {
                          value: true,
                          label: "Đang hoạt động",
                          icon: <CheckCircle size={18} color="#10b981" />,
                        },
                        {
                          value: false,
                          label: "Ngừng hoạt động",
                          icon: <X size={18} color="#ef4444" />,
                        },
                      ]}
                      value={fd.isActive ?? true}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, isActive: val }))
                      }
                    />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label>Giới thiệu (Bio)</label>
                    <textarea
                      name="bio"
                      value={fd.bio || ""}
                      onChange={handleChange}
                      placeholder="Mô tả ngắn về người dùng..."
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className={styles.btnSave}
              onClick={handleSaveInternal}
            >
              Lưu thay đổi
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditModal;
