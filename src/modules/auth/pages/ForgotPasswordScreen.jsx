import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordSchema } from '../validation/authValidation';
import AuthCardLayout from '../components/AuthCardLayout';
import { Input, Button } from '../../../components';

export const ForgotPasswordScreen = () => {
  const { isSubmitting, errorMessage, handleForgotPassword } = useAuth();
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    const res = await handleForgotPassword(data);
    if (res?.success) {
      setSubmittedEmail(data.email);
    }
  };

  const handleResend = async () => {
    if (submittedEmail) {
      await handleForgotPassword({ email: submittedEmail });
    }
  };

  const supportFooter = (
    <div className="border-t border-hairline/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
      <span>Cần thêm trợ giúp?</span>
      <a
        href="mailto:hotro@buddylink.vn"
        className="text-primary font-medium hover:underline"
      >
        Liên hệ hỗ trợ: hotro@buddylink.vn
      </a>
    </div>
  );

  return (
    <AuthCardLayout footer={supportFooter}>
      {/* Back to Login link */}
      <div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang Đăng nhập</span>
        </Link>
      </div>

      {/* Header Title & Subtitle */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low text-primary text-xs font-semibold w-fit border border-hairline">
          <KeyRound className="w-3.5 h-3.5 text-primary" />
          <span>Bảo mật tài khoản gia đình</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display">
          {submittedEmail ? 'Kiểm tra hộp thư của bạn' : 'Quên mật khẩu?'}
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          {submittedEmail
            ? `Chúng tôi đã gửi hướng dẫn cùng mã OTP khôi phục mật khẩu tới địa chỉ ${submittedEmail}. Vui lòng kiểm tra hộp thư đến hoặc mục thư rác.`
            : 'Đừng lo lắng, BuddyLink sẽ hỗ trợ bạn lấy lại quyền truy cập an toàn chỉ với vài bước đơn giản.'}
        </p>
      </div>

      {/* Dynamic Content: Form OR Success Confirmation State */}
      {!submittedEmail ? (
        <form
          className="space-y-5 pt-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-error shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Input */}
          <Input
            id="forgot-email"
            label="Địa chỉ Email đăng ký"
            placeholder="phuhuynh@buddylink.vn"
            type="email"
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Guidance Note */}
          <div className="p-4 rounded-2xl bg-surface-container-low text-on-surface-variant text-xs space-y-2 border border-hairline/70">
            <div className="flex items-center gap-2 font-medium text-text-primary">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Hướng dẫn bảo mật</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-text-muted">
              <li>Nhập đúng email bạn đã sử dụng để đăng ký tài khoản.</li>
              <li>Hệ thống sẽ gửi mã xác thực 6 số có hiệu lực trong 15 phút.</li>
              <li>Không chia sẻ mã xác thực này cho bất kỳ ai.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-3.5 rounded-xl shadow-md font-semibold text-sm"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Gửi mã khôi phục mật khẩu
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Success State Card */}
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-on-surface">
                Đã gửi email khôi phục thành công!
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Vui lòng mở ứng dụng email của bạn, lấy mã OTP xác minh để tiếp tục đổi mật khẩu mới.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
              onClick={handleResend}
              isLoading={isSubmitting}
            >
              <RotateCcw className="w-4 h-4" />
              Gửi lại email nếu chưa nhận được
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full py-2.5 text-xs text-text-muted hover:text-text-primary"
              onClick={() => setSubmittedEmail(null)}
            >
              Thử lại với địa chỉ email khác
            </Button>
          </div>
        </div>
      )}
    </AuthCardLayout>
  );
};

export default ForgotPasswordScreen;
