import { useState } from "react";
import { toast } from "react-toastify";
import { postUserPreferences, type UserPreferences, type TravelStyle, type UserTravelPreference } from "../../../../services/userService";

interface UsePreferenceModalProps {
  userId: string | number;
  onComplete: () => void;
}

const styleMap: Record<string, string> = {
  "Chill": "CHILL",
  "Mạo hiểm": "ADVENTURE",
  "Văn hóa": "CULTURE",
  "Thiên nhiên": "BEACH",
  "Lịch sử": "MONUMENT",
  "Ẩm thực": "FOOD",
  "Mua sắm": "SHOPPING",
  "Gia đình": "FAMILY"
};

export const usePreferenceModal = ({ userId, onComplete }: UsePreferenceModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>([]);
  const [selectedFoodTastes, setSelectedFoodTastes] = useState<string[]>([]);
  const [transportation, setTransportation] = useState<string>("DRIVING");

  const toggleStyle = (id: TravelStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleFoodTaste = (id: string) => {
    setSelectedFoodTastes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Mapping to BE format
      const finalData: UserTravelPreference = {
        travelStyles: selectedStyles.map(s => styleMap[s as any] || s),
        foodTastes: selectedFoodTastes,
        transportation: transportation
      };

      try {
        const res = await postUserPreferences(finalData);
        toast.success(res.data.message || "Lưu sở thích thành công");
        onComplete();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu sở thích.");
        console.error(error);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return {
    step,
    setStep,
    selectedStyles,
    selectedFoodTastes,
    transportation,
    setTransportation,
    toggleStyle,
    toggleFoodTaste,
    handleNext,
    handleBack,
  };
};
