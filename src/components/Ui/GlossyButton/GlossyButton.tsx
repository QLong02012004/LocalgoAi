import React from "react";
import styles from "./GlossyButton.module.scss";

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
  children: React.ReactNode;
}

const GlossyButton: React.FC<GlossyButtonProps> = ({
  variant = "default",
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.glossyButton} ${styles[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlossyButton;
