import React, { useState } from 'react';
import dayjs from 'dayjs';
import { RevenueKpiCards } from '../components/subscription/RevenueKpiCards';
import { MonthlyRevenueChart } from '../components/subscription/MonthlyRevenueChart';
import { PlanEditCard } from '../components/subscription/PlanEditCard';
import { SubscribersTable } from '../components/subscription/SubscribersTable';
import { TransactionsTable } from '../components/subscription/TransactionsTable';
import { useAdminPlans } from '../hooks/useAdminPlans';
import { useAdminRevenueSummary } from '../hooks/useAdminRevenueSummary';
import { Skeleton } from '../../../components/feedback/Skeleton';
import {
  ChevronRight,
  Download,
  BarChart2,
  Sparkles,
  Users,
  Receipt,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

const TABS = [
  { id: 'overview', label: 'Tổng quan (Overview)', icon: BarChart2 },
  { id: 'plans', label: 'Gói dịch vụ (Plans)', icon: Sparkles },
  { id: 'subscribers', label: 'Thuê bao (Subscriptions)', icon: Users },
  { id: 'transactions', label: 'Giao dịch (Payments)', icon: Receipt },
];

export const AdminSubscriptionManagementPage = () => {
  const toast = useToast();
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

  // Local date picker draft state
  const [tempDateFrom, setTempDateFrom] = useState(dateRange.from || dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [tempDateTo, setTempDateTo] = useState(dateRange.to || dayjs().format('YYYY-MM-DD'));
  const [activeQuickFilter, setActiveQuickFilter] = useState('30d');

  const handleApplyDateRange = () => {
    setDateRange({ from: tempDateFrom, to: tempDateTo });
    toast.success('Đã cập nhật khoảng thời gian thống kê');
  };

  const handleQuickFilter = (type) => {
    setActiveQuickFilter(type);
    const today = dayjs();
    let from;
    const to = today.format('YYYY-MM-DD');

    if (type === '7d') {
      from = today.subtract(6, 'day').format('YYYY-MM-DD');
    } else if (type === '30d') {
      from = today.subtract(29, 'day').format('YYYY-MM-DD');
    } else if (type === 'quarter') {
      from = today.subtract(90, 'day').format('YYYY-MM-DD');
    } else if (type === 'year') {
      from = today.startOf('year').format('YYYY-MM-DD');
    }

    setTempDateFrom(from);
    setTempDateTo(to);
    setDateRange({ from, to });
  };

  const handleExportFinancialReport = () => {
    // Generate CSV for monthly revenue and KPI summary
    const overview = summary?.overview || {};
    const monthly = summary?.monthlyRevenue || [];

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'BÁO CÁO TÀI CHÍNH & HỘI VIÊN BUDDYLINK\n';
    csvContent += `Thời gian xuất: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}\n`;
    csvContent += `Khoảng thời gian: ${dateRange.from || 'Tất cả'} đến ${dateRange.to || 'Hiện tại'}\n\n`;

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

    toast.success('Đã xuất báo cáo tài chính thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề Header & Nút hành động nhanh (Stitch Layout) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
            <span>Cổng điều hành</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-semibold">Doanh thu &amp; Hội viên</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quản lý Gói cước &amp; Doanh thu Hội viên
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Theo dõi lưu lượng dòng tiền, tối ưu cấu hình gói cước, quản lý vòng đời thuê bao phụ huynh và đối soát thanh toán đa kênh.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportFinancialReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-dark transition-all shadow-xs text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo tài chính</span>
          </button>
        </div>
      </div>

      {/* Thanh Navigation Tabs 4 mục chuyển đổi mượt mà */}
      <div className="border-b border-hairline">
        <div className="flex items-center gap-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Date Range Picker & Quick filters */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-hairline shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-on-surface font-semibold flex items-center gap-1.5 mr-1">
                <Calendar className="w-4 h-4 text-primary" />
                Thời gian:
              </span>

              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-hairline text-xs">
                <span className="text-on-surface-variant">Từ</span>
                <input
                  type="date"
                  value={tempDateFrom}
                  onChange={(e) => setTempDateFrom(e.target.value)}
                  className="bg-transparent border-0 p-0 text-on-surface text-xs focus:ring-0"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-hairline text-xs">
                <span className="text-on-surface-variant">Đến</span>
                <input
                  type="date"
                  value={tempDateTo}
                  onChange={(e) => setTempDateTo(e.target.value)}
                  className="bg-transparent border-0 p-0 text-on-surface text-xs focus:ring-0"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyDateRange}
                className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-dark transition-all shadow-xs"
              >
                Áp dụng
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: '7d', label: '7 ngày qua' },
                { id: '30d', label: '30 ngày qua' },
                { id: 'quarter', label: 'Quý này' },
                { id: 'year', label: 'Năm nay' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleQuickFilter(btn.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    activeQuickFilter === btn.id
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs">
            <div>
              <h2 className="text-base font-bold text-on-surface">Cấu hình Danh mục Gói Hội viên</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Tùy biến mức giá, chu kỳ cước và hạn mức tính năng kết nối cho từng đối tượng phụ huynh.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3 Gói đang sẵn sàng
              </span>
            </div>
          </div>

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

      {/* TAB 4: GIAO DỊCH (PAYMENTS) */}
      {activeTab === 'transactions' && <TransactionsTable />}
    </div>
  );
};

export default AdminSubscriptionManagementPage;
