import { useState, useCallback } from 'react';

/**
 * Hook for managing mutually exclusive dropdown open state.
 * Only one dropdown (e.g. notifications, user menu) can be open at a time.
 *
 * @returns {object} { openDropdown, toggleDropdown, closeDropdown }
 */
export function useDropdownToggle() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = useCallback((name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  return { openDropdown, toggleDropdown, closeDropdown };
}

export default useDropdownToggle;
