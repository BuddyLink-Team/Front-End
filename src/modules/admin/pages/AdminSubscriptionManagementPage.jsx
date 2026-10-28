import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { RevenueOverview } from '../components/subscription/RevenueOverview';
import { PlanEditCard } from '../components/subscription/PlanEditCard';
import { SubscribersTable } from '../components/subscription/SubscribersTable';
import { TransactionsTable } from '../components/subscription/TransactionsTable';
import { useAdminPlans } from '../hooks/useAdminPlans';
import { useAdminRevenueSummary } from '../hooks/useAdminRevenueSummary';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { Tabs } from '../../../components/navigation/Tabs';
import { Button } from '../../../components/ui/Button';
import { SUBSCRIPTION_TABS } from '../constants/admin.constants';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

export const AdminSubscriptionManagementPage = () => {
  const [activeTab, setActiveTab] = useState(SUBSCRIPTION_TABS[0].id);
  const revenue = useAdminRevenueSummary();
  const { plans, isLoading: isPlansLoading, errorMessage: plansError, isUpdating, updatePlan } = useAdminPlans();
  const activePlansCount = plans.filter((plan) => plan.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">Gói cước &amp; doanh thu</h1>
          <p className="text-body-md text-text-muted mt-1">
            Doanh thu, cấu hình gói cước, thuê bao của phụ huynh và đối soát giao dịch thanh toán.
          </p>
        </div>
        <Button
          type="button"
          onClick={revenue.exportReport}
          disabled={!revenue.summary}
          isLoading={revenue.isExporting}
          leftIcon={<Download size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} />}
          className="shrink-0"
        >
          Xuất báo cáo doanh thu
        </Button>
      </div>

      <Tabs tabs={SUBSCRIPTION_TABS} activeTab={activeTab} onChange={setActiveTab} variant="line" />

      {activeTab === 'overview' && (
        <RevenueOverview
          summary={revenue.summary}
          isLoading={revenue.isLoading}
          errorMessage={revenue.errorMessage}
          dateRange={revenue.dateRange}
          onDateRangeChange={revenue.setDateRange}
        />
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs">
            <div>
              <h2 className="text-base font-semibold text-on-surface">Cấu hình Danh mục Gói Hội viên</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Tùy biến mức giá, trạng thái mở bán và hạn mức tính năng cho từng gói. Đổi giá chỉ áp dụng cho lượt mua mới.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold shrink-0">
              <CheckCircle2 size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
              {activePlansCount} gói đang sẵn sàng
            </span>
          </div>

          {plansError && <p className="text-body-md text-error">{plansError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {isPlansLoading
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="p-6 rounded-2xl bg-surface-container-lowest border border-hairline space-y-4 shadow-xs">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              : plans.map((plan) => (
                  <PlanEditCard key={plan.id} plan={plan} onUpdate={updatePlan} isUpdating={isUpdating} />
                ))}
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && <SubscribersTable />}

      {activeTab === 'transactions' && <TransactionsTable />}
    </div>
  );
};

export default AdminSubscriptionManagementPage;
