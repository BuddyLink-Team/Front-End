import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { COMMON_ERROR_MESSAGES } from '../../../constants/error.constants';
import { blockParent, unblockParent, reportParent, uploadReportEvidence } from '../redux/safetySlice';
import { BLOCK_REASONS, SAFETY_ERROR_MESSAGES } from '../constants/safety.constants';

/**
 * Block / unblock / report another parent. API calls live in the safety slice thunks.
 */
export const useSafetyActions = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const isBlockSubmitting = useSelector((state) => state.safety.isBlockSubmitting);
  const isReportSubmitting = useSelector((state) => state.safety.isReportSubmitting);

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
    (msg = SAFETY_ERROR_MESSAGES.ID_REQUIRED) => {
      toast.error(msg);
      return { success: false, error: msg };
    },
    [toast],
  );

  const blockUser = useCallback(
    (targetParentId, displayName = 'phụ huynh', reason = BLOCK_REASONS.DEFAULT) => {
      if (!targetParentId) {
        return Promise.resolve(rejectMissingTarget());
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
        return Promise.resolve(rejectMissingTarget());
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
        return Promise.resolve(rejectMissingTarget(SAFETY_ERROR_MESSAGES.REPORTED_USER_REQUIRED));
      }
      return run(
        reportParent(payload),
        'Báo cáo đã được gửi tới Quản trị viên BuddyLink để xem xét.',
        'Gửi báo cáo thất bại. Vui lòng thử lại.',
      );
    },
    [run, rejectMissingTarget],
  );

  /**
   * Check and upload evidence images one by one (invalid files are skipped with a toast).
   * @param {File[]} files
   * @returns {Promise<string[]>} URLs of the uploaded images
   */
  const uploadEvidence = useCallback(
    async (files) => {
      const urls = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: ${COMMON_ERROR_MESSAGES.INVALID_FILE_TYPE}`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: ${COMMON_ERROR_MESSAGES.FILE_TOO_LARGE}`);
          continue;
        }
        try {
          const result = await dispatch(uploadReportEvidence(file)).unwrap();
          if (result?.url) urls.push(result.url);
        } catch (error) {
          toast.error(getApiErrorMsg(SAFETY_ERROR_MESSAGES, error, 'Tải ảnh bằng chứng thất bại. Vui lòng thử lại.'));
          break;
        }
      }
      return urls;
    },
    [dispatch, toast],
  );

  return { isBlockSubmitting, isReportSubmitting, blockUser, unblockUser, reportUser, uploadEvidence };
};

export default useSafetyActions;
