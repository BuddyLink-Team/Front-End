import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Compass, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Modal } from '../../../components/feedback/Modal';
import { FilterChips } from '../../../components/search/FilterChips';
import { PlaceSearchModal } from './PlaceSearchModal';
import { useRescheduleForm } from '../hooks/useRescheduleForm';
import { getLocalDateString } from '../../../utils/formatters';

const TIME_PRESETS = ['08:00', '09:00', '15:00', '16:30'].map((preset) => ({
  id: preset,
  label: preset,
}));

export const RescheduleModal = ({ isOpen, onClose, playdate, onSuccess }) => {
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const { form, errors, isSubmitting, setField, selectPlace, handleSubmit } = useRescheduleForm({
    isOpen,
    playdate,
    onSuccess,
    onClose,
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Đề xuất đổi lịch"
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" form="reschedule-form" variant="primary" size="sm" isLoading={isSubmitting}>
              Gửi đề xuất đổi lịch
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Consensus rule (PROJECT_OVERVIEW 6.2) */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-hairline flex items-start gap-2.5 text-xs text-text-muted">
            <AlertCircle className="w-4 h-4 text-secondary-dark shrink-0 mt-0.5" />
            <span>
              Lịch mới chỉ được áp dụng khi <strong>tất cả phụ huynh đã tham gia</strong> đồng ý. Chỉ cần một người
              từ chối, buổi hẹn sẽ giữ lịch cũ.
            </span>
          </div>

          <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Ngày mới đề xuất *"
              type="date"
              id="newDate"
              name="newDate"
              min={getLocalDateString()}
              value={form.newDate}
              onChange={(e) => setField('newDate', e.target.value)}
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              error={errors.newDate}
            />

            <div className="space-y-1.5">
              <Input
                label="Giờ hẹn mới *"
                type="time"
                id="newStartTime"
                name="newStartTime"
                value={form.newStartTime}
                onChange={(e) => setField('newStartTime', e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
                error={errors.newStartTime}
              />
              <FilterChips
                options={TIME_PRESETS}
                selected={form.newStartTime}
                onChange={(value) => value && setField('newStartTime', value)}
              />
            </div>

            <div className="space-y-2 pt-1 border-t border-hairline">
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Địa điểm mới (tùy chọn)
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPlaceSearch(true)}
                  leftIcon={<Compass className="w-3.5 h-3.5" />}
                >
                  Tìm địa điểm
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  placeholder="Tên địa điểm mới..."
                  value={form.locationName}
                  onChange={(e) => setField('locationName', e.target.value)}
                />
                <Input
                  placeholder="Địa chỉ mới..."
                  value={form.locationAddress}
                  onChange={(e) => setField('locationAddress', e.target.value)}
                />
              </div>
              {errors.location && <p className="text-xs text-error">{errors.location}</p>}
            </div>

            <Textarea
              label="Lý do đề xuất thay đổi"
              rows={2}
              maxLength={500}
              placeholder="Ví dụ: Bé bận lịch tiêm chủng, trời mưa lớn..."
              value={form.reason}
              onChange={(e) => setField('reason', e.target.value)}
            />

          </form>
        </div>
      </Modal>

      <PlaceSearchModal
        isOpen={showPlaceSearch}
        onClose={() => setShowPlaceSearch(false)}
        onSelectPlace={selectPlace}
      />
    </>
  );
};

export default RescheduleModal;
