import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { clearUserDetail, fetchAdminUserDetail, fetchAdminUserPayments } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES, RECENT_PAYMENTS_LIMIT } from '../constants/admin.constants';

/**
 * Detail of one parent account (profile, children, plan, activity) and its most recent payments.
 * Changing `reloadKey` reloads the open account in place (e.g. after a lock / unlock).
 *
 * @param {{ userId: string|null, isOpen: boolean, reloadKey?: number }} options
 */
export const useAdminUserDetail = ({ userId, isOpen, reloadKey = 0 }) => {
  const dispatch = useDispatch();
  const { data: userDetail, isLoading, error } = useSelector((state) => state.admin.userDetail);
  const payments = useSelector((state) => state.admin.payments);

  useEffect(() => {
    if (!isOpen || !userId) {
      dispatch(clearUserDetail());
      return;
    }

    dispatch(fetchAdminUserDetail(userId))
      .unwrap()
      .then((detail) => {
        if (detail?.parentId) {
          dispatch(fetchAdminUserPayments({ parentId: detail.parentId, page: 1, limit: RECENT_PAYMENTS_LIMIT }));
        }
      })
      // The error is kept in the slice and shown by the drawer
      .catch(() => {});
  }, [dispatch, isOpen, userId, reloadKey]);

  return {
    userDetail,
    errorMessage: error
      ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, error, 'Không tải được thông tin tài khoản phụ huynh.')
      : null,
    // Skeleton only on the first load of an account, not on an in-place reload
    isLoading: isLoading && !userDetail,
    payments: payments.items,
    paymentsTotal: payments.total,
    isLoadingPayments: payments.isLoading,
  };
};

export default useAdminUserDetail;
