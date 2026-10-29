import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminAnalytics } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

export const DASHBOARD_PRESETS = [
  { id: 'today', label: 'Hôm nay', days: 0, defaultGroupBy: 'day' },
  { id: '7d', label: '7 ngày qua', days: 6, defaultGroupBy: 'day' },
  { id: '30d', label: '30 ngày qua', days: 29, defaultGroupBy: 'day' },
  { id: '3m', label: '3 tháng qua', days: 89, defaultGroupBy: 'week' },
  { id: '12m', label: '12 tháng qua', days: 364, defaultGroupBy: 'month' },
];

const getRangeFromPreset = (presetId) => {
  const preset = DASHBOARD_PRESETS.find((p) => p.id === presetId) || DASHBOARD_PRESETS[2];
  const to = dayjs().format('YYYY-MM-DD');
  const from = dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD');
  return { from, to, defaultGroupBy: preset.defaultGroupBy };
};

/**
 * Hook to manage admin dashboard analytics state, date range filters, and groupBy interval.
 */
export const useAdminDashboard = (initialPreset = '30d') => {
  const dispatch = useDispatch();
  const initial = getRangeFromPreset(initialPreset);

  const [preset, setPreset] = useState(initialPreset);
  const [dateRange, setDateRange] = useState({ from: initial.from, to: initial.to });
  const [groupBy, setGroupBy] = useState(initial.defaultGroupBy);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const applyPreset = useCallback((presetId) => {
    setPreset(presetId);
    if (presetId !== 'custom') {
      const range = getRangeFromPreset(presetId);
      setDateRange({ from: range.from, to: range.to });
      setGroupBy(range.defaultGroupBy);
    }
  }, []);

  const handleCustomRange = useCallback((newRange) => {
    setPreset('custom');
    setDateRange(newRange);
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        fromDate: dateRange.from,
        toDate: dateRange.to,
        groupBy,
      };
      const data = await dispatch(fetchAdminAnalytics(params)).unwrap();
      setAnalytics(data);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được dữ liệu phân tích hệ thống.'));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, dateRange.from, dateRange.to, groupBy]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    analytics,
    isLoading,
    errorMessage,
    dateRange,
    setDateRange: handleCustomRange,
    preset,
    setPreset: applyPreset,
    groupBy,
    setGroupBy,
    reload,
  };
};

export default useAdminDashboard;
