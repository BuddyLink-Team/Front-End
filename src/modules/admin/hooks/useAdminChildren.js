import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useServerTable } from '../../../hooks/useServerTable';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { fetchAdminChildren, fetchAdminChildStats } from '../redux/adminSlice';
import { useAdminStats } from './useAdminStats';
import { useAdminExport } from './useAdminExport';
import { fetchAllPages } from '../utils/excelExport';
import {
  ADMIN_ERROR_MESSAGES,
  AGE_RANGE_OPTIONS,
  CHILD_STATUS_CHIPS,
  withStatusQuery,
} from '../constants/admin.constants';

const DEFAULT_FILTERS = { status: '', gender: '', ageRange: '' };

// Turn the UI filters (kept in the URL) into the API query: the status tab becomes its filter,
// the age range becomes minAge / maxAge
const toChildrenQuery = ({ ageRange, ...params }) => {
  const range = ageRange ? AGE_RANGE_OPTIONS.find((opt) => opt.value === ageRange) : null;
  return {
    ...withStatusQuery(CHILD_STATUS_CHIPS, params),
    ...(range ? { minAge: range.minAge, maxAge: range.maxAge } : {}),
  };
};

/**
 * Child profiles screen (read-only): server-side list, detail drawer and export.
 * Another admin screen can open a child's drawer with `navigate(ADMIN_ROUTES.CHILDREN, { state: { openChildId } })`.
 */
export const useAdminChildren = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchChildren = useCallback(
    (params) => dispatch(fetchAdminChildren(toChildrenQuery(params))).unwrap(),
    [dispatch]
  );
  const table = useServerTable({ fetcher: fetchChildren, defaultParams: { limit: 10, ...DEFAULT_FILTERS } });
  const { searchInput, filters, setSearch, setFilters, error } = table;
  const stats = useAdminStats(fetchAdminChildStats);

  const [selectedChildId, setSelectedChildId] = useState(() => location.state?.openChildId || null);

  const hasActiveFilters = Boolean(searchInput || filters.status || filters.gender || filters.ageRange);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters(DEFAULT_FILTERS);
  }, [setSearch, setFilters]);

  const openParentAccount = useCallback(
    (parentUserId) => {
      if (parentUserId) navigate(ADMIN_ROUTES.USERS, { state: { openUserId: parentUserId } });
    },
    [navigate]
  );

  const { isExporting, handleExport } = useAdminExport('children', async () => {
    const range = filters.ageRange ? AGE_RANGE_OPTIONS.find((opt) => opt.value === filters.ageRange) : null;
    const query = {
      ...withStatusQuery(CHILD_STATUS_CHIPS, { status: filters.status, gender: filters.gender }),
      search: searchInput,
      ...(range ? { minAge: range.minAge, maxAge: range.maxAge } : {}),
    };
    const allChildren = await fetchAllPages((p) => dispatch(fetchAdminChildren(p)).unwrap(), query);
    return { children: allChildren, stats: stats.stats };
  });

  return {
    ...table,
    listErrorMessage: error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, error, 'Không tải được danh sách hồ sơ trẻ. Vui lòng thử lại.')
      : null,
    stats,
    hasActiveFilters,
    resetFilters,
    selectedChildId,
    openChildDetail: setSelectedChildId,
    closeChildDetail: () => setSelectedChildId(null),
    openParentAccount,
    isExporting,
    handleExport,
  };
};

export default useAdminChildren;
