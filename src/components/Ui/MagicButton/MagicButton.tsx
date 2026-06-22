import React from "react";
import styles from "./MagicButton.module.scss";

interface MagicButtonProps {
  text: string;
  loadingText?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "cyan" | "sunset" | "dark";
  className?: string;
  type?: "button" | "submit";
}

const MagicButton: React.FC<MagicButtonProps> = ({
  text,
  loadingText,
  onClick,
  icon,
  variant = "cyan",
  className = "",
  type = "button",
}) => {
  const splitText = (str: string) => {
    return str.split("").map((char, index) => (
      <span key={index} className={styles.btnLetter}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <div className={`${styles.btnWrapper} ${className}`}>
      <button
        type={type}
        className={`${styles.btn} ${styles[variant]}`}
        onClick={onClick}
      >
        {icon ? (
          <div className={styles.btnSvg}>{icon}</div>
        ) : (
          <svg className={styles.btnSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        )}
        <div className={styles.txtWrapper}>
          <div className={styles.txt1}>{splitText(text)}</div>
          {loadingText && <div className={styles.txt2}>{splitText(loadingText)}</div>}
        </div>
      </button>
    </div>
  );
};

export default MagicButton;
