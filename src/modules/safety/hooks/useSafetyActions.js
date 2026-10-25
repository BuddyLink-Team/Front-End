import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { blockParent, unblockParent, reportParent, fetchBlockedUsers } from '../redux/safetySlice';
import { SAFETY_ERROR_MESSAGES } from '../constants/safetyConstants';

/**
 * Block / unblock / report another parent and manage blocked users list.
 */
export const useSafetyActions = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { isSubmitting, isLoadingBlockedUsers, blockedUsers, blockedUsersError } = useSelector(
    (state) => state.safety,
  );

  const run = useCallback(
    async (thunkAction, successMessage, fallbackError) => {
      try {
        const result = await dispatch(thunkAction).unwrap();
        if (successMessage) toast.success(successMessage);
        return { success: true, data: result };
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
    (targetParentId, displayName = 'phụ huynh', reason = 'Blocked by user') => {
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

  const unblockUser = useCallback(
    (targetParentId, displayName = 'phụ huynh') => {
      if (!targetParentId) {
        return Promise.resolve(rejectMissingTarget('Không tìm thấy thông tin đối phương để bỏ chặn'));
      }
      return run(
        unblockParent(targetParentId),
        `Đã bỏ chặn người dùng ${displayName}`,
        'Bỏ chặn người dùng thất bại. Vui lòng thử lại.',
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

  const loadBlockedUsers = useCallback(
    (params = { page: 1, limit: 10 }) => {
      return dispatch(fetchBlockedUsers(params)).unwrap();
    },
    [dispatch],
  );

  return {
    isSubmitting,
    isLoadingBlockedUsers,
    blockedUsers,
    blockedUsersError,
    blockUser,
    unblockUser,
    reportUser,
    fetchBlockedUsers: loadBlockedUsers,
  };
};

export default useSafetyActions;

