import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Download, CheckCircle2 } from 'lucide-react';
import { RevenueKpiCards } from '../components/subscription/RevenueKpiCards';
import { MonthlyRevenueChart } from '../components/subscription/MonthlyRevenueChart';
import { PlanEditCard } from '../components/subscription/PlanEditCard';
import { SubscribersTable } from '../components/subscription/SubscribersTable';
import { TransactionsTable } from '../components/subscription/TransactionsTable';
import { useAdminPlans } from '../hooks/useAdminPlans';
import { useAdminRevenueSummary } from '../hooks/useAdminRevenueSummary';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { Tabs } from '../../../components/navigation/Tabs';
import { DateRangeFilter } from '../../../components/search/DateRangeFilter';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../hooks/useToast';
import { REVENUE_DATE_PRESETS, SUBSCRIPTION_TABS } from '../constants/admin.constants';
import { ICON_SIZE } from '../../../constants/icon.constants';
import { formatDate } from '../../../utils/formatters';

export const AdminSubscriptionManagementPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(SUBSCRIPTION_TABS[0].id);

  // No range = the API default (last 6 months)
  const { summary, isLoading: isSummaryLoading, errorMessage: summaryError, dateRange, setDateRange } =
    useAdminRevenueSummary();

  const {
    plans,
    isLoading: isPlansLoading,
    errorMessage: plansError,
    isUpdating: isPlanUpdating,
    updatePlan,
  } = useAdminPlans();
  const activePlansCount = plans.filter((plan) => plan.isActive).length;

  const handleExportFinancialReport = () => {
    // Generate CSV for monthly revenue and KPI summary
    const overview = summary?.overview || {};
    const monthly = summary?.monthlyRevenue || [];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'BÁO CÁO TÀI CHÍNH & HỘI VIÊN BUDDYLINK\n';
    csvContent += `Thời gian xuất: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}\n`;
    csvContent += `Khoảng thời gian: ${formatDate(summary?.filter?.fromDate)} đến ${formatDate(summary?.filter?.toDate)}\n\n`;

    csvContent += 'CHỈ SỐ TỔNG HỢP (KPI)\n';
    csvContent += `Tổng doanh thu (VNĐ),${overview.totalRevenue || 0}\n`;
    csvContent += `Số giao dịch thành công,${overview.successfulTransactions || 0}\n`;
    csvContent += `Số phụ huynh thanh toán,${overview.payingParentsCount || 0}\n`;
    csvContent += `Thuê bao Premium đang hoạt động,${overview.activePremiumSubscribers || 0}\n`;
    csvContent += `Tỷ lệ chuyển đổi Free sang VIP (%),${overview.conversionRate || 0}\n`;
    csvContent += `Tỷ lệ rời bỏ Churn Rate (%),${overview.churnRate || 0}\n\n`;

    csvContent += 'DOANH THU THEO THÁNG\n';
    csvContent += 'Tháng,Doanh thu (VNĐ),Số giao dịch\n';
    monthly.forEach((m) => {
      csvContent += `${m.month},${m.revenue},${m.transactionCount || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buddylink_financial_report_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất báo cáo tài chính.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">
            Gói cước &amp; doanh thu
          </h1>
          <p className="text-body-md text-text-muted mt-1">
            Doanh thu, cấu hình gói cước, thuê bao của phụ huynh và đối soát giao dịch thanh toán.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleExportFinancialReport}
          disabled={!summary}
          leftIcon={<Download size={ICON_SIZE.MD} />}
          className="shrink-0"
        >
          Xuất báo cáo tài chính
        </Button>
      </div>

      <Tabs tabs={SUBSCRIPTION_TABS} activeTab={activeTab} onChange={setActiveTab} variant="line" />

      {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <DateRangeFilter
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
            presets={REVENUE_DATE_PRESETS}
          />

          {summaryError && <p className="text-body-md text-error">{summaryError}</p>}

          {/* 4 KPI Cards */}
          <RevenueKpiCards overview={summary?.overview} isLoading={isSummaryLoading} />

          {/* Charts & Channels Section */}
          <MonthlyRevenueChart
            data={summary?.monthlyRevenue}
            isLoading={isSummaryLoading}
            onNavigateToPlans={() => setActiveTab('plans')}
          />
        </div>
      )}

      {/* TAB 2: GÓI DỊCH VỤ (PLANS) */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-body-md text-text-muted">
              Giá, trạng thái và hạn mức tính năng của từng gói. Đổi giá chỉ áp dụng cho lượt mua mới.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold bg-primary-soft text-primary-dark shrink-0">
              <CheckCircle2 size={ICON_SIZE.SM} />
              {activePlansCount}/{plans.length} gói đang bán
            </span>
          </div>

          {plansError && <p className="text-body-md text-error">{plansError}</p>}

          {isPlansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface-container-lowest border border-hairline space-y-4 shadow-xs">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-28 w-full" />
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

      {/* TAB 3: THUÊ BAO (SUBSCRIPTIONS) */}
      {activeTab === 'subscribers' && <SubscribersTable />}

      {/* TAB 4: GIAO DỊCH */}
      {activeTab === 'transactions' && <TransactionsTable />}
    </div>
  );
};

export default AdminSubscriptionManagementPage;
