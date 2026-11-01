import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AlertCircle, BarChart2, Bell, Download, RefreshCw } from 'lucide-react';
import { StatCard } from '../../../components/cards/StatCard';
import { Tabs } from '../../../components/navigation/Tabs';
import { DateRangeFilter } from '../../../components/search/DateRangeFilter';
import { Button } from '../../../components/ui/Button';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';
import { formatCount } from '../../../utils/formatters';
import { REVENUE_DATE_PRESETS } from '../constants/admin.constants';
import {
  ADMIN_NOTIFICATION_BOARD_HASH,
  ANALYTICS_GROUP_BY_OPTIONS,
  DASHBOARD_KPI_CARDS,
  DASHBOARD_TABS,
} from '../constants/dashboard.constants';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminNotificationBoard } from '../components/AdminNotificationBoard';
import { AiUsageCard } from '../components/dashboard/AiUsageCard';
import { ChildAgeGroupsCard } from '../components/dashboard/ChildAgeGroupsCard';
import { ConnectionBreakdownCard } from '../components/dashboard/ConnectionBreakdownCard';
import { ConversionFunnelChart } from '../components/dashboard/ConversionFunnelChart';
import { PlaydateBreakdownCard } from '../components/dashboard/PlaydateBreakdownCard';
import { RevenueBarChart } from '../components/dashboard/RevenueBarChart';
import { SubscriptionBreakdownCard } from '../components/dashboard/SubscriptionBreakdownCard';
import { UserGrowthChart } from '../components/dashboard/UserGrowthChart';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAdminExport } from '../hooks/useAdminExport';
import { buildDashboardReportSheets } from '../utils/excelExport';

// '—' when there is nothing to compare with (the previous period is 0)
const formatChange = (changePercent) => {
  if (changePercent === null || changePercent === undefined) return '—';
  return `${changePercent > 0 ? '+' : ''}${changePercent}%`;
};

export const AdminDashboardPage = () => {
  const location = useLocation();
  const unreadTotal = useSelector((state) => state.admin.notifications.unreadCount.total);
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS.STATS);
  const { analytics, isLoading, errorMessage, dateRange, setDateRange, groupBy, setGroupBy, reload } =
    useAdminDashboard();

  const { isExporting, handleExport } = useAdminExport({
    page: 'dashboard',
    buildSheets: buildDashboardReportSheets,
    fetchData: async () => ({ analytics }),
    successMessage: 'Đã xuất dữ liệu bảng điều khiển ra file Excel.',
  });

  // The bell links here: location.key also changes when the hash is already there
  useEffect(() => {
    if (location.hash === ADMIN_NOTIFICATION_BOARD_HASH) setActiveTab(DASHBOARD_TABS.NOTIFICATIONS);
  }, [location.hash, location.key]);

  const dashboardTabs = [
    { id: DASHBOARD_TABS.STATS, label: 'Thống kê', icon: BarChart2 },
    { id: DASHBOARD_TABS.NOTIFICATIONS, label: 'Thông báo', icon: Bell, count: unreadTotal || undefined },
  ];
  const isFirstLoad = isLoading && !analytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">Bảng điều khiển hệ thống</h1>
          <p className="text-body-md text-text-muted mt-1">
            Chỉ số so với kỳ trước, thống kê chi tiết và sự kiện hệ thống theo thời gian thực.
          </p>
        </div>
        {activeTab === DASHBOARD_TABS.STATS && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={isLoading}
              leftIcon={<RefreshCw size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />}
            >
              Làm mới
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleExport}
              disabled={isLoading || !analytics}
              isLoading={isExporting}
              leftIcon={<Download size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />}
            >
              Xuất Excel
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-hairline pb-2">
        <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === DASHBOARD_TABS.NOTIFICATIONS && <AdminNotificationBoard />}

      {activeTab === DASHBOARD_TABS.STATS && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-hairline p-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 shadow-xs">
            <DateRangeFilter
              from={dateRange.from}
              to={dateRange.to}
              onChange={setDateRange}
              presets={REVENUE_DATE_PRESETS}
            />
            <AdminFilterDropdown
              header="CHU KỲ THỐNG KÊ"
              labelPrefix="Chu kỳ:"
              options={ANALYTICS_GROUP_BY_OPTIONS}
              value={groupBy}
              onChange={setGroupBy}
              align="right"
              className="shrink-0"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-error-container border border-error flex items-center gap-3 text-sm text-error-on-container"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DASHBOARD_KPI_CARDS.map(({ key, label, icon: Icon, variant, format = formatCount }) => {
              const kpi = analytics?.overview?.[key];
              return (
                <StatCard
                  key={key}
                  icon={<Icon size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.DEFAULT} />}
                  title={label}
                  value={kpi ? format(kpi.value) : undefined}
                  change={formatChange(kpi?.changePercent)}
                  changeSuffix={kpi?.changePercent === null ? 'chưa có kỳ trước để so sánh' : 'so với kỳ trước'}
                  variant={variant}
                  isLoading={isFirstLoad}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Each row pairs blocks of the same height, so none is stretched with an empty bottom */}
            <div className="lg:col-span-2">
              <UserGrowthChart data={analytics?.userGrowth?.timeline} isLoading={isLoading} />
            </div>
            <RevenueBarChart data={analytics?.revenue?.timeline} isLoading={isLoading} />
            <ChildAgeGroupsCard data={analytics?.children?.byAgeGroup} isLoading={isLoading} />
            <ConversionFunnelChart data={analytics?.conversion?.funnel} isLoading={isLoading} />
            <ConnectionBreakdownCard connections={analytics?.connections} isLoading={isLoading} />
            <PlaydateBreakdownCard playdates={analytics?.playdates} isLoading={isLoading} />
            <SubscriptionBreakdownCard subscriptions={analytics?.subscriptions} isLoading={isLoading} />
            <div className="lg:col-span-2">
              <AiUsageCard aiUsage={analytics?.aiUsage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
