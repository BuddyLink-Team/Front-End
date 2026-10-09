import React from 'react';
import { Heart, Compass, Smile } from 'lucide-react';
import {
  POPULAR_INTERESTS,
  PERSONALITY_TRAITS,
} from '../constants/childConstants';
import { ACTIVITIES, ACTIVITY_GROUPS } from '../../../constants/activity.constants';

export const ChildInterestsStep = ({
  formData,
  formErrors,
  toggleArrayItem,
}) => {
  // Saved activities that are no longer in the catalog stay visible so they can be removed
  const otherActivities = formData.favoriteActivities.filter(
    (value) => !ACTIVITIES.some((a) => a.value === value)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Interests Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-primary" />
            Sở thích của bé <span className="text-error">*</span>
          </label>
          <span className="text-xs text-text-muted">Đã chọn: {formData.interests.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_INTERESTS.map((item) => {
            const isSelected = formData.interests.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleArrayItem('interests', item)}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border-hairline hover:bg-surface-container'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        {formErrors.interests && (
          <p className="text-xs text-error mt-1.5">{formErrors.interests}</p>
        )}
      </div>

      {/* Favorite Activities */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Hoạt động con thích tham gia <span className="text-error">*</span>
          </label>
          <span className="text-xs text-text-muted">Đã chọn: {formData.favoriteActivities.length}</span>
        </div>
        <div className="space-y-3">
          {ACTIVITY_GROUPS.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.activities.map(({ value, icon: Icon }) => {
                  const isSelected = formData.favoriteActivities.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleArrayItem('favoriteActivities', value)}
                      className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant border-hairline hover:bg-surface-container'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {otherActivities.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Khác</p>
              <div className="flex flex-wrap gap-2">
                {otherActivities.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed
                    onClick={() => toggleArrayItem('favoriteActivities', value)}
                    className="px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border bg-primary text-white border-primary shadow-xs"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {formErrors.favoriteActivities && (
          <p className="text-xs text-error mt-1.5">{formErrors.favoriteActivities}</p>
        )}
      </div>

      {/* Personality Traits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-primary" />
            Tính cách nổi bật của bé <span className="text-error">*</span>
          </label>
          <span className="text-xs text-text-muted">Đã chọn: {formData.personality.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TRAITS.map((trait) => {
            const isSelected = formData.personality.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                onClick={() => toggleArrayItem('personality', trait)}
                className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant border-hairline hover:bg-surface-container'
                }`}
              >
                {trait}
              </button>
            );
          })}
        </div>
        {formErrors.personality && (
          <p className="text-xs text-error mt-1.5">{formErrors.personality}</p>
        )}
      </div>
    </div>
  );
};

export default ChildInterestsStep;
