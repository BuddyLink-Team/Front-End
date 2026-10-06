import { USER_ROLES } from '../../../constants/role.constants';

/**
 * A parent is fully verified once both phone and email are verified.
 * (Google sign-in marks the email as verified on the backend, so no special case is needed.)
 * @param {Object|null} parent
 * @returns {boolean}
 */
export const isParentVerified = (parent) =>
  Boolean(parent?.verification?.isPhoneVerified && parent?.verification?.isEmailVerified);

/**
 * Whether the signed-in account still has to finish OTP verification before using the app.
 * Admin accounts never need it.
 * @param {Object|null} user
 * @param {Object|null} parent
 * @returns {boolean}
 */
export const needsVerification = (user, parent) =>
  user?.role === USER_ROLES.PARENT && !isParentVerified(parent);
