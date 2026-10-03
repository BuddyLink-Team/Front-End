/**
 * Utility functions for error handling.
 */

/**
 * Extract a human-readable error message from an API error response.
 *
 * Each module is responsible for defining its own `errorMap` (a plain object
 * mapping backend error codes to Vietnamese messages) and passing it here.
 * This keeps module-specific error strings co-located with the module's
 * constants rather than hardcoded in a shared utility.
 *
 * @param {Record<string, string>} errorMap - Module-specific error code map.
 * @param {any} err - The caught error from an API call.
 * @param {string} [fallback] - Fallback message when no mapping is found.
 * @returns {string}
 */
export const getApiErrorMsg = (
  errorMap,
  err,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại.',
) => {
  const code =
    err?.code ||
    err?.error?.code ||
    err?.response?.data?.error?.code ||
    (typeof err?.error === 'string' ? err?.error : null);

  if (code && errorMap?.[code]) {
    return errorMap[code];
  }

  // Check direct backend message key mapping
  const backendMsg = err?.response?.data?.message || err?.message;
  if (backendMsg && errorMap?.[backendMsg]) {
    return errorMap[backendMsg];
  }

  // Extract first validation error detail if available
  const details = err?.response?.data?.error?.details || err?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    const firstDetail = details[0];
    const detailMsg = firstDetail?.message || (typeof firstDetail === 'string' ? firstDetail : null);
    if (detailMsg && errorMap?.[detailMsg]) {
      return errorMap[detailMsg];
    }
    if (detailMsg) {
      return detailMsg;
    }
  }

  return backendMsg || fallback;
};
