import { useState, useCallback } from 'react';
import playdateApi from '../api/playdateApi.js';
import { useToast } from '../../../hooks/useToast.js';
import { getApiErrorMsg } from '../../../utils/errorUtils.js';
import { PLAYDATE_ERROR_MESSAGES } from '../constants/playdate.constants.js';

/**
 * Hook to manage playdate chaperone actions (BUD-49 B5).
 * Encapsulates playdateApi.toggleChaperone so UI components never call APIs directly.
 * @param {string} playdateId
 */
export const usePlaydateChaperone = (playdateId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const toggleChaperone = useCallback(
    async (action = 'confirm') => {
      if (!playdateId) return null;
      try {
        setIsUpdating(true);
        const response = await playdateApi.toggleChaperone(playdateId, action);
        const data = response?.data?.data || response?.data;
        toast.success(
          action === 'confirm'
            ? 'Đã xác nhận tham gia làm người lớn đi kèm'
            : 'Đã hủy đăng ký người lớn đi kèm'
        );
        return data;
      } catch (err) {
        toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể cập nhật trạng thái người đi kèm'));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [playdateId, toast]
  );

  return {
    toggleChaperone,
    isUpdating,
  };
};

export default usePlaydateChaperone;

