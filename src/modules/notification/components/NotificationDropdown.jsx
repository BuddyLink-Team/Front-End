import React from 'react';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { useNotificationDropdown } from '../hooks/useNotificationDropdown';
import { getNotificationMeta } from '../constants/notification.constants';
import { formatRelativeTime } from '../utils/notificationFormatters';
import { Avatar } from '../../../components/ui/Avatar';

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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`relative p-2.5 rounded-full transition-all duration-200 outline-none focus:outline-none ${
          isOpen
            ? 'bg-primary-soft text-primary-dark'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
        }`}
      >
        <Bell className="w-5 h-5 transition-transform duration-200" />

        {/* Unread count badge - Soft design system error color */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          tabIndex="-1"
          className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl p-0 shadow-[0_16px_40px_-8px_rgba(45,55,72,0.08)] border border-hairline focus:outline-none z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-hairline bg-surface/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-soft text-primary-dark border border-primary-border">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingRead}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-hairline/60">
            {isLoading && previewItems.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : previewItems.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted mb-2.5">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Không có thông báo mới</p>
                <p className="text-xs text-text-muted mt-1 max-w-[240px] mx-auto">
                  Bạn đã cập nhật tất cả thông báo gần đây.
                </p>
              </div>
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
                    className={`relative flex items-start gap-3 p-3.5 transition-colors duration-150 cursor-pointer outline-none focus:bg-surface-muted ${
                      !notification.isRead
                        ? 'bg-primary-soft/25 hover:bg-primary-soft/40'
                        : 'hover:bg-surface-container-low/60'
                    }`}
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
                            className="rounded-xl ring-2 ring-white"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-white ${meta.bgClass}`}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.bgClass}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${meta.badgeClass}`}
                        >
                          {meta.badgeText}
                        </span>
                        <span className="text-[11px] text-text-muted whitespace-nowrap">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <p
                        className={`text-xs mt-1 leading-snug line-clamp-1 ${
                          !notification.isRead
                            ? 'font-semibold text-text-primary'
                            : 'font-medium text-text-primary'
                        }`}
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
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark hover:bg-white transition-all duration-150"
            >
              <span>Xem tất cả lịch sử thông báo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
