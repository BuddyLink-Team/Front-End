import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, LogIn, Lock } from 'lucide-react';
import { loginSchema } from '../../auth/validation/authValidation';
import { useAuth } from '../../auth/hooks/useAuth';
import { Input, PasswordInput, Button } from '../../../components';
import logoImg from '../../../assets/images/logo.png';
import { ICON_STROKE } from '../../../constants/icon.constants';

/**
 * Sign-in screen of the admin portal (admin build only).
 * The request goes to the admin API, which only accepts admin accounts.
 */
export const AdminLoginPage = () => {
  const { isSubmitting, handleLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-space-lg">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-hairline p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-space-xs">
          <img src={logoImg} alt="Logo BuddyLink" className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-title-md text-on-surface tracking-tight leading-tight">BuddyLink</span>
            <span className="text-label-sm text-on-surface-variant">Admin Console</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">Đăng nhập quản trị</h1>
          <p className="text-sm text-text-muted">Chỉ dành cho tài khoản quản trị viên của hệ thống.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)} noValidate>
          <Input
            id="admin-login-email"
            label="Địa chỉ Email"
            placeholder="admin@buddylink.vn"
            type="email"
            autoComplete="email"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            id="admin-login-password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            className="w-full py-3.5 rounded-xl shadow-md font-semibold text-sm"
            isLoading={isSubmitting}
            rightIcon={<LogIn className="w-4 h-4" />}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="p-space-sm rounded-md bg-surface-container flex items-center gap-space-xs">
          <Lock className="w-5 h-5 text-primary-dark" strokeWidth={ICON_STROKE.DEFAULT} />
          <span className="text-label-sm text-on-surface-variant">Chế độ bảo mật cao</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
