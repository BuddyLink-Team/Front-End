import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing search input state with built-in debounce.
 *
 * @param {Function} onSearch - Callback invoked after debounce delay.
 * @param {number} [delay=300] - Debounce delay in milliseconds.
 * @returns {object} { query, handleSearch, resetSearch }
 */
export function useSearch(onSearch, delay = 300) {
  const [query, setQuery] = useState('');
  const timerRef = useRef(null);

  const handleSearch = useCallback(
    (value) => {
      setQuery(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        onSearch?.(value);
      }, delay);
    },
    [onSearch, delay]
  );

  const resetSearch = useCallback(() => {
    setQuery('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onSearch?.('');
  }, [onSearch]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    query,
    handleSearch,
    resetSearch,
  };
}

export default useSearch;
