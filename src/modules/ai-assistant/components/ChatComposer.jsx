import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Send } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { AI_DISCLAIMER, AI_LIMITS } from '../constants/aiAssistantConstants';

/**
 * Message input: Enter sends, Shift+Enter adds a line; grows with its content
 * @param {(text: string) => Promise<boolean>|void} onSend
 * @param {boolean} [disabled]
 * @param {string} [placeholder]
 */
export const ChatComposer = ({ onSend, disabled = false, placeholder = 'Nhắn cho BuddyLink AI…' }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const canSend = !disabled && text.trim().length > 0;
  const showCounter = text.length > AI_LIMITS.MAX_MESSAGE_LENGTH - AI_LIMITS.COUNTER_THRESHOLD;

  const resize = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const submit = () => {
    if (!canSend) return;
    const value = text;
    setText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    onSend(value);
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-hairline-strong bg-surface-container-low p-2 pl-4 shadow-sm transition-colors focus-within:border-primary',
          disabled && 'border-surface-muted bg-surface-muted',
        )}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          disabled={disabled}
          maxLength={AI_LIMITS.MAX_MESSAGE_LENGTH}
          placeholder={placeholder}
          aria-label="Tin nhắn cho Trợ lý AI"
          onChange={(event) => {
            setText(event.target.value);
            resize(event.target);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          className="max-h-composer flex-1 resize-none bg-transparent py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Gửi"
          className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-xs transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 px-1 text-label-sm text-on-surface-variant">
        <span>{AI_DISCLAIMER}</span>
        {showCounter && (
          <span>
            {text.length}/{AI_LIMITS.MAX_MESSAGE_LENGTH}
          </span>
        )}
      </div>
    </div>
  );
};

ChatComposer.propTypes = {
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

export default ChatComposer;
