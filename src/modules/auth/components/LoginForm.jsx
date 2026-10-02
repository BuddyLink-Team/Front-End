import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, LogIn } from 'lucide-react';
import { loginSchema } from '../validation/authValidation';
import { Input, PasswordInput, Button, Checkbox } from '../../../components';
import { STORAGE_KEYS } from '../../../constants/storage.constants';

export const LoginForm = ({ onSubmit, isLoading }) => {
  const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      rememberMe: Boolean(rememberedEmail),
    },
  });

  const handleFormSubmit = async (data) => {
    if (data.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, data.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }

    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Email Field */}
      <Input
        id="login-email"
        label="Địa chỉ Email"
        placeholder="phuhuynh@buddylink.vn"
        type="email"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-text-primary"
          >
            Mật khẩu
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-primary font-medium hover:underline focus:outline-none"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          placeholder="Nhập mật khẩu của bạn"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      {/* Remember me option */}
      <div className="pt-1">
        <Checkbox
          id="rememberMe"
          label="Ghi nhớ đăng nhập trên thiết bị này"
          description="Duy trì phiên đăng nhập an toàn để nhận thông báo lịch hẹn chơi kịp thời."
          {...register('rememberMe')}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full py-3.5 rounded-xl shadow-md font-semibold text-sm"
          isLoading={isLoading}
          rightIcon={<LogIn className="w-4 h-4" />}
        >
          Đăng nhập ngay
        </Button>
      </div>

      {/* Protection & Quick Tip Notice (matches RegisterForm height naturally) */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs border border-hairline/60">
        <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
        <span className="leading-relaxed">
          Tài khoản phụ huynh được bảo vệ bằng cơ chế xác thực đa lớp. Vui lòng bảo mật mật khẩu của bạn.
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
