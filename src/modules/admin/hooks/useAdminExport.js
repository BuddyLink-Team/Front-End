import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';
import { createWorkbookBlob, downloadBlob, getExportFileName } from '../utils/excelExport';

/**
 * Excel export of an admin page: loading state, download and success / error toast.
 * @param {Object} config
 * @param {string} config.page - Part of the file name: buddylink-<page>-YYYYMMDD-HHmm.xlsx
 * @param {Function} config.buildSheets - (data) => sheets
 * @param {Function} config.fetchData - Async function that gathers the data of the sheets
 * @param {string} config.successMessage
 */
export const useAdminExport = ({ page, buildSheets, fetchData, successMessage }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: toastError } = useToast();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const sheets = buildSheets(await fetchData());
      downloadBlob(await createWorkbookBlob(sheets), getExportFileName(page));
      success(successMessage);
    } catch (err) {
      toastError(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Có lỗi xảy ra khi xuất file Excel.'));
    } finally {
      setIsExporting(false);
    }
  }, [page, buildSheets, fetchData, successMessage, success, toastError]);

  return { isExporting, handleExport };
};

export default useAdminExport;
