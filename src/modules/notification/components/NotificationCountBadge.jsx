import React from 'react';
import { cn } from '../../../utils/cn';
import { useUnreadNotificationCount } from '../hooks/useUnreadNotificationCount';

const MAX_DISPLAY_COUNT = 99;

/**
 * Unread notification counter; renders nothing when everything is read.
 * Lets shared UI (Navbar) show the count without reading the notification slice itself.
 * @param {string} [className] - Placement, e.g. absolute over the bell icon
 */
export const NotificationCountBadge = ({ className }) => {
  const unreadCount = useUnreadNotificationCount();
  if (!unreadCount) return null;

  return (
    <span
      className={cn(
        'min-w-5 h-5 px-1 rounded-full bg-error text-white text-label-xs font-semibold flex items-center justify-center',
        className
      )}
    >
      {unreadCount > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : unreadCount}
    </span>
  );
};

export default NotificationCountBadge;
