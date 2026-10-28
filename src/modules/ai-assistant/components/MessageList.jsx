import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { TypingIndicator } from '../../../components/feedback/TypingIndicator';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { AIMascotAvatar } from './AIMascotAvatar';
import { MessageBubble } from './MessageBubble';

/**
 * Scrollable conversation, kept at the bottom when a message arrives; typing indicator while waiting
 */
export const MessageList = ({ messages, isLoading, isSending, onRetry, onStartNew, cardHandlers, emptyState }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end', behavior: 'smooth' });
  }, [messages.length, isSending]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 space-y-4 chat-stream-canvas p-4">
        <Skeleton className="h-10 w-2/3 ml-auto rounded-2xl" />
        <Skeleton className="h-24 w-3/4 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto chat-stream-canvas px-3 py-4 sm:px-5" aria-live="polite">
      {messages.length === 0 && !isSending ? (
        emptyState
      ) : (
        <div className="mx-auto flex max-w-ai-thread flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.localId || message.id}
              message={message}
              isSending={isSending}
              onRetry={onRetry}
              onStartNew={onStartNew}
              cardHandlers={cardHandlers}
            />
          ))}
          {isSending && <TypingIndicator avatar={<AIMascotAvatar size="sm" />} label="BuddyLink AI đang soạn" />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  isSending: PropTypes.bool,
  onRetry: PropTypes.func.isRequired,
  onStartNew: PropTypes.func,
  cardHandlers: PropTypes.object.isRequired,
  emptyState: PropTypes.node,
};

export default MessageList;
