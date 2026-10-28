import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { createRescheduleRequest } from '../redux/playdateSlice';
import { DEFAULT_PLAYDATE_DURATION, PLAYDATE_ERROR_MESSAGES } from '../constants/playdate.constants';
import { getLocalDateString } from '../../../utils/formatters';
import { PLAYDATE_TIME_REGEX, hasPlaydateStarted } from '../utils/playdateTime';
import { useScheduleCheck } from './useScheduleCheck';

const toDateInput = (value) => (value ? getLocalDateString(value) : '');
// Old playdates have no duration: the API reads them as 2 hours
const currentDuration = (playdate) => playdate?.durationMinutes ?? DEFAULT_PLAYDATE_DURATION;

const buildInitialForm = (playdate) => ({
  newDate: '',
  newStartTime: playdate?.time || '',
  durationMinutes: String(currentDuration(playdate)),
  locationName: playdate?.location?.name || '',
  locationAddress: playdate?.location?.address || '',
  placeId: playdate?.location?.placeId || null,
  coordinates: playdate?.location?.coordinates || null,
  reason: '',
});

/**
 * Host proposes a new date / time / location (PROJECT_OVERVIEW 6.2).
 * The request is applied once every accepted participant agrees.
 */
export const useRescheduleForm = ({ isOpen, playdate, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const isSubmitting = useSelector((state) => state.playdate.isActionLoading);

  const [form, setForm] = useState(() => buildInitialForm(playdate));
  const [errors, setErrors] = useState({});

  // Start from the current schedule each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(playdate));
      setErrors({});
    }
  }, [isOpen, playdate]);

  // The host child must be free at the new time; accepted families' children are checked too
  // (they could not agree to a time they are busy at). This playdate itself does not count.
  const acceptedChildIds = useMemo(
    () => (playdate?.participants || []).filter((p) => p.status === 'accepted').map((p) => p.childId).filter(Boolean),
    [playdate],
  );
  const scheduleCheck = useScheduleCheck({
    childId: playdate?.isHost ? playdate?.myChildId || playdate?.hostChildId : null,
    participantChildIds: acceptedChildIds,
    date: form.newDate,
    time: form.newStartTime.trim(),
    durationMinutes: Number(form.durationMinutes) || DEFAULT_PLAYDATE_DURATION,
    excludePlaydateId: playdate?.id,
  });

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  }, []);

  const selectPlace = useCallback((place) => {
    setForm((prev) => ({
      ...prev,
      locationName: place.name,
      locationAddress: place.address,
      placeId: place.placeId || null,
      coordinates: place.coordinates || null,
    }));
    setErrors((prev) => ({ ...prev, location: null }));
  }, []);

  const validate = () => {
    const errs = {};
    const name = form.locationName.trim();
    const address = form.locationAddress.trim();
    if (!form.newDate) errs.newDate = 'Vui lòng chọn ngày mới';
    if (!form.newStartTime.trim()) errs.newStartTime = 'Vui lòng chọn giờ hẹn mới';
    else if (!PLAYDATE_TIME_REGEX.test(form.newStartTime.trim())) errs.newStartTime = 'Giờ hẹn có dạng HH:mm, ví dụ 09:00';
    else if (form.newDate && hasPlaydateStarted(form.newDate, form.newStartTime.trim())) {
      errs.newStartTime = 'Lịch hẹn mới phải ở tương lai';
    } else if (scheduleCheck.ownConflicts.length > 0) {
      errs.newStartTime = PLAYDATE_ERROR_MESSAGES.SCHEDULE_CONFLICT;
    }
    // A new location needs both a name and an address
    if (Boolean(name) !== Boolean(address)) errs.location = 'Vui lòng nhập cả tên và địa chỉ địa điểm mới';

    const isSameDate = form.newDate === toDateInput(playdate?.scheduledDate);
    const isSameTime =
      form.newStartTime.trim() === playdate?.time && Number(form.durationMinutes) === currentDuration(playdate);
    const isSameLocation =
      (!name && !address) || (name === playdate?.location?.name && address === playdate?.location?.address);
    if (!errs.newDate && isSameDate && isSameTime && isSameLocation) {
      errs.newDate = 'Lịch đề xuất đang trùng với lịch hiện tại';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const name = form.locationName.trim();
    const address = form.locationAddress.trim();
    const payload = {
      newDate: form.newDate,
      newStartTime: form.newStartTime.trim(),
      reason: form.reason.trim(),
    };
    // Only send the duration when it changed (the API keeps the current one otherwise)
    if (Number(form.durationMinutes) !== currentDuration(playdate)) {
      payload.newDurationMinutes = Number(form.durationMinutes);
    }
    // Only send the location when it changed
    if (name && address && (name !== playdate?.location?.name || address !== playdate?.location?.address)) {
      payload.newLocation = { name, address, placeId: form.placeId, coordinates: form.coordinates };
    }

    try {
      const result = await dispatch(createRescheduleRequest({ id: playdate.id, payload })).unwrap();
      toast.success(
        result?.isAutoApplied
          ? 'Đã cập nhật lịch hẹn mới.'
          : 'Đã gửi đề xuất đổi lịch. Lịch mới được áp dụng khi tất cả phụ huynh tham gia đồng ý.',
      );
      onSuccess?.(result);
      onClose?.();
    } catch (err) {
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Có lỗi xảy ra khi gửi đề xuất đổi lịch.'));
    }
  };

  return { form, errors, isSubmitting, scheduleCheck, setField, selectPlace, handleSubmit };
};

export default useRescheduleForm;
