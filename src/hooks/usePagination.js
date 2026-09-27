import { useMemo } from 'react';

/**
 * Hook to compute pagination window with ellipsis for large page ranges.
 *
 * @param {number} currentPage - Active page index (1-indexed).
 * @param {number} totalPages - Total available pages.
 */
export function usePagination(currentPage = 1, totalPages = 1) {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const current = Math.min(Math.max(1, currentPage), totalPages);
    const delta = 1;
    const range = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift('...');
    }
    if (current + delta < totalPages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [currentPage, totalPages]);

  return {
    isPrevDisabled,
    isNextDisabled,
    pages,
  };
}

export default usePagination;
