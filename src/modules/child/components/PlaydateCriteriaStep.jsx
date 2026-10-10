import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Navigation,
  Compass,
} from 'lucide-react';
import { Input, RangeSlider, SelectableOptions } from '../../../components';
import {
  PLAYDATE_DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  LOCATION_PREFERENCE_OPTIONS,
  DISTANCE_SLIDER,
} from '../constants/childConstants';

export const PlaydateCriteriaStep = ({
  formData,
  formErrors,
  updateField,
  toggleArrayItem,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Schedule & Time Preferences Section */}
      <div className="bg-surface-container-low/40 rounded-2xl p-5 sm:p-6 border border-hairline/80 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-hairline/60">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface">
              Thời gian & Khung giờ hẹn chơi
            </h3>
            <p className="text-xs text-text-muted">
              Chọn thời điểm thuận tiện nhất cho lịch trình sinh hoạt của gia
              đình
            </p>
          </div>
        </div>

        {/* Days of week */}
        <div>
          <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between mb-2.5">
            <span>
              Ngày trong tuần phù hợp <span className="text-error">*</span>
            </span>
            <span className="text-[11px] text-text-muted font-normal">
              Có thể chọn nhiều
            </span>
          </label>
          <SelectableOptions
            variant="check"
            options={PLAYDATE_DAY_OPTIONS}
            selected={formData.preferredPlaydateDays}
            onToggle={(value) => toggleArrayItem('preferredPlaydateDays', value)}
          />
          {formErrors.preferredPlaydateDays && (
            <p className="text-xs text-error mt-1.5">
              {formErrors.preferredPlaydateDays}
            </p>
          )}
        </div>

        {/* Time slots */}
        <div>
          <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Khung giờ ưa thích <span className="text-error">*</span>
            </span>
            <span className="text-[11px] text-text-muted font-normal">
              Có thể chọn nhiều
            </span>
          </label>
          <SelectableOptions
            variant="tile"
            options={TIME_SLOT_OPTIONS}
            selected={formData.preferredTimeSlots}
            onToggle={(value) => toggleArrayItem('preferredTimeSlots', value)}
          />
          {formErrors.preferredTimeSlots && (
            <p className="text-xs text-error mt-1.5">
              {formErrors.preferredTimeSlots}
            </p>
          )}
        </div>
      </div>

      {/* 2. Location & Gathering Spots */}
      <div className="bg-surface-container-low/40 rounded-2xl p-5 sm:p-6 border border-hairline/80 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-hairline/60">
          <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary-dark flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface">
              Địa điểm & Khu vực kết nối
            </h3>
            <p className="text-xs text-text-muted">
              Định vị vị trí để hệ thống tìm kiếm bạn bè trong khu vực lân cận
            </p>
          </div>
        </div>

        {/* Favorite venue types */}
        <div>
          <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between mb-2.5">
            <span>
              Loại hình không gian mong muốn{' '}
              <span className="text-error">*</span>
            </span>
            <span className="text-[11px] text-text-muted font-normal">
              Chọn không gian an toàn
            </span>
          </label>
          <SelectableOptions
            variant="chip"
            options={LOCATION_PREFERENCE_OPTIONS}
            selected={formData.preferredLocations}
            onToggle={(value) => toggleArrayItem('preferredLocations', value)}
          />
          {formErrors.preferredLocations && (
            <p className="text-xs text-error mt-1.5">
              {formErrors.preferredLocations}
            </p>
          )}
        </div>

        {/* City & Ward */}
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="city"
              label="Tỉnh / Thành phố"
              placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..."
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              error={formErrors.city}
              required
            />
            <Input
              id="area"
              label="Phường / Xã"
              placeholder="VD: Phường Sài Gòn, Phường Hội An..."
              value={formData.area}
              onChange={(e) => updateField('area', e.target.value)}
              error={formErrors.area}
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 border border-hairline text-xs text-text-muted">
            <Compass className="w-4 h-4 text-primary shrink-0" />
            <span>
              Tọa độ trung tâm Phường/Xã sẽ được tự động đồng bộ qua bản đồ địa
              lý để tính bán kính tương thích.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Matching Distance & Age Criteria */}
      <div className="bg-surface-container-low/40 rounded-2xl p-5 sm:p-6 border border-hairline/80 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-hairline/60">
          <div className="w-8 h-8 rounded-xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface">
              Tiêu chuẩn kết nối bạn nhỏ
            </h3>
            <p className="text-xs text-text-muted">
              Khoảng cách di chuyển và độ tuổi tương đồng để các bé dễ kết thân
            </p>
          </div>
        </div>

        {/* Age Range & Distance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Age range */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-on-surface mb-2">
              Khoảng tuổi của bạn chơi (từ {formData.ageMin} đến{' '}
              {formData.ageMax} tuổi)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="18"
                value={formData.ageMin}
                onChange={(e) => updateField('ageMin', Number(e.target.value))}
                placeholder="Từ (tuổi)"
                className="text-center font-semibold"
              />
              <span className="text-text-muted font-bold px-1">đến</span>
              <Input
                type="number"
                min="0"
                max="18"
                value={formData.ageMax}
                onChange={(e) => updateField('ageMax', Number(e.target.value))}
                placeholder="Đến (tuổi)"
                className="text-center font-semibold"
              />
            </div>
            {formErrors.ageMax && (
              <p className="text-xs text-error mt-1.5">{formErrors.ageMax}</p>
            )}
          </div>

          {/* Search Distance Slider */}
          <RangeSlider
            id="criteria-max-distance"
            label={
              <>
                <Navigation className="w-3.5 h-3.5 text-primary" />
                Bán kính tìm kiếm tối đa
              </>
            }
            valueLabel={`${formData.maxDistanceKm} km`}
            min={DISTANCE_SLIDER.MIN}
            max={DISTANCE_SLIDER.MAX}
            value={formData.maxDistanceKm}
            onChange={(km) => updateField('maxDistanceKm', km)}
            marks={DISTANCE_SLIDER.MARKS}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaydateCriteriaStep;
