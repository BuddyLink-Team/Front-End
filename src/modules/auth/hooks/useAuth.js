import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { setCredentials, setLoading, updateVerification } from '../redux/authSlice';
import { getRoleHomePath } from '../../../constants/role.constants';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { AUTH_ERROR_MESSAGES } from '../constants/authConstants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  /**
   * Handle Parent / User Registration
   */
  const handleRegister = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    dispatch(setLoading(true));

    try {
      const response = await authApi.register({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });

      const payload = response.data || response;
      const { user, parent, tokens } = payload;

      dispatch(
        setCredentials({
          user,
          parent,
          token: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
        }),
      );

      toast.success('Đăng ký tài khoản thành công! Vui lòng xác thực tài khoản để tiếp tục.');
      
      navigate('/verify-otp', { replace: true });
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Đăng ký không thành công. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  /**
   * Handle User Login (Email + Password)
   */
  const handleLogin = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    dispatch(setLoading(true));

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const payload = response.data || response;
      const { user, parent, tokens } = payload;

      dispatch(
        setCredentials({
          user,
          parent,
          token: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
        }),
      );

      const isParent = user?.role === 'parent';
      const welcomeMsg = isParent
        ? 'Đăng nhập thành công! Rất vui được gặp lại ba mẹ.'
        : 'Đăng nhập quản trị viên thành công!';
      toast.success(welcomeMsg);
      
      const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
      const isEmailVerified = !!parent?.verification?.isEmailVerified;
      const isVerified = isPhoneVerified && (isEmailVerified || !!user?.googleId);

      if (isParent && !isVerified) {
        navigate('/verify-otp', { replace: true });
      } else {
        const homePath = getRoleHomePath(user?.role);
        navigate(homePath, { replace: true });
      }
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Email hoặc mật khẩu không chính xác!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  /**
   * Handle Google OAuth Sign-in
   */
  const handleGoogleLogin = async (idToken) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    dispatch(setLoading(true));

    try {
      const response = await authApi.googleLogin({ idToken });
      const payload = response.data || response;
      const { user, parent, tokens } = payload;

      dispatch(
        setCredentials({
          user,
          parent,
          token: tokens?.accessToken,
          refreshToken: tokens?.refreshToken,
        }),
      );

      toast.success('Đăng nhập với Google thành công!');

      const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
      if (user?.role === 'parent' && !isPhoneVerified) {
        navigate('/verify-otp', { replace: true });
      } else {
        navigate(getRoleHomePath(user?.role), { replace: true });
      }
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Đăng nhập Google thất bại. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  /**
   * Handle Forgot Password Request
   */
  const handleForgotPassword = async (data) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authApi.forgotPassword({
        email: data.email,
      });

      const message = 'Mã đặt lại mật khẩu đã được gửi đến email của bạn nếu tài khoản tồn tại.';
      toast.success(message);
      return { success: true, message };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Send Phone OTP
   */
  const handleSendPhoneOtp = async (phone) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authApi.sendPhoneOtp({ phone });
      const msg = 'Mã OTP đã được gửi đến số điện thoại của bạn!';
      toast.success(msg);
      return { success: true, message: msg };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Không thể gửi mã OTP tới số điện thoại. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify Phone OTP via Backend
   */
  const handleVerifyPhoneOtp = async (phone, otp) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await authApi.verifyPhoneOtp({ phone, otp });
      const payload = response.data || response;
      dispatch(updateVerification({ verification: payload, phone }));
      toast.success('Xác thực số điện thoại thành công!');
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Mã OTP không đúng hoặc đã hết hạn!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify Phone via Firebase ID Token
   */
  const handleVerifyFirebasePhone = async (idToken) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await authApi.verifyFirebasePhone({ idToken });
      const payload = response.data || response;
      dispatch(updateVerification({
        verification: payload.verification || payload,
        phone: payload.phone
      }));
      toast.success('Xác thực số điện thoại qua Firebase thành công!');
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Xác thực số điện thoại qua Firebase thất bại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Send Email OTP
   */
  const handleSendEmailOtp = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await authApi.sendEmailOtp();
      const msg = 'Mã xác thực OTP đã được gửi về email của bạn!';
      toast.success(msg);
      return { success: true, message: msg };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Không thể gửi mã xác thực email!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verify Email OTP
   */
  const handleVerifyEmailOtp = async (otp) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await authApi.verifyEmailOtp({ otp });
      const payload = response.data || response;
      dispatch(updateVerification({ verification: payload }));
      toast.success('Xác thực email thành công! Tài khoản của bạn đã được chứng nhận an toàn.');
      return { success: true, data: payload };
    } catch (error) {
      const msg = getApiErrorMsg(
        AUTH_ERROR_MESSAGES,
        error,
        'Mã xác thực email không đúng hoặc đã hết hạn!',
      );
      setErrorMessage(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errorMessage,
    setErrorMessage,
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
    handleVerifyFirebasePhone,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
  };
};

export default useAuth;
