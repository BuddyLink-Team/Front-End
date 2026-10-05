import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleHomePath } from '../constants/role.constants';
import { needsVerification } from '../modules/auth/utils/verification';

/**
 * Route guard that only permits unauthenticated users.
 * Authenticated users are redirected to their role's home page (or /verify-otp if unverified).
 */
export const PublicRoute = () => {
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (needsVerification(user, parent)) {
      return <Navigate to="/verify-otp" replace />;
    }

    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
