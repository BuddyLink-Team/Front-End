import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from './useAuth';
import { getRoleHomePath } from '../../../constants/role.constants';
import {
  isFirebaseConfigured,
  initRecaptchaVerifier,
  sendFirebasePhoneOtp,
} from '../../../services/firebase';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { AUTH_ERROR_MESSAGES, OTP_RESEND_COOLDOWN_SECONDS } from '../constants/authConstants';

/**
 * Custom hook encapsulating the full business logic and state for OTP Verification.
 * Supports Firebase SMS Delivery + backend fallback.
 */
export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const { user, parent } = useSelector((state) => state.auth);
  const {
    isSubmitting,
    errorMessage,
    setErrorMessage,
    handleSendPhoneOtp,
    handleVerifyPhoneOtp,
    handleVerifyFirebasePhone,
    handleSendEmailOtp,
    handleVerifyEmailOtp,
  } = useAuth();

  const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
  const isEmailVerified = !!parent?.verification?.isEmailVerified;

  const [activeStep, setActiveStep] = useState(
    isPhoneVerified ? 'EMAIL' : 'PHONE',
  );

  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(!user?.phone);
  const [newPhoneInput, setNewPhoneInput] = useState(user?.phone || '');

  // Keep phone number in sync with user state
  useEffect(() => {
    if (user?.phone && !phoneNumber) {
      setPhoneNumber(user.phone);
      setNewPhoneInput(user.phone);
    } else if (!user?.phone && !phoneNumber) {
      setIsEditingPhone(true);
    }
  }, [user?.phone, phoneNumber]);

  // 6-digit OTP code state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Resend cooldown in seconds (not the code validity, which is shown separately)
  const [countdown, setCountdown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Auto trigger initial OTP when arriving at screen
  const hasTriggeredInitialOtp = useRef(false);
  useEffect(() => {
    if (!hasTriggeredInitialOtp.current) {
      hasTriggeredInitialOtp.current = true;

      // Already verified before opening this screen: nothing to verify, go home
      if (isPhoneVerified && isEmailVerified) {
        navigate(getRoleHomePath(user?.role), { replace: true });
        return;
      }

      const targetPhone = user?.phone || phoneNumber;
      if (activeStep === 'PHONE' && targetPhone) {
        sendPhoneVerificationOtp(targetPhone);
      } else if (activeStep === 'EMAIL') {
        handleSendEmailOtp();
      }
    }
    // Runs once per screen visit (guarded by the ref). The send helpers are declared below and
    // recreated every render, so listing them would only re-run this guarded effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, user?.phone, phoneNumber]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Handle single digit change and auto-focus next
  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace / navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste 6-digit OTP code directly
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Firebase ConfirmationResult reference
  const confirmationResultRef = useRef(null);

  // Send Phone OTP: Priority Firebase Phone SMS -> Fallback to Backend Console SMS
  const sendPhoneVerificationOtp = async (phone) => {
    setErrorMessage(null);
    confirmationResultRef.current = null;

    if (isFirebaseConfigured) {
      try {
        const appVerifier = initRecaptchaVerifier('recaptcha-container');
        const confirmationResult = await sendFirebasePhoneOtp(phone, appVerifier);
        confirmationResultRef.current = confirmationResult;
        return { success: true };
      } catch {
        // Fallback to backend SMS endpoint if Firebase quota / config / carrier fails
        return await handleSendPhoneOtp(phone);
      }
    }

    return await handleSendPhoneOtp(phone);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;

    if (activeStep === 'PHONE') {
      const res = await sendPhoneVerificationOtp(phoneNumber);
      if (res.success) {
        setCountdown(OTP_RESEND_COOLDOWN_SECONDS);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
      }
    } else {
      const res = await handleSendEmailOtp();
      if (res.success) {
        setCountdown(OTP_RESEND_COOLDOWN_SECONDS);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
      }
    }
  };

  // Submit OTP Verification
  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }

    if (activeStep === 'PHONE') {
      let verifySuccess = false;

      // The code was sent by Firebase: verify it there and send the ID token to the backend.
      // Never fall back to the backend here, because the backend did not issue this code.
      if (confirmationResultRef.current) {
        try {
          const userCredential = await confirmationResultRef.current.confirm(otpCode);
          const idToken = await userCredential.user.getIdToken();
          const res = await handleVerifyFirebasePhone(idToken);
          verifySuccess = res.success;
        } catch (error) {
          setErrorMessage(
            getApiErrorMsg(AUTH_ERROR_MESSAGES, error, 'Mã OTP không đúng hoặc đã hết hạn!'),
          );
        }
      } else {
        const res = await handleVerifyPhoneOtp(phoneNumber, otpCode);
        verifySuccess = res.success;
      }

      if (verifySuccess) {
        if (isEmailVerified) {
          navigate('/onboarding-child', { replace: true });
        } else {
          setActiveStep('EMAIL');
          setOtpDigits(['', '', '', '', '', '']);
          setCountdown(OTP_RESEND_COOLDOWN_SECONDS);
          setCanResend(false);
          handleSendEmailOtp();
        }
      }
    } else {
      const res = await handleVerifyEmailOtp(otpCode);
      if (res.success) {
        navigate('/onboarding-child', { replace: true });
      }
    }
  };

  // Save new phone number and trigger new OTP
  const handleSavePhone = async () => {
    if (!newPhoneInput || newPhoneInput.length < 9) {
      setErrorMessage('Số điện thoại không hợp lệ');
      return;
    }
    setPhoneNumber(newPhoneInput);
    setIsEditingPhone(false);
    await sendPhoneVerificationOtp(newPhoneInput);
    setCountdown(OTP_RESEND_COOLDOWN_SECONDS);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const isFormComplete = otpDigits.every((d) => d !== '');

  return {
    user,
    parent,
    isPhoneVerified,
    isEmailVerified,
    activeStep,
    phoneNumber,
    isEditingPhone,
    setIsEditingPhone,
    newPhoneInput,
    setNewPhoneInput,
    otpDigits,
    inputRefs,
    countdown,
    canResend,
    isSubmitting,
    errorMessage,
    isFormComplete,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    handleResendOtp,
    handleVerifySubmit,
    handleSavePhone,
  };
};

export default useVerifyOtp;
