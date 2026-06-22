import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PremiumButton.module.scss";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "sunset";
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  variant = "primary",
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.premiumButton} ${styles[variant]} ${className}`}
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={false}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.loader}
          >
            <div className={styles.spinner}></div>
            <span>Đang xử lý...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.content}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default PremiumButton;
