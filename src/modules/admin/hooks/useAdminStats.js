import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Platform-wide counts shown above an admin list (not affected by its filters)
 * @param {Function} fetchThunk - fetchAdminUserStats or fetchAdminChildStats
 * @returns {{ stats: Object|null, isLoading: boolean, hasError: boolean, reload: Function }}
 */
export const useAdminStats = (fetchThunk) => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setStats(await dispatch(fetchThunk()).unwrap());
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, fetchThunk]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { stats, isLoading, hasError, reload };
};

export default useAdminStats;
