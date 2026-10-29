import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/useToast';
import {
  createWorkbookBlob,
  downloadBlob,
  getExportFileName,
  buildDashboardReportSheets,
  buildUsersReportSheets,
  buildChildrenReportSheets,
  buildPlaydatesReportSheets,
  buildConnectionsReportSheets,
} from '../utils/excelExport';

const BUILDERS = {
  dashboard: {
    builder: buildDashboardReportSheets,
    fileName: 'bang-dieu-khien',
    successMsg: 'Đã xuất dữ liệu bảng điều khiển ra file Excel.',
  },
  users: {
    builder: buildUsersReportSheets,
    fileName: 'danh-sach-phu-huynh',
    successMsg: 'Đã xuất danh sách phụ huynh ra file Excel.',
  },
  children: {
    builder: buildChildrenReportSheets,
    fileName: 'danh-sach-ho-so-tre',
    successMsg: 'Đã xuất danh sách hồ sơ trẻ ra file Excel.',
  },
  playdates: {
    builder: buildPlaydatesReportSheets,
    fileName: 'danh-sach-buoi-hen',
    successMsg: 'Đã xuất danh sách buổi hẹn chơi ra file Excel.',
  },
  connections: {
    builder: buildConnectionsReportSheets,
    fileName: 'danh-sach-ket-noi',
    successMsg: 'Đã xuất danh sách kết nối ra file Excel.',
  },
};

/**
 * Universal hook for exporting admin pages to Excel (.xlsx)
 * @param {'dashboard'|'users'|'children'|'playdates'|'connections'} type
 * @param {Function} fetchExportData - Async function that gathers data for sheets
 */
export const useAdminExport = (type, fetchExportData) => {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: toastError } = useToast();

  const handleExport = useCallback(async () => {
    const config = BUILDERS[type];
    if (!config) {
      toastError('Loại báo cáo không hợp lệ.');
      return;
    }

    setIsExporting(true);
    try {
      const data = await fetchExportData();
      if (!data) {
        throw new Error('Không có dữ liệu để xuất.');
      }

      const sheets = config.builder(data);
      const blob = await createWorkbookBlob(sheets);
      downloadBlob(blob, getExportFileName(config.fileName));
      success(config.successMsg);
    } catch (err) {
      toastError(err?.message || 'Có lỗi xảy ra khi xuất file Excel.');
    } finally {
      setIsExporting(false);
    }
  }, [type, fetchExportData, success, toastError]);

  return { isExporting, handleExport, exportReport: handleExport };
};

export default useAdminExport;
