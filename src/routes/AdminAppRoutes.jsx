import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AdminRoutes } from './AdminRoutes';
import { USER_ROLES } from '../constants/role.constants';
import { useSessionBootstrap } from '../modules/auth/hooks/useSessionBootstrap';

const AdminLoginPage = lazy(() => import('../modules/admin/pages/AdminLoginPage'));

/**
 * Routes of the admin portal build (VITE_APP_TARGET=admin). Parent pages are not part of this build.
 */
export const AdminAppRoutes = () => {
  const { isCheckingSession } = useSessionBootstrap();

  // Route guards must not decide on cached data before the session is verified
  if (isCheckingSession) {
    return <LoadingOverlay show fullPage message="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <Suspense fallback={<LoadingOverlay show fullPage message="Đang tải giao diện..." />}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AdminLoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
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

export default AdminAppRoutes;
