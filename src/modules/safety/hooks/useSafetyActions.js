import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { blockParent, reportParent } from '../redux/safetySlice';
import { SAFETY_ERROR_MESSAGES } from '../constants/safetyConstants';

/**
 * Block / report another parent. API calls live in the safety slice thunks.
 */
export const useSafetyActions = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const isSubmitting = useSelector((state) => state.safety.isSubmitting);

  const run = useCallback(
    async (thunkAction, successMessage, fallbackError) => {
      try {
        await dispatch(thunkAction).unwrap();
        toast.success(successMessage);
        return { success: true };
      } catch (error) {
        const msg = getApiErrorMsg(SAFETY_ERROR_MESSAGES, error, fallbackError);
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [dispatch, toast],
  );

  const rejectMissingTarget = useCallback(
    (msg) => {
      toast.error(msg);
      return { success: false, error: msg };
    },
    [toast],
  );

  const blockUser = useCallback(
    (targetParentId, displayName, reason = 'Blocked from a conversation') => {
      if (!targetParentId) {
        return Promise.resolve(rejectMissingTarget('Không tìm thấy thông tin đối phương để chặn'));
      }
      return run(
        blockParent({ blockedId: targetParentId, reason }),
        `Đã chặn người dùng ${displayName}`,
        'Chặn người dùng thất bại. Vui lòng thử lại.',
      );
    },
    [run, rejectMissingTarget],
  );

  const reportUser = useCallback(
    (payload) => {
      if (!payload?.reportedUserId) {
        return Promise.resolve(rejectMissingTarget('Không tìm thấy thông tin đối phương để báo cáo'));
      }
      return run(
        reportParent(payload),
        'Báo cáo đã được gửi tới Quản trị viên BuddyLink để xem xét.',
        'Gửi báo cáo thất bại. Vui lòng thử lại.',
      );
    },
    [run, rejectMissingTarget],
  );

  return { isSubmitting, blockUser, reportUser };
};

export default useSafetyActions;
