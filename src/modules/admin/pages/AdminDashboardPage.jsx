import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Activity,
  Baby,
  Calendar,
  UserCheck,
  Crown,
  DollarSign,
  Bot,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart2,
  Bell,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/navigation/Tabs';
import { StatCard } from '../../../components/cards/StatCard';
import { useAdminDashboard, DASHBOARD_PRESETS } from '../hooks/useAdminDashboard';
import { useAdminExport } from '../hooks/useAdminExport';
import { useAdminNotificationSocket } from '../hooks/useAdminNotificationSocket';
import { formatCurrency, formatCount } from '../../../utils/formatters';

import { UserGrowthChart } from '../components/dashboard/UserGrowthChart';
import { RevenueBarChart } from '../components/dashboard/RevenueBarChart';
import { ConversionFunnelChart } from '../components/dashboard/ConversionFunnelChart';
import { ChildAgeGroupsCard } from '../components/dashboard/ChildAgeGroupsCard';
import { PlaydateBreakdownCard } from '../components/dashboard/PlaydateBreakdownCard';
import { ConnectionBreakdownCard } from '../components/dashboard/ConnectionBreakdownCard';
import { SubscriptionBreakdownCard } from '../components/dashboard/SubscriptionBreakdownCard';
import { AiUsageCard } from '../components/dashboard/AiUsageCard';
import { AdminNotificationBoard } from '../components/AdminNotificationBoard';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';

const GROUP_BY_OPTIONS = [
  { label: 'Theo Ngày', value: 'day' },
  { label: 'Theo Tuần', value: 'week' },
  { label: 'Theo Tháng', value: 'month' },
];

const formatChange = (changePercent) => {
  if (changePercent === null || changePercent === undefined) return '';
  if (changePercent > 0) return `+${changePercent}%`;
  return `${changePercent}%`;
};

