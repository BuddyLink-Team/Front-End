import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleHomePath } from '../constants/role.constants';

/**
 * Route guard that only permits unauthenticated users.
 * Authenticated users are redirected to their role's home page.
 */
export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
