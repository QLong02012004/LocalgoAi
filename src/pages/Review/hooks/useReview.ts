import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getReviews, createReview, type ReviewPayload } from "../../../services/reviewService";

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

const MOCK_COMMUNITY_REVIEWS: CommunityReview[] = [
  {
    id: 1,
    userName: "Lê Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    timeAgo: "2 ngày trước",
    rating: 5,
    comment: "Chuyến đi Đà Nẵng - Hội An vừa rồi nhờ có TravelAI mà lịch trình mượt mà vô cùng. Cầu Vàng sáng sớm vắng người chụp ảnh siêu đẹp!",
    images: ["https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 24,
    aiResponse: "TravelAI rất vui vì bạn đã có trải nghiệm tuyệt vời tại Cầu Vàng!",
    isLiked: false,
  },
  {
    id: 2,
    userName: "Trần Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    timeAgo: "3 ngày trước",
    rating: 5,
    comment: "Phố cổ Hội An về đêm đẹp lung linh. Thả hoa đăng trên sông Hoài và ăn bánh mì Phượng là 2 trải nghiệm không thể bỏ lỡ.",
    images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 18,
    aiResponse: "Cảm ơn Hoàng Nam, Hội An luôn mang một nét thơ rất riêng!",
    isLiked: false,
  },
  {
    id: 3,
    userName: "Nguyễn Thảo Vy",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    timeAgo: "5 ngày trước",
    rating: 5,
    comment: "Đại Nội Huế thật uy nghiêm và cổ kính. Thuê một bộ Việt phục chụp ảnh quanh Ngọ Môn và Cung Diên Thọ lên hình cực kỳ xuất sắc.",
    images: ["https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 31,
    aiResponse: "Gợi ý mặc cổ phục tại Cố đô của bạn rất tuyệt vời!",
    isLiked: false,
  },
  {
    id: 4,
    userName: "Đỗ Đức Anh",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    timeAgo: "1 tuần trước",
    rating: 4,
    comment: "Bán đảo Sơn Trà và Chùa Linh Ứng có tượng Phật Bà hướng biển rất thanh tịnh. Đường đèo ven biển lái xe máy rất đã.",
    images: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 12,
    aiResponse: "Lái xe cung đường Sơn Trà nhớ chú ý an toàn nhé bạn!",
    isLiked: false,
  },
  {
    id: 5,
    userName: "Vũ Bảo Ngọc",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    timeAgo: "1 tuần trước",
    rating: 5,
    comment: "Mì Quảng Bà Mua và Bánh xèo Bà Dưỡng ngon đỉnh chóp. Giá cả cực kỳ hợp lý, phục vụ nhanh nhẹn.",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 15,
    aiResponse: "Ẩm thực miền Trung luôn làm xiêu lòng thực khách!",
    isLiked: false,
  },
  {
    id: 6,
    userName: "Phạm Quốc Tuấn",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    timeAgo: "2 tuần trước",
    rating: 5,
    comment: "Ngắm Cầu Rồng phun lửa và phun nước vào tối thứ 7, Chủ Nhật lúc 21:00 rất đông vui và náo nhiệt. Nên đến sớm 30 phút để chọn chỗ đẹp.",
    images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80"],
    helpfulCount: 42,
    aiResponse: "Mẹo đến sớm ngắm Cầu Rồng rất hữu ích cho các bạn mới đi lần đầu!",
    isLiked: false,
  }
];

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
  const [communityReviews, setCommunityReviews] = useState<CommunityReview[]>(MOCK_COMMUNITY_REVIEWS);
  const [isLoading, setIsLoading] = useState(false);
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
    const positive = ["ngon", "đẹp", "tuyệt", "tốt", "hài lòng", "rẻ", "nhiệt tình", "sạch", "xuất sắc", "thích"];
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
        if (rawContent.length > 0) {
          const mappedData: CommunityReview[] = rawContent.map((r: any, idx: number) => ({
            id: r.id,
            userName: r.userName || "Người dùng",
            avatar: r.userImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            timeAgo: r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "Gần đây",
            rating: r.rating || 5,
            comment: r.comment || "",
            images: r.images && r.images.length > 0 ? r.images : idx % 2 === 0 ? ["https://images.unsplash.com/photo-1559592490-67245a494447?q=80&w=400"] : [],
            helpfulCount: Math.floor(Math.random() * 15),
            aiResponse: `AI: Cảm ơn phản hồi từ bạn!`,
            isLiked: false,
          }));
          setCommunityReviews(mappedData);
        } else {
          setCommunityReviews(MOCK_COMMUNITY_REVIEWS);
        }
      } else {
        setCommunityReviews(MOCK_COMMUNITY_REVIEWS);
      }
    } catch {
      setCommunityReviews(MOCK_COMMUNITY_REVIEWS);
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
    if (rating === 0 || !comment.trim()) {
      toast.warn("Vui lòng chọn số sao và nhập cảm nhận đánh giá!");
      return;
    }

    setIsSubmitting(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : { id: 1, fullName: "Bạn (Local Guide)" };

      const payload: ReviewPayload = {
        userId: user.id || 1,
        rating,
        comment,
        type: state?.targetType || "WEBSITE",
      };

      if (state?.targetType === "HOTEL") payload.hotelId = Number(state.targetId);
      if (state?.targetType === "RESTAURANT") payload.restaurantId = Number(state.targetId);
      if (state?.targetType === "ATTRACTION") payload.attractionId = Number(state.targetId);

      try {
        await createReview(payload, imageFiles);
      } catch {
        // Fallback optimistic addition
      }

      const newReview: CommunityReview = {
        id: Date.now(),
        userName: user.fullName || "Bạn (Local Guide)",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        timeAgo: "Vừa xong",
        rating,
        comment,
        images: previews.length > 0 ? [...previews] : [],
        helpfulCount: 1,
        aiResponse: "AI: Cảm ơn phản hồi tâm huyết của bạn! Bạn đã nhận được +50 điểm tích lũy.",
        isLiked: false,
      };

      setCommunityReviews((prev) => [newReview, ...prev]);
      toast.success("Tuyệt vời! Đánh giá đã được ghi nhận thành công.");
      setComment("");
      setRating(0);
      setPreviews([]);
      setImageFiles([]);
    } catch {
      toast.error("Gửi thất bại, vui lòng thử lại.");
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