export const AdminDashboardPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.hash === '#admin-notification-board' || location.hash === '#notifications') {
      return 'notifications';
    }
    return 'stats';
  });

  const {
    analytics,
    isLoading,
    errorMessage,
    dateRange,
    setDateRange,
    preset,
    setPreset,
    groupBy,
    setGroupBy,
    reload,
  } = useAdminDashboard('30d');

  const { isExporting, exportReport } = useAdminExport('dashboard', () => ({
    analytics,
  }));

  const notificationSocket = useAdminNotificationSocket({ autoFetch: true });

  // Handle hash scrolling / tab switching (e.g. from notification bell)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin-notification-board' || window.location.hash === '#notifications') {
        setActiveTab('notifications');
        const el = document.getElementById('admin-notification-board');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [location.hash]);

  const overview = analytics?.overview || analytics?.summary || {};
  const userGrowth = analytics?.userGrowth || {};
  const revenue = analytics?.revenue || {};
  const conversion = analytics?.conversion || {};
  const playdates = analytics?.playdates || {};
  const connections = analytics?.connections || {};
  const subscriptions = analytics?.subscriptions || {};
  const aiUsage = analytics?.aiUsage || {};
  const children = analytics?.children || {};

  const dashboardTabs = [
    { id: 'stats', label: 'Thống kê', icon: BarChart2 },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: Bell,
      count: notificationSocket.unreadCount?.total || undefined,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Bảng điều khiển hệ thống
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Theo dõi toàn diện các chỉ số KPI, tăng trưởng người dùng, doanh thu, playdate, kết nối và cảnh báo thời gian thực
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'stats' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={reload}
                disabled={isLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={exportReport}
                disabled={isExporting || isLoading || !analytics}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={notificationSocket.loadNotifications}
              disabled={notificationSocket.isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${notificationSocket.isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới thông báo</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2 Dashboard Tabs */}
      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <Tabs
          tabs={dashboardTabs}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
        />
      </div>

      {/* Tab 1: Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Filter Toolbar: Presets, Custom Date Range, and GroupBy */}
          <div className="bg-white rounded-2xl border border-hairline p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            {/* Preset Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {DASHBOARD_PRESETS.map((p) => {
                const isActive = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-muted text-text-muted hover:bg-surface-variant hover:text-text-primary'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Range & GroupBy */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted font-medium">Từ:</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface-muted border border-hairline rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-text-muted font-medium">Đến:</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-2.5 py-1.5 bg-surface-muted border border-hairline rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center pl-2 border-l border-hairline">
                <AdminFilterDropdown
                  header="CHU KỲ THỐNG KÊ"
                  labelPrefix="Chu kỳ:"
                  options={GROUP_BY_OPTIONS}
                  value={groupBy}
                  onChange={(val) => setGroupBy(val || 'day')}
                  align="right"
                />
              </div>
            </div>
          </div>

          {/* Error Alert if any */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-error-container/30 border border-error/30 flex items-center gap-3 text-sm text-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 9 KPI Stat Cards Grid (using shared StatCard) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Total Parents */}
            <StatCard
              title="Tổng số phụ huynh"
              value={isLoading && !analytics ? '…' : formatCount(overview.totalParents?.value ?? overview.parents?.total ?? 0)}
              change={formatChange(overview.totalParents?.changePercent ?? overview.parents?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Users className="w-5 h-5 stroke-1.75" />}
              variant="secondary"
            />

            {/* 2. New Parents */}
            <StatCard
              title="Phụ huynh mới"
              value={isLoading && !analytics ? '…' : formatCount(overview.newParents?.value ?? overview.parents?.current ?? 0)}
              change={formatChange(overview.newParents?.changePercent ?? overview.parents?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<UserPlus className="w-5 h-5 stroke-1.75" />}
              variant="primary"
            />

            {/* 3. Active Users */}
            <StatCard
              title="Người dùng hoạt động"
              value={isLoading && !analytics ? '…' : formatCount(overview.activeUsers?.value ?? overview.activeUsers?.current ?? 0)}
              change={formatChange(overview.activeUsers?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Activity className="w-5 h-5 stroke-1.75" />}
              variant="secondary"
            />

            {/* 4. Child Profiles */}
            <StatCard
              title="Tổng hồ sơ trẻ"
              value={isLoading && !analytics ? '…' : formatCount(overview.totalChildProfiles?.value ?? overview.children?.total ?? 0)}
              change={formatChange(overview.totalChildProfiles?.changePercent ?? overview.children?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Baby className="w-5 h-5 stroke-1.75" />}
              variant="tertiary"
            />

            {/* 5. Playdates */}
            <StatCard
              title="Buổi Playdate"
              value={isLoading && !analytics ? '…' : formatCount(overview.totalPlaydates?.value ?? overview.playdates?.total ?? 0)}
              change={formatChange(overview.totalPlaydates?.changePercent ?? overview.playdates?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Calendar className="w-5 h-5 stroke-1.75" />}
              variant="primary"
            />

            {/* 6. Accepted Connections */}
            <StatCard
              title="Kết nối đã ghép đôi"
              value={isLoading && !analytics ? '…' : formatCount(overview.acceptedConnections?.value ?? overview.connections?.accepted ?? 0)}
              change={formatChange(overview.acceptedConnections?.changePercent ?? overview.connections?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<UserCheck className="w-5 h-5 stroke-1.75" />}
              variant="primary"
            />

            {/* 7. Active Subscriptions */}
            <StatCard
              title="Gói Premium hoạt động"
              value={isLoading && !analytics ? '…' : formatCount(overview.activePremiumSubscriptions?.value ?? overview.subscriptions?.active ?? 0)}
              change={formatChange(overview.activePremiumSubscriptions?.changePercent ?? overview.subscriptions?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Crown className="w-5 h-5 stroke-1.75" />}
              variant="tertiary"
            />

            {/* 8. Total Revenue */}
            <StatCard
              title="Tổng doanh thu"
              value={isLoading && !analytics ? '…' : formatCurrency(overview.totalRevenue?.value ?? overview.revenue?.current ?? 0)}
              change={formatChange(overview.totalRevenue?.changePercent ?? overview.revenue?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<DollarSign className="w-5 h-5 stroke-1.75" />}
              variant="primary"
            />

            {/* 9. AI Usage */}
            <StatCard
              title="Lượt hỏi AI Assistant"
              value={isLoading && !analytics ? '…' : formatCount(overview.aiUsage?.value ?? overview.aiUsage?.currentRequests ?? 0)}
              change={formatChange(overview.aiUsage?.changePercent)}
              changeSuffix="so với kỳ trước"
              icon={<Bot className="w-5 h-5 stroke-1.75" />}
              variant="secondary"
            />
          </div>

          {/* Row 1: User Growth & Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserGrowthChart data={userGrowth.timeline || analytics?.charts?.userGrowth} isLoading={isLoading} />
            <RevenueBarChart data={revenue.timeline || analytics?.charts?.revenue} isLoading={isLoading} />
          </div>

          {/* Row 2: Conversion Funnel & Child Age Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionFunnelChart data={conversion.funnel || analytics?.charts?.conversionFunnel} isLoading={isLoading} />
            <ChildAgeGroupsCard data={children.byAgeGroup || analytics?.charts?.childAgeGroups} isLoading={isLoading} />
          </div>

          {/* Row 3: Playdates & Connections Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlaydateBreakdownCard playdates={playdates} isLoading={isLoading} />
            <ConnectionBreakdownCard
              connections={connections}
              acceptanceRate={connections.acceptanceRate ?? overview.connections?.acceptanceRate ?? 0}
              isLoading={isLoading}
            />
          </div>

          {/* Row 4: Subscriptions & AI Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubscriptionBreakdownCard subscriptions={subscriptions} isLoading={isLoading} />
            <AiUsageCard aiUsage={aiUsage} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* Tab 2: Notifications (Full height of remaining screen) */}
      {activeTab === 'notifications' && (
        <div id="admin-notification-board" className="min-h-[calc(100vh-14rem)] flex flex-col">
          <AdminNotificationBoard
            className="flex-1"
            notifications={notificationSocket.notifications}
            unreadCount={notificationSocket.unreadCount}
            isLoading={notificationSocket.isLoading}
            isConnected={notificationSocket.isConnected}
            onRefresh={notificationSocket.loadNotifications}
            onMarkAsRead={notificationSocket.markAsRead}
            onMarkAllAsRead={notificationSocket.markAllAsRead}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
