import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleHomePath, USER_ROLES } from '../constants/role.constants';

/**
 * Route guard that only permits unauthenticated users.
 * Authenticated users are redirected to their role's home page (or /verify-otp if unverified).
 */
export const PublicRoute = () => {
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (user?.role === USER_ROLES.PARENT) {
      const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
      const isEmailVerified = !!parent?.verification?.isEmailVerified;
      const isVerified = isPhoneVerified && (isEmailVerified || !!user?.googleId);

      if (!isVerified) {
        return <Navigate to="/verify-otp" replace />;
      }
    }

    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
