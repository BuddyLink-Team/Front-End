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
import { MainLayout } from '../layouts/MainLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';
import LandingPage from '../modules/auth/pages/LandingPage';
import AuthPage from '../modules/auth/pages/AuthPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../modules/auth/pages/VerifyOtpPage';
import OnboardingChildPage from '../modules/child/pages/OnboardingChildPage';


/**
 * Root route handler:
 * - Unauthenticated guest: Show LandingPage
 * - Authenticated user: Redirect to their role home page (/discovery or /admin/dashboard)
 */
const RootHandler = () => {
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === USER_ROLES.PARENT) {
    const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
    const isEmailVerified = !!parent?.verification?.isEmailVerified;
    const isVerified = isPhoneVerified && (isEmailVerified || !!user?.googleId);

    if (!isVerified) {
      return <Navigate to="/verify-otp" replace />;
    }
  }

  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <LoadingOverlay show fullPage message="Đang tải giao diện..." />
      }
    >
      <Routes>
        {/* Root Route: Landing Page for guests, role-based redirect for logged in users */}
        <Route path="/" element={<RootHandler />} />

        {/* Public Routes (Wrapped in MainLayout for Header & Footer) */}
        <Route element={<PublicRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password"
              element={
                <PlaceholderPage
                  title="Đặt lại mật khẩu"
                  description="Cập nhật mật khẩu mới cho tài khoản."
                />
              }
            />
          </Route>
        </Route>

        {/* OTP Verification Route (Accessible by logged in parents as well) */}
        <Route>
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/onboarding-child" element={<OnboardingChildPage />} />
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
