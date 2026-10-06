import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema } from '../validation/authValidation';
import AuthCardLayout from '../components/AuthCardLayout';
import { Input, PasswordInput, Button } from '../../../components';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const { isSubmitting, errorMessage, handleResetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: location.state?.email || '',
      token: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  return (
    <AuthCardLayout>
      <div>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Gửi lại mã khôi phục</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Nhập mã 6 chữ số đã được gửi tới email của bạn và tạo mật khẩu mới cho tài khoản.
        </p>
      </div>

      <form className="space-y-4 pt-2" onSubmit={handleSubmit(handleResetPassword)} noValidate>
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-error shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          id="reset-email"
          label="Địa chỉ Email đăng ký"
          placeholder="phuhuynh@buddylink.vn"
          type="email"
          autoComplete="email"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="reset-token"
          label="Mã khôi phục"
          placeholder="6 chữ số"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          leftIcon={<KeyRound className="w-4 h-4" />}
          error={errors.token?.message}
          {...register('token')}
        />

        <PasswordInput
          id="reset-new-password"
          label="Mật khẩu mới"
          placeholder="Tối thiểu 6 ký tự"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <PasswordInput
          id="reset-confirm-password"
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-3.5 rounded-xl shadow-md font-semibold text-sm"
            isLoading={isSubmitting}
            rightIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Cập nhật mật khẩu
          </Button>
        </div>
      </form>
    </AuthCardLayout>
  );
};

export default ResetPasswordPage;
