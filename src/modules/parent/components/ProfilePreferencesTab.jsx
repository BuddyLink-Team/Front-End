import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Users,
  Save,
} from 'lucide-react';
import { Card, Button, Input, RangeSlider, SelectableOptions } from '../../../components';
import {
  PLAYDATE_DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  LOCATION_PREFERENCE_OPTIONS,
  DISTANCE_SLIDER,
} from '../../child/constants/childConstants';
import { useProfilePreferences } from '../hooks/useParentTabHooks';

export const ProfilePreferencesTab = ({ profile, onUpdate, isUpdating }) => {
  const {
    preferredDays,
    preferredSlots,
    preferredLocs,
    maxDistanceKm,
    setMaxDistanceKm,
    ageMin,
    setAgeMin,
    ageMax,
    setAgeMax,
    handleToggleDay,
    handleToggleSlot,
    handleToggleLoc,
    handleSave,
  } = useProfilePreferences({ profile, onUpdate });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Schedule & Time Preferences Section */}
      <Card className="p-6 sm:p-7 rounded-3xl border border-hairline bg-white shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-hairline/80">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">
              Thời gian & Khung giờ hẹn chơi
            </h3>
            <p className="text-xs text-text-muted">
              Chọn thời điểm thuận tiện nhất cho lịch trình sinh hoạt của gia đình
            </p>
          </div>
        </div>

        {/* Days of week */}
        <div className="space-y-2.5">
          <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between">
            <span>Ngày trong tuần phù hợp</span>
            <span className="text-[11px] text-text-muted font-normal">Có thể chọn nhiều</span>
          </label>
          <SelectableOptions
            variant="check"
            options={PLAYDATE_DAY_OPTIONS}
            selected={preferredDays}
            onToggle={handleToggleDay}
          />
        </div>

        {/* Time slots */}
        <div className="space-y-2.5 pt-1">
          <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Khung giờ ưa thích
            </span>
            <span className="text-[11px] text-text-muted font-normal">Có thể chọn nhiều</span>
          </label>
          <SelectableOptions
            variant="tile"
            options={TIME_SLOT_OPTIONS}
            selected={preferredSlots}
            onToggle={handleToggleSlot}
          />
        </div>
      </Card>

      {/* 2. Venue & Space Preferences Section */}
      <Card className="p-6 sm:p-7 rounded-3xl border border-hairline bg-white shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-hairline/80">
          <div className="w-9 h-9 rounded-2xl bg-secondary/15 text-secondary-dark flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">
              Không gian vui chơi ưa thích
            </h3>
            <p className="text-xs text-text-muted">
              Lựa chọn các loại hình không gian an toàn, phù hợp với tính cách của các bé
            </p>
          </div>
        </div>

        <SelectableOptions
          variant="chip"
          options={LOCATION_PREFERENCE_OPTIONS}
          selected={preferredLocs}
          onToggle={handleToggleLoc}
        />
      </Card>

      {/* 3. Matching Distance & Age Criteria Section */}
      <Card className="p-6 sm:p-7 rounded-3xl border border-hairline bg-white shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-hairline/80">
          <div className="w-9 h-9 rounded-2xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">
              Tiêu chuẩn kết nối bạn nhỏ
            </h3>
            <p className="text-xs text-text-muted">
              Khoảng cách di chuyển và độ tuổi tương đồng để các bé dễ kết thân
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Age range */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-on-surface">
              Khoảng tuổi của bạn chơi (từ {ageMin} đến {ageMax} tuổi)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="18"
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value))}
                placeholder="Từ (tuổi)"
                className="text-center font-semibold"
              />
              <span className="text-text-muted font-bold px-1">đến</span>
              <Input
                type="number"
                min="0"
                max="18"
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value))}
                placeholder="Đến (tuổi)"
                className="text-center font-semibold"
              />
            </div>
          </div>

          {/* Search Distance Slider */}
          <RangeSlider
            id="preferences-max-distance"
            label={
              <>
                <Navigation className="w-3.5 h-3.5 text-primary" />
                Bán kính tìm kiếm tối đa
              </>
            }
            valueLabel={`${maxDistanceKm} km`}
            min={DISTANCE_SLIDER.MIN}
            max={DISTANCE_SLIDER.MAX}
            value={maxDistanceKm}
            onChange={setMaxDistanceKm}
            marks={DISTANCE_SLIDER.MARKS}
          />
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-4 border-t border-hairline/80">
          <Button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-xl shadow-md font-semibold text-sm"
            isLoading={isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Lưu thay đổi tiêu chí
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePreferencesTab;
