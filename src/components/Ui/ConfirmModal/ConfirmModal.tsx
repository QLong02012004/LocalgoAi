import React from "react";
import styles from "./ConfirmModal.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className={styles.containerInner}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.content}>
              <p>{message}</p>
            </div>
            <div className={styles.buttons}>
              <button
                className={`${styles.btn} ${styles.confirm}`}
                type="button"
                onClick={onConfirm}
              >
                Xác nhận
              </button>
              <button
                className={`${styles.btn} ${styles.cancel}`}
                type="button"
                onClick={onCancel}
              >
                Hủy bỏ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
