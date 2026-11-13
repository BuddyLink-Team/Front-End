import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import {
  ADMIN_ERROR_MESSAGES,
  REPORT_STATUS_CHIPS,
  SENTINEL_BATCH_MIN_CONFIDENCE,
} from '../constants/admin.constants';
import {
  clearReportDetail,
  fetchAdminReportDetail,
  fetchAdminReports,
  fetchAdminReportStats,
  reopenAdminReport,
  decideAdminReport,
  updateAdminReportSeverity,
  assessAdminReportWithSentinel,
  batchScanAdminSentinel,
  batchApplyAdminSentinel,
  resolveAdminSentinelCluster,
} from '../redux/adminSlice';
import { fetchAllPages } from '../utils/excelExport';
import { buildModerationReportSheets } from '../utils/moderationReport';
import { useAdminExport } from './useAdminExport';
import { useAdminStats } from './useAdminStats';
import adminSocketService from '../../../services/adminSocket';
import { ADMIN_SOCKET_EVENTS } from '../constants/dashboard.constants';

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
  const isActionLoading = useSelector(
    (state) => state.admin.isOversightActionLoading,
  );

  const fetcher = useCallback(
    (params) => dispatch(fetchAdminReports(params)).unwrap(),
    [dispatch],
  );
  const table = useServerTable({ fetcher, defaultParams: { limit: 10 } });
  const { params, filters, searchInput, setSearch, setFilters, refetch } =
    table;

  const {
    stats,
    isLoading: isStatsLoading,
    hasError: hasStatsError,
    reload: reloadStats,
  } = useAdminStats(fetchAdminReportStats);

  const [selectedReportId, setSelectedReportId] = useState(null);

  const loadDetail = useCallback(
    (id) =>
      dispatch(fetchAdminReportDetail(id))
        .unwrap()
        .catch((err) => {
          toastError(
            getApiErrorMsg(
              ADMIN_ERROR_MESSAGES,
              err,
              'Không thể tải chi tiết báo cáo.',
            ),
          );
          setSelectedReportId(null);
        }),
    [dispatch, toastError],
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

  // A new report changes the numbers of the others on the same user (corroboration, velocity, strikes):
  // reload the list, the counts and the open drawer. The backend recomputes the rule part on each read.
  const selectedReportIdRef = useRef(selectedReportId);
  selectedReportIdRef.current = selectedReportId;
  useEffect(() => {
    const socket = adminSocketService.connect();
    const handleNotification = (notification) => {
      if (notification?.entityType !== 'Report') return;
      refetch();
      reloadStats();
      if (selectedReportIdRef.current) loadDetail(selectedReportIdRef.current);
    };
    socket.on(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
    // Only this listener is removed: the socket itself belongs to the admin layout
    return () =>
      socket.off(ADMIN_SOCKET_EVENTS.NOTIFICATION_NEW, handleNotification);
  }, [refetch, reloadStats, loadDetail]);

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
    [
      dispatch,
      success,
      toastError,
      selectedReportId,
      loadDetail,
      refetch,
      reloadStats,
    ],
  );

  const handleUpdateSeverity = useCallback(
    (id, severity) =>
      runAction(
        updateAdminReportSeverity({ id, severity }),
        'Đã cập nhật mức độ nghiêm trọng.',
        'Không thể cập nhật mức độ.',
      ),
    [runAction],
  );

  // One decision closes every open report of the case (and the other cases chosen with it)
  const handleDecide = useCallback(
    (id, payload) =>
      runAction(
        decideAdminReport({ id, payload }),
        payload.outcome === 'violation'
          ? 'Đã xử lý và đóng vụ việc.'
          : 'Đã bác bỏ vụ việc.',
        'Không thể đóng vụ việc.',
      ),
    [runAction],
  );

  const handleReopen = useCallback(
    (id, note) =>
      runAction(
        reopenAdminReport({ id, note }),
        'Đã mở lại vụ việc.',
        'Không thể mở lại vụ việc.',
      ),
    [runAction],
  );

  const handleAssessSentinel = useCallback(
    (id, forceRefresh = false) =>
      runAction(
        assessAdminReportWithSentinel({ id, forceRefresh }),
        'Sentinel AI đã hoàn tất thẩm định vụ việc.',
        'Không thể chạy thẩm định Sentinel AI.',
      ),
    [runAction],
  );

  // Quick handling of an overview cluster (open reports against one parent). Resolves with the result,
  // or null when the request failed.
  const handleResolveCluster = useCallback(
    async (reportIds, note = '') => {
      try {
        const result = await dispatch(
          resolveAdminSentinelCluster({
            reportIds,
            ...(note ? { note } : {}),
          }),
        ).unwrap();
        const closedCount =
          (result?.resolved?.length || 0) + (result?.dismissed?.length || 0);
        const keptCount =
          (result?.skipped?.length || 0) + (result?.failed?.length || 0);
        const message = `Đã đóng ${closedCount} báo cáo của cụm${
          keptCount > 0
            ? `, ${keptCount} báo cáo vẫn mở để bạn xử lý trong chi tiết`
            : ''
        }.`;
        if (result?.failed?.length) toastError(message);
        else success(message);
        if (selectedReportId) loadDetail(selectedReportId);
        refetch();
        reloadStats();
        return result;
      } catch (err) {
        toastError(
          getApiErrorMsg(
            ADMIN_ERROR_MESSAGES,
            err,
            'Không thể xử lý cụm báo cáo.',
          ),
        );
        return null;
      }
    },
    [
      dispatch,
      success,
      toastError,
      selectedReportId,
      loadDetail,
      refetch,
      reloadStats,
    ],
  );

  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [isBatchApplying, setIsBatchApplying] = useState(false);

  const handleBatchScanSentinel = useCallback(async () => {
    setIsBatchScanning(true);
    try {
      const result = await dispatch(batchScanAdminSentinel()).unwrap();
      const scannedCount = result?.scannedCount || 0;
      const highCount = result?.highConfidenceCount || 0;
      const autoCount = result?.autoResolvedCount || 0;
      success(
        autoCount > 0
          ? `Sentinel AI đã quét xong: Tự động thi hành & đóng ${autoCount} vi phạm nhẹ (Cảnh cáo / Đình chỉ ≤ 7 ngày). Các vụ việc còn lại đã được tổng hợp chờ Admin xem xét.`
          : scannedCount > 0
            ? `Sentinel AI đã quét xong ${scannedCount} báo cáo (${highCount} báo cáo có độ tự tin cao ≥ 80%).`
            : 'Tất cả báo cáo đang mở trong hàng đợi đều đã được AI thẩm định.',
      );
      refetch();
      reloadStats();
      return result;
    } catch (err) {
      toastError(
        getApiErrorMsg(
          ADMIN_ERROR_MESSAGES,
          err,
          'Không thể quét AI hàng loạt.',
        ),
      );
      return null;
    } finally {
      setIsBatchScanning(false);
    }
  }, [dispatch, success, toastError, refetch, reloadStats]);

  const handleBatchApplySentinel = useCallback(
    async (minConfidence = SENTINEL_BATCH_MIN_CONFIDENCE) => {
      setIsBatchApplying(true);
      try {
        const result = await dispatch(
          batchApplyAdminSentinel({ minConfidence }),
        ).unwrap();
        const executedCount = result?.executedCount || 0;
        const failedCount = result?.failed?.length || 0;
        success(
          executedCount > 0
            ? `Đã tự động thi hành chế tài chuẩn và đóng ${executedCount} báo cáo (độ tự tin ≥ ${minConfidence}%).`
            : `Không có báo cáo đang mở nào đạt ngưỡng tự tin ≥ ${minConfidence}% để thi hành tự động.`,
        );
        if (failedCount > 0) {
          toastError(
            `${failedCount} báo cáo không thi hành được, vẫn mở để bạn xử lý tiếp.`,
          );
        }
        refetch();
        reloadStats();
        return result;
      } catch (err) {
        toastError(
          getApiErrorMsg(
            ADMIN_ERROR_MESSAGES,
            err,
            'Không thể thi hành hàng loạt theo AI.',
          ),
        );
        return null;
      } finally {
        setIsBatchApplying(false);
      }
    },
    [dispatch, success, toastError, refetch, reloadStats],
  );

  // Same query as the list: every page, with the current filters and date range
  const { isExporting, handleExport } = useAdminExport({
    page: 'bao-cao-vi-pham',
    buildSheets: buildModerationReportSheets,
    fetchData: async () => ({
      // The export keeps one line per report, not per case
      reports: await fetchAllPages(fetcher, {
        ...filters,
        view: 'reports',
        search: searchInput,
      }),
      filter: filters,
    }),
    successMessage: EXPORT_SUCCESS_MESSAGE,
  });

  const statusChips = useMemo(
    () =>
      REPORT_STATUS_CHIPS.map((chip) => ({
        ...chip,
        ...(stats
          ? { count: chip.value ? stats[chip.value] : stats.total }
          : {}),
      })),
    [stats],
  );

  const hasActiveFilters = Boolean(
    searchInput ||
    params.severity ||
    params.category ||
    params.targetType ||
    params.fromDate ||
    params.toDate,
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
      ? getApiErrorMsg(
          ADMIN_ERROR_MESSAGES,
          table.error,
          'Không tải được danh sách báo cáo. Vui lòng thử lại.',
        )
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
    handleUpdateSeverity,
    handleDecide,
    handleReopen,
    handleAssessSentinel,
    handleResolveCluster,
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
