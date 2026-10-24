import React from 'react';
import { cn } from '../../../utils/cn';
import { getNotificationMeta } from '../constants/notification.constants';

export const NotificationToast = ({ notification, onClick }) => {
  if (!notification) return null;

  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="flex items-start gap-3 cursor-pointer py-1 outline-none"
    >
      <div className={cn('p-2 rounded-xl shrink-0', meta.bgClass)}>
        <Icon className="w-5 h-5 stroke-1.75" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary line-clamp-1">
          {notification.title}
        </p>
        <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
          {notification.body}
        </p>
      </div>
    </div>
  );
};

export default NotificationToast;
