import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminRevenueSummary } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * Revenue overview tab: KPIs and monthly revenue over a date range.
 * @param {{ from: string, to: string }} [initialRange] - 'YYYY-MM-DD'; empty = the API default (last 6 months)
 */
export const useAdminRevenueSummary = (initialRange = { from: '', to: '' }) => {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState(initialRange);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (dateRange.from) params.fromDate = dateRange.from;
      if (dateRange.to) params.toDate = dateRange.to;
      setSummary(await dispatch(fetchAdminRevenueSummary(params)).unwrap());
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được thống kê doanh thu.'));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, dateRange]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, isLoading, errorMessage, dateRange, setDateRange, reload };
};

export default useAdminRevenueSummary;
