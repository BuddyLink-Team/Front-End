import { useCallback, useEffect, useState } from 'react';
import { AI_FAB_REMINDER } from '../constants/aiAssistantConstants';

const readDismissed = () => {
  try {
    return sessionStorage.getItem(AI_FAB_REMINDER.STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Reminder message next to the floating assistant bubble: appears shortly after the page opens,
 * stays hidden for the rest of the tab session once dismissed (or once the assistant was opened)
 * @param {boolean} isActive - The floating bubble is on screen
 */
export const useFabReminder = (isActive) => {
  const [isDismissed, setIsDismissed] = useState(readDismissed);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isActive || isDismissed) return undefined;
    const timer = setTimeout(() => setIsReady(true), AI_FAB_REMINDER.DELAY_MS);
    return () => clearTimeout(timer);
  }, [isActive, isDismissed]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(AI_FAB_REMINDER.STORAGE_KEY, '1');
    } catch {
      // Storage unavailable: hidden until reload only
    }
  }, []);

  return { isVisible: isActive && isReady && !isDismissed, dismiss };
};

export default useFabReminder;
