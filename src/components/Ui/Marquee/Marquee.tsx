import React from "react";
import styles from "./Marquee.module.scss";

interface MarqueeProps {
  children: React.ReactNode;
  vertical?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  duration?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  vertical = false,
  reverse = false,
  pauseOnHover = false,
  className = "",
  duration = "40s",
}) => {
  return (
    <div
      className={`${styles.marqueeContainer} ${vertical ? styles.vertical : ""} ${
        pauseOnHover ? styles.pauseOnHover : ""
      } ${className}`}
      style={{ "--duration": duration } as React.CSSProperties}
    >
      <div className={`${styles.marqueeContent} ${reverse ? styles.reverse : ""}`}>
        {children}
        {/* Duplicate content for seamless loop */}
        {children}
      </div>
    </div>
  );
};

export default Marquee;
