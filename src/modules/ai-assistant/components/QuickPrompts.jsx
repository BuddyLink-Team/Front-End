import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { QUICK_PROMPTS } from '../constants/ai-assistant.constants';
import { AIMascotAvatar } from './AIMascotAvatar';

/**
 * Empty conversation: greeting and starter prompts (sent on click)
 * @param {(prompt: string) => void} onPick
 * @param {boolean} [disabled]
 * @param {boolean} [compact] - Drawer variant (one column)
 */
export const QuickPrompts = ({ onPick, disabled = false, compact = false }) => (
  <div className="mx-auto flex max-w-ai-thread flex-col items-center gap-5 py-6 text-center">
    <AIMascotAvatar size="lg" />
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-on-surface">Xin chào! Mình là BuddyLink AI</h2>
      <p className="text-sm text-on-surface-variant">
        Mình giúp bạn tìm bạn chơi cho bé, gợi ý địa điểm và lên kế hoạch hẹn chơi từng bước.
      </p>
    </div>
    <div className={cn('grid w-full gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
      {QUICK_PROMPTS.map(({ key, icon: Icon, tone, label, prompt }) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onPick(prompt)}
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-hairline-strong shadow-sm bg-surface-container-lowest px-4 py-3 text-left text-sm font-medium text-on-surface transition-colors disabled:bg-surface-container-low disabled:text-outline',
            !disabled && tone.hover,
          )}
        >
          <span className={cn('flex w-9 h-9 shrink-0 items-center justify-center rounded-full', tone.tile)}>
            <Icon className="w-4 h-4" />
          </span>
          {label}
        </button>
      ))}
    </div>
  </div>
);

QuickPrompts.propTypes = {
  onPick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
};

export default QuickPrompts;
