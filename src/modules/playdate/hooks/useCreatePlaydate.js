import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { childApi } from '../../child/api/childApi';
import { playdateApi } from '../api/playdateApi';
import { createPlaydateSchema } from '../validation/playdateValidation';
import { getLocalDateString } from '../../../utils/formatters';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PLAYDATE_ERROR_MAP } from '../../../constants/playdate.constants';

export const useCreatePlaydate = () => {
  const navigate = useNavigate();
  const { user, parent } = useSelector((state) => state.auth || {});

  // Check subscription tier: Premium has unlimited playdates
  const isPremium = Boolean(
    user?.isPremium ||
    user?.subscriptionTier === 'premium' ||
    parent?.isPremium ||
    parent?.planCode === 'premium'
  );

  const [myChildren, setMyChildren] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [quotaExceededModal, setQuotaExceededModal] = useState(false);

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
      try {
        const [childrenRes, friendsRes] = await Promise.allSettled([
          childApi.getMyChildren(),
          playdateApi.getFriends(),
        ]);

        if (isMounted) {
          if (childrenRes.status === 'fulfilled' && childrenRes.value?.data) {
            const list = Array.isArray(childrenRes.value.data)
              ? childrenRes.value.data
              : childrenRes.value.data.children || [];
            setMyChildren(list);
            if (list.length > 0) {
              const defaultChildId = (list[0]._id || list[0].id)?.toString();
              setValue('hostChildId', defaultChildId);
            }
          }

          if (friendsRes.status === 'fulfilled' && friendsRes.value?.data) {
            const list = Array.isArray(friendsRes.value.data)
              ? friendsRes.value.data
              : friendsRes.value.data.friends || [];
            setFriends(list);
          }
        }
      } catch (err) {
        toast.error('Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) setIsLoadingInitialData(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [setValue]);

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
    toast.success(`Đã chọn địa điểm: ${place.name}`);
  }, [setValue]);

  const onSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
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

      await playdateApi.createPlaydate(payload);
      toast.success('Khởi tạo cuộc hẹn chơi thành công! Lời mời đã được gửi tới bạn bè.');
      navigate('/playdates');
    } catch (err) {
      const errorCode = err.response?.data?.error?.code || err.response?.data?.message;
      if (errorCode === 'QUOTA_EXCEEDED') {
        setQuotaExceededModal(true);
      } else {
        const errorMsg = getApiErrorMsg(
          PLAYDATE_ERROR_MAP,
          err,
          'Có lỗi xảy ra khi tạo cuộc hẹn chơi. Vui lòng kiểm tra lại.'
        );
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isPremium,
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
    quotaExceededModal,
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    setValue,
    setShowNearbyModal,
    setQuotaExceededModal,
    handleToggleFriend,
    handleSelectQuickActivity,
    handleSelectTime,
    handleSelectPlace,
  };
};

export default useCreatePlaydate;
