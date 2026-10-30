import { useDispatch } from 'react-redux';
import { useAdminOversight } from './useAdminOversight';
import { useAdminExport } from './useAdminExport';
import { buildPlaydatesReportSheets, fetchAllPages } from '../utils/excelExport';
import {
  fetchAdminPlaydates,
  fetchAdminPlaydateStats,
  fetchAdminPlaydateDetail,
  clearPlaydateDetail,
  cancelAdminPlaydate,
} from '../redux/adminSlice';

const MESSAGES = Object.freeze({
  listError: 'Không tải được danh sách cuộc hẹn chơi. Vui lòng thử lại.',
  detailError: 'Không tải được thông tin chi tiết cuộc hẹn chơi.',
  actionSuccess: 'Đã hủy cuộc hẹn chơi.',
  actionError: 'Không hủy được cuộc hẹn chơi. Vui lòng thử lại.',
});

/**
 * Playdates oversight screen: list across the platform, detail modal and force-cancel with a reason.
 */
export const useAdminPlaydates = () => {
  const oversight = useAdminOversight({
    fetchList: fetchAdminPlaydates,
    fetchStats: fetchAdminPlaydateStats,
    fetchDetail: fetchAdminPlaydateDetail,
    clearDetail: clearPlaydateDetail,
    detailKey: 'playdateDetail',
    runAction: cancelAdminPlaydate,
    messages: MESSAGES,
    openStateKey: 'openPlaydateId',
  });

  const dispatch = useDispatch();
  const { isExporting, handleExport } = useAdminExport({
    page: 'playdates',
    buildSheets: buildPlaydatesReportSheets,
    fetchData: async () => ({
      playdates: await fetchAllPages((params) => dispatch(fetchAdminPlaydates(params)).unwrap(), {
        search: oversight.searchInput,
        status: oversight.filters?.status,
        fromDate: oversight.filters?.fromDate,
        toDate: oversight.filters?.toDate,
      }),
      stats: oversight.stats?.stats,
    }),
    successMessage: 'Đã xuất danh sách buổi hẹn chơi ra file Excel.',
  });

  return {
    ...oversight,
    isExporting,
    handleExport,
  };
};

export default useAdminPlaydates;
