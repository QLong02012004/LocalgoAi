import React from "react";
import {
  EnvelopeSimple,
  Eye,
  EyeSlash,
  // FacebookLogo, // TODO: Mở lại khi dùng Facebook Login
  LockKey,
  User,
} from "phosphor-react";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
// TODO: Mở lại khi dùng Facebook Login
// import FacebookLoginExport from "@greatsumini/react-facebook-login";
// const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "3832704913701035";
// const FacebookLogin =
//   (FacebookLoginExport as { default?: typeof FacebookLoginExport }).default ||
//   FacebookLoginExport;
import styles from "./Register.module.scss";
import { useRegister } from "./hooks/useRegister";

import InputGroup from "../../../components/Ui/InputGroup/InputGroup";
import Checkbox from "../../../components/Ui/Checkbox/Checkbox";
import PremiumButton from "../../../components/Ui/PremiumButton/PremiumButton";

interface Props {
  onToggle: () => void;
}

const Register: React.FC<Props> = ({ onToggle }) => {
  const {
    formData,
    showPass,
    setShowPass,
    showConfirm,
    setShowConfirm,
    terms,
    setTerms,
    isLoading,
    handleChange,
    handleRegister,
    handleSocialSuccess,
  } = useRegister({ onToggle });

  return (
    <div className={styles.registerContainer}>
      <div className={styles.header}>
        <h2>Tạo tài khoản mới</h2>
        <p>Gia nhập cộng đồng du lịch thông minh</p>
      </div>

      <div className={styles.socialButtons}>
        <div className={styles.googleButtonWrap}>
          <GoogleLogin
            onSuccess={(resp) => resp.credential && handleSocialSuccess('google', resp.credential)}
            onError={() => toast.error("Đăng ký Google thất bại!")}
            theme="outline" shape="pill" text="signup_with" logo_alignment="center"
            width="100%"
          />
        </div>
        {/* TODO: Mở lại khi dùng Facebook Login
        <div className={styles.facebookButtonWrap}>
          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            onSuccess={(resp: any) => handleSocialSuccess('facebook', resp.accessToken)}
            render={({ onClick }: any) => (
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

      <div className={styles.divider}><span>Hoặc tham gia bằng email</span></div>

      <form onSubmit={handleRegister} className={styles.form}>
        <InputGroup
          label="Họ và tên" name="name" type="text" placeholder="Nguyễn Văn A"
          value={formData.name} onChange={handleChange} icon={<User weight="duotone" />}
          disabled={isLoading}
        />

        <InputGroup
          label="Email của bạn" name="email" type="email" placeholder="name@example.com"
          value={formData.email} onChange={handleChange} icon={<EnvelopeSimple weight="duotone" />}
          disabled={isLoading}
        />

        <InputGroup
          label="Mật khẩu" name="pass" type="password" placeholder="8-32 ký tự, hoa, thường, số"
          value={formData.pass} onChange={handleChange} icon={<LockKey weight="duotone" />}
          disabled={isLoading} showToggle isShown={showPass} onToggleShow={() => setShowPass(!showPass)}
        />

        <InputGroup
          label="Xác nhận mật khẩu" name="confirm" type="password" placeholder="Nhập lại mật khẩu"
          value={formData.confirm} onChange={handleChange} icon={<LockKey weight="duotone" />}
          disabled={isLoading} showToggle isShown={showConfirm} onToggleShow={() => setShowConfirm(!showConfirm)}
        />

        <Checkbox
          id="terms"
          label="Tôi đồng ý với Điều khoản và Chính sách"
          checked={terms}
          onChange={(checked) => setTerms(checked)}
          disabled={isLoading}
        />

        <PremiumButton type="submit" loading={isLoading} variant="primary">
          Đăng ký hoàn tất
        </PremiumButton>
      </form>

      <div className={styles.footer}>
        Bạn đã có tài khoản?{" "}
        <button type="button" onClick={onToggle}>
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default Register;
