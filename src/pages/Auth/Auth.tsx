import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "./Login/Login";
import Register from "./Register/Register";
import styles from "./Auth.module.scss";
import { useAuth } from "./hooks/useAuth";

const Auth: React.FC = () => {
  const { isSignUp, content, toggleMode } = useAuth();

  return (
    <main className={styles.authMain}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.authContainer}
      >
        {/* Cánh trái: Thông tin giới thiệu */}
        <div className={styles.authLeft}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "register-info" : "login-info"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className={styles.leftContentBox}
            >
              <h1 className={styles.gradientText}>{content.title}</h1>
              <p className={styles.description}>{content.description}</p>
              <ul className={styles.authFeatures}>
                {content.features.map((feature, idx) => (
                  <li key={idx}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    {feature.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cánh phải: Form Đăng nhập/Đăng ký */}
        <div className={styles.authRight}>
          <div className={styles.formWrapper}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "register" : "login"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {isSignUp ? (
                  <Register onToggle={toggleMode} />
                ) : (
                  <Login onToggle={toggleMode} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Auth;