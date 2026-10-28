import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { clearChildDetail, fetchAdminChildDetail } from '../redux/adminSlice';
import { ADMIN_ERROR_MESSAGES } from '../constants/admin.constants';

/**
 * Detail of one child profile with its parent summary (read-only).
 * @param {{ childId: string|null, isOpen: boolean }} options
 */
export const useAdminChildDetail = ({ childId, isOpen }) => {
  const dispatch = useDispatch();
  const { data: childDetail, isLoading, error } = useSelector((state) => state.admin.childDetail);

  useEffect(() => {
    if (!isOpen || !childId) {
      dispatch(clearChildDetail());
      return;
    }
    dispatch(fetchAdminChildDetail(childId));
  }, [dispatch, isOpen, childId]);

  return {
    childDetail,
    errorMessage: error ? getApiErrorMsg(ADMIN_ERROR_MESSAGES, error, 'Không tải được hồ sơ trẻ.') : null,
    isLoading,
  };
};

export default useAdminChildDetail;
