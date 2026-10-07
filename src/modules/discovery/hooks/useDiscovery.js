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
  initFiltersFromPreferences,
  setSelectedChild,
} from '../redux/discoverySlice';
import { fetchMyChildren, CHILD_LIST_STATUS } from '../../child/redux/childSlice';
import { fetchMyParentProfile } from '../../parent/redux/parentSlice';
import { PARENT_ERROR_MESSAGES } from '../../parent/constants/parentConstants';
import { CHILD_ERROR_MESSAGES } from '../../child/constants/childConstants';
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
const PREFERENCES_ERROR_FALLBACK = 'Không tải được tiêu chí tìm bạn của bạn, đang dùng bộ lọc mặc định.';
const CHILDREN_ERROR_FALLBACK = 'Không tải được danh sách bé, đang tìm bạn cho tất cả các bé.';

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
 * Labels for the filter bar chips. Filters always hold real values (defaults = parent preferences);
 * a filter is "active" when it differs from those defaults.
 */
const buildFilterSummary = (filters, defaultFilters) => {
  if (!filters || !defaultFilters) {
    return { hasActiveFilter: false, distanceLabel: '...', ageLabel: '...' };
  }
  const isDistanceChanged = filters.maxDistance !== defaultFilters.maxDistance;
  const isAgeChanged = filters.minAge !== defaultFilters.minAge || filters.maxAge !== defaultFilters.maxAge;
  const hasPersonality = (filters.personalities || []).length > 0;

  return {
    hasActiveFilter: isDistanceChanged || isAgeChanged || hasPersonality,
    distanceLabel: `${filters.maxDistance} km`,
    ageLabel: `${filters.minAge}-${filters.maxAge} tuổi`,
  };
};

const DEFAULT_SEARCHING_FOR_LABEL = 'Bé của bạn';

const getChildId = (child) => String(child.id || child._id);

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
  const { filters, defaultFilters, selectedChildId, profiles, meta, hasMore, isLoading, error } = useSelector(
    (state) => state.discovery,
  );
  const { profile: parentProfile, isLoading: isParentLoading } = useSelector((state) => state.parent);
  const hasRequestedParent = useRef(false);

  // Default filters = the parent's preferences: load the profile if needed, then (re)build defaults
  // whenever the preferences change. Falls back to the standard defaults if it cannot be loaded.
  const parentPreferences = parentProfile?.preferences;
  const hasDefaultFilters = Boolean(defaultFilters);

  useEffect(() => {
    if (parentPreferences) dispatch(initFiltersFromPreferences(parentPreferences));
  }, [parentPreferences, dispatch]);

  useEffect(() => {
    if (parentPreferences || isParentLoading || hasDefaultFilters) return;
    if (!hasRequestedParent.current) {
      hasRequestedParent.current = true;
      dispatch(fetchMyParentProfile())
        .unwrap()
        .catch((err) => toast.error(getApiErrorMsg(PARENT_ERROR_MESSAGES, err, PREFERENCES_ERROR_FALLBACK)));
      return;
    }
    // Profile could not be loaded: use the standard defaults
    dispatch(initFiltersFromPreferences());
  }, [parentPreferences, isParentLoading, hasDefaultFilters, dispatch, toast]);
  const { children: myChildren, listStatus: childListStatus } = useSelector((state) => state.child);

  // Load the parent's children once: the matches are computed for one selected child
  useEffect(() => {
    if (childListStatus !== CHILD_LIST_STATUS.IDLE) return;
    dispatch(fetchMyChildren())
      .unwrap()
      .catch((err) => toast.error(getApiErrorMsg(CHILD_ERROR_MESSAGES, err, CHILDREN_ERROR_FALLBACK)));
  }, [childListStatus, dispatch, toast]);

  const isChildListSettled =
    childListStatus === CHILD_LIST_STATUS.SUCCEEDED || childListStatus === CHILD_LIST_STATUS.FAILED;

  // Default to the first child; re-pick if the selected child no longer exists
  useEffect(() => {
    if (!isChildListSettled) return;
    const childIds = myChildren.map(getChildId);
    if (childIds.length === 0) {
      if (selectedChildId) dispatch(setSelectedChild(null));
    } else if (!childIds.includes(selectedChildId)) {
      dispatch(setSelectedChild(childIds[0]));
    }
  }, [isChildListSettled, myChildren, selectedChildId, dispatch]);

  const childOptions = myChildren.map((c) => ({ value: getChildId(c), label: c.displayName }));
  const selectedChild = childOptions.find((o) => o.value === selectedChildId);
  const selectChild = useCallback((childId) => dispatch(setSelectedChild(childId)), [dispatch]);

  // Ready once the default filters (parent preferences) and the selected child are known
  const isSelectionReady =
    isChildListSettled && (myChildren.length === 0 || myChildren.some((c) => getChildId(c) === selectedChildId));
  const isSearchReady = Boolean(filters) && isSelectionReady;

  // Child IDs whose swipe request is still in flight
  const pendingSwipeIds = useRef(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  // Latest stack, read inside handleSwipe without re-creating it on every change
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;

  const fetchProfiles = useCallback(
    () => dispatch(fetchDiscoveryProfiles({ ...filters, childId: selectedChildId || undefined })),
    [dispatch, filters, selectedChildId],
  );

  // (Re)search whenever the filters are applied or another child is selected
  useEffect(() => {
    if (isSearchReady) fetchProfiles();
  }, [isSearchReady, fetchProfiles]);

  // Load the next batch once the stack is empty and every swipe has reached the server,
  // so already-swiped children are excluded by the backend
  useEffect(() => {
    if (isSearchReady && profiles.length === 0 && hasMore && !isLoading && !error && pendingCount === 0) {
      fetchProfiles();
    }
  }, [isSearchReady, profiles.length, hasMore, isLoading, error, pendingCount, fetchProfiles]);

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
    // Still loading until the default filters and the selected child are known
    isLoading: isLoading || !isSearchReady,
    isSwiping: pendingCount > 0,
    errorMessage: error ? getApiErrorMsg(DISCOVERY_ERROR_MESSAGES, error, FETCH_ERROR_FALLBACK) : null,
    remainingViewsLabel,
    searchingForLabel: selectedChild?.label || DEFAULT_SEARCHING_FOR_LABEL,
    childOptions,
    selectedChildId,
    selectChild,
    filterSummary: buildFilterSummary(filters, defaultFilters),
    refetch: fetchProfiles,
    handleSwipe,
    goToUpgrade,
  };
};

export default useDiscovery;
