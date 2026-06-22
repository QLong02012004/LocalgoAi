import React from 'react';
import { Plus } from "@phosphor-icons/react";
import { useNavigate } from 'react-router-dom';
import styles from './AddTripCard.module.scss';

const AddTripCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      className={styles.addTripCard} 
      data-aos="fade-up"
      onClick={() => navigate('/planner')}
      style={{ cursor: 'pointer' }}
    >
      {/* Animated SVG Border */}
      <svg className={styles.borderSvg}>
        <rect 
          rx="24" 
          ry="24" 
          className={styles.borderRect} 
        />
      </svg>

      <div className={styles.addNewContent}>
        <div className={styles.plusCircle}>
          <Plus size={32} weight="bold" />
        </div>
        <h3>Tạo hành trình mới</h3>
        <p>Để AI thiết kế chuyến đi mơ ước cho bạn</p>
      </div>
    </div>
  );
};

export default AddTripCard;