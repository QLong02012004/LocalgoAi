import React from "react";
import styles from "./Checkbox.module.scss";

interface CheckboxProps {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div className={styles.checkboxContainer}>
      <input
        type="checkbox"
        id={id}
        className={styles.taskCheckbox}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={id} className={styles.checkboxLabel}>
        <div className={styles.checkboxBox}>
          <div className={styles.checkboxFill} />
          <div className={styles.checkmark}>
            <svg viewBox="0 0 24 24" className={styles.checkIcon}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <div className={styles.successRipple} />
        </div>
        <span className={styles.checkboxText}>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
