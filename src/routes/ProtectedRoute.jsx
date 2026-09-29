import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../constants/role.constants';

/**
 * Route guard that requires user to be authenticated and verified.
 * Parents must complete verification before accessing protected features.
 */
export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Mandatory verification check for Parent accounts
  if (user?.role === USER_ROLES.PARENT) {
    const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
    const isEmailVerified = !!parent?.verification?.isEmailVerified;
    const isVerified = isPhoneVerified && (isEmailVerified || !!user?.googleId);

    if (!isVerified) {
      return <Navigate to="/verify-otp" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
