import React from 'react';
import { cn } from '../../utils/cn';

/**
 * TypingIndicator - "is typing" bubble with three bouncing dots (chat, AI Assistant).
 *
 * @param {React.ReactNode} [avatar] - Shown before the bubble (e.g. <Avatar size="sm" />)
 * @param {React.ReactNode} [label] - Text before the dots (e.g. "Lan đang soạn"); dots only when omitted
 * @param {string} [className]
 */
export const TypingIndicator = ({ avatar, label, className }) => (
  <div
    role="status"
    aria-label={typeof label === 'string' ? label : 'Đang soạn tin'}
    className={cn('flex items-center gap-2 self-start animate-fade-in pl-1', className)}
  >
    {avatar}
    <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm chat-typing-bubble flex items-center gap-1.5">
      {label && <span className="text-xs text-on-surface-variant">{label}</span>}
      <span className={cn('flex items-center gap-1', label ? 'pt-1' : 'py-1')} aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-3" />
      </span>
    </div>
  </div>
);

export default TypingIndicator;
