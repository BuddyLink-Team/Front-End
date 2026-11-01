import { useDispatch } from 'react-redux';
import { useAdminOversight } from './useAdminOversight';
import { useAdminExport } from './useAdminExport';
import { buildConnectionsReportSheets, fetchAllPages } from '../utils/excelExport';
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
 * Connections oversight screen: list across the platform, detail modal, soft-remove and export.
 */
export const useAdminConnections = () => {
  const oversight = useAdminOversight({
    fetchList: fetchAdminConnections,
    fetchStats: fetchAdminConnectionStats,
    fetchDetail: fetchAdminConnectionDetail,
    clearDetail: clearConnectionDetail,
    detailKey: 'connectionDetail',
    runAction: removeAdminConnection,
    messages: MESSAGES,
    openStateKey: 'openConnectionId',
  });

  const dispatch = useDispatch();
  const { isExporting, handleExport } = useAdminExport({
    page: 'connections',
    buildSheets: buildConnectionsReportSheets,
    fetchData: async () => ({
      connections: await fetchAllPages((params) => dispatch(fetchAdminConnections(params)).unwrap(), {
        search: oversight.searchInput,
        status: oversight.filters?.status,
      }),
      stats: oversight.stats?.stats,
    }),
    successMessage: 'Đã xuất danh sách kết nối ra file Excel.',
  });

  return {
    ...oversight,
    isExporting,
    handleExport,
  };
};

export default useAdminConnections;
