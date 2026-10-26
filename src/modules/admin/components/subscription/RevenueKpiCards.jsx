import React from 'react';
import { CircleDollarSign, Crown, TrendingUp, UserMinus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

export const RevenueKpiCards = ({ overview, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs space-y-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const {
    totalRevenue = 0,
    successfulTransactions = 0,
    payingParentsCount = 0,
    activePremiumSubscribers = 0,
    conversionRate = 0,
    churnRate = 0,
  } = overview || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* KPI 1: Tổng doanh thu */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary-dark">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark font-medium text-xs">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {successfulTransactions} GD
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Tổng doanh thu
          </span>
          <div className="text-2xl font-bold text-on-surface tracking-tight mt-1">
            {formatCurrency(totalRevenue)}{' '}
            <span className="text-xs font-semibold text-on-surface-variant">VNĐ</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
            <span>{payingParentsCount} phụ huynh đã thanh toán</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Thuê bao Premium hoạt động */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary">
            <Crown className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-medium text-xs">
            Thời gian thực
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Thuê bao Premium hoạt động
          </span>
          <div className="text-2xl font-bold text-on-surface tracking-tight mt-1">
            {activePremiumSubscribers}{' '}
            <span className="text-xs font-semibold text-on-surface-variant">tài khoản</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, activePremiumSubscribers > 0 ? 75 : 0))}%` }}
              />
            </div>
            <span className="text-xs text-on-surface-variant shrink-0">Đang hiệu lực</span>
          </div>
        </div>
      </div>

      {/* KPI 3: Tỷ lệ chuyển đổi (Conversion) */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/50 flex items-center justify-center text-tertiary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark font-medium text-xs">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Free → VIP
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Tỷ lệ chuyển đổi (Conversion)
          </span>
          <div className="text-2xl font-bold text-on-surface tracking-tight mt-1">
            {conversionRate}%
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
            <span>Phụ huynh trả phí / Tổng phụ huynh</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Tỷ lệ rời bỏ (Churn Rate) */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-hairline shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
            <UserMinus className="w-5 h-5" />
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            churnRate > 5 ? 'bg-error-container text-on-error-container' : 'bg-primary-soft text-primary-dark'
          }`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
            {churnRate <= 5 ? 'Ổn định' : 'Cần chú ý'}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Tỷ lệ rời bỏ (Churn Rate)
          </span>
          <div className="text-2xl font-bold text-on-surface tracking-tight mt-1">
            {churnRate}%
          </div>
          <div className="mt-2 text-xs text-on-surface-variant">
            <span className={churnRate <= 5 ? 'text-primary font-medium' : 'text-error font-medium'}>
              {churnRate <= 5 ? 'Mức tối ưu' : 'Cần kích hoạt gia hạn'}
            </span>{' '}
            (Mục tiêu &lt; 5%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueKpiCards;
