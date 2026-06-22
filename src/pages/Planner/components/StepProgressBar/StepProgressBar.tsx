import React from "react";
import styles from "./StepProgressBar.module.scss";

interface Props {
  currentStep: number;
}

const StepProgressBar: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Thông tin" },
    { id: 2, label: "Hoàn tất" },
  ];

  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`${styles.step} ${currentStep === step.id ? styles.active : ""} ${currentStep > step.id ? styles.completed : ""}`}
          >
            <div className={styles.circle}>{step.id}</div>
            <span className={styles.label}>{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`${styles.line} ${currentStep > step.id ? styles.active : ""}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepProgressBar;
