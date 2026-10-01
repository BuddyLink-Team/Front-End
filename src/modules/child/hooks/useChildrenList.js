import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { childApi } from '../api/childApi';
import { CHILD_ERROR_MESSAGES } from '../constants/childConstants';
import { getApiErrorMsg } from '../../../utils/errorUtils';

export const useChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await childApi.getMyChildren();
      const list = res?.data || res || [];
      setChildren(Array.isArray(list) ? list : []);
    } catch (error) {
      const msg = getApiErrorMsg(
        CHILD_ERROR_MESSAGES,
        error,
        'Không thể tải danh sách hồ sơ bé. Vui lòng thử lại!',
      );
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleDeleteChild = async (childId) => {
    if (!childId) return;
    setIsDeleting(true);
    try {
      await childApi.deleteChild(childId);
      setChildren((prev) => prev.filter((c) => (c.id || c._id) !== childId));
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
    isLoading,
    isDeleting,
    errorMessage,
    fetchChildren,
    handleDeleteChild,
  };
};

export default useChildrenList;
