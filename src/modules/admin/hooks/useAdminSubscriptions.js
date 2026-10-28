import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useServerTable } from '../../../hooks/useServerTable';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { fetchAdminSubscriptions } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * Subscribers tab: server-side list of subscriptions and the row opened in the detail modal.
 * Not kept in the URL: the tabs of this screen share it.
 */
export const useAdminSubscriptions = () => {
  const dispatch = useDispatch();
  const fetcher = useCallback((params) => dispatch(fetchAdminSubscriptions(params)).unwrap(), [dispatch]);
  const table = useServerTable({ fetcher, defaultParams: { limit: 10 }, syncWithUrl: false });
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  return {
    ...table,
    listErrorMessage: table.error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, table.error, 'Không tải được danh sách thuê bao.')
      : null,
    selectedSubscription,
    openDetail: setSelectedSubscription,
    closeDetail: () => setSelectedSubscription(null),
  };
};

export default useAdminSubscriptions;
