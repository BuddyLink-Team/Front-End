import React from 'react';
import { getNotificationMeta } from '../constants/notification.constants';

export const NotificationToast = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  return (
    <div
      onClick={onDismiss}
      className="flex items-start gap-3 cursor-pointer py-1"
      role="alert"
    >
      <div className={`p-2 rounded-xl shrink-0 ${meta.bgClass}`}>
        <Icon className="w-5 h-5" />
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
