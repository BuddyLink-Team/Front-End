import { useState, useCallback } from 'react';

const SIDEBAR_EXPANDED = 'w-64';
const SIDEBAR_COLLAPSED = 'w-20';
const STORAGE_KEY = 'buddylink_sidebar_collapsed';

/**
 * Hook for managing collapsible sidebar state with localStorage persistence.
 *
 * @returns {object} { collapsed, toggle, sidebarWidth }
 */
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return {
    collapsed,
    toggle,
    sidebarWidth: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
  };
}

export default useSidebar;
