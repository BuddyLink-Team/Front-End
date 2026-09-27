import { useState, useMemo } from 'react';

/**
 * Hook for client-side sorting on table rows.
 *
 * @param {Array<object>} rows - The data rows to sort.
 * @param {string} [initialKey=''] - Default column key to sort by.
 * @param {'asc'|'desc'} [initialDir='asc'] - Default direction.
 */
export function useTableSort(rows = [], initialKey = '', initialDir = 'asc') {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey || !Array.isArray(rows)) return rows;

    return [...rows].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      return sortDir === 'asc'
        ? strA.localeCompare(strB, 'vi')
        : strB.localeCompare(strA, 'vi');
    });
  }, [rows, sortKey, sortDir]);

  return {
    sortKey,
    sortDir,
    sortedRows,
    handleSort,
  };
}

export default useTableSort;
