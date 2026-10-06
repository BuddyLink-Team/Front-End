/**
 * Utility functions for error handling.
 */
import { COMMON_ERROR_MESSAGES } from '../constants/error.constants';

/**
 * Get the error code from an API error body ({ error: { code } }), a socket ack ({ code })
 * or a Firebase error ({ code }).
 * @param {any} err
 * @returns {string|null}
 */
export const getErrorCode = (err) => err?.error?.code || err?.code || null;

/**
 * Map a backend error code to a Vietnamese message.
 *
 * Each module defines its own `errorMap` (backend error code -> Vietnamese message) for the codes
 * its endpoints return; codes shared by every endpoint live in COMMON_ERROR_MESSAGES.
 * The backend's English message is never shown: unmapped codes fall back to `fallback`.
 *
 * @param {Record<string, string>} errorMap - Module-specific error code map.
 * @param {any} err - The caught error from an API call / socket ack.
 * @param {string} [fallback] - Message when the code is not mapped.
 * @returns {string}
 */
export const getApiErrorMsg = (errorMap, err, fallback = 'Có lỗi xảy ra, vui lòng thử lại.') => {
  const code = getErrorCode(err);
  if (!code) return fallback;
  return errorMap?.[code] || COMMON_ERROR_MESSAGES[code] || fallback;
};
