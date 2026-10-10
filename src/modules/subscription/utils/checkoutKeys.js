import { STORAGE_KEYS } from '../../../constants/storage.constants';

/**
 * Idempotency-Key of the checkout per plan, kept for the browser tab (sessionStorage) so a reload
 * or retry resumes the same PayOS order instead of creating a new one.
 */
const storageKeyOf = (planCode) => `${STORAGE_KEYS.CHECKOUT_IDEMPOTENCY_PREFIX}${planCode}`;

const generateKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/** Current key of the plan, created on first use */
export const getCheckoutKey = (planCode) => {
  let key = sessionStorage.getItem(storageKeyOf(planCode));
  if (!key) {
    key = generateKey();
    sessionStorage.setItem(storageKeyOf(planCode), key);
  }
  return key;
};

/** New key of the plan: the next checkout creates a new order */
export const regenerateCheckoutKey = (planCode) => {
  const key = generateKey();
  sessionStorage.setItem(storageKeyOf(planCode), key);
  return key;
};

export const clearCheckoutKey = (planCode) => {
  if (planCode) sessionStorage.removeItem(storageKeyOf(planCode));
};

/** Drop the keys of every plan (logout: the next account never resumes these orders) */
export const clearAllCheckoutKeys = () => {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(STORAGE_KEYS.CHECKOUT_IDEMPOTENCY_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
};
