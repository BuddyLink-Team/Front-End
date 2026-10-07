import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { Card, Button, Avatar, InterestTag } from '../../../components';
import { CHILD_GENDERS, GENDER_OPTIONS } from '../constants/childConstants';

/**
 * ChildCard Component
 * Displays a single child's profile summary card with actions
 */
export const ChildCard = ({ child, onEdit, onDelete }) => {
  const childId = child.id || child._id;
  const isBoy = child.gender === CHILD_GENDERS.BOY;
  const genderOption = GENDER_OPTIONS.find((opt) => opt.value === child.gender);
  const genderLabel = genderOption ? genderOption.label : GENDER_OPTIONS.find((opt) => opt.value === CHILD_GENDERS.OTHER)?.label || 'Khác';

  return (
    <Card
      className="p-6 rounded-3xl border border-hairline bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between space-y-5 relative overflow-hidden"
    >
      {/* Decorative Top Accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-2 ${isBoy ? 'bg-secondary' : 'bg-primary'}`}
      />

      {/* Child Main Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <Avatar
              alt={child.displayName}
              size="lg"
              className="rounded-2xl object-cover shrink-0 w-14 h-14"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-on-surface truncate">
                  {child.displayName}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                    isBoy
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {genderLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span>
                  {child.age ? `${child.age} tuổi` : 'Độ tuổi phù hợp'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons in top-right corner */}
          <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onEdit?.(childId)}
              className="text-xs text-primary font-semibold hover:bg-primary/10 px-2 py-1.5 rounded-xl flex items-center gap-1"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              title="Chỉnh sửa hồ sơ bé"
            >
              Sửa
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onDelete?.(child)}
              className="text-xs text-error font-semibold hover:bg-error/10 px-2 py-1.5 rounded-xl flex items-center gap-1"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              title="Xóa hồ sơ bé"
            >
              Xóa
            </Button>
          </div>
        </div>

        {/* Interests Tags */}
        {child.interests &&
          child.interests.length > 0 &&
          (() => {
            const maxDisplay = 3;
            const visibleList = child.interests.slice(0, maxDisplay);
            const remainingCount = child.interests.length - maxDisplay;
            const remainingTooltip = child.interests.slice(maxDisplay).join(', ');

            return (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-text-muted block uppercase tracking-wider">
                  Sở thích
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleList.map((item, idx) => (
                    <InterestTag key={idx} label={item} />
                  ))}
                  {remainingCount > 0 && (
                    <span
                      title={`Còn lại: ${remainingTooltip}`}
                      className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-text-muted border border-hairline/80 cursor-help hover:bg-surface-container-high transition-colors"
                    >
                      +{remainingCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

        {/* Personality Traits */}
        {child.personality &&
          child.personality.length > 0 &&
          (() => {
            const maxDisplay = 3;
            const visibleList = child.personality.slice(0, maxDisplay);
            const remainingCount = child.personality.length - maxDisplay;
            const remainingTooltip = child.personality.slice(maxDisplay).join(', ');

            return (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-text-muted block uppercase tracking-wider">
                  Tính cách
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {visibleList.map((trait, idx) => (
                    <InterestTag
                      key={idx}
                      label={trait}
                      className="bg-tertiary/15 text-tertiary-dark border-tertiary/40"
                    />
                  ))}
                  {remainingCount > 0 && (
                    <span
                      title={`Còn lại: ${remainingTooltip}`}
                      className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary-dark border border-tertiary/40 cursor-help hover:bg-tertiary/25 transition-colors"
                    >
                      +{remainingCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
      </div>
    </Card>
  );
};

ChildCard.propTypes = {
  child: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    displayName: PropTypes.string,
    gender: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    interests: PropTypes.arrayOf(PropTypes.string),
    personality: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ChildCard;
