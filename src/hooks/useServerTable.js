import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import { PAGINATION } from '../constants/app.constants';

const CONTROL_KEYS = ['page', 'limit', 'search', 'sortKey', 'sortDir'];

const isEmptyValue = (value) => value === undefined || value === null || value === '';

// Drop empty values so they neither reach the URL nor the API
const compact = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => !isEmptyValue(value)));

const toPositiveInt = (value, fallback) => {
  const number = parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

/**
 * Server-side list state for admin tables: page, limit, search (debounced), filters and sort,
 * kept in the URL query so a reload or a shared link opens the same view.
 *
 * The fetcher receives `{ page, limit, search?, sortKey?, sortDir?, ...filters }` (empty values left out)
 * and returns the API body `{ data: { items, pagination } }` (or `{ items, pagination }` directly).
 * Changing the search, a filter or the sort goes back to page 1.
 *
 * @param {Object} options
 * @param {Function} options.fetcher - (params) => Promise
 * @param {Object} [options.defaultParams] - Initial values (e.g. { limit: 20, status: 'active' })
 * @param {boolean} [options.syncWithUrl=true] - false keeps the state in memory
 *   (e.g. several tables in the tabs of one page)
 * @param {number} [options.debounceMs=400] - Delay before the typed search is applied
 * @returns {{ rows: Array<object>, pagination: {page: number, limit: number, total: number, totalPages: number},
 *   isLoading: boolean, error: any, params: Object, searchInput: string, setSearch: Function,
 *   setFilter: Function, setFilters: Function, setSort: Function, setPage: Function, refetch: Function }}
 */
export function useServerTable({ fetcher, defaultParams = {}, syncWithUrl = true, debounceMs = 400 }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [memoryParams, setMemoryParams] = useState({});

  const rawParams = syncWithUrl ? Object.fromEntries(searchParams) : memoryParams;
  const defaultsKey = JSON.stringify(defaultParams);

  const params = useMemo(() => {
    const merged = { ...JSON.parse(defaultsKey), ...rawParams };
    return compact({
      ...merged,
      page: toPositiveInt(merged.page, PAGINATION.DEFAULT_PAGE),
      limit: toPositiveInt(merged.limit, PAGINATION.DEFAULT_LIMIT),
    });
    // rawParams is rebuilt every render: compare it by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawParams), defaultsKey]);
  const paramsKey = JSON.stringify(params);

  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const apply = (current) => compact({ ...current, ...patch, ...(resetPage ? { page: undefined } : {}) });
      if (syncWithUrl) {
        setSearchParams((current) => apply(Object.fromEntries(current)), { replace: true });
      } else {
        setMemoryParams(apply);
      }
    },
    [syncWithUrl, setSearchParams]
  );

  // The input shows what is typed right away; the query follows after the debounce
  const [searchInput, setSearchInput] = useState(params.search || '');
  const debouncedSearch = useDebounce(searchInput, debounceMs);
  useEffect(() => {
    if ((debouncedSearch.trim() || undefined) !== params.search) {
      updateParams({ search: debouncedSearch.trim() });
    }
    // Only a new debounced value should write the search back
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [state, setState] = useState({
    rows: [],
    pagination: { page: params.page, limit: params.limit, total: 0, totalPages: 1 },
    isLoading: true,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let isCurrent = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    Promise.resolve(fetcherRef.current(JSON.parse(paramsKey)))
      .then((response) => {
        if (!isCurrent) return;
        const payload = response?.data ?? response ?? {};
        const { page, limit } = JSON.parse(paramsKey);
        setState({
          rows: payload.items || [],
          pagination: payload.pagination || { page, limit, total: payload.items?.length || 0, totalPages: 1 },
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (isCurrent) setState((prev) => ({ ...prev, isLoading: false, error }));
      });

    // A response that arrives after the params changed again is ignored
    return () => {
      isCurrent = false;
    };
  }, [paramsKey, reloadToken]);

  const setFilters = useCallback((filters) => updateParams(filters), [updateParams]);
  const setFilter = useCallback((key, value) => updateParams({ [key]: value }), [updateParams]);
  const setSort = useCallback(({ sortKey, sortDir }) => updateParams({ sortKey, sortDir }), [updateParams]);
  const setPage = useCallback((page) => updateParams({ page }, { resetPage: false }), [updateParams]);
  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const filters = Object.fromEntries(Object.entries(params).filter(([key]) => !CONTROL_KEYS.includes(key)));

  return {
    ...state,
    params,
    filters,
    searchInput,
    setSearch: setSearchInput,
    setFilter,
    setFilters,
    setSort,
    setPage,
    refetch,
  };
}

export default useServerTable;
