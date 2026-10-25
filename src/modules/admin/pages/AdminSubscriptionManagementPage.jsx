import React, { useState } from 'react';
import { Tabs } from '../../../components/navigation/Tabs';
import { DateRangeFilter } from '../../../components/search/DateRangeFilter';
import { RevenueKpiCards } from '../components/subscription/RevenueKpiCards';
import { MonthlyRevenueChart } from '../components/subscription/MonthlyRevenueChart';
import { PlanEditCard } from '../components/subscription/PlanEditCard';
import { SubscribersTable } from '../components/subscription/SubscribersTable';
import { TransactionsTable } from '../components/subscription/TransactionsTable';
import { useAdminPlans } from '../hooks/useAdminPlans';
import { useAdminRevenueSummary } from '../hooks/useAdminRevenueSummary';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { LayoutDashboard, Layers, Users, Receipt } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'plans', label: 'Gói dịch vụ', icon: Layers },
  { id: 'subscribers', label: 'Thuê bao', icon: Users },
  { id: 'transactions', label: 'Giao dịch', icon: Receipt },
];

export const AdminSubscriptionManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    summary,
    isLoading: isSummaryLoading,
    dateRange,
    setDateRange,
  } = useAdminRevenueSummary();

  const {
    plans,
    isLoading: isPlansLoading,
    isUpdating: isPlanUpdating,
    updatePlan,
  } = useAdminPlans();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quản lý Gói dịch vụ & Doanh thu
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Cấu hình giá và hạn mức các gói hội viên, theo dõi danh sách thuê bao phụ huynh và giám sát toàn bộ giao dịch thanh toán.
          </p>
        </div>

        {activeTab === 'overview' && (
          <div className="shrink-0">
            <DateRangeFilter
              from={dateRange.from}
              to={dateRange.to}
              onChange={setDateRange}
            />
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="line"
      />

      {/* Tab 1: Tổng quan */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <RevenueKpiCards overview={summary?.overview} isLoading={isSummaryLoading} />
          <MonthlyRevenueChart data={summary?.monthlyRevenue} isLoading={isSummaryLoading} />
        </div>
      )}

      {/* Tab 2: Gói dịch vụ */}
      {activeTab === 'plans' && (
        <div>
          {isPlansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface border border-hairline space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => (
                <PlanEditCard
                  key={plan.id}
                  plan={plan}
                  onUpdate={updatePlan}
                  isUpdating={isPlanUpdating}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Thuê bao */}
      {activeTab === 'subscribers' && <SubscribersTable />}

      {/* Tab 4: Giao dịch */}
      {activeTab === 'transactions' && <TransactionsTable />}
    </div>
  );
};

export default AdminSubscriptionManagementPage;
