import React from "react";
import { Eye, EyeSlash } from "phosphor-react";
import styles from "./InputGroup.module.scss";

interface InputGroupProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled?: boolean;
  showToggle?: boolean;
  isShown?: boolean;
  onToggleShow?: () => void;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  disabled,
  showToggle,
  isShown,
  onToggleShow,
}) => {
  return (
    <div className={styles.group}>
      <label>{label}</label>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>{icon}</span>
        <input
          name={name}
          type={showToggle ? (isShown ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
        />
        {showToggle && (
          <span
            className={styles.eye}
            onClick={() => !disabled && onToggleShow?.()}
          >
            {isShown ? <EyeSlash weight="duotone" /> : <Eye weight="duotone" />}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputGroup;
