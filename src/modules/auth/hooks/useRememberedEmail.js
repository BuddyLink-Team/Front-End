import { useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '../../../constants/storage.constants';

/**
 * "Remember me" email for the login form, persisted in localStorage.
 */
export const useRememberedEmail = () => {
  const rememberedEmail = useMemo(
    () => localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '',
    [],
  );

  const saveRememberedEmail = useCallback((email, shouldRemember) => {
    if (shouldRemember && email) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }
  }, []);

  return { rememberedEmail, saveRememberedEmail };
};

export default useRememberedEmail;
