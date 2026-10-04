import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Compass,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { PlaceSearchModal } from './PlaceSearchModal';
import { playdateApi } from '../api/playdateApi';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PLAYDATE_ERROR_MAP } from '../../../constants/playdate.constants';
import { getLocalDateString } from '../../../utils/formatters';

const TIME_PRESETS = [
  '09:00 - 11:00',
  '14:00 - 16:00',
  '15:30 - 17:30',
  '17:00 - 19:00',
];

export const RescheduleModal = ({
  isOpen,
  onClose,
  playdate,
  onSuccess,
}) => {
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState(playdate?.time || '');
  const [locationName, setLocationName] = useState(playdate?.location?.name || '');
  const [locationAddress, setLocationAddress] = useState(playdate?.location?.address || '');
  const [coordinates, setCoordinates] = useState(playdate?.location?.coordinates || null);
  const [placeId, setPlaceId] = useState(playdate?.location?.placeId || null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Place search modal
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const todayStr = getLocalDateString();

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!newDate) errs.newDate = 'Vui lòng chọn ngày mới';
    if (!newStartTime.trim()) errs.newStartTime = 'Vui lòng nhập hoặc chọn khung giờ mới';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        newDate,
        newStartTime: newStartTime.trim(),
        reason: reason.trim(),
      };

      if (locationName.trim() && locationAddress.trim()) {
        payload.newLocation = {
          name: locationName.trim(),
          address: locationAddress.trim(),
          placeId,
          coordinates,
        };
      }

      const res = await playdateApi.createReschedule(playdate.id || playdate._id, payload);

      if (res?.data?.isAutoApplied || res?.isAutoApplied) {
        toast.success('🎉 Đã cập nhật lịch hẹn mới thành công!');
      } else {
        toast.success('Đã gửi đề xuất đổi lịch đến các phụ huynh tham gia.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Có lỗi xảy ra khi gửi đề xuất đổi lịch');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPlace = (place) => {
    setLocationName(place.name);
    setLocationAddress(place.address);
    setPlaceId(place.placeId);
    setCoordinates(place.coordinates);
    toast.success(`Đã chọn địa điểm: ${place.name}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-hairline max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-tertiary-dark flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Đề xuất đổi lịch Playdate
                </h3>
                <p className="text-xs text-text-muted">
                  Thay đổi ngày, giờ hoặc địa điểm gặp gỡ cho các bé
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rule notice alert */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-hairline flex items-start gap-2.5 text-xs text-text-muted">
            <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <span>
              <strong>Quy tắc đồng thuận:</strong> Đề xuất đổi lịch chỉ chính thức được áp dụng khi <strong>tất cả các phụ huynh đã Chấp thuận (Accepted)</strong> đồng ý với thời gian mới.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Date */}
            <Input
              label="Ngày mới đề xuất *"
              type="date"
              id="newDate"
              name="newDate"
              min={todayStr}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                if (errors.newDate) setErrors((prev) => ({ ...prev, newDate: null }));
              }}
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              error={errors.newDate}
            />

            {/* New Time */}
            <div className="space-y-1.5">
              <Input
                label="Khung giờ mới đề xuất *"
                id="newStartTime"
                name="newStartTime"
                placeholder="Ví dụ: 15:30 - 17:30"
                value={newStartTime}
                onChange={(e) => {
                  setNewStartTime(e.target.value);
                  if (errors.newStartTime) setErrors((prev) => ({ ...prev, newStartTime: null }));
                }}
                leftIcon={<Clock className="w-4 h-4" />}
                error={errors.newStartTime}
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setNewStartTime(preset);
                      if (errors.newStartTime) setErrors((prev) => ({ ...prev, newStartTime: null }));
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      newStartTime === preset
                        ? 'bg-primary/10 border-primary text-primary-dark font-medium'
                        : 'bg-surface-subtle text-text-muted border-hairline hover:border-gray-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* New Location (Optional) */}
            <div className="space-y-2 pt-1 border-t border-hairline">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Địa điểm mới (tùy chọn)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlaceSearch(true)}
                  leftIcon={<Compass className="w-3.5 h-3.5 text-secondary" />}
                  className="text-[11px] py-1 px-2.5 rounded-lg border-secondary/30 text-secondary-dark hover:bg-secondary/5"
                >
                  Tìm địa điểm
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  placeholder="Tên địa điểm mới..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                <Input
                  placeholder="Địa chỉ mới..."
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <Textarea
              label="Lý do đề xuất thay đổi"
              rows={2}
              placeholder="Giải thích ngắn gọn lý do dời lịch (Ví dụ: Bé bận lịch tiêm chủng, trời mưa lớn, v.v.)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-hairline">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="rounded-xl shadow-xs"
              >
                Gửi đề xuất đổi lịch
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Place search modal child */}
      <PlaceSearchModal
        isOpen={showPlaceSearch}
        onClose={() => setShowPlaceSearch(false)}
        onSelectPlace={handleSelectPlace}
      />
    </>
  );
};

export default RescheduleModal;
