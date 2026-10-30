import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { fetchAdminUsers, fetchAdminUserStats, updateAdminUserStatus } from '../redux/adminSlice';
import { useAdminStats } from './useAdminStats';
import { useAdminExport } from './useAdminExport';
import { buildUsersReportSheets, fetchAllPages } from '../utils/excelExport';
import { ADMIN_ERROR_MESSAGES, USER_STATUS_CHIPS, withStatusQuery } from '../constants/admin.constants';

/**
 * Parent accounts screen: server-side list, detail drawer, lock / unlock and export.
 * Another admin screen can open a parent's drawer with `navigate(ADMIN_ROUTES.USERS, { state: { openUserId } })`.
 */
export const useAdminUsers = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isUpdatingStatus = useSelector((state) => state.admin.isUpdatingStatus);

  const fetchUsers = useCallback(
    (params) => dispatch(fetchAdminUsers(withStatusQuery(USER_STATUS_CHIPS, params))).unwrap(),
    [dispatch]
  );
  const table = useServerTable({
    fetcher: fetchUsers,
    defaultParams: { limit: 10, status: '', isVerified: '' },
  });
  const { searchInput, filters, setSearch, setFilters, refetch, error } = table;
  const stats = useAdminStats(fetchAdminUserStats);
  const reloadStats = stats.reload;

  const [selectedUserId, setSelectedUserId] = useState(() => location.state?.openUserId || null);
  const [lockTargetUser, setLockTargetUser] = useState(null);
  // Bumped after a status change so an open detail drawer reloads
  const [detailVersion, setDetailVersion] = useState(0);

  const hasActiveFilters = Boolean(searchInput || filters.status || filters.isVerified);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({ status: '', isVerified: '' });
  }, [setSearch, setFilters]);

  const confirmLockToggle = useCallback(async () => {
    if (!lockTargetUser) return;
    const nextActive = !lockTargetUser.isActive;

    try {
      await dispatch(updateAdminUserStatus({ userId: lockTargetUser.id, isActive: nextActive })).unwrap();
      success(
        nextActive
          ? `Đã mở khóa tài khoản ${lockTargetUser.fullName}.`
          : `Đã khóa tài khoản ${lockTargetUser.fullName}.`
      );
      setLockTargetUser(null);
      refetch();
      reloadStats();
      setDetailVersion((version) => version + 1);
    } catch (err) {
      toastError(
        getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.')
      );
    }
  }, [dispatch, lockTargetUser, success, toastError, refetch, reloadStats]);

  const openChildProfile = useCallback(
    (child) => navigate(ADMIN_ROUTES.CHILDREN, { state: { openChildId: child.id } }),
    [navigate]
  );

  // Same query as the list: the status chip is turned into its API filter
  const { isExporting, handleExport } = useAdminExport({
    page: 'users',
    buildSheets: buildUsersReportSheets,
    fetchData: async () => ({
      users: await fetchAllPages(fetchUsers, { search: searchInput, status: filters.status, isVerified: filters.isVerified }),
      stats: stats.stats,
    }),
    successMessage: 'Đã xuất danh sách phụ huynh ra file Excel.',
  });

  return {
    ...table,
    listErrorMessage: error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, error, 'Không tải được danh sách phụ huynh. Vui lòng thử lại.')
      : null,
    stats,
    hasActiveFilters,
    resetFilters,
    selectedUserId,
    openUserDetail: setSelectedUserId,
    closeUserDetail: () => setSelectedUserId(null),
    detailVersion,
    lockTargetUser,
    openLockDialog: setLockTargetUser,
    closeLockDialog: () => setLockTargetUser(null),
    isUpdatingStatus,
    confirmLockToggle,
    openChildProfile,
    isExporting,
    handleExport,
  };
};

export default useAdminUsers;
