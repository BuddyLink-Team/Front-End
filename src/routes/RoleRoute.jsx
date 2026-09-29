import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRoleHomePath } from '../constants/role.constants';

/**
 * Route guard that restricts access based on allowed user roles.
 *
 * @param {Array<string>} [allowedRoles=[]]
 */
export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
