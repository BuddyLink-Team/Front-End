import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../../../hooks/useToast';
import { fetchMyChildren } from '../../child/redux/childSlice';
import { fetchInvitableFriends, createPlaydate } from '../redux/playdateSlice';
import { useSubscriptionQuota } from '../../subscription/hooks/useSubscriptionQuota';
import { createPlaydateSchema } from '../validation/playdateValidation';
import { getLocalDateString } from '../../../utils/formatters';
import { getApiErrorMsg, getErrorCode } from '../../../utils/errorUtils';
import { PLAYDATE_ERROR_CODES, PLAYDATE_ERROR_MAP } from '../constants/playdateConstants';

/**
 * Create playdate form: host child, invited friends (connected parents only), date, time and place.
 * API calls live in the child / playdate slice thunks.
 */
export const useCreatePlaydate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const myChildren = useSelector((state) => state.child.children);
  const friends = useSelector((state) => state.playdate.friends);
  const isSubmitting = useSelector((state) => state.playdate.isActionLoading);

  // Premium has unlimited playdates per month (-1 = unlimited)
  const { limits } = useSubscriptionQuota();
  const isPremium = limits.playdatesCreatedPerMonth === -1;
  // Free plan default until the quota is loaded
  const playdateLimit = limits.playdatesCreatedPerMonth ?? 3;

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [showNearbyModal, setShowNearbyModal] = useState(false);

  const todayStr = getLocalDateString();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPlaydateSchema),
    defaultValues: {
      hostChildId: '',
      activity: '',
      scheduledDate: '',
      time: '',
      locationName: '',
      locationAddress: '',
      note: '',
    },
  });

  const selectedChildId = watch('hostChildId');
  const activity = watch('activity');
  const scheduledDate = watch('scheduledDate');
  const time = watch('time');
  const locationName = watch('locationName');
  const locationAddress = watch('locationAddress');
  const note = watch('note');

  // Load initial data (host children & connected friends)
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setIsLoadingInitialData(true);
      const [childrenRes, friendsRes] = await Promise.allSettled([
        dispatch(fetchMyChildren()).unwrap(),
        dispatch(fetchInvitableFriends()).unwrap(),
      ]);
      if (!isMounted) return;

      if (childrenRes.status === 'fulfilled') {
        const list = Array.isArray(childrenRes.value) ? childrenRes.value : childrenRes.value?.children || [];
        if (list.length > 0) setValue('hostChildId', (list[0]._id || list[0].id)?.toString());
      }
      if (childrenRes.status === 'rejected' || friendsRes.status === 'rejected') {
        const failed = childrenRes.status === 'rejected' ? childrenRes.reason : friendsRes.reason;
        toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, failed, 'Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.'));
      }
      setIsLoadingInitialData(false);
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, setValue, toast]);

  // Friend participant toggling
  const handleToggleFriend = useCallback((friend, child) => {
    setSelectedFriends((prev) => {
      const exists = prev.some(
        (p) => p.parentId === friend.id && p.childId === (child.id || child._id)
      );
      if (exists) {
        return prev.filter(
          (p) => !(p.parentId === friend.id && p.childId === (child.id || child._id))
        );
      }
      return [
        ...prev,
        {
          parentId: friend.id,
          parentName: friend.fullName,
          avatarUrl: friend.avatarUrl,
          childId: child.id || child._id,
          childName: child.displayName,
        },
      ];
    });
  }, []);

  const handleSelectQuickActivity = useCallback((name) => {
    setValue('activity', name, { shouldValidate: true });
  }, [setValue]);

  const handleSelectTime = useCallback((preset) => {
    setValue('time', preset, { shouldValidate: true });
  }, [setValue]);

  const handleSelectPlace = useCallback((place) => {
    setValue('locationName', place.name, { shouldValidate: true });
    setValue('locationAddress', place.address, { shouldValidate: true });
    if (place.coordinates) {
      setLocationCoordinates(place.coordinates);
    }
  }, [setValue]);

  const onSubmitForm = async (formData) => {
    const payload = {
      hostChildId: formData.hostChildId,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      time: formData.time,
      activity: formData.activity,
      location: {
        name: formData.locationName,
        address: formData.locationAddress,
        coordinates: locationCoordinates || undefined,
      },
      participants: selectedFriends.map((f) => ({
        parentId: f.parentId,
        childId: f.childId,
      })),
      note: formData.note || '',
    };

    try {
      await dispatch(createPlaydate(payload)).unwrap();
      toast.success('Đã tạo buổi hẹn chơi! Lời mời đã được gửi tới bạn bè.');
      navigate('/playdates');
    } catch (err) {
      // The global PaywallModal is opened by apiClient for quota errors
      if (getErrorCode(err) === PLAYDATE_ERROR_CODES.QUOTA_EXCEEDED) return;
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Có lỗi xảy ra khi tạo cuộc hẹn chơi. Vui lòng kiểm tra lại.'));
    }
  };

  return {
    isPremium,
    playdateLimit,
    todayStr,
    myChildren,
    friends,
    selectedFriends,
    selectedChildId,
    activity,
    scheduledDate,
    time,
    locationName,
    locationAddress,
    note,
    errors,
    isLoadingInitialData,
    isSubmitting,
    showNearbyModal,
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    setValue,
    setShowNearbyModal,
    handleToggleFriend,
    handleSelectQuickActivity,
    handleSelectTime,
    handleSelectPlace,
  };
};

export default useCreatePlaydate;
