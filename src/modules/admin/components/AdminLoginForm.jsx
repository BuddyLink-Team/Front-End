import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Lock, ArrowRight } from 'lucide-react';
import { loginSchema } from '../../auth/validation/authValidation';
import { useRememberedEmail } from '../../auth/hooks/useRememberedEmail';
import { Input, PasswordInput, Button, Checkbox } from '../../../components';

const FIELD_CLASS = 'py-3 pl-11 text-body-md';
const FIELD_ICON_CLASS = 'w-5 h-5 stroke-1.75 text-outline';

/**
 * Email + password form of the admin portal (Stitch "Đăng nhập Quản trị viên").
 */
export const AdminLoginForm = ({ onSubmit, isLoading }) => {
  const { rememberedEmail, saveRememberedEmail } = useRememberedEmail();

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
    saveRememberedEmail(data.email, data.rememberMe);
    await onSubmit?.(data);
  };

  return (
    <form className="mt-space-lg space-y-space-md" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Input
        id="admin-login-email"
        label="Email quản trị"
        required
        placeholder="ten@buddylink.vn"
        type="email"
        autoComplete="email"
        className={FIELD_CLASS}
        leftIcon={<AtSign className={FIELD_ICON_CLASS} />}
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordInput
        id="admin-login-password"
        label="Mật khẩu bảo mật"
        required
        placeholder="••••••••••••"
        autoComplete="current-password"
        className={FIELD_CLASS}
        leftIcon={<Lock className={FIELD_ICON_CLASS} />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Checkbox id="admin-remember-me" label="Ghi nhớ email trên thiết bị này" {...register('rememberMe')} />

      <Button
        type="submit"
        className="w-full py-3.5 text-label-lg"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="w-4 h-4 stroke-1.75" />}
      >
        Đăng nhập vào Hệ thống
      </Button>
    </form>
  );
};

export default AdminLoginForm;
