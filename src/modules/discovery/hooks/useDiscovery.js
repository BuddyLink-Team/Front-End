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
  DEFAULT_DISCOVERY_FILTERS,
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
 * Labels for the filter bar chips. Unset values mean "no filter" (Tất cả).
 */
const buildFilterSummary = (filters = {}) => {
  const hasDistance =
    filters.maxDistance !== undefined && filters.maxDistance !== DEFAULT_DISCOVERY_FILTERS.maxDistance;
  const hasAge =
    (filters.minAge !== undefined && filters.minAge !== DEFAULT_DISCOVERY_FILTERS.minAge) ||
    (filters.maxAge !== undefined && filters.maxAge !== DEFAULT_DISCOVERY_FILTERS.maxAge);
  const hasPersonality = (filters.personalities || []).length > 0;

  return {
    hasActiveFilter: hasDistance || hasAge || hasPersonality,
    distanceLabel: hasDistance ? `${filters.maxDistance} km` : 'Tất cả',
    ageLabel: hasAge
      ? `${filters.minAge ?? DEFAULT_DISCOVERY_FILTERS.minAge}-${filters.maxAge ?? DEFAULT_DISCOVERY_FILTERS.maxAge} tuổi`
      : 'Tất cả',
  };
};

/**
 * Discovery card stack: loads profiles, records swipes (optimistic with rollback) and
 * wires keyboard shortcuts. API calls live in the discovery slice thunks.
 *
 * @param {Object} [options]
 * @param {boolean} [options.isKeyboardEnabled=true] - Disable shortcuts while a modal is open
 * @param {(childId: string) => void} [options.onViewDetail] - Called on Enter for the top card
 */
export const useDiscovery = ({ isKeyboardEnabled = true, onViewDetail } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { filters, profiles, meta, hasMore, isLoading, error } = useSelector((state) => state.discovery);

  // Child IDs whose swipe request is still in flight
  const pendingSwipeIds = useRef(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  // Latest stack, read inside handleSwipe without re-creating it on every change
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;

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

  /**
   * Like / Pass a child. Accepts a discovery profile, or a child ID (e.g. from the detail modal).
   * @returns {Promise<boolean>} true when the swipe was recorded
   */
  const handleSwipe = useCallback(
    async (profileOrChildId, direction) => {
      const childId = typeof profileOrChildId === 'string' ? profileOrChildId : profileOrChildId?.childId;
      if (!childId || pendingSwipeIds.current.has(childId)) return false;

      // Only cards that are in the stack are removed / restored
      const stackProfile = profilesRef.current.find((p) => p.childId === childId);

      pendingSwipeIds.current.add(childId);
      setPendingCount(pendingSwipeIds.current.size);
      if (stackProfile) dispatch(removeProfile(childId));

      try {
        const result = await dispatch(
          swipeDiscoveryProfile({ targetChildId: childId, isLike: direction === SWIPE_DIRECTIONS.LIKE }),
        ).unwrap();

        // Like = connection request; liking back someone who already sent one connects both parents
        const connection = result?.connection;
        if (connection?.isMatched) toast.success(LIKE_SUCCESS_MESSAGES.MATCHED);
        else if (connection?.isNew) toast.success(LIKE_SUCCESS_MESSAGES.SENT);
        else if (connection) toast.success(LIKE_SUCCESS_MESSAGES.EXISTING);
        return true;
      } catch (err) {
        // A duplicate swipe means the server already has it: keep the card removed
        if (getErrorCode(err) === DISCOVERY_ERROR_CODES.DUPLICATE_SWIPE) return true;
        if (stackProfile) dispatch(restoreProfile(stackProfile));
        toast.error(getSwipeErrorMessage(err));
        return false;
      } finally {
        pendingSwipeIds.current.delete(childId);
        setPendingCount(pendingSwipeIds.current.size);
      }
    },
    [dispatch, toast],
  );

  // Keyboard shortcuts: ← pass, → like, Enter view detail (ignored while typing or holding the key)
  useEffect(() => {
    if (!isKeyboardEnabled) return undefined;

    const handleKeyDown = (e) => {
      if (e.repeat || isTypingTarget(e.target) || profiles.length === 0) return;
      const topProfile = profiles[0];
      if (e.key === 'ArrowLeft') handleSwipe(topProfile, SWIPE_DIRECTIONS.PASS);
      else if (e.key === 'ArrowRight') handleSwipe(topProfile, SWIPE_DIRECTIONS.LIKE);
      else if (e.key === 'Enter' && onViewDetail) onViewDetail(topProfile.childId);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardEnabled, profiles, handleSwipe, onViewDetail]);

  const goToUpgrade = useCallback(() => navigate(SUBSCRIPTION_PAGE_PATH), [navigate]);

  let remainingViewsLabel = '...';
  if (meta?.remainingViews === UNLIMITED_QUOTA) remainingViewsLabel = 'Không giới hạn';
  else if (meta?.remainingViews !== undefined) remainingViewsLabel = `${meta.remainingViews} lượt`;

  return {
    profiles,
    meta,
    isLoading,
    isSwiping: pendingCount > 0,
    errorMessage: error ? getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, error, FETCH_ERROR_FALLBACK) : null,
    remainingViewsLabel,
    filterSummary: buildFilterSummary(filters),
    refetch: fetchProfiles,
    handleSwipe,
    goToUpgrade,
  };
};

export default useDiscovery;
