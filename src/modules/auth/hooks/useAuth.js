import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
  sendPhoneOtp,
  verifyPhoneOtp,
  verifyFirebasePhone,
  sendEmailOtp,
  verifyEmailOtp,
  logoutUser,
} from '../redux/authSlice';
import { clearParentState } from '../../parent/redux/parentSlice';
import { resetChildState } from '../../child/redux/childSlice';
import { resetSubscriptionState } from '../../subscription/redux/subscriptionSlice';
import { resetChatState } from '../../chat/redux/chatSlice';
import { getRoleHomePath, USER_ROLES } from '../../../constants/role.constants';
import socketService from '../../../services/socket';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { AUTH_ERROR_MESSAGES } from '../constants/authConstants';
import { needsVerification } from '../utils/verification';

/**
 * Authentication UI flows. API calls and session state live in the auth slice thunks;
 * this hook handles submit state, toasts, error messages and navigation.
 */
export const useAuth = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  /**
   * Dispatch a thunk and normalize the outcome to { success, data } / { success: false, error }
   * @param {Object} thunkAction - Result of calling a thunk action creator
   * @param {string} fallbackError - Message shown when the error code has no mapping
   * @param {(data: any) => string|void} [onSuccess] - Optional side effects; may return a toast message
   */
  const runAuthAction = useCallback(
    async (thunkAction, fallbackError, onSuccess) => {
      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const data = await dispatch(thunkAction).unwrap();
        const successMessage = onSuccess?.(data);
        if (successMessage) toast.success(successMessage);
        return { success: true, data, message: successMessage };
      } catch (error) {
        const msg = getApiErrorMsg(AUTH_ERROR_MESSAGES, error, fallbackError);
        setErrorMessage(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, toast],
  );

  const goToHomeOrVerification = useCallback(
    ({ user, parent }) => {
      navigate(needsVerification(user, parent) ? '/verify-otp' : getRoleHomePath(user?.role), {
        replace: true,
      });
    },
    [navigate],
  );

  const handleRegister = (data) =>
    runAuthAction(
      registerUser({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        password: data.password,
      }),
      'Đăng ký không thành công. Vui lòng thử lại!',
      () => {
        navigate('/verify-otp', { replace: true });
        return 'Đăng ký tài khoản thành công! Vui lòng xác thực tài khoản để tiếp tục.';
      },
    );

  const handleLogin = (data) =>
    runAuthAction(
      loginUser({ email: data.email, password: data.password }),
      'Email hoặc mật khẩu không chính xác!',
      (payload) => {
        goToHomeOrVerification(payload);
        return payload?.user?.role === USER_ROLES.PARENT
          ? 'Đăng nhập thành công! Rất vui được gặp lại ba mẹ.'
          : 'Đăng nhập quản trị viên thành công!';
      },
    );

  const handleGoogleLogin = (idToken) =>
    runAuthAction(loginWithGoogle(idToken), 'Đăng nhập Google thất bại. Vui lòng thử lại!', (payload) => {
      goToHomeOrVerification(payload);
      return 'Đăng nhập với Google thành công!';
    });

  const handleForgotPassword = (data) =>
    runAuthAction(
      requestPasswordReset(data.email),
      'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại!',
      () => 'Mã đặt lại mật khẩu đã được gửi đến email của bạn nếu tài khoản tồn tại.',
    );

  const handleResetPassword = ({ email, token, newPassword }) =>
    runAuthAction(
      resetPassword({ email, token, newPassword }),
      'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã khôi phục!',
      () => {
        navigate('/login', { replace: true });
        return 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.';
      },
    );

  const handleSendPhoneOtp = (phone) =>
    runAuthAction(
      sendPhoneOtp(phone),
      'Không thể gửi mã OTP tới số điện thoại. Vui lòng thử lại!',
      () => 'Mã OTP đã được gửi đến số điện thoại của bạn!',
    );

  const handleVerifyPhoneOtp = (phone, otp) =>
    runAuthAction(
      verifyPhoneOtp({ phone, otp }),
      'Mã OTP không đúng hoặc đã hết hạn!',
      () => 'Xác thực số điện thoại thành công!',
    );

  const handleVerifyFirebasePhone = (idToken) =>
    runAuthAction(
      verifyFirebasePhone(idToken),
      'Xác thực số điện thoại qua Firebase thất bại!',
      () => 'Xác thực số điện thoại qua Firebase thành công!',
    );

  const handleSendEmailOtp = () =>
    runAuthAction(
      sendEmailOtp(),
      'Không thể gửi mã xác thực email!',
      () => 'Mã xác thực OTP đã được gửi về email của bạn!',
    );

  const handleVerifyEmailOtp = (otp) =>
    runAuthAction(
      verifyEmailOtp(otp),
      'Mã xác thực email không đúng hoặc đã hết hạn!',
      () => 'Xác thực email thành công! Tài khoản của bạn đã được chứng nhận an toàn.',
    );

  /**
   * Logout: revoke the refresh token on the server, then clear every piece of session state.
   * logoutUser never rejects, so local cleanup always runs (even offline).
   */
  const handleLogout = async () => {
    await dispatch(logoutUser());
    socketService.disconnect();
    dispatch(clearParentState());
    dispatch(resetChildState());
    dispatch(resetSubscriptionState());
    dispatch(resetChatState());
    navigate('/', { replace: true });
  };

  return {
    isSubmitting,
    errorMessage,
    setErrorMessage,
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
    handleVerifyFirebasePhone,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
  };
};

export default useAuth;
