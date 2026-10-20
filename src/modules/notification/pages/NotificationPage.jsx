import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Bell,
  CheckCheck,
  Check,
  Inbox,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setActiveTab,
} from '../redux/notificationSlice';
import {
  TAB_DEFINITIONS,
  getNotificationMeta,
} from '../constants/notification.constants';
import { formatRelativeTime } from '../utils/notificationFormatters';
import { Avatar } from '../../../components/ui/Avatar';
import { Pagination } from '../../../components/navigation/Pagination';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items,
    unreadCount,
    pagination,
    isLoading,
    isMarkingRead,
    activeTab,
  } = useSelector((state) => state.notification);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load notifications whenever active tab, unreadOnly, or page changes
  useEffect(() => {
    const currentTabDef = TAB_DEFINITIONS.find((t) => t.id === activeTab);
    const queryParams = {
      page: currentPage,
      limit: 10,
    };

    if (unreadOnly) {
      queryParams.isRead = false;
    }

    if (currentTabDef?.types && currentTabDef.types.length === 1) {
      queryParams.type = currentTabDef.types[0];
    }

    dispatch(fetchNotifications(queryParams));
  }, [dispatch, activeTab, unreadOnly, currentPage]);

  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
    setCurrentPage(1);
  };

  const handleUnreadToggle = () => {
    setUnreadOnly((prev) => !prev);
    setCurrentPage(1);
  };

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation();
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !isMarkingRead) {
      dispatch(markAllNotificationsAsRead());
    }
  };

  const handleActionClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
    const meta = getNotificationMeta(notification.type);
    const targetPath = meta.getActionPath(notification.data);
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Client-side filtering when a tab corresponds to multiple types
  const currentTabDef = TAB_DEFINITIONS.find((t) => t.id === activeTab);
  const displayedItems = items.filter((item) => {
    if (currentTabDef?.types) {
      return currentTabDef.types.includes(item.type);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hairline shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-primary-soft text-primary-dark">
                <Bell className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Lịch sử thông báo
              </h1>
            </div>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Theo dõi và quản lý mọi cập nhật về lời mời kết nối, buổi hẹn Playdate và huy hiệu thành tích của bạn.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingRead}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-muted hover:bg-primary-soft hover:text-primary-dark text-text-primary text-sm font-semibold transition-all duration-200 border border-hairline disabled:opacity-50 self-start md:self-auto shrink-0 shadow-xs"
            >
              <CheckCheck className="w-4 h-4 text-primary" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {TAB_DEFINITIONS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-text-muted hover:text-text-primary hover:bg-surface-muted border border-hairline'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unread Only Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleUnreadToggle}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
              unreadOnly
                ? 'bg-primary-soft text-primary-dark border-primary-border shadow-xs'
                : 'bg-white text-text-muted hover:text-text-primary border-hairline'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                unreadOnly ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
            <span>Chỉ xem chưa đọc</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && displayedItems.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-5 border border-hairline animate-pulse flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-50 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-hairline shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-surface-muted flex items-center justify-center text-text-muted mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Không có thông báo nào</h3>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-sm mx-auto">
              {unreadOnly
                ? 'Bạn đã đọc tất cả các thông báo trong mục này.'
                : 'Hiện tại chưa có thông báo mới nào được ghi nhận.'}
            </p>
            {unreadOnly && (
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary-soft transition-colors"
              >
                <span>Xem tất cả thông báo</span>
              </button>
            )}
          </div>
        ) : (
          displayedItems.map((notification) => {
            const meta = getNotificationMeta(notification.type);
            const Icon = meta.icon;
            const sender = notification.data?.sender;
            const playdate = notification.data?.playdate;

            return (
              <div
                key={notification.id}
                onClick={() => handleActionClick(notification)}
                className={`group relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                  !notification.isRead
                    ? 'border-l-4 border-l-primary border-hairline bg-primary-soft/10 shadow-xs'
                    : 'border-hairline hover:border-gray-200'
                }`}
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
                            className="rounded-2xl ring-2 ring-white shadow-xs"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 p-1 rounded-full border border-white ${meta.bgClass}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${meta.bgClass}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Notification Copy */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                        >
                          {meta.badgeText}
                        </span>

                        {!notification.isRead && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>Mới</span>
                          </span>
                        )}

                        <span className="text-xs text-text-muted">
                          • {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <h4
                        className={`text-sm sm:text-base mt-1.5 ${
                          !notification.isRead
                            ? 'font-bold text-text-primary'
                            : 'font-semibold text-text-primary'
                        }`}
                      >
                        {notification.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                        {notification.body}
                      </p>

                      {/* Extra context snippet for Playdate / Badge if available */}
                      {playdate?.activity && (
                        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-muted border border-hairline text-[11px] text-text-muted">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
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
                    <button
                      type="button"
                      onClick={() => handleActionClick(notification)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-muted group-hover:bg-primary group-hover:text-white text-text-primary transition-all duration-200"
                    >
                      <span>{meta.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-surface-muted transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
