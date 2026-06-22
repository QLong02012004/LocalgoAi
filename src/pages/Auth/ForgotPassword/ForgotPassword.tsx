import React from "react";
import {
  EnvelopeSimple,
  ArrowBendUpLeft,
  PaperPlaneTilt,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeSlash,
} from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import styles from "./ForgotPassword.module.scss";
import { useForgotPassword } from "./hooks/useForgotPassword";

const ForgotPassword: React.FC = () => {
  const {
    step,
    setStep,
    email,
    setEmail,
    otp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isLoading,
    navigate,
    otpRefs,
    handleEmailSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
    handleOtpSubmit,
    handleResetSubmit,
    handleResendOtp,
  } = useForgotPassword();

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  };

  const fieldNames = [
    "field-q",
    "field-w",
    "field-e",
    "field-r",
    "field-t",
    "field-y",
  ];

  return (
    <main className={styles.authMain}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.authContainer}
      >
        <div className={styles.authLeft}>
          <div className={styles.leftContentBox}>
            <h1 className={styles.gradientText}>
              {step === "email" && "Lấy lại quyền \n truy cập của bạn."}
              {step === "otp" && "Xác minh \n danh tính của bạn."}
              {step === "reset" && "Thiết lập \n mật khẩu mới."}
              {step === "success" && "Khôi phục \n thành công!"}
            </h1>
            <p className={styles.description}>
              {step === "email" &&
                "Đừng lo lắng! Nhập email tài khoản của bạn và làm theo hướng dẫn."}
              {step === "otp" &&
                "Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã."}
              {step === "reset" &&
                "Vui lòng chọn một mật khẩu mạnh để bảo vệ tài khoản của bạn tốt hơn."}
              {step === "success" &&
                "Tài khoản của bạn đã được cập nhật thành công."}
            </p>
            <ul className={styles.authFeatures}>
              <li>
                <div className={styles.featureIcon}>
                  <PaperPlaneTilt weight="duotone" />
                </div>{" "}
                Nhận mã khôi phục qua Email
              </li>
              <li>
                <div className={styles.featureIcon}>
                  <ShieldCheck weight="duotone" />
                </div>{" "}
                Bảo mật với OTP 6 chữ số
              </li>
              <li>
                <div className={styles.featureIcon}>
                  <Lock weight="duotone" />
                </div>{" "}
                Thay đổi mật khẩu mới an toàn
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.authRight}>
          <div className={styles.formSection}>
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div key="email" {...slideVariants}>
                  <div className={styles.formHeader}>
                    <h2>Quên mật khẩu?</h2>
                    <p>Vui lòng nhập Email để nhận mã OTP</p>
                  </div>
                  <form
                    onSubmit={handleEmailSubmit}
                    className={styles.authForm}
                  >
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email tài khoản</label>
                      <div className={styles.inputContainer}>
                        <EnvelopeSimple
                          className={styles.inputIcon}
                          weight="duotone"
                        />
                        <input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          title="Email tài khoản"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={styles.btnSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
                    </button>
                  </form>
                  <div className={styles.authFooterText}>
                    <button onClick={() => navigate("/auth?mode=login")}>
                      <ArrowBendUpLeft size={16} weight="bold" /> Quay lại Đăng
                      nhập
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div key="otp" {...slideVariants}>
                  <button
                    type="button"
                    className={styles.btnBack}
                    onClick={() => setStep("email")}
                    title="Quay lại"
                    aria-label="Quay lại"
                  >
                    <div className={styles.btnIcon}>
                      <ArrowLeft size={20} />
                    </div>
                  </button>
                  <div className={styles.formHeader}>
                    <h2>Xác minh OTP</h2>
                    <p>
                      Đã gửi tới{" "}
                      <span className={styles.highlightEmail}>
                        {email}
                      </span>
                    </p>
                  </div>
                  <form onSubmit={handleOtpSubmit} className={styles.authForm}>
                    <div className={styles.otpContainer}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={fieldNames[idx]}
                          name={fieldNames[idx]}
                          ref={(el) => {
                            otpRefs.current[idx] = el;
                          }}
                          type="tel" // Quan trọng: type=tel giúp né các bộ lọc Autofill gắt gao
                          maxLength={1}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="one-time-code" // Vẫn giữ one-time-code nhưng đổi ID/Name
                          title={`Nhập số OTP thứ ${idx + 1}`}
                          placeholder="-"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          onFocus={(e) => e.target.select()} // Tự động bôi đen khi focus
                          className={styles.otpInput}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      className={styles.btnSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang xác minh..." : "Xác minh ngay"}
                    </button>
                  </form>
                  <div className={styles.authFooterText}>
                    Chưa nhận được mã?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      Gửi lại mã
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "reset" && (
                <motion.div key="reset" {...slideVariants}>
                  <div className={styles.formHeader}>
                    <h2>Mật khẩu mới</h2>
                    <p>Hãy tạo mật khẩu mới cho tài khoản của bạn</p>
                  </div>
                  <form
                    onSubmit={handleResetSubmit}
                    className={styles.authForm}
                  >
                    <div className={styles.formGroup}>
                      <label htmlFor="newPassword">Mật khẩu mới</label>
                      <div className={styles.inputContainer}>
                        <Lock className={styles.inputIcon} weight="duotone" />
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới"
                          title="Mật khẩu mới"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <span
                          className={styles.eyeIcon}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlash weight="duotone" />
                          ) : (
                            <Eye weight="duotone" />
                          )}
                        </span>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="confirmPassword">Xác nhận lại</label>
                      <div className={styles.inputContainer}>
                        <Lock className={styles.inputIcon} weight="duotone" />
                        <input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          title="Xác nhận lại mật khẩu "
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <span
                          className={styles.eyeIcon}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlash weight="duotone" />
                          ) : (
                            <Eye weight="duotone" />
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={styles.btnSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </button>
                  </form>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  {...slideVariants}
                  className={styles.successStep}
                >
                  <div className={styles.successIconBox}>
                    <CheckCircle size={60} weight="fill" />
                  </div>
                  <div className={styles.formHeader}>
                    <h2>Thành công!</h2>
                    <p>Mật khẩu đã được thay đổi. Chào mừng bạn trở lại!</p>
                  </div>
                  <button
                    className={styles.btnSubmit}
                    onClick={() => navigate("/auth?mode=login")}
                  >
                    Đăng nhập ngay
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default ForgotPassword;
