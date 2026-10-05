import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ParentRoutes } from './ParentRoutes';
import { AdminRoutes } from './AdminRoutes';
import { USER_ROLES, getRoleHomePath } from '../constants/role.constants';
import { needsVerification } from '../modules/auth/utils/verification';
import { MainLayout } from '../layouts/MainLayout';
import { useSessionBootstrap } from '../modules/auth/hooks/useSessionBootstrap';

// Pages are code-split: each route downloads its own chunk on first visit
const LandingPage = lazy(() => import('../modules/auth/pages/LandingPage'));
const AuthPage = lazy(() => import('../modules/auth/pages/AuthPage'));
const ForgotPasswordPage = lazy(() => import('../modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../modules/auth/pages/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('../modules/auth/pages/VerifyOtpPage'));
const OnboardingChildPage = lazy(() => import('../modules/child/pages/OnboardingChildPage'));

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

  if (needsVerification(user, parent)) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

export const AppRoutes = () => {
  const { isCheckingSession } = useSessionBootstrap();

  // Route guards must not decide on cached data before the session is verified
  if (isCheckingSession) {
    return <LoadingOverlay show fullPage message="Đang kiểm tra phiên đăng nhập..." />;
  }

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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* OTP Verification: signed-in parents who have not finished verification yet */}
        <Route element={<ProtectedRoute requireVerification={false} />}>
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Route>

        {/* Onboarding: verified parents only */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.PARENT]} />}>
            <Route path="/onboarding-child" element={<OnboardingChildPage />} />
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
