import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Check,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { AdminFilterDropdown } from './AdminFilterDropdown';

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'safety', label: 'An toàn & Báo cáo' },
  { id: 'payments', label: 'Thanh toán' },
  { id: 'users', label: 'Người dùng' },
  { id: 'playdates', label: 'Playdates' },
  { id: 'connections', label: 'Kết nối' },
  { id: 'system', label: 'Hệ thống' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Mọi mức độ' },
  { value: 'critical', label: 'Khẩn cấp' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'info', label: 'Thông tin' },
];

const SEVERITY_CONFIG = {
  critical: {
    badgeClass: 'bg-error-container text-error border-error/20',
    icon: ShieldAlert,
    label: 'Khẩn cấp',
  },
  warning: {
    badgeClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary/20',
    icon: AlertTriangle,
    label: 'Cảnh báo',
  },
  info: {
    badgeClass: 'bg-primary-soft text-primary-dark border-primary/20',
    icon: Info,
    label: 'Thông tin',
  },
};

/**
 * AdminNotificationBoard - Interactive realtime board for admin system events
 */
export const AdminNotificationBoard = ({
  notifications = [],
  unreadCount = { total: 0, byCategory: {} },
  isLoading = false,
  isConnected = true,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filteredNotifications = notifications.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSev = selectedSeverity === 'all' || item.severity === selectedSeverity;
    return matchesCat && matchesSev;
  });

  const handleNavigateEntity = (item) => {
    if (!item.isRead && onMarkAsRead) {
      onMarkAsRead(item._id);
    }

    switch (String(item.entityType || '').toLowerCase()) {
      case 'user':
        navigate(ADMIN_ROUTES.USERS);
        break;
      case 'child':
        navigate(ADMIN_ROUTES.CHILDREN);
        break;
      case 'playdate':
        navigate(ADMIN_ROUTES.PLAYDATES);
        break;
      case 'connection':
        navigate(ADMIN_ROUTES.CONNECTIONS);
        break;
      case 'payment':
      case 'subscription':
        navigate(ADMIN_ROUTES.SUBSCRIPTIONS);
        break;
      case 'report':
        navigate('/admin/reports');
        break;
      default:
        break;
    }
  };

  return (
    <Card className={cn('p-5 space-y-4 rounded-2xl border border-hairline shadow-xs', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-soft text-primary-dark shrink-0">
            <Bell className="w-5 h-5 stroke-1.75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-title-md font-semibold text-text-primary">Sự kiện &amp; Thông báo Realtime</h2>
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full inline-block',
                  isConnected ? 'bg-primary animate-pulse' : 'bg-text-muted'
                )}
                title={isConnected ? 'Kết nối realtime ổn định' : 'Mất kết nối realtime'}
              />
            </div>
            <p className="text-label-md text-text-muted">
              Cập nhật tức thì các biến động về người dùng, thanh toán, bảo mật và sự cố hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
              title="Tải lại thông báo"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          )}
          {unreadCount.total > 0 && onMarkAllAsRead && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMarkAllAsRead(selectedCategory)}
              leftIcon={<CheckCheck className="w-4 h-4" />}
              className="text-label-sm"
            >
              Đã đọc tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Filters: Category Tabs + Severity Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.id === 'all' ? unreadCount.total : unreadCount.byCategory?.[tab.id] || 0;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-label-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0',
                  isSelected
                    ? 'bg-text-primary text-white shadow-xs'
                    : 'bg-surface-muted text-text-muted hover:text-text-primary hover:bg-surface-container-high'
                )}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-label-xs font-bold',
                      isSelected ? 'bg-white text-text-primary' : 'bg-primary-soft text-primary-dark'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Severity filter */}
        <div className="shrink-0">
          <AdminFilterDropdown
            icon={Filter}
            header="MỨC ĐỘ THÔNG BÁO"
            options={SEVERITY_OPTIONS}
            value={selectedSeverity}
            onChange={(val) => setSelectedSeverity(val || 'all')}
            align="right"
          />
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 max-h-notification-list overflow-y-auto pr-1">
        {isLoading && notifications.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-surface-muted space-y-2 border border-hairline">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bell className="w-8 h-8 text-text-muted/40 mx-auto" />
            <p className="text-body-md font-medium text-text-primary">Không có thông báo nào</p>
            <p className="text-label-md text-text-muted">
              {selectedCategory !== 'all' || selectedSeverity !== 'all'
                ? 'Không có thông báo phù hợp với bộ lọc đã chọn.'
                : 'Mọi hoạt động trên hệ thống đang diễn ra bình thường.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const sevConfig = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info;
            const SevIcon = sevConfig.icon;

            return (
              <div
                key={item._id}
                onClick={() => handleNavigateEntity(item)}
                className={cn(
                  'group p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 justify-between',
                  item.isRead
                    ? 'bg-surface-container-lowest border-hairline hover:bg-surface-muted/60'
                    : 'bg-primary-soft/20 border-primary-soft hover:bg-primary-soft/30'
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'p-2 rounded-lg border shrink-0 mt-0.5',
                      sevConfig.badgeClass
                    )}
                  >
                    <SevIcon className="w-4 h-4 stroke-1.75" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          'text-body-md font-semibold truncate',
                          item.isRead ? 'text-text-primary' : 'text-primary-dark'
                        )}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-label-md text-text-muted line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 pt-0.5 text-label-sm text-text-muted">
                      <span>{formatDateTime(item.createdAt)}</span>
                      {item.entityType && (
                        <span className="capitalize font-medium text-text-primary">
                          #{item.entityType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  {!item.isRead && onMarkAsRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(item._id);
                      }}
                      className="p-1.5 rounded-md text-text-muted hover:text-primary-dark hover:bg-primary-soft transition-colors"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {item.entityType && (
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default AdminNotificationBoard;
