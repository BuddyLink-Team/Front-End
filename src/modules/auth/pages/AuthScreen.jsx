import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AUTH_MODES } from '../constants/authConstants';
import AuthCardLayout from '../components/AuthCardLayout';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';

export const AuthScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isSubmitting,
    errorMessage,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
  } = useAuth();

  // Determine current mode from path
  const isRegisterRoute = location.pathname.includes('/register');
  const [mode, setMode] = useState(
    isRegisterRoute ? AUTH_MODES.REGISTER : AUTH_MODES.LOGIN,
  );

  useEffect(() => {
    if (isRegisterRoute) {
      setMode(AUTH_MODES.REGISTER);
    } else {
      setMode(AUTH_MODES.LOGIN);
    }
  }, [isRegisterRoute]);

  const switchMode = (newMode) => {
    setMode(newMode);
    if (newMode === AUTH_MODES.REGISTER) {
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const onGoogleClick = () => {
    // Mock token support for local development / testing matching backend
    const mockEmail = `google-${Date.now()}@example.com`;
    const mockIdToken = `mock-google-token:${mockEmail}:Phụ Huynh Google`;
    handleGoogleLogin(mockIdToken);
  };

  const authFooter = (
    <div className="text-center text-text-muted text-xs space-y-1">
      <p>Bằng việc tiếp tục, quý phụ huynh đồng ý với</p>
      <div className="flex items-center justify-center gap-2 font-medium text-primary">
        <a href="#terms" className="hover:underline">
          Điều khoản dịch vụ
        </a>
        <span>•</span>
        <a href="#privacy" className="hover:underline">
          Chính sách bảo mật trẻ em
        </a>
        <span>•</span>
        <a href="#standards" className="hover:underline">
          Quy chuẩn cộng đồng
        </a>
      </div>
    </div>
  );

  return (
    <AuthCardLayout footer={authFooter}>
      {/* Mode Switcher Tabs */}
      <div className="inline-flex p-1 bg-surface-container-low rounded-full w-full border border-hairline/80">
        <button
          type="button"
          onClick={() => switchMode(AUTH_MODES.REGISTER)}
          className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-center transition-all duration-200 ${
            mode === AUTH_MODES.REGISTER
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          Đăng ký tài khoản
        </button>
        <button
          type="button"
          onClick={() => switchMode(AUTH_MODES.LOGIN)}
          className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold text-center transition-all duration-200 ${
            mode === AUTH_MODES.LOGIN
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          Đăng nhập
        </button>
      </div>

      {/* Header Titles - fixed min-height to avoid text wrap height jumping */}
      <div className="space-y-1 min-h-[76px]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
          {mode === AUTH_MODES.REGISTER
            ? 'Tạo tài khoản BuddyLink'
            : 'Mừng bạn quay trở lại'}
        </h1>
        <p className="text-sm text-text-muted">
          {mode === AUTH_MODES.REGISTER
            ? 'Bắt đầu hành trình tìm bạn chơi an lành và kết nối các hoạt động bổ ích cho con yêu.'
            : 'Đăng nhập để theo dõi lịch hẹn chơi và kết nối cùng cộng đồng phụ huynh an lành.'}
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-error-container/60 border border-error/20 text-on-error-container text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Active Forms - Keep both mounted and toggle visibility so container size stays 100% stable */}
      <div className={mode === AUTH_MODES.REGISTER ? 'block' : 'hidden'}>
        <RegisterForm onSubmit={handleRegister} isLoading={isSubmitting} />
      </div>

      <div className={mode === AUTH_MODES.LOGIN ? 'block' : 'hidden'}>
        <LoginForm onSubmit={handleLogin} isLoading={isSubmitting} />
      </div>

      {/* Visual Divider */}
      <div className="relative flex items-center justify-center pt-2">
        <div className="w-full h-px bg-hairline" />
        <span className="absolute bg-white px-3 text-[11px] font-medium text-text-muted uppercase tracking-wider">
          {mode === AUTH_MODES.REGISTER
            ? 'hoặc đăng ký với'
            : 'hoặc đăng nhập với'}
        </span>
      </div>

      {/* Google Action */}
      <GoogleLoginButton
        onSuccess={(idToken) => handleGoogleLogin(idToken)}
        onClick={onGoogleClick}
        disabled={isSubmitting}
        text={
          mode === AUTH_MODES.REGISTER
            ? 'Đăng ký nhanh bằng Google'
            : 'Đăng nhập nhanh bằng Google'
        }
      />
    </AuthCardLayout>
  );
};

export default AuthScreen;
