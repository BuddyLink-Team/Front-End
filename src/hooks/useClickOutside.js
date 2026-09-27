import { useEffect } from 'react';

/**
 * Hook to trigger handler when clicking outside of element ref.
 *
 * @param {import('react').RefObject} ref - React ref of the element to detect outside clicks for.
 * @param {boolean|Function} enabledOrHandler - Either boolean flag to enable or handler function.
 * @param {Function} [maybeHandler] - Handler function when 2nd argument is a boolean flag.
 */
export function useClickOutside(ref, enabledOrHandler, maybeHandler) {
  const handler = typeof enabledOrHandler === 'function' ? enabledOrHandler : maybeHandler;
  const enabled = typeof enabledOrHandler === 'boolean' ? enabledOrHandler : true;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler?.(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, enabled, handler]);
}

export default useClickOutside;
