import { useAdminOversight } from './useAdminOversight';
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
export const useAdminPlaydates = () =>
  useAdminOversight({
    fetchList: fetchAdminPlaydates,
    fetchStats: fetchAdminPlaydateStats,
    fetchDetail: fetchAdminPlaydateDetail,
    clearDetail: clearPlaydateDetail,
    detailKey: 'playdateDetail',
    runAction: cancelAdminPlaydate,
    messages: MESSAGES,
  });

export default useAdminPlaydates;
