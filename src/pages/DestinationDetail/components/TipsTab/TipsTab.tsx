import React from "react";
import {
  Camera,
  Sun,
  Wallet,
  FirstAid,
  Clock,
  Users,
} from "@phosphor-icons/react";
import styles from "./TipsTab.module.scss";
import type { Destination } from "../../DestinationDetail";

interface TipsTabProps {
  tips: Destination["travelTips"];
}

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera size={30} weight="fill" />,
  Sun: <Sun size={30} weight="fill" />,
  Wallet: <Wallet size={30} weight="fill" />,
  FirstAid: <FirstAid size={30} weight="fill" />,
  Clock: <Clock size={30} weight="fill" />,
  Users: <Users size={30} weight="fill" />,
};

const TipsTab: React.FC<TipsTabProps> = ({ tips }) => {
  return (
    <div className={styles.tipsContainer} data-aos="fade-up">
      <h2 className={styles.tabTitle}>Mẹo du lịch</h2>
      <div className={styles.tipsGrid}>
        {tips.map((tip, idx) => (
          <div key={idx} className={styles.tipCard}>
            <div className={styles.iconCircle}>
              {iconMap[tip.icon] || <Clock size={30} weight="fill" />}
            </div>
            <h4>{tip.title}</h4>
            <p>{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsTab;
