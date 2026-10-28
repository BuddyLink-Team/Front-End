import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useServerTable } from '../../../hooks/useServerTable';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminTransactionDetail, fetchAdminTransactions } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * Transactions tab: server-side list of every parent's payments and the payment detail modal.
 * Not kept in the URL: the tabs of this screen share it.
 */
export const useAdminTransactions = () => {
  const dispatch = useDispatch();
  const fetcher = useCallback((params) => dispatch(fetchAdminTransactions(params)).unwrap(), [dispatch]);
  const table = useServerTable({ fetcher, defaultParams: { limit: 10 }, syncWithUrl: false });

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailErrorMessage, setDetailErrorMessage] = useState(null);

  const openDetail = useCallback(
    async (id) => {
      setSelectedId(id);
      setDetail(null);
      setDetailErrorMessage(null);
      setIsDetailLoading(true);
      try {
        setDetail(await dispatch(fetchAdminTransactionDetail(id)).unwrap());
      } catch (err) {
        setDetailErrorMessage(getApiErrorMsg(ADMIN_ERROR_MESSAGES, err, 'Không tải được chi tiết giao dịch.'));
      } finally {
        setIsDetailLoading(false);
      }
    },
    [dispatch]
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setDetail(null);
  }, []);

  return {
    ...table,
    listErrorMessage: table.error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, table.error, 'Không tải được danh sách giao dịch.')
      : null,
    isDetailOpen: Boolean(selectedId),
    detail,
    isDetailLoading,
    detailErrorMessage,
    openDetail,
    closeDetail,
  };
};

export default useAdminTransactions;
