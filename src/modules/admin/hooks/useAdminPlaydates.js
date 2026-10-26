import { useState, useCallback } from 'react';
import useServerTable from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import adminApi from '../api/adminApi';

/**
 * Domain business hook for Admin Playdates Management.
 * Keeps table filtering/pagination in sync with URL and manages detail/cancellation flows.
 */
export function useAdminPlaydates() {
  const toast = useToast();

  const table = useServerTable({
    fetcher: adminApi.getPlaydates,
    defaultParams: { limit: 10 },
  });

  const [selectedPlaydateId, setSelectedPlaydateId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [cancellingPlaydate, setCancellingPlaydate] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch full detail for the modal
  const openDetail = useCallback(
    async (playdate) => {
      if (!playdate?.id) return;
      setSelectedPlaydateId(playdate.id);
      setIsDetailModalOpen(true);
      setIsDetailLoading(true);

      try {
        const res = await adminApi.getPlaydateDetail(playdate.id);
        setDetailData(res?.data ?? res ?? null);
      } catch (err) {
        toast.error(err?.message || 'Không thể tải thông tin chi tiết cuộc hẹn');
        setIsDetailModalOpen(false);
      } finally {
        setIsDetailLoading(false);
      }
    },
    [toast]
  );

  const closeDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedPlaydateId(null);
    setDetailData(null);
  }, []);

  const initiateCancel = useCallback((playdate) => {
    setCancellingPlaydate(playdate);
  }, []);

  const cancelCancel = useCallback(() => {
    setCancellingPlaydate(null);
  }, []);

  const confirmCancel = useCallback(
    async (reason) => {
      if (!cancellingPlaydate?.id) return;
      setIsActionLoading(true);

      try {
        await adminApi.cancelPlaydate(cancellingPlaydate.id, reason);
        toast.success('Đã hủy cuộc hẹn chơi thành công');
        setCancellingPlaydate(null);

        // If the detail modal is currently showing the cancelled playdate, refresh it
        if (selectedPlaydateId === cancellingPlaydate.id) {
          try {
            const updated = await adminApi.getPlaydateDetail(cancellingPlaydate.id);
            setDetailData(updated?.data ?? updated ?? null);
          } catch {
            closeDetail();
          }
        }

        // Refresh table list
        table.refetch();
      } catch (err) {
        toast.error(err?.message || 'Không thể hủy cuộc hẹn chơi');
      } finally {
        setIsActionLoading(false);
      }
    },
    [cancellingPlaydate, selectedPlaydateId, table, toast, closeDetail]
  );

  return {
    ...table,
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    cancellingPlaydate,
    initiateCancel,
    cancelCancel,
    confirmCancel,
    isActionLoading,
  };
}

export default useAdminPlaydates;
