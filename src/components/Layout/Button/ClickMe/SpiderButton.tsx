
import React from 'react';
import styles from './SpiderButton.module.scss';

interface SpiderButtonProps {
  text: string;
  onClick?: () => void;
  className?: string; // Để bạn có thể tùy chỉnh margin/position từ bên ngoài
}

const SpiderButton: React.FC<SpiderButtonProps> = ({ text, onClick, className }) => {
  return (
    <div className={`${styles.buttonWrapper} ${className || ''}`}>
      <button className={styles.spiderverseButton} onClick={onClick}>
        {text}
        
        <div className={styles.glitchLayers}>
          <div className={`${styles.glitchLayer} ${styles.layer1}`}>{text}</div>
          <div className={`${styles.glitchLayer} ${styles.layer2}`}>{text}</div>
        </div>

        <div className={styles.noise}></div>
        <div className={styles.glitchSlice}></div>
      </button>
    </div>
  );
};

export default SpiderButton;