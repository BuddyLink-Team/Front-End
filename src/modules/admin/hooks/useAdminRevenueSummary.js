import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import {
  fetchAdminPlans,
  fetchAdminRevenueSummary,
  fetchAdminSubscriptions,
  fetchAdminTransactions,
} from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import {
  buildRevenueReportSheets,
  createRevenueWorkbookBlob,
  downloadBlob,
  fetchAllPages,
} from '../utils/revenueReport';

/**
 * Revenue overview tab: KPIs and monthly revenue over a date range, and its Excel report
 * (overview, monthly revenue, plans, every subscription, every payment created in the range).
 * @param {{ from: string, to: string }} [initialRange] - 'YYYY-MM-DD'; empty = the API default (last 6 months)
 */
export const useAdminRevenueSummary = (initialRange = { from: '', to: '' }) => {
  const dispatch = useDispatch();
  const { success, error: toastError } = useToast();
  const [dateRange, setDateRange] = useState(initialRange);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportReport = useCallback(async () => {
    if (!summary) return;
    setIsExporting(true);
    try {
      const fetchPage = (thunk) => (params) => dispatch(thunk(params)).unwrap();
      // Payments of the same period as the figures of the report
      const period = { fromDate: summary.filter.fromDate, toDate: summary.filter.toDate };
      const [plansData, subscriptions, transactions] = await Promise.all([
        dispatch(fetchAdminPlans()).unwrap(),
        fetchAllPages(fetchPage(fetchAdminSubscriptions)),
        fetchAllPages(fetchPage(fetchAdminTransactions), period),
      ]);
      const blob = await createRevenueWorkbookBlob(
        buildRevenueReportSheets({ summary, plans: plansData?.plans || [], subscriptions, transactions })
      );
      downloadBlob(blob, `buddylink-bao-cao-doanh-thu-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`);
      success('Đã xuất báo cáo doanh thu.');
    } catch (err) {
      toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không xuất được báo cáo doanh thu.'));
    } finally {
      setIsExporting(false);
    }
  }, [dispatch, summary, success, toastError]);

  return { summary, isLoading, errorMessage, dateRange, setDateRange, reload, exportReport, isExporting };
};

export default useAdminRevenueSummary;
