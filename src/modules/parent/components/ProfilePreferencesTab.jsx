import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Users,
  Save,
  Check,
} from 'lucide-react';
import { Card, Button, Input } from '../../../components';
import {
  PLAYDATE_DAY_OPTIONS,
  TIME_SLOT_OPTIONS,
  LOCATION_PREFERENCE_OPTIONS,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PLAYDATE_DAY_OPTIONS.map((opt) => {
              const isSelected = preferredDays.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleToggleDay(opt.value)}
                  className={`p-3.5 rounded-2xl text-left border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary-dark font-semibold shadow-xs'
                      : 'bg-white border-hairline text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container-low/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'border border-hairline bg-surface-container-low'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TIME_SLOT_OPTIONS.map((slot) => {
              const isSelected = preferredSlots.includes(slot.value);
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => handleToggleSlot(slot.value)}
                  className={`py-3 px-3.5 rounded-2xl text-center border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                      : 'bg-white border-hairline text-on-surface-variant hover:border-outline-variant/60 hover:bg-surface-container-low/60'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
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

        <div className="flex flex-wrap gap-2.5">
          {LOCATION_PREFERENCE_OPTIONS.map((loc) => {
            const isSelected = preferredLocs.includes(loc.value);
            return (
              <button
                key={loc.value}
                type="button"
                onClick={() => handleToggleLoc(loc.value)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                    : 'bg-white text-on-surface-variant border-hairline hover:border-outline-variant/60 hover:bg-surface-container-low/60'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span>{loc.label}</span>
              </button>
            );
          })}
        </div>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                Bán kính tìm kiếm tối đa
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                {maxDistanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full h-2.5 bg-white border border-hairline rounded-lg appearance-none cursor-pointer accent-primary mt-2 transition-all"
            />
            <div className="flex justify-between text-[11px] text-text-muted font-medium pt-1">
              <span>1 km (Gần nhà)</span>
              <span>15 km (Khu vực)</span>
              <span>30 km</span>
            </div>
          </div>
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
