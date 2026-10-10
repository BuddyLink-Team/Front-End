import React, { useRef } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { QUICK_EMOJIS } from '../constants/chatConstants.js';

export const EmojiPopover = ({ isOpen, onClose, onSelectEmoji }) => {
  const popoverRef = useRef(null);

  useClickOutside(popoverRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-14 left-2 z-50 p-2.5 chat-emoji-popover rounded-2xl animate-pop-in"
    >
      <div className="grid grid-cols-6 gap-1.5 w-52">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-container-low rounded-xl transition-all hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPopover;
