import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../hooks/useToast';
import { useDebounce } from '../../../hooks/useDebounce';
import { fetchMyChildren } from '../../child/redux/childSlice';
import { fetchPlaymates, fetchPlaceDetail, createPlaydate } from '../redux/playdateSlice';
import { useSubscriptionQuota } from '../../subscription/hooks/useSubscriptionQuota';
import { usePlaydateSuggestions } from './usePlaydateSuggestions';
import { useScheduleCheck } from './useScheduleCheck';
import { createPlaydateSchema } from '../validation/playdateValidation';
import { getLocalDateString } from '../../../utils/formatters';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';
import {
  DEFAULT_PLAYDATE_DURATION,
  PLAYDATE_ERROR_CODES,
  PLAYDATE_ERROR_MESSAGES,
  PLAYDATE_WARNING_CODES,
} from '../constants/playdateConstants';

const getChildId = (child) => (child._id || child.id)?.toString();

// Playmate entry of GET /playdates/friends?childId= -> invited child
const toSelection = ({ parent, child }) => ({
  parentId: parent.id,
  parentName: parent.fullName,
  avatarUrl: parent.avatarUrl,
  childId: child.id,
  childName: child.displayName,
});

/**
 * Create playdate form, child first:
 * 1. the host child (required before anything else),
 * 2. playmates ranked for that child (already paired children first),
 * 3. time, place and activity, helped by suggestions for the selected children.
 * ?invite=<parentId>&childId=<own child> (connections page) preselects the child and that family.
 */
