import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminLoginForm } from '../components/AdminLoginForm';
import logoImg from '../../../assets/images/logo.png';

/**
 * Sign-in screen of the admin portal (admin build only), from Stitch "Đăng nhập Quản trị viên".
 * The request goes to the admin API, which only accepts admin accounts.
 */
export const AdminLoginPage = () => {
  const { isSubmitting, handleLogin } = useAuth();

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-margin">
      <div className="w-full max-w-admin-login flex flex-col items-center gap-6">
        <section className="w-full bg-surface-container-lowest border border-hairline rounded-2xl p-8 sm:p-10">
          <header className="flex flex-col items-center gap-space-sm text-center">
            <img src={logoImg} alt="Logo BuddyLink" className="h-14 w-auto object-contain" />

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary-dark text-label-sm">
              <Shield className="w-3.5 h-3.5 stroke-1.75" />
              Hệ Thống Quản Trị Trung Tâm
            </span>
            <h1 className="mt-2 text-headline-md text-on-surface">Đăng nhập Admin</h1>
          </header>

          <AdminLoginForm onSubmit={handleLogin} isLoading={isSubmitting} />


        </section>

        <footer className="flex items-center justify-center gap-6 text-label-sm text-outline">
          <span>Tiêu chuẩn An toàn Dữ liệu Trẻ em</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span>Hỗ trợ Kỹ thuật</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminLoginPage;
