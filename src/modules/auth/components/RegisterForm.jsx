import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { registerSchema } from '../validation/authValidation';
import { Input, PasswordInput, Button } from '../../../components';

export const RegisterForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Full Name Field */}
      <Input
        id="register-fullName"
        label="Họ và tên phụ huynh"
        placeholder="VD: Nguyễn Thu Hà"
        type="text"
        autoComplete="name"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      {/* Phone Field */}
      <Input
        id="register-phone"
        label="Số điện thoại"
        placeholder="VD: 0901234567"
        type="tel"
        autoComplete="tel"
        leftIcon={<Phone className="w-4 h-4" />}
        error={errors.phone?.message}
        {...register('phone')}
      />

      {/* Email Field */}
      <Input
        id="register-email"
        label="Địa chỉ Email"
        placeholder="phuhuynh@buddylink.vn"
        type="email"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Password Field */}
      <PasswordInput
        id="register-password"
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự an toàn"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {/* Confirm Password Field */}
      <PasswordInput
        id="register-confirmPassword"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu vừa đặt"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full py-3.5 rounded-xl shadow-md font-semibold text-sm"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Đăng ký tài khoản
        </Button>
      </div>

      {/* Protection & Security Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface-variant text-xs border border-hairline/60">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Sau bước này, bạn có thể xác thực tài khoản qua Email hoặc liên kết số điện thoại Firebase để đạt chuẩn tài khoản tin cậy cho con.
        </span>
      </div>
    </form>
  );
};

export default RegisterForm;
