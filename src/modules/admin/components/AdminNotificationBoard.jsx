import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, CheckCheck, Filter, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { Tabs } from '../../../components/navigation/Tabs';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/cn';
import { formatDateTime } from '../../../utils/formatters';
import {
  ADMIN_NOTIFICATION_FILTER_ALL,
  NOTIFICATION_CATEGORY_TABS,
  NOTIFICATION_ENTITY_TARGETS,
  NOTIFICATION_SEVERITY_DISPLAY,
  NOTIFICATION_SEVERITY_OPTIONS,
} from '../constants/dashboard.constants';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { AdminFilterDropdown } from './AdminFilterDropdown';

const SKELETON_ROWS = [0, 1, 2, 3];

const NotificationRow = ({ item, onOpen, onMarkAsRead }) => {
  const severity = NOTIFICATION_SEVERITY_DISPLAY[item.severity] || NOTIFICATION_SEVERITY_DISPLAY.info;
  const SeverityIcon = severity.icon;
  const hasTarget = Boolean(NOTIFICATION_ENTITY_TARGETS[item.entityType]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') onOpen(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
      className={cn(
        'group p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        item.isRead
          ? 'bg-surface-container-lowest border-hairline hover:bg-surface-muted'
          : 'bg-primary-soft border-primary-border hover:bg-primary-tint'
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={cn('p-2 rounded-lg shrink-0 mt-0.5', severity.iconClass)}>
          <SeverityIcon className="w-4 h-4 stroke-1.75" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-body-md font-semibold text-text-primary truncate">{item.title}</p>
            {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary-dark shrink-0" aria-label="Chưa đọc" />}
          </div>
          <p className="text-label-md text-text-muted line-clamp-2">{item.message}</p>
          <p className="text-label-sm text-text-muted">{formatDateTime(item.createdAt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-center">
        {!item.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Đánh dấu đã đọc"
            title="Đánh dấu đã đọc"
            className="p-1.5"
            onClick={(event) => {
              event.stopPropagation();
              onMarkAsRead(item.id);
            }}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        {hasTarget && <ArrowRight className="w-4 h-4 text-text-muted" aria-hidden="true" />}
      </div>
    </div>
  );
};

/**
 * Realtime board of the system events: one tab per category with its unread count, a severity filter
 * and an infinite list, filtered by the API. New events arrive through the store (useAdminNotificationSocket).
 */
export const AdminNotificationBoard = ({ className }) => {
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    isLoading,
    isLoadingMore,
    isSocketConnected,
    hasMore,
    applyFilters,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useAdminNotifications();
  const [category, setCategory] = useState(ADMIN_NOTIFICATION_FILTER_ALL);
  const [severity, setSeverity] = useState(ADMIN_NOTIFICATION_FILTER_ALL);
  const sentinelRef = useRef(null);

  useEffect(() => {
    applyFilters({ category, severity });
  }, [applyFilters, category, severity]);

  // Next page as soon as the end of the list comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const handleOpen = (item) => {
    if (!item.isRead) markAsRead(item.id);
    const target = NOTIFICATION_ENTITY_TARGETS[item.entityType];
    if (!target) return;
    const state = target.stateKey && item.entityId ? { [target.stateKey]: item.entityId } : undefined;
    navigate(target.route, { state });
  };

  const categoryTabs = NOTIFICATION_CATEGORY_TABS.map((tab) => {
    const count = tab.id === ADMIN_NOTIFICATION_FILTER_ALL ? unreadCount.total : unreadCount.byCategory[tab.id];
    return { ...tab, count: count || undefined };
  });
  const isFiltered = category !== ADMIN_NOTIFICATION_FILTER_ALL || severity !== ADMIN_NOTIFICATION_FILTER_ALL;
  const canMarkAll =
    category === ADMIN_NOTIFICATION_FILTER_ALL ? unreadCount.total > 0 : unreadCount.byCategory[category] > 0;

  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-title-md text-text-primary">Sự kiện hệ thống</h2>
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full inline-block',
                isSocketConnected ? 'bg-primary animate-pulse' : 'bg-text-muted'
              )}
              title={isSocketConnected ? 'Đang nhận thông báo realtime' : 'Mất kết nối realtime'}
            />
          </div>
          <p className="text-body-md text-text-muted mt-1">
            Thông báo mới hiện ngay ở đầu danh sách, không cần tải lại trang.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={refresh}
            aria-label="Tải lại thông báo"
            title="Tải lại thông báo"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
          {canMarkAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead(category)}
              leftIcon={<CheckCheck className="w-4 h-4" />}
            >
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="overflow-x-auto min-w-0">
          <Tabs tabs={categoryTabs} activeTab={category} onChange={setCategory} className="w-max" />
        </div>
        <AdminFilterDropdown
          icon={Filter}
          header="MỨC ĐỘ THÔNG BÁO"
          options={NOTIFICATION_SEVERITY_OPTIONS}
          value={severity}
          onChange={setSeverity}
          align="right"
        />
      </div>

      <div className="space-y-2.5">
        {isLoading && items.length === 0 &&
          SKELETON_ROWS.map((row) => (
            <div key={row} className="p-3.5 rounded-xl border border-hairline space-y-2">
              <Skeleton data-testid="notification-skeleton" className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}

        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title="Không có thông báo nào"
            description={
              isFiltered ? 'Không có thông báo phù hợp với bộ lọc đã chọn.' : 'Chưa có sự kiện nào trên hệ thống.'
            }
          />
        )}

        {items.map((item) => (
          <NotificationRow key={item.id} item={item} onOpen={handleOpen} onMarkAsRead={markAsRead} />
        ))}

        {hasMore && <div ref={sentinelRef} data-testid="notification-sentinel" className="h-1" />}

        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary-dark" aria-label="Đang tải thêm" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdminNotificationBoard;
