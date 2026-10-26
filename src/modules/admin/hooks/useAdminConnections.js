import { useState, useCallback } from 'react';
import useServerTable from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import adminApi from '../api/adminApi';

/**
 * Domain business hook for Admin Connections Management.
 * Keeps table filtering/pagination in sync with URL and manages detail/removal flows.
 */
export function useAdminConnections() {
  const toast = useToast();

  const table = useServerTable({
    fetcher: adminApi.getConnections,
    defaultParams: { limit: 10 },
  });

  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [removingConnection, setRemovingConnection] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch full detail for the modal
  const openDetail = useCallback(
    async (connection) => {
      if (!connection?.id) return;
      setSelectedConnectionId(connection.id);
      setIsDetailModalOpen(true);
      setIsDetailLoading(true);

      try {
        const res = await adminApi.getConnectionDetail(connection.id);
        setDetailData(res?.data ?? res ?? null);
      } catch (err) {
        toast.error(err?.message || 'Không thể tải thông tin chi tiết kết nối');
        setIsDetailModalOpen(false);
      } finally {
        setIsDetailLoading(false);
      }
    },
    [toast]
  );

  const closeDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedConnectionId(null);
    setDetailData(null);
  }, []);

  const initiateRemove = useCallback((connection) => {
    setRemovingConnection(connection);
  }, []);

  const cancelRemove = useCallback(() => {
    setRemovingConnection(null);
  }, []);

  const confirmRemove = useCallback(
    async (reason) => {
      if (!removingConnection?.id) return;
      setIsActionLoading(true);

      try {
        await adminApi.removeConnection(removingConnection.id, reason);
        toast.success('Đã gỡ kết nối thành công');
        setRemovingConnection(null);

        // If the detail modal is showing the removed connection, refresh it
        if (selectedConnectionId === removingConnection.id) {
          try {
            const updated = await adminApi.getConnectionDetail(removingConnection.id);
            setDetailData(updated?.data ?? updated ?? null);
          } catch {
            closeDetail();
          }
        }

        // Refresh table list
        table.refetch();
      } catch (err) {
        toast.error(err?.message || 'Không thể gỡ kết nối');
      } finally {
        setIsActionLoading(false);
      }
    },
    [removingConnection, selectedConnectionId, table, toast, closeDetail]
  );

  return {
    ...table,
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    removingConnection,
    initiateRemove,
    cancelRemove,
    confirmRemove,
    isActionLoading,
  };
}

export default useAdminConnections;
