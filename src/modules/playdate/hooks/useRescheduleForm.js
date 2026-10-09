import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { createRescheduleRequest } from '../redux/playdateSlice';
import { PLAYDATE_ERROR_MAP } from '../constants/playdateConstants';
import { getLocalDateString } from '../../../utils/formatters';
import { PLAYDATE_TIME_REGEX, hasPlaydateStarted } from '../utils/playdateTime';

const toDateInput = (value) => (value ? getLocalDateString(value) : '');

const buildInitialForm = (playdate) => ({
  newDate: '',
  newStartTime: playdate?.time || '',
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
    }
    // A new location needs both a name and an address
    if (Boolean(name) !== Boolean(address)) errs.location = 'Vui lòng nhập cả tên và địa chỉ địa điểm mới';

    const isSameDate = form.newDate === toDateInput(playdate?.scheduledDate);
    const isSameTime = form.newStartTime.trim() === playdate?.time;
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
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Có lỗi xảy ra khi gửi đề xuất đổi lịch.'));
    }
  };

  return { form, errors, isSubmitting, setField, selectPlace, handleSubmit };
};

export default useRescheduleForm;
