import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from '../../../hooks/useDebounce';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchBlockedUsers } from '../redux/safetySlice';
import { BLOCKED_USERS_PAGE_SIZE, SAFETY_ERROR_MESSAGES } from '../constants/safetyConstants';
import { useSafetyActions } from './useSafetyActions';

/**
 * Blocked users list of the current parent: server-side pagination and name search, unblock.
 */
export const useBlockedUsers = () => {
  const dispatch = useDispatch();
  const { isBlockSubmitting: isSubmitting, unblockUser } = useSafetyActions();
  const blockedUsers = useSelector((state) => state.safety.blockedUsers);
  const isLoading = useSelector((state) => state.safety.isLoadingBlockedUsers);
  const error = useSelector((state) => state.safety.blockedUsersError);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 400);

  const load = useCallback(() => {
    // Errors are kept in the slice and shown by the page
    dispatch(fetchBlockedUsers({ page, limit: BLOCKED_USERS_PAGE_SIZE, search: debouncedSearch || undefined }));
  }, [dispatch, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // A new search starts from the first page
  const changeSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const unblock = useCallback(
    async (user) => {
      const result = await unblockUser(user.parentId, user.fullName);
      if (!result.success) return result;

      // The last item of a page is gone: show the previous page, otherwise refill the current one
      if (blockedUsers.items.length <= 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        load();
      }
      return result;
    },
    [unblockUser, blockedUsers.items.length, page, load],
  );

  return {
    items: blockedUsers.items,
    pagination: blockedUsers.pagination,
    page,
    setPage,
    search,
    setSearch: changeSearch,
    isSearching: Boolean(debouncedSearch),
    isLoading,
    errorMessage: error
      ? getApiErrorMsg(SAFETY_ERROR_MESSAGES, error, 'Đã xảy ra sự cố khi tải danh sách. Vui lòng thử lại.')
      : null,
    isSubmitting,
    reload: load,
    unblock,
  };
};

export default useBlockedUsers;
