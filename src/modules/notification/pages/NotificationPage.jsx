import React from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Inbox,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useNotifications } from '../hooks/useNotifications';
import {
  TAB_DEFINITIONS,
  getNotificationMeta,
  hasNotificationAction,
} from '../constants/notification.constants';
import { formatRelativeTime } from '../utils/notificationFormatters';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/cards/Card';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Switch } from '../../../components/ui/Switch';
import { Tabs } from '../../../components/navigation/Tabs';
import { Pagination } from '../../../components/navigation/Pagination';

export const NotificationPage = () => {
  const {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    activeTab,
    unreadOnly,
    handleTabChange,
    handleUnreadToggle,
    handlePageChange,
    handleMarkAsRead,
    handleMarkAllRead,
    handleActionClick,
  } = useNotifications();

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header Card */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary-soft text-primary-dark">
                <Bell className="w-6 h-6 stroke-1.75" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                Lịch sử thông báo
              </h1>
            </div>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Theo dõi và quản lý mọi cập nhật về lời mời kết nối, buổi hẹn Playdate và huy hiệu thành tích của bạn.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={handleMarkAllRead}
              disabled={isMarkingRead}
              leftIcon={<CheckCheck className="w-4 h-4 text-primary stroke-1.75" />}
              className="self-start md:self-auto shrink-0"
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </Card>

      {/* Category Filter Tabs & Unread Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Shared Tabs Component (Pill variant with rounded-full geometry) */}
        <div className="overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Tabs
            tabs={TAB_DEFINITIONS}
            activeTab={activeTab}
            onChange={handleTabChange}
            variant="pill"
          />
        </div>

        {/* Unread Only Toggle */}
        <Switch
          size="sm"
          label="Chỉ hiện thông báo chưa đọc"
          checked={unreadOnly}
          onChange={handleUnreadToggle}
          className="shrink-0 self-end sm:self-auto"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} padding="default" className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/4 mt-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-7 h-7 text-primary stroke-1.75" />}
            title="Không có thông báo nào"
            description={
              unreadOnly
                ? 'Bạn đã đọc tất cả các thông báo trong mục này.'
                : 'Hiện tại chưa có thông báo mới nào được ghi nhận.'
            }
            actionLabel={unreadOnly ? 'Xem tất cả thông báo' : undefined}
            onAction={unreadOnly ? handleUnreadToggle : undefined}
          />
        ) : (
          items.map((notification) => {
            const meta = getNotificationMeta(notification.type);
            const hasAction = hasNotificationAction(notification);
            const Icon = meta.icon;
            const sender = notification.data?.sender;
            const playdate = notification.data?.playdate;

            return (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => handleActionClick(notification)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActionClick(notification);
                  }
                }}
                className={cn(
                  'group relative rounded-2xl p-4 sm:p-5 border transition-colors duration-150 cursor-pointer outline-none focus:ring-2 focus:ring-primary/20',
                  notification.isRead
                    ? 'bg-white border-hairline hover:border-hairline-strong'
                    : 'bg-primary-soft border-primary-border border-l-4 border-l-primary hover:bg-primary-tint-hover'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon / Avatar and Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Visual: Avatar or Event Icon */}
                    <div className="relative shrink-0 mt-0.5 sm:mt-0">
                      {sender?.avatarUrl ? (
                        <div className="relative">
                          <Avatar
                            src={sender.avatarUrl}
                            name={sender.fullName}
                            size="lg"
                            className="ring-2 ring-white"
                          />
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 p-1 rounded-full border border-white',
                              meta.bgClass
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 stroke-1.75" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center border',
                            meta.bgClass
                          )}
                        >
                          <Icon className="w-6 h-6 stroke-1.75" />
                        </div>
                      )}
                    </div>

                    {/* Notification Copy */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip tone={meta.badgeTone} label={meta.badgeText} />

                        {!notification.isRead && (
                          <span className="flex items-center gap-1 text-label-sm font-semibold text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>Mới</span>
                          </span>
                        )}

                        <span className="text-xs text-text-muted">
                          • {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          'text-sm sm:text-base mt-1.5 text-text-primary',
                          notification.isRead ? 'font-medium' : 'font-semibold'
                        )}
                      >
                        {notification.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                        {notification.body}
                      </p>

                      {/* Extra context snippet for Playdate */}
                      {playdate?.activity && (
                        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-muted border border-hairline text-label-sm text-text-muted">
                          <Calendar className="w-3.5 h-3.5 text-primary stroke-1.75" />
                          <span className="font-semibold text-text-primary">
                            {playdate.activity}
                          </span>
                          {playdate.time && <span>• {playdate.time}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
                    {hasAction && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(notification);
                        }}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-1.75" />}
                      >
                        {meta.actionLabel}
                      </Button>
                    )}

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        title="Đánh dấu đã đọc"
                        aria-label="Đánh dấu đã đọc"
                        className="p-2 text-text-muted hover:text-primary"
                      >
                        <Check className="w-4 h-4 stroke-1.75" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
