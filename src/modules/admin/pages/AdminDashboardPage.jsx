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

  const summary = analytics?.summary || {};
  const charts = analytics?.charts || {};

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

          <div className="flex items-center gap-1.5 pl-2 border-l border-hairline">
            <span className="text-text-muted font-medium">Chu kỳ:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-2.5 py-1.5 bg-surface-muted border border-hairline rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="day">Theo Ngày</option>
              <option value="week">Theo Tuần</option>
              <option value="month">Theo Tháng</option>
            </select>
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
          value={formatCount(summary.parents?.total ?? 0)}
          subtitle={`${formatCount(summary.parents?.current ?? 0)} trong kỳ`}
          changePercent={summary.parents?.changePercent}
          icon={Users}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 2. New Parents */}
        <AdminKpiCard
          title="Phụ huynh mới"
          value={formatCount(summary.parents?.current ?? 0)}
          subtitle="Đăng ký tài khoản"
          changePercent={summary.parents?.changePercent}
          icon={UserPlus}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 3. Active Users */}
        <AdminKpiCard
          title="Người dùng hoạt động"
          value={formatCount(summary.activeUsers?.current ?? 0)}
          subtitle="Tương tác trong kỳ"
          changePercent={summary.activeUsers?.changePercent}
          icon={Activity}
          variant="secondary"
          isLoading={isLoading}
        />

        {/* 4. Child Profiles */}
        <AdminKpiCard
          title="Tổng hồ sơ trẻ"
          value={formatCount(summary.children?.total ?? 0)}
          subtitle={`+${formatCount(summary.children?.current ?? 0)} mới`}
          changePercent={summary.children?.changePercent}
          icon={Baby}
          variant="accent"
          isLoading={isLoading}
        />

        {/* 5. Playdates */}
        <AdminKpiCard
          title="Buổi Playdate"
          value={formatCount(summary.playdates?.total ?? 0)}
          subtitle={`${formatCount(summary.playdates?.current ?? 0)} trong kỳ`}
          changePercent={summary.playdates?.changePercent}
          icon={Calendar}
          variant="info"
          isLoading={isLoading}
        />

        {/* 6. Accepted Connections */}
        <AdminKpiCard
          title="Kết nối đã ghép đôi"
          value={formatCount(summary.connections?.accepted ?? 0)}
          subtitle={`Tỷ lệ chấp thuận ${summary.connections?.acceptanceRate ?? 0}%`}
          changePercent={summary.connections?.changePercent}
          icon={UserCheck}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 7. Active Subscriptions */}
        <AdminKpiCard
          title="Gói Premium hoạt động"
          value={formatCount(summary.subscriptions?.active ?? 0)}
          subtitle={`${formatCount(summary.subscriptions?.current ?? 0)} mới trong kỳ`}
          changePercent={summary.subscriptions?.changePercent}
          icon={Crown}
          variant="warning"
          isLoading={isLoading}
        />

        {/* 8. Total Revenue */}
        <AdminKpiCard
          title="Tổng doanh thu"
          value={formatCurrency(summary.revenue?.current ?? 0)}
          subtitle={summary.revenue?.currency || 'VND'}
          changePercent={summary.revenue?.changePercent}
          icon={DollarSign}
          variant="primary"
          isLoading={isLoading}
        />

        {/* 9. AI Usage */}
        <AdminKpiCard
          title="Lượt hỏi AI Assistant"
          value={formatCount(summary.aiUsage?.currentRequests ?? 0)}
          subtitle={`${formatCount(summary.aiUsage?.totalTokens ?? 0)} tokens`}
          changePercent={summary.aiUsage?.changePercent}
          icon={Bot}
          variant="secondary"
          isLoading={isLoading}
        />
      </div>

      {/* Row 1: User Growth & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={charts.userGrowth} isLoading={isLoading} />
        <RevenueBarChart data={charts.revenue} isLoading={isLoading} />
      </div>

      {/* Row 2: Conversion Funnel & Child Age Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnelChart data={charts.conversionFunnel} isLoading={isLoading} />
        <ChildAgeGroupsCard data={charts.childAgeGroups} isLoading={isLoading} />
      </div>

      {/* Row 3: Playdates & Connections Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaydateBreakdownCard playdates={charts.playdates} isLoading={isLoading} />
        <ConnectionBreakdownCard
          connections={charts.connections}
          acceptanceRate={summary.connections?.acceptanceRate ?? 0}
          isLoading={isLoading}
        />
      </div>

      {/* Row 4: Subscriptions & AI Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionBreakdownCard subscriptions={charts.subscriptions} isLoading={isLoading} />
        <AiUsageCard aiUsage={charts.aiUsage} isLoading={isLoading} />
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
