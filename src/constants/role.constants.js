/**
 * User roles in BuddyLink system.
 */
export const USER_ROLES = {
  PARENT: 'parent',
  ADMIN: 'admin',
};

/**
 * Returns default redirect path after login based on user role.
 *
 * @param {string} [role]
 * @returns {string} Target path
 */
export const getRoleHomePath = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return '/admin/dashboard';
  }
  return '/discovery';
};
