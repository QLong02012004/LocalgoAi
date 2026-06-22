import React from "react";
import {
  EnvelopeSimple,
  LockKey,
  // FacebookLogo, // TODO: Mở lại khi dùng Facebook Login
} from "phosphor-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Login.module.scss";
import { GoogleLogin } from "@react-oauth/google";
// TODO: Mở lại khi dùng Facebook Login
// import FacebookLoginExport from "@greatsumini/react-facebook-login";
// const FacebookLogin =
//   (FacebookLoginExport as { default?: typeof FacebookLoginExport }).default ||
//   FacebookLoginExport;
import InputGroup from "../../../components/Ui/InputGroup/InputGroup";
import PremiumButton from "../../../components/Ui/PremiumButton/PremiumButton";
import { useLogin } from "./hooks/useLogin";
import type { LoginProps } from "./types";

const Login: React.FC<LoginProps> = ({ onToggle }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    handleLogin,
    handleSocialSuccess,
  } = useLogin();

  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <h2>Chào mừng trở lại</h2>
        <p>Vui lòng nhập thông tin để truy cập</p>
      </div>

      <div className={styles.socialButtons}>
        <div className={styles.googleButtonWrap}>
          <GoogleLogin
            onSuccess={(resp) => resp.credential && handleSocialSuccess('google', resp.credential)}
            onError={() => toast.error("Đăng nhập Google thất bại!")}
            theme="outline" shape="pill" text="signin_with" logo_alignment="center"
            width="100%"
          />
        </div>
        {/* TODO: Mở lại khi dùng Facebook Login
        <div className={styles.facebookButtonWrap}>
          <FacebookLogin
            appId={import.meta.env.VITE_FACEBOOK_APP_ID || "1493682952374744"}
            onSuccess={(resp: { accessToken: string }) => handleSocialSuccess('facebook', resp.accessToken)}
            render={({ onClick }: { onClick?: () => void }) => (
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.facebook}`}
                onClick={onClick}
                disabled={isLoading}
              >
                <FacebookLogo weight="fill" size={20} /> Facebook
              </button>
            )}
          />
        </div>
        */}
      </div>

      <div className={styles.divider}><span>Hoặc đăng nhập bằng email</span></div>

      <form onSubmit={handleLogin} className={styles.form}>
        <InputGroup
          label="Email của bạn" name="email" type="email" placeholder="name@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          icon={<EnvelopeSimple weight="duotone" />} disabled={isLoading}
        />

        <div className={styles.passwordGroupWrap}>
          <div className={styles.labelRow}>
            <label>Mật khẩu</label>
            <Link to="/forgot-password" className={styles.forgotPass}>Quên mật khẩu?</Link>
          </div>
          <InputGroup
            label="" name="password" type="password" placeholder="Nhập mật khẩu"
            value={password} onChange={(e) => setPassword(e.target.value)}
            icon={<LockKey weight="duotone" />} disabled={isLoading}
            showToggle isShown={showPassword} onToggleShow={() => setShowPassword(!showPassword)}
          />
        </div>

        <PremiumButton type="submit" loading={isLoading} variant="primary">
          Đăng nhập
        </PremiumButton>
      </form>

      <div className={styles.footer}>
        Bạn chưa có tài khoản?{" "}
        <button type="button" onClick={onToggle}>Đăng ký ngay</button>
      </div>
    </div>
  );
};

export default Login;
