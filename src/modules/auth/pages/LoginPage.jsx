import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">Đăng nhập tài khoản</h2>
        <p className="text-sm text-text-muted mt-1">Chào mừng ba mẹ quay trở lại với BuddyLink</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="Email hoặc Số điện thoại" placeholder="phuhuynh@example.com" type="email" />
        <Input label="Mật khẩu" placeholder="••••••••" type="password" />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-text-muted">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-primary-dark font-medium hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full">
          Đăng nhập
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary-dark font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
