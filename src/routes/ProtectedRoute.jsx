import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { needsVerification } from '../modules/auth/utils/verification';

/**
 * Route guard that requires an authenticated user.
 *
 * @param {Object} props
 * @param {boolean} [props.requireVerification=true] - Parents must finish OTP verification first.
 *   Set to false for the verification screen itself. Already-verified users are sent away by that
 *   screen on mount only: redirecting here would also fire right after a successful verification
 *   and override the screen's own navigation to onboarding.
 */
export const ProtectedRoute = ({ requireVerification = true }) => {
  const location = useLocation();
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireVerification && needsVerification(user, parent)) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
