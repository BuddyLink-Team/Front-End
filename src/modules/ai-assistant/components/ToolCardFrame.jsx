import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { AI_TONES } from '../constants/ai-assistant.constants';

/**
 * Shell of a Tool UI Card: white card with a strong hairline border + small shadow (like the rest of the web), pastel icon badge + title
 * @param {Object} [tone] - AI_TONES entry
 * @param {React.ElementType} icon
 * @param {React.ReactNode} title
 * @param {React.ReactNode} [aside] - Right of the title (link, status)
 * @param {string} [className]
 */
export const ToolCardFrame = ({ tone = AI_TONES.primary, icon: Icon, title, aside, className, children }) => (
  <div className={cn('w-full rounded-2xl border border-hairline-strong shadow-sm bg-surface-container-lowest p-3 sm:p-4 space-y-3', className)}>
    <div className="flex items-center justify-between gap-2">
      <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-on-surface">
        <span className={cn('flex w-8 h-8 shrink-0 items-center justify-center rounded-full', tone.tile)}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="min-w-0 break-words">{title}</span>
      </p>
      {aside}
    </div>
    {children}
  </div>
);

ToolCardFrame.propTypes = {
  tone: PropTypes.shape({ tile: PropTypes.string }),
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.node,
  aside: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default ToolCardFrame;
