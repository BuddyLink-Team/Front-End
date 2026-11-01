import React from 'react';
import { X } from 'lucide-react';
import { useAIAssistantDrawer } from '../hooks/useAIAssistantDrawer';
import { useFabReminder } from '../hooks/useFabReminder';
import { AIMascotAvatar } from './AIMascotAvatar';
import { AI_FAB_REMINDER } from '../constants/ai-assistant.constants';

/**
 * Floating chat bubble (mascot) opening the assistant drawer, with a reminder message next to it.
 * Hidden on the assistant page and the messenger.
 */
export const AIAssistantFab = () => {
  const { isOpen, isFabVisible, open } = useAIAssistantDrawer();
  const isShown = isFabVisible && !isOpen;
  const reminder = useFabReminder(isShown);
  if (!isShown) return null;

  // Opening the assistant also means the reminder did its job
  const openAssistant = () => {
    reminder.dismiss();
    open();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {reminder.isVisible && (
        <div
          role="status"
          className="relative max-w-60 sm:max-w-xs rounded-2xl rounded-br-sm border border-hairline-strong bg-surface-container-lowest py-2.5 pl-3.5 pr-8 shadow-popover animate-pop-in"
        >
          <button type="button" onClick={openAssistant} className="text-left">
            <span className="block text-sm font-semibold text-primary-dark">{AI_FAB_REMINDER.TITLE}</span>
            <span className="block text-xs text-on-surface-variant">{AI_FAB_REMINDER.TEXT}</span>
          </button>
          <button
            type="button"
            onClick={reminder.dismiss}
            aria-label="Ẩn lời nhắc"
            className="absolute right-1.5 top-1.5 rounded-full p-1 text-text-muted transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={openAssistant}
        aria-label="Mở Trợ lý BuddyLink AI"
        className="relative flex w-14 h-14 shrink-0 items-center justify-center rounded-full border-2 border-primary-border bg-surface-container-lowest shadow-elevated transition-transform hover:scale-105 animate-pop-in"
      >
        <AIMascotAvatar size="lg" className="w-full h-full border-0" />
        {/* Online dot, like a chat head */}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white bg-primary" aria-hidden="true" />
      </button>
    </div>
  );
};

export default AIAssistantFab;
