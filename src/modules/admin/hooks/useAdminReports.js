import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import adminApi from '../api/adminApi';
import { ADMIN_ERROR_MESSAGES, REPORT_STATUS_CHIPS } from '../constants/admin.constants';
import {
  applyAdminReportAction,
  clearReportDetail,
  fetchAdminReportDetail,
  fetchAdminReports,
  fetchAdminReportStats,
  reopenAdminReport,
  resolveAdminReport,
  reviewAdminReport,
  updateAdminReportSeverity,
  assessAdminReportWithSentinel,
  applyAdminSentinelRecommendation,
} from '../redux/adminSlice';
import { fetchAllPages } from '../utils/excelExport';
import { buildModerationReportSheets } from '../utils/moderationReport';
import { useAdminExport } from './useAdminExport';
import { useAdminStats } from './useAdminStats';

const EXPORT_SUCCESS_MESSAGE = 'Xuất file báo cáo Excel thành công';

/**
 * Moderation queue: server-side list kept in the URL, stat strip, Excel export and the investigation
 * drawer. The report is fetched again every time the drawer opens; each action shows a toast, then the
 * drawer, the list and the counts refresh.
 */
export const useAdminReports = () => {
  const dispatch = useDispatch();
  const { success, error: toastError } = useToast();
  const detail = useSelector((state) => state.admin.reportDetail);
  const isActionLoading = useSelector((state) => state.admin.isOversightActionLoading);

  const fetcher = useCallback((params) => dispatch(fetchAdminReports(params)).unwrap(), [dispatch]);
  const table = useServerTable({ fetcher, defaultParams: { limit: 10 } });
  const { params, filters, searchInput, setSearch, setFilters, refetch } = table;

  const { stats, isLoading: isStatsLoading, hasError: hasStatsError, reload: reloadStats } = useAdminStats(fetchAdminReportStats);

  const [selectedReportId, setSelectedReportId] = useState(null);

  const loadDetail = useCallback(
    (id) =>
      dispatch(fetchAdminReportDetail(id))
        .unwrap()
        .catch((err) => {
          toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể tải chi tiết báo cáo.'));
          setSelectedReportId(null);
        }),
    [dispatch, toastError]
  );

  useEffect(() => {
    if (selectedReportId) {
      loadDetail(selectedReportId);
    } else {
      dispatch(clearReportDetail());
    }
  }, [dispatch, loadDetail, selectedReportId]);

  const openReportDetail = useCallback((id) => setSelectedReportId(id), []);
  const closeReportDetail = useCallback(() => setSelectedReportId(null), []);

  const runAction = useCallback(
    async (thunkAction, successMessage, errorMessage) => {
      try {
        await dispatch(thunkAction).unwrap();
        success(successMessage);
        if (selectedReportId) loadDetail(selectedReportId);
        refetch();
        reloadStats();
        return true;
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, errorMessage));
        return false;
      }
    },
    [dispatch, success, toastError, selectedReportId, loadDetail, refetch, reloadStats]
  );

  const handleClaim = useCallback(
    (id) =>
      runAction(reviewAdminReport({ id, action: 'claim' }), 'Đã tiếp nhận xử lý báo cáo.', 'Không thể tiếp nhận báo cáo.'),
    [runAction]
  );

  const handleTakeover = useCallback(
    (id) =>
      runAction(reviewAdminReport({ id, action: 'takeover' }), 'Đã tiếp quản xử lý báo cáo.', 'Không thể tiếp quản báo cáo.'),
    [runAction]
  );

  const handleUpdateSeverity = useCallback(
    (id, severity) =>
      runAction(updateAdminReportSeverity({ id, severity }), 'Đã cập nhật mức độ nghiêm trọng.', 'Không thể cập nhật mức độ.'),
    [runAction]
  );

  const handleApplyAction = useCallback(
    (id, payload) =>
      runAction(applyAdminReportAction({ id, payload }), 'Đã thi hành chế tài.', 'Không thể thi hành chế tài.'),
    [runAction]
  );

  const handleResolve = useCallback(
    (id, payload) =>
      runAction(
        resolveAdminReport({ id, payload }),
        payload.status === 'resolved' ? 'Đã đóng báo cáo: đã xử lý.' : 'Đã bác bỏ báo cáo.',
        'Không thể đóng báo cáo.'
      ),
    [runAction]
  );

  const handleReopen = useCallback(
    (id, note) =>
      runAction(reopenAdminReport({ id, note }), 'Đã mở lại báo cáo.', 'Không thể mở lại báo cáo.'),
    [runAction]
  );

  const handleAssessSentinel = useCallback(
    (id, forceRefresh = false) =>
      runAction(
        assessAdminReportWithSentinel({ id, forceRefresh }),
        'Sentinel AI đã hoàn tất thẩm định vụ việc.',
        'Không thể chạy thẩm định Sentinel AI.'
      ),
    [runAction]
  );

  const handleApplySentinel = useCallback(
    (id) =>
      runAction(
        applyAdminSentinelRecommendation(id),
        'Đã tự động thi hành toàn bộ chế tài theo đề xuất của Sentinel AI.',
        'Không thể tự động thi hành chế tài Sentinel.'
      ),
    [runAction]
  );

  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [isBatchApplying, setIsBatchApplying] = useState(false);

  const handleBatchScanSentinel = useCallback(async () => {
    setIsBatchScanning(true);
    try {
      const response = await adminApi.batchScanSentinel();
      const result = response?.data || response;
      const scannedCount = result?.scannedCount || 0;
      const highCount = result?.highConfidenceCount || 0;
      const autoCount = result?.autoResolvedCount || 0;
      success(
        autoCount > 0
          ? `Sentinel AI đã quét xong: Tự động thi hành & đóng ${autoCount} vi phạm nhẹ (Cảnh cáo / Đình chỉ ≤7d). Các vụ việc còn lại đã được tổng hợp chờ Admin xem xét.`
          : scannedCount > 0
            ? `Sentinel AI đã quét xong ${scannedCount} báo cáo (${highCount} báo cáo có độ tự tin cao ≥ 80%).`
            : 'Tất cả báo cáo đang mở trong hàng đợi đều đã được AI thẩm định.'
      );
      refetch();
      reloadStats();
      return result;
    } catch (err) {
      toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể quét AI hàng loạt.'));
      return null;
    } finally {
      setIsBatchScanning(false);
    }
  }, [success, toastError, refetch, reloadStats]);

  const handleBatchApplySentinel = useCallback(
    async (minConfidence = 75) => {
      setIsBatchApplying(true);
      try {
        const response = await adminApi.batchApplySentinel({ minConfidence });
        const result = response?.data || response;
        const executedCount = result?.executedCount || 0;
        success(
          executedCount > 0
            ? `Đã tự động thi hành chế tài chuẩn và đóng ${executedCount} báo cáo (độ tự tin ≥ ${minConfidence}%).`
            : `Không có báo cáo đang mở nào đạt ngưỡng tự tin ≥ ${minConfidence}% để thi hành tự động.`
        );
        refetch();
        reloadStats();
        return result;
      } catch (err) {
        toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không thể thi hành hàng loạt theo AI.'));
        return null;
      } finally {
        setIsBatchApplying(false);
      }
    },
    [success, toastError, refetch, reloadStats]
  );

  // Same query as the list: every page, with the current filters and date range
  const { isExporting, handleExport } = useAdminExport({
    page: 'bao-cao-vi-pham',
    buildSheets: buildModerationReportSheets,
    fetchData: async () => ({
      reports: await fetchAllPages(fetcher, { ...filters, search: searchInput }),
      filter: filters,
    }),
    successMessage: EXPORT_SUCCESS_MESSAGE,
  });

  const statusChips = useMemo(
    () =>
      REPORT_STATUS_CHIPS.map((chip) => ({
        ...chip,
        ...(stats ? { count: chip.value ? stats[chip.value] : stats.total } : {}),
      })),
    [stats]
  );

  const hasActiveFilters = Boolean(
    searchInput ||
      params.severity ||
      params.category ||
      params.targetType ||
      params.fromDate ||
      params.toDate
  );

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({
      severity: undefined,
      category: undefined,
      targetType: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  }, [setSearch, setFilters]);

  return {
    ...table,
    listErrorMessage: table.error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, table.error, 'Không tải được danh sách báo cáo. Vui lòng thử lại.')
      : null,
    stats,
    isStatsLoading,
    hasStatsError,
    statusChips,
    hasActiveFilters,
    resetFilters,

    // Drawer
    selectedReportId,
    drawerReport: detail.data,
    isDrawerLoading: detail.isLoading && !detail.data,
    openReportDetail,
    closeReportDetail,

    // Actions
    isActionLoading,
    handleClaim,
    handleTakeover,
    handleUpdateSeverity,
    handleApplyAction,
    handleResolve,
    handleReopen,
    handleAssessSentinel,
    handleApplySentinel,
    isBatchScanning,
    isBatchApplying,
    handleBatchScanSentinel,
    handleBatchApplySentinel,

    // Export
    isExporting,
    handleExport,
  };
};

export default useAdminReports;
