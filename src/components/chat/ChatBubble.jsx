import React from 'react';
import { cn } from '../../utils/cn';

/**
 * ChatBubble - layout of one chat message: avatar (incoming only), bubble, extra content and meta line.
 * Holds no message logic, so both the messenger and the AI Assistant render their messages with it.
 *
 * @param {boolean} [isOutgoing=false] - Own message: right-aligned, user bubble color, no avatar
 * @param {React.ReactNode} [avatar] - Shown next to incoming messages
 * @param {React.ReactNode} children - Bubble content
 * @param {React.ReactNode} [attachments] - Content below the bubble, outside it (e.g. AI tool cards)
 * @param {React.ReactNode} [meta] - Line below everything (time, delivery status...)
 * @param {boolean} [isPending=false] - Dims the bubble while it is being sent
 * @param {boolean} [hasError=false] - Error ring around the bubble
 * @param {string} [className]
 * @param {string} [bubbleClassName]
 */
export const ChatBubble = ({
  isOutgoing = false,
  avatar,
  children,
  attachments,
  meta,
  isPending = false,
  hasError = false,
  className,
  bubbleClassName,
}) => (
  <div
    className={cn(
      // w-fit + auto margin: the message list is a block container, so self-* alone has no effect
      'flex w-fit items-end gap-2.5 max-w-bubble sm:max-w-bubble-sm',
      isOutgoing ? 'ml-auto self-end justify-end' : 'mr-auto self-start justify-start',
      className
    )}
  >
    {!isOutgoing && avatar && <div className="shrink-0 mb-1">{avatar}</div>}

    <div className={cn('flex flex-col gap-1', isOutgoing ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed break-words',
          isOutgoing ? 'chat-bubble-user' : 'chat-bubble-partner',
          isPending && 'opacity-70',
          hasError && 'ring-1 ring-error/40',
          bubbleClassName
        )}
      >
        {children}
      </div>

      {attachments && <div className="w-full flex flex-col gap-2">{attachments}</div>}

      {meta && <div className="flex items-center gap-1 text-label-sm text-outline px-1">{meta}</div>}
    </div>
  </div>
);

export default ChatBubble;