export const useCreatePlaydate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const allChildren = useSelector((state) => state.child.children);
  // Children locked by the Free plan (past its child limit) cannot host a playdate
  const myChildren = useMemo(() => allChildren.filter((c) => !c.isLocked), [allChildren]);
  const playmates = useSelector((state) => state.playdate.playmates);
  const isSubmitting = useSelector((state) => state.playdate.isActionLoading);
  const [searchParams] = useSearchParams();
  const invitedParentId = searchParams.get('invite');
  const preferredChildId = searchParams.get('childId');

  // Premium has unlimited playdates per month (-1 = unlimited)
  const { limits } = useSubscriptionQuota();
  const isPremium = limits.playdatesCreatedPerMonth === -1;
  // Free plan default until the quota is loaded
  const playdateLimit = limits.playdatesCreatedPerMonth ?? 3;

  const [selectedFriends, setSelectedFriends] = useState([]);
  // Friend name search, sent to the backend (GET /playdates/friends?search=)
  const [friendSearch, setFriendSearch] = useState('');
  const debouncedFriendSearch = useDebounce(friendSearch, 350);
  const [isLoadingPlaymates, setIsLoadingPlaymates] = useState(false);
  // Before the first answer a skeleton is shown; later reloads keep the current list on screen
  const [hasLoadedPlaymates, setHasLoadedPlaymates] = useState(false);
  const hasAppliedInvite = useRef(false);
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [locationPlaceId, setLocationPlaceId] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  // Once the parent picks a duration, suggestions never change it again
  const isDurationTouched = useRef(false);
  // Suggested place opened in the place modal's details
  const [placeToView, setPlaceToView] = useState(null);

  const todayStr = getLocalDateString();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPlaydateSchema),
    defaultValues: {
      hostChildId: '',
      activity: '',
      scheduledDate: '',
      time: '',
      durationMinutes: String(DEFAULT_PLAYDATE_DURATION),
      locationName: '',
      locationAddress: '',
      note: '',
    },
  });

  const selectedChildId = watch('hostChildId');
  const activity = watch('activity');
  const scheduledDate = watch('scheduledDate');
  const time = watch('time');
  const durationMinutes = Number(watch('durationMinutes')) || DEFAULT_PLAYDATE_DURATION;
  const locationName = watch('locationName');
  const locationAddress = watch('locationAddress');
  const note = watch('note');

  // Step 1: the parent's children (the one from ?childId=, else the first)
  useEffect(() => {
    let isMounted = true;
    dispatch(fetchMyChildren())
      .unwrap()
      .then((data) => {
        if (!isMounted) return;
        const ids = (Array.isArray(data) ? data : data?.children || []).map(getChildId);
        const initialChildId = ids.includes(preferredChildId) ? preferredChildId : ids[0];
        if (initialChildId) setValue('hostChildId', initialChildId);
      })
      .catch((err) => toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể tải danh sách bé. Vui lòng thử lại sau.')))
      .finally(() => isMounted && setIsLoadingInitialData(false));
    return () => {
      isMounted = false;
    };
  }, [dispatch, setValue, toast, preferredChildId]);

  // Step 2: playmates ranked for the selected child, reloaded when it changes or the search changes
  useEffect(() => {
    if (!selectedChildId) return undefined;
    let isCurrent = true;
    setIsLoadingPlaymates(true);
    dispatch(fetchPlaymates({ childId: selectedChildId, search: debouncedFriendSearch.trim() }))
      .unwrap()
      .then((data) => {
        // The invited family (?invite=) is preselected once, with its best ranked child
        if (!isCurrent || !invitedParentId || hasAppliedInvite.current) return;
        hasAppliedInvite.current = true;
        const entry = [...(data?.matched || []), ...(data?.others || [])].find((e) => e.parent.id === invitedParentId);
        if (entry) setSelectedFriends([toSelection(entry)]);
      })
      .catch((err) => isCurrent && toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể tải danh sách bạn chơi.')))
      .finally(() => {
        if (!isCurrent) return;
        setIsLoadingPlaymates(false);
        setHasLoadedPlaymates(true);
      });
    return () => {
      isCurrent = false;
    };
  }, [selectedChildId, debouncedFriendSearch, invitedParentId, dispatch, toast]);

  // Step 3: suggestions for the selected children
  // Stable list: the playmate picker and the suggestions only re-render when the invited children change
  const selectedChildIds = useMemo(() => selectedFriends.map((f) => f.childId), [selectedFriends]);
  const suggestions = usePlaydateSuggestions({
    childId: selectedChildId,
    participantChildIds: selectedChildIds,
    durationMinutes,
  });
  // The children's other playdates that day: a clash shows as soon as the time is picked
  const scheduleCheck = useScheduleCheck({
    childId: selectedChildId,
    participantChildIds: selectedChildIds,
    date: scheduledDate,
    time,
    durationMinutes,
  });
  // Usual length of the chosen activity, when it is one of the suggestions
  const suggestedDuration = suggestions.activities.items.find((a) => a.title === activity)?.durationMinutes ?? null;

  const handleSelectChild = useCallback(
    (childId) => setValue('hostChildId', childId, { shouldValidate: true }),
    [setValue],
  );

  const handleTogglePlaymate = useCallback((entry) => {
    setSelectedFriends((prev) => {
      const exists = prev.some((p) => p.childId === entry.child.id);
      return exists ? prev.filter((p) => p.childId !== entry.child.id) : [...prev, toSelection(entry)];
    });
  }, []);

  // Typed text or an activity picked in the list
  const hasActivityError = Boolean(errors.activity);
  const handleChangeActivity = useCallback((value) => {
    setValue('activity', value, { shouldDirty: true, shouldValidate: hasActivityError });
  }, [setValue, hasActivityError]);

  // A suggested activity also brings its usual duration (unless the parent chose one)
  const handleSelectSuggestedActivity = useCallback((suggestion) => {
    setValue('activity', suggestion.title, { shouldValidate: true });
    if (!isDurationTouched.current && suggestion.durationMinutes) {
      setValue('durationMinutes', String(suggestion.durationMinutes), { shouldValidate: true });
    }
  }, [setValue]);

  const handleChangeDuration = useCallback((value) => {
    isDurationTouched.current = true;
    setValue('durationMinutes', value, { shouldValidate: true });
  }, [setValue]);

  const handleSelectTime = useCallback((preset) => {
    setValue('time', preset, { shouldValidate: true });
  }, [setValue]);

  // A suggested slot fills both the date and the start time
  const handleSelectTimeSlot = useCallback((slot) => {
    setValue('scheduledDate', slot.date, { shouldValidate: true });
    setValue('time', slot.time, { shouldValidate: true });
  }, [setValue]);

  const handleSelectPlace = useCallback((place) => {
    setValue('locationName', place.name, { shouldValidate: true });
    setValue('locationAddress', place.address, { shouldValidate: true });
    setLocationCoordinates(place.coordinates || null);
    setLocationPlaceId(place.placeId || null);
  }, [setValue]);

  // A suggested place is always read from the places API (map data: address, coordinates...),
  // like a place picked in the search modal
  const handleSelectSuggestedPlace = useCallback(async (place) => {
    let detail = place;
    try {
      detail = { ...place, ...(await dispatch(fetchPlaceDetail(place.id)).unwrap()) };
    } catch {
      // Keep the suggestion data: the address can still be typed in
    }
    handleSelectPlace({
      name: detail.name,
      address: detail.address || '',
      placeId: detail.placeId,
      coordinates: detail.coordinates ? { type: 'Point', coordinates: detail.coordinates } : null,
    });
  }, [dispatch, handleSelectPlace]);

  // "Chi tiết" of a suggested place: the place modal opens on its details
  const handleViewSuggestedPlace = useCallback((place) => {
    setPlaceToView({ ...place, placeType: place.type });
    setShowNearbyModal(true);
  }, []);

  const closePlaceModal = useCallback(() => {
    setShowNearbyModal(false);
    setPlaceToView(null);
  }, []);

  // Invited children who already have another playdate at that time (they can still be invited)
  const warnScheduleConflicts = (warnings = []) => {
    const names = warnings
      .filter((w) => w.code === PLAYDATE_WARNING_CODES.SCHEDULE_CONFLICT)
      .map((w) => selectedFriends.find((f) => f.childId === w.childId)?.childName)
      .filter(Boolean);
    if (names.length) {
      toast.toast(`${names.join(', ')} đã có lịch hẹn khác trùng giờ này. Phụ huynh của bé có thể chưa nhận lời được.`, {
        icon: '⚠️',
        duration: 6000,
      });
    }
  };

  const onSubmitForm = async (formData) => {
    // Known clash of the own child: no request, the field says why (the API would answer 409)
    if (scheduleCheck.ownConflicts.length > 0) {
      setError('time', { message: PLAYDATE_ERROR_MESSAGES[PLAYDATE_ERROR_CODES.SCHEDULE_CONFLICT] });
      return;
    }
    const payload = {
      hostChildId: formData.hostChildId,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      time: formData.time,
      durationMinutes: formData.durationMinutes,
      activity: formData.activity,
      location: {
        name: formData.locationName,
        address: formData.locationAddress,
        placeId: locationPlaceId || undefined,
        coordinates: locationCoordinates || undefined,
      },
      participants: selectedFriends.map((f) => ({
        parentId: f.parentId,
        childId: f.childId,
      })),
      note: formData.note || '',
    };

    try {
      const created = await dispatch(createPlaydate(payload)).unwrap();
      toast.success('Đã tạo buổi hẹn chơi! Lời mời đã được gửi tới bạn bè.');
      warnScheduleConflicts(created?.warnings);
      navigate('/playdates');
    } catch (err) {
      const code = getErrorCode(err);
      // The global PaywallModal is opened by apiClient for quota errors
      if (code === PLAYDATE_ERROR_CODES.QUOTA_EXCEEDED) return;
      if (code === PLAYDATE_ERROR_CODES.SCHEDULE_CONFLICT) {
        setError('time', { message: PLAYDATE_ERROR_MESSAGES[code] });
      }
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Có lỗi xảy ra khi tạo cuộc hẹn chơi. Vui lòng kiểm tra lại.'));
    }
  };

  return {
    isPremium,
    playdateLimit,
    todayStr,
    myChildren,
    playmates,
    friendSearch,
    setFriendSearch,
    isLoadingPlaymates,
    hasLoadedPlaymates,
    selectedFriends,
    selectedChildIds,
    selectedChildId,
    activity,
    scheduledDate,
    time,
    durationMinutes,
    suggestedDuration,
    locationName,
    locationAddress,
    locationCoordinates,
    note,
    errors,
    isLoadingInitialData,
    isSubmitting,
    showNearbyModal,
    placeToView,
    suggestions,
    scheduleCheck,
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    setValue,
    setShowNearbyModal,
    closePlaceModal,
    handleSelectChild,
    handleTogglePlaymate,
    handleChangeActivity,
    handleSelectSuggestedActivity,
    handleChangeDuration,
    handleSelectTime,
    handleSelectTimeSlot,
    handleSelectPlace,
    handleSelectSuggestedPlace,
    handleViewSuggestedPlace,
  };
};

export default useCreatePlaydate;
