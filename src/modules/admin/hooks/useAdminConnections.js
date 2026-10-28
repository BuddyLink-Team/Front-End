import { useAdminOversight } from './useAdminOversight';
import {
  fetchAdminConnections,
  fetchAdminConnectionStats,
  fetchAdminConnectionDetail,
  clearConnectionDetail,
  removeAdminConnection,
} from '../redux/adminSlice';

const MESSAGES = Object.freeze({
  listError: 'Không tải được danh sách kết nối. Vui lòng thử lại.',
  detailError: 'Không tải được thông tin chi tiết kết nối.',
  actionSuccess: 'Đã gỡ kết nối.',
  actionError: 'Không gỡ được kết nối. Vui lòng thử lại.',
});

/**
 * Connections oversight screen: list across the platform, detail modal and soft-remove with an optional reason.
 */
export const useAdminConnections = () =>
  useAdminOversight({
    fetchList: fetchAdminConnections,
    fetchStats: fetchAdminConnectionStats,
    fetchDetail: fetchAdminConnectionDetail,
    clearDetail: clearConnectionDetail,
    detailKey: 'connectionDetail',
    runAction: removeAdminConnection,
    messages: MESSAGES,
  });

export default useAdminConnections;
