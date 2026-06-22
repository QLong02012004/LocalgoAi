import React, { useState } from "react";
import { Star } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StarRating.module.scss";

interface StarRatingProps {
  maxStars?: number;
  initialRating?: number;
  isEditable?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  maxStars = 5,
  initialRating = 0,
  isEditable = true,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);

  const currentRating = hoverRating || selectedRating;

  const getEmoji = (rating: number) => {
    switch (rating) {
      case 1: return { emoji: "☹️", text: "Rất tệ" };
      case 2: return { emoji: "😟", text: "Tệ" };
      case 3: return { emoji: "😐", text: "Bình thường" };
      case 4: return { emoji: "🙂", text: "Tốt" };
      case 5: return { emoji: "😍", text: "Tuyệt vời!" };
      default: return null;
    }
  };

  const ratingInfo = getEmoji(currentRating);

  return (
    <div className={styles.ratingContainer}>
      <div className={styles.starsWrapper}>
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;

          return (
            <motion.div
              key={index}
              whileHover={isEditable ? { scale: 1.2 } : {}}
              whileTap={isEditable ? { scale: 0.9 } : {}}
              className={`${styles.starItem} ${isEditable ? styles.editable : styles.readonly}`}
              onClick={() => {
                if (isEditable) {
                  setSelectedRating(starValue);
                  if (onChange) onChange(starValue);
                }
              }}
              onMouseEnter={() => isEditable && setHoverRating(starValue)}
              onMouseLeave={() => isEditable && setHoverRating(0)}
            >
              <Star
                weight={isFilled ? "fill" : "bold"}
                className={`${styles.starIcon} ${isFilled ? styles.filled : styles.empty}`}
              />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {ratingInfo && (
          <motion.div
            key={currentRating}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={styles.ratingBadge}
          >
            <span className={styles.emoji}>{ratingInfo.emoji}</span>
            <span>{ratingInfo.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarRating;
