import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminSubscriptionApi } from '../api/adminSubscriptionApi';

export const useAdminRevenueSummary = (initialDateRange = { from: '', to: '' }) => {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (range) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (range?.from) params.fromDate = range.from;
      if (range?.to) params.toDate = range.to;

      const response = await adminSubscriptionApi.getRevenueSummary(params);
      const data = response?.data || response;
      setSummary(data);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải thống kê doanh thu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(dateRange);
  }, [fetchSummary, dateRange]);

  const handleDateRangeChange = useCallback((newRange) => {
    setDateRange(newRange);
  }, []);

  return {
    summary,
    isLoading,
    error,
    dateRange,
    setDateRange: handleDateRangeChange,
    refetch: () => fetchSummary(dateRange),
  };
};

export default useAdminRevenueSummary;
