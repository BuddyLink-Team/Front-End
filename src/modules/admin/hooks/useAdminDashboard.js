import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminAnalytics } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import {
  ANALYTICS_GROUP_BY,
  ANALYTICS_GROUP_BY_DAY_LIMIT,
  ANALYTICS_GROUP_BY_WEEK_LIMIT,
  ANALYTICS_MAX_RANGE_DAYS,
} from '../constants/dashboard.constants';

const DEFAULT_RANGE_DAYS = 30;

const getDefaultRange = () => ({
  from: dayjs().subtract(DEFAULT_RANGE_DAYS - 1, 'day').format('YYYY-MM-DD'),
  to: dayjs().format('YYYY-MM-DD'),
});

// Long ranges read better with larger periods; the admin can still pick another grouping afterwards
const getDefaultGroupBy = ({ from, to }) => {
  const days = from && to ? dayjs(to).diff(dayjs(from), 'day') + 1 : DEFAULT_RANGE_DAYS;
  if (days <= ANALYTICS_GROUP_BY_DAY_LIMIT) return ANALYTICS_GROUP_BY.DAY;
  if (days <= ANALYTICS_GROUP_BY_WEEK_LIMIT) return ANALYTICS_GROUP_BY.WEEK;
  return ANALYTICS_GROUP_BY.MONTH;
};

// Message for a range the API would refuse, null when it is fine
const getRangeError = ({ from, to }) => {
  const end = to ? dayjs(to) : dayjs();
  if (!from) return null;
  if (dayjs(from).isAfter(end, 'day')) return 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.';
  if (end.diff(dayjs(from), 'day') > ANALYTICS_MAX_RANGE_DAYS) return 'Chỉ xem được tối đa 12 tháng.';
  return null;
};

/**
 * Analytics of the admin dashboard: date range, grouping and the single /admin/analytics call of the page.
 */
export const useAdminDashboard = () => {
  const dispatch = useDispatch();
  const [dateRange, setDateRangeState] = useState(getDefaultRange);
  const [groupBy, setGroupBy] = useState(ANALYTICS_GROUP_BY.DAY);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const latestRequest = useRef(0);

  const setDateRange = useCallback((range) => {
    setDateRangeState(range);
    setGroupBy(getDefaultGroupBy(range));
  }, []);

  const reload = useCallback(async () => {
    const rangeError = getRangeError(dateRange);
    if (rangeError) {
      setErrorMessage(rangeError);
      setIsLoading(false);
      return;
    }

    // A response answered after a newer request started is ignored
    latestRequest.current += 1;
    const requestNumber = latestRequest.current;
    setIsLoading(true);
    try {
      const data = await dispatch(
        fetchAdminAnalytics({
          ...(dateRange.from ? { fromDate: dateRange.from } : {}),
          ...(dateRange.to ? { toDate: dateRange.to } : {}),
          groupBy,
        })
      ).unwrap();
      if (requestNumber !== latestRequest.current) return;
      setAnalytics(data);
      setErrorMessage(null);
    } catch (err) {
      if (requestNumber !== latestRequest.current) return;
      setErrorMessage(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được dữ liệu thống kê hệ thống.'));
    } finally {
      if (requestNumber === latestRequest.current) setIsLoading(false);
    }
  }, [dispatch, dateRange, groupBy]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { analytics, isLoading, errorMessage, dateRange, setDateRange, groupBy, setGroupBy, reload };
};

export default useAdminDashboard;
