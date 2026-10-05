import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { fetchMyChildren, deleteChild, CHILD_LIST_STATUS } from '../redux/childSlice';
import { CHILD_ERROR_MESSAGES } from '../constants/childConstants';
import { getApiErrorMsg } from '../../../utils/errorUtils';

/**
 * Children list of the signed-in parent. Data and request status live in the child slice.
 */
export const useChildrenList = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { children, listStatus } = useSelector((state) => state.child);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchChildren = useCallback(async () => {
    setErrorMessage(null);
    try {
      await dispatch(fetchMyChildren()).unwrap();
    } catch (error) {
      const msg = getApiErrorMsg(
        CHILD_ERROR_MESSAGES,
        error,
        'Không thể tải danh sách hồ sơ bé. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
    }
  }, [dispatch, toast]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleDeleteChild = async (childId) => {
    if (!childId) return { success: false };
    setIsDeleting(true);
    try {
      await dispatch(deleteChild(childId)).unwrap();
      toast.success('Đã xóa hồ sơ bé thành công!');
      return { success: true };
    } catch (error) {
      const msg = getApiErrorMsg(
        CHILD_ERROR_MESSAGES,
        error,
        'Xóa hồ sơ bé không thành công. Vui lòng thử lại!',
      );
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    children,
    // Not fetched yet counts as loading so the page never flashes the empty state
    isLoading: listStatus === CHILD_LIST_STATUS.IDLE || listStatus === CHILD_LIST_STATUS.LOADING,
    isDeleting,
    errorMessage,
    fetchChildren,
    handleDeleteChild,
  };
};

export default useChildrenList;
