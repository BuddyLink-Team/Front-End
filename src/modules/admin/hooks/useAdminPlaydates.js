import { useDispatch } from 'react-redux';
import { useAdminOversight } from './useAdminOversight';
import { useAdminExport } from './useAdminExport';
import { fetchAllPages } from '../utils/excelExport';
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
  });

  const dispatch = useDispatch();
  const { isExporting, handleExport } = useAdminExport('playdates', async () => {
    const allPlaydates = await fetchAllPages(
      (params) => dispatch(fetchAdminPlaydates(params)).unwrap(),
      {
        search: oversight.searchInput,
        status: oversight.filters?.status || undefined,
        fromDate: oversight.filters?.fromDate || undefined,
        toDate: oversight.filters?.toDate || undefined,
      }
    );
    return { playdates: allPlaydates, stats: oversight.stats?.stats };
  });

  return {
    ...oversight,
    isExporting,
    handleExport,
  };
};

export default useAdminPlaydates;
