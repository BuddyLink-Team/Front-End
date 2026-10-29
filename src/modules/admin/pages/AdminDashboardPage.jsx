import React, { useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAdminDashboard, DASHBOARD_PRESETS } from '../hooks/useAdminDashboard';
import { useAdminExport } from '../hooks/useAdminExport';
import { useAdminNotificationSocket } from '../hooks/useAdminNotificationSocket';
import { formatCurrency, formatCount } from '../../../utils/formatters';

import { AdminKpiCard } from '../components/dashboard/AdminKpiCard';
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

export const AdminDashboardPage = () => {
  const location = useLocation();
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

  // Handle hash scrolling (e.g. from notification bell)
  useEffect(() => {
    if (location.hash === '#admin-notification-board') {
      const el = document.getElementById('admin-notification-board');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
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
        </div>
      </div>

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

      {/* 9 KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Parents */}
        <AdminKpiCard
          title="Tổng số phụ huynh"
          value={formatCount(overview.totalParents?.value ?? overview.parents?.total ?? 0)}
          subtitle={`${formatCount(overview.newParents?.value ?? overview.parents?.current ?? 0)} trong kỳ`}
          changePercent={overview.totalParents?.changePercent ?? overview.parents?.changePercent}
          icon={Users}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 2. New Parents */}
        <AdminKpiCard
          title="Phụ huynh mới"
          value={formatCount(overview.newParents?.value ?? overview.parents?.current ?? 0)}
          subtitle="Đăng ký tài khoản"
          changePercent={overview.newParents?.changePercent ?? overview.parents?.changePercent}
          icon={UserPlus}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 3. Active Users */}
        <AdminKpiCard
          title="Người dùng hoạt động"
          value={formatCount(overview.activeUsers?.value ?? overview.activeUsers?.current ?? 0)}
          subtitle="Tương tác trong kỳ"
          changePercent={overview.activeUsers?.changePercent}
          icon={Activity}
          variant="secondary"
          isLoading={isLoading}
        />

        {/* 4. Child Profiles */}
        <AdminKpiCard
          title="Tổng hồ sơ trẻ"
          value={formatCount(overview.totalChildProfiles?.value ?? overview.children?.total ?? 0)}
          subtitle={`+${formatCount(children.total ?? overview.totalChildProfiles?.value ?? 0)} hồ sơ`}
          changePercent={overview.totalChildProfiles?.changePercent ?? overview.children?.changePercent}
          icon={Baby}
          variant="accent"
          isLoading={isLoading}
        />

        {/* 5. Playdates */}
        <AdminKpiCard
          title="Buổi Playdate"
          value={formatCount(overview.totalPlaydates?.value ?? overview.playdates?.total ?? 0)}
          subtitle={`${formatCount(overview.totalPlaydates?.value ?? overview.playdates?.current ?? 0)} trong kỳ`}
          changePercent={overview.totalPlaydates?.changePercent ?? overview.playdates?.changePercent}
          icon={Calendar}
          variant="info"
          isLoading={isLoading}
        />

        {/* 6. Accepted Connections */}
        <AdminKpiCard
          title="Kết nối đã ghép đôi"
          value={formatCount(overview.acceptedConnections?.value ?? overview.connections?.accepted ?? 0)}
          subtitle={`Tỷ lệ chấp thuận ${connections.acceptanceRate ?? overview.connections?.acceptanceRate ?? 0}%`}
          changePercent={overview.acceptedConnections?.changePercent ?? overview.connections?.changePercent}
          icon={UserCheck}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 7. Active Subscriptions */}
        <AdminKpiCard
          title="Gói Premium hoạt động"
          value={formatCount(overview.activePremiumSubscriptions?.value ?? overview.subscriptions?.active ?? 0)}
          subtitle={`${formatCount(subscriptions.activePremium ?? overview.activePremiumSubscriptions?.value ?? 0)} tài khoản`}
          changePercent={overview.activePremiumSubscriptions?.changePercent ?? overview.subscriptions?.changePercent}
          icon={Crown}
          variant="warning"
          isLoading={isLoading}
        />

        {/* 8. Total Revenue */}
        <AdminKpiCard
          title="Tổng doanh thu"
          value={formatCurrency(overview.totalRevenue?.value ?? overview.revenue?.current ?? 0)}
          subtitle="VND"
          changePercent={overview.totalRevenue?.changePercent ?? overview.revenue?.changePercent}
          icon={DollarSign}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 9. AI Usage */}
        <AdminKpiCard
          title="Lượt hỏi AI Assistant"
          value={formatCount(overview.aiUsage?.value ?? overview.aiUsage?.currentRequests ?? 0)}
          subtitle={`${formatCount(aiUsage.totalMessagesInPeriod ?? overview.aiUsage?.value ?? 0)} tin nhắn`}
          changePercent={overview.aiUsage?.changePercent}
          icon={Bot}
          variant="secondary"
          isLoading={isLoading}
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

      {/* Realtime Notification Board */}
      <div id="admin-notification-board" className="pt-2">
        <AdminNotificationBoard
          notifications={notificationSocket.notifications}
          unreadCount={notificationSocket.unreadCount}
          isLoading={notificationSocket.isLoading}
          isConnected={notificationSocket.isConnected}
          onRefresh={notificationSocket.loadNotifications}
          onMarkAsRead={notificationSocket.markAsRead}
          onMarkAllAsRead={notificationSocket.markAllAsRead}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
