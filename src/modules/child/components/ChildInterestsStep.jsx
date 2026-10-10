import React from 'react';
import { Heart, Compass, Smile } from 'lucide-react';
import { SelectableOptions } from '../../../components';
import {
  POPULAR_INTERESTS,
  PERSONALITY_TRAITS,
} from '../constants/childConstants';
import { ACTIVITIES, ACTIVITY_GROUPS } from '../../../constants/activity.constants';

const toOptions = (values) => values.map((value) => ({ value, label: value }));

const INTEREST_OPTIONS = toOptions(POPULAR_INTERESTS);
const PERSONALITY_OPTIONS = toOptions(PERSONALITY_TRAITS);

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
        <SelectableOptions
          options={INTEREST_OPTIONS}
          selected={formData.interests}
          onToggle={(value) => toggleArrayItem('interests', value)}
        />
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
              <SelectableOptions
                options={group.activities.map(({ value, icon }) => ({ value, label: value, icon }))}
                selected={formData.favoriteActivities}
                onToggle={(value) => toggleArrayItem('favoriteActivities', value)}
              />
            </div>
          ))}
          {otherActivities.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Khác</p>
              <SelectableOptions
                options={toOptions(otherActivities)}
                selected={otherActivities}
                onToggle={(value) => toggleArrayItem('favoriteActivities', value)}
              />
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
        <SelectableOptions
          options={PERSONALITY_OPTIONS}
          selected={formData.personality}
          onToggle={(value) => toggleArrayItem('personality', value)}
        />
        {formErrors.personality && (
          <p className="text-xs text-error mt-1.5">{formErrors.personality}</p>
        )}
      </div>
    </div>
  );
};

export default ChildInterestsStep;
