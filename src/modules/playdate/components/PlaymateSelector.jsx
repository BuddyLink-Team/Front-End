import { memo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Link2, TriangleAlert } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { ShowMoreButton } from '../../../components/ui/ShowMoreButton';
import { useShowMore } from '../../../hooks/useShowMore';
import { MatchScoreBar } from '../../discovery/components/MatchScoreBar';
import { cn } from '../../../utils/cn';
import { ICON_STROKE } from '../../../constants/icon.constants';
import { PLAYDATE_WARNING_CODES } from '../constants/playdateConstants';

const warningText = (warning) =>
  warning.code === PLAYDATE_WARNING_CODES.AGE_GAP ? `Chênh lệch ${warning.ageGapYears} tuổi` : null;

const PlaymateCard = ({ entry, isMatched, isSelected, onToggle }) => {
  const { parent, child, matchScore, warnings } = entry;
  const notes = warnings.map(warningText).filter(Boolean);

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(entry)}
      className={cn(
        'w-full p-3.5 rounded-2xl border text-left transition-colors space-y-2.5',
        isSelected
          ? 'border-primary bg-primary-soft shadow-2xs'
          : 'border-hairline bg-surface-container-low/30 hover:border-hairline-strong hover:bg-surface-container-low',
      )}
    >
      <div className="flex items-center gap-2.5">
        <Avatar src={parent.avatarUrl} alt={parent.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary truncate">
            {child.displayName}
            {child.age !== null && child.age !== undefined && (
              <span className="font-normal text-text-muted"> · {child.age} tuổi</span>
            )}
          </p>
          <p className="text-xs text-text-muted truncate">Phụ huynh: {parent.fullName}</p>
        </div>
        {isSelected && <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" strokeWidth={ICON_STROKE.DEFAULT} />}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {isMatched && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-on-primary text-label-sm">
            <Link2 className="w-3 h-3" strokeWidth={ICON_STROKE.DEFAULT} />
            Đã ghép đôi
          </span>
        )}
        <MatchScoreBar score={matchScore} className="w-auto px-2 py-0.5 shadow-none backdrop-blur-none" />
      </div>

      {notes.length > 0 && (
        <p className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs bg-tertiary-soft text-tertiary-dark border-tertiary-border">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0" strokeWidth={ICON_STROKE.DEFAULT} />
          {notes.join(' · ')} — vẫn có thể mời
        </p>
      )}
    </button>
  );
};

const entryShape = PropTypes.shape({
  parent: PropTypes.shape({ id: PropTypes.string, fullName: PropTypes.string, avatarUrl: PropTypes.string }).isRequired,
  child: PropTypes.shape({ id: PropTypes.string, displayName: PropTypes.string, age: PropTypes.number }).isRequired,
  matchScore: PropTypes.number,
  source: PropTypes.string,
  warnings: PropTypes.arrayOf(PropTypes.object),
});

PlaymateCard.propTypes = {
  entry: entryShape.isRequired,
  isMatched: PropTypes.bool,
  isSelected: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

const PlaymateGroup = ({ title, entries, isMatched, isSelected, onToggle }) => {
  const { visibleItems, hiddenCount, hasMore, isExpanded, toggle } = useShowMore(entries, { keepVisible: isSelected });
  if (!entries.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-label-md uppercase tracking-wider text-text-muted">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleItems.map((entry) => (
          <PlaymateCard
            key={entry.child.id}
            entry={entry}
            isMatched={isMatched}
            isSelected={isSelected(entry)}
            onToggle={onToggle}
          />
        ))}
      </div>
      {hasMore && <ShowMoreButton isExpanded={isExpanded} hiddenCount={hiddenCount} unit="bé" onToggle={toggle} />}
    </div>
  );
};

PlaymateGroup.propTypes = {
  title: PropTypes.string.isRequired,
  entries: PropTypes.arrayOf(entryShape).isRequired,
  isMatched: PropTypes.bool,
  isSelected: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

/**
 * The friends' children ranked for the host child, 4 per group before "Xem thêm":
 * "Bạn chơi của bé" (already paired children) first, then the other children of connected families.
 * Warnings (e.g. a big age gap) only inform: every child stays selectable.
 * While a new list loads, the current one stays visible (dimmed).
 */
export const PlaymateSelector = memo(({ matched, others, selectedChildIds, onToggle, isRefreshing = false }) => {
  const isSelected = (entry) => selectedChildIds.includes(entry.child.id);

  return (
    <div className={cn('space-y-4 transition-opacity', isRefreshing && 'opacity-60')} aria-busy={isRefreshing}>
      <PlaymateGroup title="Bạn chơi của bé" entries={matched} isMatched isSelected={isSelected} onToggle={onToggle} />
      <PlaymateGroup title="Các bé khác trong gia đình bạn bè" entries={others} isSelected={isSelected} onToggle={onToggle} />
    </div>
  );
});

PlaymateSelector.displayName = 'PlaymateSelector';
PlaymateSelector.propTypes = {
  matched: PropTypes.arrayOf(entryShape).isRequired,
  others: PropTypes.arrayOf(entryShape).isRequired,
  selectedChildIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
};

export default PlaymateSelector;
