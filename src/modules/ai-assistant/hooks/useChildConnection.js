import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';
import { swipeDiscoveryProfile } from '../../discovery/redux/discoverySlice';
import {
  DISCOVERY_ERROR_CODES,
  DISCOVERY_ERROR_MESSAGES,
  LIKE_SUCCESS_MESSAGES,
  SWIPE_DIRECTIONS,
} from '../../discovery/constants/discovery.constants';

const SWIPE_ERROR_FALLBACK = 'Không thể ghi nhận lựa chọn. Vui lòng thử lại.';

/**
 * Like / Pass a child opened from an assistant card (same Discovery swipe, with the same toasts).
 * @param {{ childId: string, forChildId?: string } | null} target - Child shown in the profile modal
 */
export const useChildConnection = (target) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [isSwiping, setIsSwiping] = useState(false);

  /** @returns {Promise<boolean>} true when the swipe was recorded */
  const swipe = useCallback(
    async (direction) => {
      if (!target?.childId || isSwiping) return false;
      setIsSwiping(true);
      try {
        const result = await dispatch(
          swipeDiscoveryProfile({
            targetChildId: target.childId,
            isLike: direction === SWIPE_DIRECTIONS.LIKE,
            forChildId: target.forChildId || undefined,
          }),
        ).unwrap();

        const connection = result?.connection;
        if (connection?.isMatched) toast.success(LIKE_SUCCESS_MESSAGES.MATCHED);
        else if (connection?.isNew) toast.success(LIKE_SUCCESS_MESSAGES.SENT);
        else if (connection) toast.success(LIKE_SUCCESS_MESSAGES.EXISTING);
        return true;
      } catch (err) {
        // Already swiped (e.g. in Discovery): the server has it, nothing to retry
        if (getErrorCode(err) === DISCOVERY_ERROR_CODES.DUPLICATE_SWIPE) {
          toast.success(DISCOVERY_ERROR_MESSAGES[DISCOVERY_ERROR_CODES.DUPLICATE_SWIPE]);
          return true;
        }
        // Quota errors open the global PaywallModal (services/apiClient.js)
        if (getErrorCode(err) !== DISCOVERY_ERROR_CODES.QUOTA_EXCEEDED) {
          toast.error(getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, err, SWIPE_ERROR_FALLBACK));
        }
        return false;
      } finally {
        setIsSwiping(false);
      }
    },
    [dispatch, toast, target, isSwiping],
  );

  return { swipe, isSwiping };
};

export default useChildConnection;
