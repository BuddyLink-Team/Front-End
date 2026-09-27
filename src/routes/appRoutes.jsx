import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ParentRoutes } from './ParentRoutes';
import { AdminRoutes } from './AdminRoutes';
import { USER_ROLES, getRoleHomePath } from '../constants/role.constants';
import { AuthLayout } from '../layouts/AuthLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';
import LandingPage from '../modules/auth/pages/LandingPage';

/**
 * Root route handler:
 * - Unauthenticated guest: Show LandingPage
 * - Authenticated user: Redirect to their role home page (/discovery or /admin/dashboard)
 */
const RootHandler = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingOverlay show fullPage message="Đang tải giao diện..." />}>
      <Routes>
        {/* Root Route: Landing Page for guests, role-based redirect for logged in users */}
        <Route path="/" element={<RootHandler />} />

        {/* Public Routes (Auth Layout) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={<PlaceholderPage title="Đăng nhập" description="Đăng nhập tài khoản phụ huynh bằng email/số điện thoại hoặc Google." />}
            />
            <Route
              path="/register"
              element={<PlaceholderPage title="Đăng ký" description="Tạo tài khoản phụ huynh mới trên nền tảng BuddyLink." />}
            />
            <Route
              path="/forgot-password"
              element={<PlaceholderPage title="Quên mật khẩu" description="Gửi yêu cầu khôi phục mật khẩu qua email." />}
            />
            <Route
              path="/reset-password"
              element={<PlaceholderPage title="Đặt lại mật khẩu" description="Cập nhật mật khẩu mới cho tài khoản." />}
            />
            <Route
              path="/verify-otp"
              element={<PlaceholderPage title="Xác minh mã OTP" description="Nhập mã OTP được gửi về số điện thoại hoặc email." />}
            />
          </Route>
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Parent Role Routes */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.PARENT]} />}>
            {ParentRoutes()}
          </Route>

          {/* Admin Role Routes */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
            {AdminRoutes()}
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
