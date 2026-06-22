import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getReviews, createReview, type ReviewPayload } from "../../../services/reviewService";
import { anhmatdinh } from "../../../assets/images/img";

export interface CommunityReview {
  id: number;
  userName: string;
  avatar: string;
  timeAgo: string;
  rating: number;
  comment: string;
  images: string[];
  helpfulCount: number;
  aiResponse?: string;
  isLiked?: boolean;
}

export const useReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    targetId?: string;
    targetType?: "HOTEL" | "RESTAURANT" | "ATTRACTION";
  } | null;

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [communityReviews, setCommunityReviews] = useState<CommunityReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewsRef = useRef<string[]>([]);
  previewsRef.current = previews;

  const [userLevel] = useState({
    name: "Thám hiểm viên",
    currentReviews: 13,
    target: 15,
  });

  const [currentPage] = useState(0);
  const [pageSize] = useState(8);

  const suggestedTags = useMemo(() => {
    if (!state?.targetType) {
      return ["Giao diện đẹp", "Dễ sử dụng", "AI thông minh", "Tốc độ nhanh", "Thông tin hữu ích", "Tiết kiệm thời gian"];
    }
    return ["Giá cả hợp lý", "View cực đẹp", "Nhân viên nhiệt tình", "Sạch sẽ", "Dịch vụ tốt", "Không gian rộng"];
  }, [state?.targetType]);

  const sentiment = useMemo(() => {
    const text = comment.toLowerCase();
    const positive = ["ngon", "đẹp", "tuyệt", "tốt", "hài lòng", "rẻ", "nhiệt tình", "sạch"];
    const negative = ["tệ", "xấu", "đắt", "bẩn", "thất vọng", "kém", "chậm"];
    let score = 0;
    positive.forEach((word) => { if (text.includes(word)) score++; });
    negative.forEach((word) => { if (text.includes(word)) score--; });

    if (score > 0) return { type: "pos", msg: "Thật tuyệt!" };
    if (score < 0) return { type: "neg", msg: "Rất tiếc về điều này." };
    return { type: "neu", msg: "Cảm ơn bạn!" };
  }, [comment]);

  const fetchCommunityData = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const res = await getReviews(page, pageSize);
      if (res.data && res.data.data) {
        const rawContent = (res.data.data as any).content || [];
        const mappedData: CommunityReview[] = rawContent.map((r: any, idx: number) => ({
          id: r.id,
          userName: r.userName || "Người dùng",
          avatar: r.userImage || anhmatdinh,
          timeAgo: r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
          rating: r.rating || 5,
          comment: r.comment || "",
          images: r.images && r.images.length > 0 ? r.images : idx % 2 === 0 ? ["https://images.unsplash.com/photo-1559592490-67245a494447?q=80&w=400"] : [],
          helpfulCount: Math.floor(Math.random() * 15),
          aiResponse: `AI: Cảm ơn phản hồi từ bạn!`,
          isLiked: false,
        }));
        setCommunityReviews(mappedData);
      }
    } catch {
      console.error("Lỗi tải Community:");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchCommunityData(currentPage);
  }, [currentPage, fetchCommunityData]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
    };
  }, []);

  const addTagToComment = (tag: string) => {
    setComment((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
      toast.info("Đã thêm ảnh!");
    }
  };

  const handleImageRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (rating === 0 || !comment.trim()) {
      toast.warn("Vui lòng hoàn thành đánh giá!");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(userStr);
      const payload: ReviewPayload = {
        userId: user.id,
        rating,
        comment,
        type: state?.targetType || "WEBSITE",
      };

      if (state?.targetType === "HOTEL") payload.hotelId = Number(state.targetId);
      if (state?.targetType === "RESTAURANT") payload.restaurantId = Number(state.targetId);
      if (state?.targetType === "ATTRACTION") payload.attractionId = Number(state.targetId);

      const res = await createReview(payload, imageFiles);

      if (res.data.status === 200 || res.data.status === 201) {
        toast.success(res.data.message || "Tuyệt vời! Đánh giá đã được ghi nhận.");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error(res.data.message || "Gửi thất bại!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    rating, setRating, comment, setComment, previews, communityReviews, isLoading, 
    isSubmitting, userLevel, suggestedTags, sentiment, state,
    addTagToComment, handleSubmit, handleImageUpload, handleImageRemove
  };
};
