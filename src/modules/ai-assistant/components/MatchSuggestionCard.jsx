import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Users, Compass, Baby } from 'lucide-react';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { MatchScoreBar } from '../../discovery/components/MatchScoreBar';
import { ChildAvatar } from '../../discovery/components/ChildAvatar';
import { cn } from '../../../utils/cn';
import { formatKm, LINK_CLASS } from '../../playdate/utils/suggestionFormatters';
import { ToolCardFrame } from './ToolCardFrame';
import { AI_CARD_TONES, AI_CARD_TYPES } from '../constants/aiAssistantConstants';

/**
 * Children who would be good playmates (Discovery, read only: nothing is swiped from here).
 * @param {Array<Object>} items - MatchCardItem from the assistant
 * @param {(childId: string) => void} onViewChild - Opens the child's public profile
 */
export const MatchSuggestionCard = ({ items, onViewChild }) => (
  <ToolCardFrame
    tone={AI_CARD_TONES[AI_CARD_TYPES.MATCH_SUGGESTIONS]}
    icon={Users}
    title="Bạn chơi phù hợp"
    aside={
      <Link to="/discovery" className={LINK_CLASS}>
        <Compass className="w-3 h-3" /> Mở Khám phá
      </Link>
    }
  >
    {items.length === 0 ? (
      <p className="text-xs text-text-muted">Chưa tìm thấy bạn phù hợp. Thử nới độ tuổi hoặc khoảng cách nhé.</p>
    ) : (
      <ul className="space-y-2">
        {items.map((child) => (
          <li key={child.childId} className="rounded-xl border border-hairline-strong shadow-sm p-3 space-y-2">
            <div className="flex items-start gap-3">
              <ChildAvatar gender={child.gender} alt={child.displayName} size="sm" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary break-words">
                    {child.displayName}
                    {child.age != null && <span className="font-normal text-text-muted"> · {child.age} tuổi</span>}
                  </p>
                  <button type="button" onClick={() => onViewChild(child.childId)} className={cn(LINK_CLASS, 'shrink-0 whitespace-nowrap')}>
                    <Baby className="w-3 h-3" /> Xem hồ sơ
                  </button>
                </div>
                <p className="flex flex-wrap items-center gap-1.5 text-label-sm text-text-muted">
                  <span className="break-words">
                    Bé nhà {child.parent.fullName}
                    {child.parent.area ? ` · ${child.parent.area}` : ''}
                    {child.distanceKm != null ? ` · ~${formatKm(child.distanceKm)}` : ''}
                  </span>
                  {child.parent.isVerifiedParent && <VerifiedBadge size="sm" iconOnly />}
                </p>
              </div>
            </div>
            {child.matchScore != null && <MatchScoreBar score={child.matchScore} />}
            {child.sharedInterests.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-label-sm text-text-muted">Cùng thích:</span>
                {child.sharedInterests.map((interest) => (
                  <InterestTag key={interest} label={interest} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </ToolCardFrame>
);

MatchSuggestionCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      childId: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      age: PropTypes.number,
      gender: PropTypes.string,
      sharedInterests: PropTypes.arrayOf(PropTypes.string).isRequired,
      matchScore: PropTypes.number,
      distanceKm: PropTypes.number,
      parent: PropTypes.shape({
        fullName: PropTypes.string,
        area: PropTypes.string,
        isVerifiedParent: PropTypes.bool,
      }).isRequired,
    }),
  ).isRequired,
  onViewChild: PropTypes.func.isRequired,
};

export default MatchSuggestionCard;
