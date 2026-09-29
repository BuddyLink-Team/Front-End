import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Mail,
  Check,
  ArrowRight,
  Clock,
  RotateCcw,
  Edit2,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { formatTimer, maskPhone, maskEmail } from '../../../utils/formatters';
import { Button, Input } from '../../../components';

export const VerifyOtpScreen = () => {
  const {
    user,
    isPhoneVerified,
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
  } = useVerifyOtp();

  return (
    <div className="w-full flex items-center justify-center py-6 sm:py-12 relative selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Soft Glow matching Stitch */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex overflow-hidden opacity-40">
        <div className="w-1/2 h-full bg-gradient-to-br from-surface-container-high via-surface-container-lowest to-surface" />
        <div className="w-1/2 h-full bg-gradient-to-bl from-primary-fixed/20 via-surface-container-low to-surface" />
        <div className="absolute inset-0 backdrop-blur-md" />
      </div>

      {/* Main Single Centered Card matching Stitch screen: max-w-[620px] */}
      <div className="w-full max-w-[620px] bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-surface-tint/5 p-6 sm:p-10 flex flex-col relative transition-all duration-300 border border-hairline">
        {/* Invisible container for Firebase phone recaptcha */}
        <div id="recaptcha-container" />
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-1.5 rounded-full border border-hairline/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              {activeStep === 'PHONE'
                ? 'Bước 1/2: Xác thực SĐT'
                : 'Bước 2/2: Xác thực Email'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                activeStep === 'PHONE' || isPhoneVerified
                  ? 'bg-primary'
                  : 'bg-surface-container-highest'
              }`}
            />
            <div
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                activeStep === 'EMAIL'
                  ? 'bg-primary'
                  : 'bg-surface-container-highest'
              }`}
            />
          </div>
        </div>

        {/* Center Illustration Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 shadow-sm border border-primary/20">
            {activeStep === 'PHONE' ? (
              <Smartphone className="w-8 h-8 text-primary" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display mb-2">
            {activeStep === 'PHONE'
              ? 'Xác thực Số điện thoại'
              : 'Xác thực Địa chỉ Email'}
          </h1>

          <div className="flex items-center gap-2 text-primary font-semibold text-base mb-2">
            {activeStep === 'PHONE' ? (
              <>
                <Smartphone className="w-4 h-4" />
                <span>{phoneNumber ? maskPhone(phoneNumber) : 'Chưa cập nhật số điện thoại'}</span>
                {!isEditingPhone && (
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(true)}
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors ml-1 p-1 rounded-md hover:bg-surface-container cursor-pointer"
                    title="Cập nhật số điện thoại"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{phoneNumber ? 'Thay đổi' : 'Nhập số điện thoại'}</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>{maskEmail(user?.email)}</span>
              </>
            )}
          </div>

          <p className="text-sm text-on-surface-variant max-w-[460px] leading-relaxed">
            {activeStep === 'PHONE'
              ? 'BuddyLink đã gửi mã bảo mật 6 chữ số đến thiết bị của bạn nhằm xác thực thành viên và bảo vệ an toàn mạng lưới kết nối phụ huynh.'
              : 'BuddyLink đã gửi mã bảo mật 6 chữ số đến hộp thư của bạn nhằm hoàn tất chứng nhận tài khoản an toàn.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-error shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OTP Input Boxes (6 digits) */}
        <div className="flex flex-col items-center w-full mb-8">
          <div
            className="flex items-center justify-center gap-2 sm:gap-3.5 w-full mb-4"
            onPaste={handlePaste}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 sm:w-14 h-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all outline-none ${
                  digit
                    ? 'border-primary bg-primary/5 text-on-surface shadow-sm ring-2 ring-primary/20'
                    : 'border-hairline bg-surface-container-low text-on-surface focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
                }`}
                aria-label={`Số OTP thứ ${idx + 1}`}
              />
            ))}
          </div>

          {/* Countdown & Resend Option */}
          <div className="flex flex-wrap items-center justify-between w-full max-w-[440px] px-1 text-on-surface-variant gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-surface-container-low/70 py-1 px-3 rounded-full border border-hairline/60">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                Mã hết hạn sau{' '}
                <strong className="text-on-surface font-semibold">
                  {formatTimer(countdown)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-text-muted">Chưa nhận được?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || isSubmitting}
                className={`font-semibold transition-colors inline-flex items-center gap-1 ${
                  canResend
                    ? 'text-primary hover:underline cursor-pointer'
                    : 'text-text-muted cursor-not-allowed opacity-70'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                {canResend ? 'Gửi lại' : `Gửi lại (${countdown}s)`}
              </button>
            </div>
          </div>
        </div>

        {/* Change Phone Modal / Toggle Row */}
        {isEditingPhone && activeStep === 'PHONE' ? (
          <div className="p-4 mb-6 rounded-2xl bg-surface-container-low border border-hairline space-y-3">
            <Input
              id="new-phone"
              label="Nhập số điện thoại mới"
              placeholder="VD: 0912345678"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingPhone(false)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSavePhone}
                isLoading={isSubmitting}
              >
                Lưu &amp; Gửi mã mới
              </Button>
            </div>
          </div>
        ) : null}

        {/* Parent Profile Step Progress Box matching Stitch */}
        <div className="bg-surface-container-low/60 rounded-2xl p-4 sm:p-5 mb-8 border border-hairline/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="uppercase tracking-wider text-text-muted font-semibold">
              Tiến trình hồ sơ phụ huynh
            </span>
            <span className="text-primary font-semibold">
              {activeStep === 'PHONE' ? '50% hoàn tất' : '75% hoàn tất'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Step 1: General Info */}
            <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl shadow-sm border border-hairline/60">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface font-semibold truncate">
                  1. Thông tin chung
                </span>
                <span className="text-[10px] text-primary leading-tight font-medium">
                  Đã ghi nhận
                </span>
              </div>
            </div>

            {/* Step 2: Phone Verification */}
            <div
              className={`flex items-center gap-2.5 bg-white p-2.5 rounded-xl shadow-sm border border-hairline/60 ${
                activeStep === 'PHONE' ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                  isPhoneVerified || activeStep === 'EMAIL'
                    ? 'bg-primary'
                    : 'bg-primary'
                }`}
              >
                {isPhoneVerified || activeStep === 'EMAIL' ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface font-semibold truncate">
                  2. Xác thực SĐT
                </span>
                <span className="text-[10px] text-primary leading-tight font-medium">
                  {isPhoneVerified || activeStep === 'EMAIL'
                    ? 'Đã xác thực'
                    : 'Đang nhập mã OTP'}
                </span>
              </div>
            </div>

            {/* Step 3: Email Verification */}
            <div
              className={`flex items-center gap-2.5 bg-white p-2.5 rounded-xl shadow-sm border border-hairline/60 ${
                activeStep === 'EMAIL'
                  ? 'ring-2 ring-primary/30'
                  : 'opacity-75 bg-surface-container-low/50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  activeStep === 'EMAIL'
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-highest text-text-muted'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-on-surface-variant font-medium truncate">
                  3. Xác thực Email
                </span>
                <span className="text-[10px] text-text-muted leading-tight">
                  {activeStep === 'EMAIL' ? 'Đang thực hiện' : 'Bước kế tiếp'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5 w-full">
          <Button
            type="button"
            className="w-full h-12 rounded-full font-semibold text-sm shadow-md"
            onClick={handleVerifySubmit}
            isLoading={isSubmitting}
            disabled={!isFormComplete || isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {activeStep === 'PHONE'
              ? 'Xác nhận & Tiếp tục xác thực Email'
              : 'Xác nhận & Hoàn tất bảo mật'}
          </Button>

          {activeStep === 'PHONE' && !isEditingPhone && (
            <button
              type="button"
              onClick={() => setIsEditingPhone(true)}
              className="w-full py-2 text-center text-xs sm:text-sm text-text-muted hover:text-on-surface flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Thay đổi số điện thoại nhận mã</span>
            </button>
          )}
        </div>

        {/* Security Shield Footer Banner matching Stitch */}
        <div className="mt-8 pt-5 bg-surface-container-low/40 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 px-6 sm:px-10 pb-6 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-center gap-2 text-center text-text-muted border-t border-hairline/60">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs">
            Mã hóa SSL 256-bit • Tiêu chuẩn an toàn dữ liệu trẻ em BuddyLink
            Shield
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpScreen;
