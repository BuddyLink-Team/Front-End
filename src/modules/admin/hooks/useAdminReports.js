
import { useCallback, useEffect, useState } from 'react';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import adminApi from '../api/adminApi';
import { useAdminExport } from './useAdminExport';
import { fetchAllPages } from '../utils/excelExport';
import { buildModerationReportSheets } from '../utils/moderationReport';

export const useAdminReports = () => {
  const { success, error: toastError } = useToast();

  const fetchReports = useCallback(async (params) => {
    const response = await adminApi.getReports(params);
    return response.data;
  }, []);

  const table = useServerTable({
    fetcher: fetchReports,
    defaultParams: {
      limit: 10,
      status: '',
      severity: '',
      category: '',
      targetType: '',
      assignedTo: '',
    },
  });

  const {
    rows,
    pagination,
    isLoading: isTableLoading,
    error: tableError,
    params,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
    refetch: refetchTable,
  } = table;

  // Stats
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const reloadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const response = await adminApi.getReportStats();
      setStats(response.data?.data || response.data || null);
    } catch (_err) {
      // Ignore stats error
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  // Drawer detail state
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [drawerReport, setDrawerReport] = useState(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  const fetchDrawerDetail = useCallback(async (id) => {
    if (!id) {
      setDrawerReport(null);
      return;
    }

    setIsDrawerLoading(true);
    try {
      const response = await adminApi.getReportDetail(id);
      setDrawerReport(response.data?.data || response.data);
    } catch (err) {
      toastError(getApiErrorMsg(err, 'Không thể tải chi tiết báo cáo'));
      setDrawerReport(null);
    } finally {
      setIsDrawerLoading(false);
    }
  }, [toastError]);

  const openReportDetail = useCallback((id) => {
    setSelectedReportId(id);
    fetchDrawerDetail(id);
  }, [fetchDrawerDetail]);

  const closeReportDetail = useCallback(() => {
    setSelectedReportId(null);
    setDrawerReport(null);
  }, []);

  // Actions execution
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleClaim = useCallback(async (reportId) => {
    setIsActionLoading(true);
    try {
      const response = await adminApi.reviewReport(reportId, {
        action: 'claim',
      });

      setDrawerReport(response.data?.data || response.data);
      success('Tiếp nhận xử lý báo cáo thành công');
      refetchTable();
      reloadStats();
    } catch (err) {
      toastError(getApiErrorMsg(err, 'Không thể tiếp nhận báo cáo'));
    } finally {
      setIsActionLoading(false);
    }
  }, [refetchTable, reloadStats, success, toastError]);

  const handleTakeover = useCallback(async (reportId) => {
    setIsActionLoading(true);
    try {
      const response = await adminApi.reviewReport(reportId, {
        action: 'takeover',
      });

      setDrawerReport(response.data?.data || response.data);
      success('Tiếp quản xử lý báo cáo thành công');
      refetchTable();
      reloadStats();
    } catch (err) {
      toastError(getApiErrorMsg(err, 'Không thể tiếp quản báo cáo'));
    } finally {
      setIsActionLoading(false);
    }
  }, [refetchTable, reloadStats, success, toastError]);

  const handleUpdateSeverity = useCallback(
    async (reportId, severity, note) => {
      setIsActionLoading(true);
      try {
        const response = await adminApi.updateReportSeverity(reportId, {
          severity,
          note,
        });

        setDrawerReport(response.data?.data || response.data);
        success('Cập nhật mức độ nghiêm trọng thành công');
        refetchTable();
        reloadStats();
      } catch (err) {
        toastError(getApiErrorMsg(err, 'Không thể cập nhật mức độ'));
      } finally {
        setIsActionLoading(false);
      }
    },
    [refetchTable, reloadStats, success, toastError]
  );

  const handleApplyAction = useCallback(
    async (reportId, { type, durationDays, note }) => {
      setIsActionLoading(true);
      try {
        const response = await adminApi.applyReportAction(reportId, {
          type,
          durationDays,
          note,
        });

        setDrawerReport(response.data?.data || response.data);
        success('Thi hành chế tài kỷ luật thành công');
        refetchTable();
        reloadStats();
        return true;
      } catch (err) {
        toastError(getApiErrorMsg(err, 'Không thể thi hành chế tài'));
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [refetchTable, reloadStats, success, toastError]
  );

  const handleResolve = useCallback(async (reportId, payload) => {
    setIsActionLoading(true);
    try {
      await adminApi.resolveReport(reportId, payload);

      success(
        payload.status === 'resolved'
          ? 'Đã giải quyết báo cáo thành công'
          : 'Đã bác bỏ báo cáo'
      );

      closeReportDetail();
      refetchTable();
      reloadStats();
      return true;
    } catch (err) {
      toastError(getApiErrorMsg(err, 'Không thể đóng báo cáo'));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [
    closeReportDetail,
    refetchTable,
    reloadStats,
    success,
    toastError,
  ]);

  const handleReopen = useCallback(async (reportId, note) => {
    setIsActionLoading(true);
    try {
      const response = await adminApi.reopenReport(reportId, { note });

      setDrawerReport(response.data?.data || response.data);
      success('Mở lại hồ sơ điều tra thành công');
      refetchTable();
      reloadStats();
      return true;
    } catch (err) {
      toastError(getApiErrorMsg(err, 'Không thể mở lại báo cáo'));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [refetchTable, reloadStats, success, toastError]);

  // Excel Export
  const { isExporting, handleExport: handleExportExcel } = useAdminExport({
    page: 'bao-cao-vi-pham',
    buildSheets: buildModerationReportSheets,
    fetchData: async () => ({
      stats: stats || {},
      reports: await fetchAllPages(async (pageParams) => {
        const res = await adminApi.getReports(pageParams);
        return res.data?.data || res.data;
      }, params),
      filter: params,
    }),
    successMessage: 'Xuất file báo cáo Excel thành công',
  });

  const hasActiveFilters = Boolean(
    searchInput ||
    params.severity ||
    params.category ||
    params.targetType ||
    params.assignedTo ||
    params.fromDate ||
    params.toDate
  );

  const resetFilters = useCallback(() => {
    setSearch('');

    setFilters({
      status: params.status || '',
      severity: '',
      category: '',
      targetType: '',
      assignedTo: '',
      fromDate: '',
      toDate: '',
    });
  }, [params.status, setSearch, setFilters]);

  return {
    rows,
    pagination,
    isLoading: isTableLoading,
    tableError,
    params,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
    refetchTable,
    stats,
    isStatsLoading,
    hasActiveFilters,
    resetFilters,

    // Drawer
    selectedReportId,
    drawerReport,
    isDrawerLoading,
    openReportDetail,
    closeReportDetail,
    refetchDrawer: () => fetchDrawerDetail(selectedReportId),

    // Actions
    isActionLoading,
    handleClaim,
    handleTakeover,
    handleUpdateSeverity,
    handleApplyAction,
    handleResolve,
    handleReopen,

    // Export
    isExporting,
    handleExportExcel,
  };
};

export default useAdminReports;
