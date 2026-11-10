import React from 'react';
import PropTypes from 'prop-types';
import { Timer } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { formatDurationLabel } from '../../playdate/constants/playdate.constants';

/**
 * Length of the playdate as chips (time card, summary card): picking another one asks the assistant
 * to check the plan again for it
 * @param {number[]} durations - Minutes offered (BE durationChoices)
 * @param {number} current
 * @param {(minutes: number) => void} onPick
 * @param {boolean} [disabled]
 */
export const DurationChips = ({ durations, current, onPick, disabled = false }) => {
  const choices = [...new Set([...(durations || []), current].filter(Boolean))].sort((a, b) => a - b);
  if (!choices.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Thời lượng buổi hẹn">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-on-surface-variant">
        <Timer className="w-3.5 h-3.5" /> Thời lượng:
      </span>
      {choices.map((minutes) => {
        const isCurrent = minutes === current;
        return (
          <button
            key={minutes}
            type="button"
            aria-pressed={isCurrent}
            disabled={disabled || isCurrent}
            onClick={() => onPick(minutes)}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
              isCurrent
                ? 'border-primary bg-primary text-on-primary'
                : 'border-hairline-strong bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary-dark',
              disabled && !isCurrent && 'cursor-not-allowed opacity-60',
            )}
          >
            {formatDurationLabel(minutes)}
          </button>
        );
      })}
    </div>
  );
};

DurationChips.propTypes = {
  durations: PropTypes.arrayOf(PropTypes.number),
  current: PropTypes.number,
  onPick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default DurationChips;
