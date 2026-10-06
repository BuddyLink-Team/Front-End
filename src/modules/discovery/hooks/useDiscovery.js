import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';
import {
  fetchDiscoveryProfiles,
  swipeDiscoveryProfile,
  removeProfile,
  restoreProfile,
} from '../redux/discoverySlice';
import {
  CONNECTION_QUOTA_EXCEEDED_MESSAGE,
  DISCOVERY_ERROR_CODES,
  DISCOVERY_ERROR_MESSAGES,
  LIKE_SUCCESS_MESSAGES,
  QUOTA_ACTION_TYPES,
  SUBSCRIPTION_PAGE_PATH,
  SWIPE_DIRECTIONS,
  UNLIMITED_QUOTA,
} from '../constants/discoveryConstants';

const FETCH_ERROR_FALLBACK = 'Lỗi tải danh sách khám phá';
const SWIPE_ERROR_FALLBACK = 'Không thể ghi nhận lựa chọn. Vui lòng thử lại.';

/**
 * Map a swipe error to a message; QUOTA_EXCEEDED is shared by the discovery and
 * connection request quotas, told apart by error.details[0].message (the action type).
 */
const getSwipeErrorMessage = (err) => {
  const isConnectionQuota =
    getErrorCode(err) === DISCOVERY_ERROR_CODES.QUOTA_EXCEEDED &&
    err?.error?.details?.[0]?.message === QUOTA_ACTION_TYPES.CONNECTION_REQUEST;
  if (isConnectionQuota) return CONNECTION_QUOTA_EXCEEDED_MESSAGE;
  return getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, err, SWIPE_ERROR_FALLBACK);
};

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Discovery card stack: loads profiles, records swipes (optimistic with rollback) and
 * wires keyboard shortcuts. API calls live in the discovery slice thunks.
 */
export const useDiscovery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { filters, profiles, meta, hasMore, isLoading, error } = useSelector((state) => state.discovery);

  // Child IDs whose swipe request is still in flight
  const pendingSwipeIds = useRef(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  const fetchProfiles = useCallback(() => dispatch(fetchDiscoveryProfiles(filters)), [dispatch, filters]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Load the next batch once the stack is empty and every swipe has reached the server,
  // so already-swiped children are excluded by the backend
  useEffect(() => {
    if (profiles.length === 0 && hasMore && !isLoading && !error && pendingCount === 0) {
      fetchProfiles();
    }
  }, [profiles.length, hasMore, isLoading, error, pendingCount, fetchProfiles]);

  const handleSwipe = useCallback(
    async (profile, direction) => {
      if (!profile || pendingSwipeIds.current.has(profile.childId)) return;

      pendingSwipeIds.current.add(profile.childId);
      setPendingCount(pendingSwipeIds.current.size);
      dispatch(removeProfile(profile.childId));

      try {
        const result = await dispatch(
          swipeDiscoveryProfile({
            targetChildId: profile.childId,
            isLike: direction === SWIPE_DIRECTIONS.LIKE,
          }),
        ).unwrap();

        // Like = connection request; liking back someone who already sent one connects both parents
        const connection = result?.connection;
        if (connection?.isMatched) toast.success(LIKE_SUCCESS_MESSAGES.MATCHED);
        else if (connection?.isNew) toast.success(LIKE_SUCCESS_MESSAGES.SENT);
        else if (connection) toast.success(LIKE_SUCCESS_MESSAGES.EXISTING);
      } catch (err) {
        // A duplicate swipe means the server already has it: keep the card removed
        if (getErrorCode(err) !== DISCOVERY_ERROR_CODES.DUPLICATE_SWIPE) {
          dispatch(restoreProfile(profile));
          toast.error(getSwipeErrorMessage(err));
        }
      } finally {
        pendingSwipeIds.current.delete(profile.childId);
        setPendingCount(pendingSwipeIds.current.size);
      }
    },
    [dispatch, toast],
  );

  // Keyboard shortcuts: ← pass, → like (ignored while typing or holding the key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || isTypingTarget(e.target) || profiles.length === 0) return;
      if (e.key === 'ArrowLeft') handleSwipe(profiles[0], SWIPE_DIRECTIONS.PASS);
      else if (e.key === 'ArrowRight') handleSwipe(profiles[0], SWIPE_DIRECTIONS.LIKE);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profiles, handleSwipe]);

  const goToUpgrade = useCallback(() => navigate(SUBSCRIPTION_PAGE_PATH), [navigate]);

  let remainingViewsLabel = '...';
  if (meta?.remainingViews === UNLIMITED_QUOTA) remainingViewsLabel = 'Không giới hạn';
  else if (meta?.remainingViews !== undefined) remainingViewsLabel = `${meta.remainingViews} lượt`;

  return {
    profiles,
    meta,
    isLoading,
    errorMessage: error ? getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, error, FETCH_ERROR_FALLBACK) : null,
    remainingViewsLabel,
    refetch: fetchProfiles,
    handleSwipe,
    goToUpgrade,
  };
};

export default useDiscovery;
