import React from 'react';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useNotificationDropdown } from '../hooks/useNotificationDropdown';
import { getNotificationMeta } from '../constants/notification.constants';
import { formatRelativeTime } from '../utils/notificationFormatters';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { NotificationCountBadge } from './NotificationCountBadge';

export const NotificationDropdown = () => {
  const {
    isOpen,
    dropdownRef,
    previewItems,
    unreadCount,
    isLoading,
    isMarkingRead,
    toggleDropdown,
    handleItemClick,
    handleMarkAllRead,
    handleViewAll,
  } = useNotificationDropdown();

  return (
    <div className="relative inline-block text-left mr-3" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        onClick={toggleDropdown}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          // No focus ring on click (the Button default draws a ring around the icon); keyboard focus keeps it
          'relative p-1 bg-transparent hover:bg-transparent active:scale-100 text-text-muted hover:text-text-primary focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/30',
          isOpen && 'text-primary-dark hover:text-primary-dark'
        )}
      >
        <Bell className="w-6 h-6 stroke-1.75" />
        <NotificationCountBadge className="absolute -top-1 -right-1 ring-2 ring-white" />
      </Button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          tabIndex="-1"
          className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl shadow-popover border border-hairline focus:outline-none z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-hairline bg-surface/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Thông báo</h3>
              {unreadCount > 0 && (
                <StatusChip tone="success" label={`${unreadCount} mới`} />
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isMarkingRead}
                title="Đánh dấu tất cả đã đọc"
                leftIcon={<CheckCheck className="w-3.5 h-3.5 stroke-1.75" />}
                className="text-text-muted hover:text-primary"
              >
                Đã đọc tất cả
              </Button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && previewItems.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : previewItems.length === 0 ? (
              <EmptyState
                icon={<Inbox className="w-6 h-6 stroke-1.75" />}
                title="Không có thông báo mới"
                description="Bạn đã cập nhật tất cả thông báo gần đây."
                className="border-0 rounded-none bg-transparent p-6 md:p-8"
              />
            ) : (
              previewItems.map((notification) => {
                const meta = getNotificationMeta(notification.type);
                const Icon = meta.icon;
                const sender = notification.data?.sender;

                return (
                  <div
                    key={notification.id}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleItemClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(notification);
                      }
                    }}
                    className={cn(
                      'relative flex items-start gap-3 p-3.5 border-b last:border-b-0 transition-colors duration-150 cursor-pointer outline-none focus:bg-surface-muted',
                      notification.isRead
                        ? 'border-hairline hover:bg-surface-muted'
                        : 'bg-primary-soft border-primary-border hover:bg-primary-tint-hover'
                    )}
                  >
                    {/* Unread indicator bar */}
                    {!notification.isRead && (
                      <span className="absolute left-1 top-4 w-1.5 h-8 rounded-full bg-primary" />
                    )}

                    {/* Icon or Avatar */}
                    <div className="relative shrink-0">
                      {sender?.avatarUrl ? (
                        <div className="relative">
                          <Avatar
                            src={sender.avatarUrl}
                            name={sender.fullName}
                            size="md"
                            className="ring-2 ring-white"
                          />
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 p-0.5 rounded-full border border-white',
                              meta.bgClass
                            )}
                          >
                            <Icon className="w-3 h-3 stroke-1.75" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center border',
                            meta.bgClass
                          )}
                        >
                          <Icon className="w-5 h-5 stroke-1.75" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <StatusChip tone={meta.badgeTone} label={meta.badgeText} />
                        <span className="text-label-sm text-text-muted whitespace-nowrap">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <p
                        className={cn(
                          'text-xs mt-1 leading-snug line-clamp-1 text-text-primary',
                          notification.isRead ? 'font-medium' : 'font-semibold'
                        )}
                      >
                        {notification.title}
                      </p>

                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-hairline bg-surface/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-1.75" />}
              className="w-full text-primary hover:text-primary-dark"
            >
              Xem tất cả lịch sử thông báo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
