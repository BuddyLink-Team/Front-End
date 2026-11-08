import React from 'react';
import PropTypes from 'prop-types';
import { CircleX, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { TIME_ISSUE_SEVERITY, TIME_ISSUE_TEXT } from '../constants/playdate.constants';

const STYLES = {
  [TIME_ISSUE_SEVERITY.BLOCK]: { icon: CircleX, className: 'border-error-container bg-error-soft text-error-dark' },
  [TIME_ISSUE_SEVERITY.WARN]: { icon: TriangleAlert, className: 'border-tertiary-border bg-tertiary-soft text-tertiary-dark' },
  [TIME_ISSUE_SEVERITY.INFO]: { icon: Info, className: 'border-secondary-border bg-secondary-soft text-secondary-dark' },
};

/**
 * Rules the picked time breaks (BUD-49 C), worst first: a blocking one (place closed, time passed)
 * must be fixed before the playdate can be created, the others are notes.
 */
export const TimeRuleNotices = ({ issues }) => {
  const shown = issues.filter((issue) => TIME_ISSUE_TEXT[issue.code]);
  if (!shown.length) return null;
  return (
    <ul className="space-y-1.5" aria-live="polite">
      {shown.map((issue) => {
        const style = STYLES[issue.severity] || STYLES[TIME_ISSUE_SEVERITY.INFO];
        const Icon = style.icon;
        return (
          <li key={issue.code} className={cn('flex items-start gap-1.5 px-3 py-2 rounded-xl border text-xs', style.className)}>
            <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{TIME_ISSUE_TEXT[issue.code]}</span>
          </li>
        );
      })}
    </ul>
  );
};

TimeRuleNotices.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default TimeRuleNotices;
