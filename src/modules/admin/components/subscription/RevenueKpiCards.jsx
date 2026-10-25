import React from 'react';
import { CircleDollarSign, Crown, TrendingUp, UserMinus } from 'lucide-react';
import { StatCard } from '../../../../components/cards/StatCard';
import { Skeleton } from '../../../../components/feedback/Skeleton';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export const RevenueKpiCards = ({ overview, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-2xl border border-hairline p-5 space-y-3">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Tổng doanh thu"
        value={formatCurrency(totalRevenue)}
        change={`${successfulTransactions} giao dịch`}
        changeSuffix={`(${payingParentsCount} phụ huynh trả phí)`}
        variant="primary"
        icon={<CircleDollarSign className="w-5 h-5 text-primary-dark" />}
      />

      <StatCard
        title="Thuê bao Premium"
        value={activePremiumSubscribers}
        change="Đang hoạt động"
        changeSuffix=""
        variant="tertiary"
        icon={<Crown className="w-5 h-5 text-tertiary-dark" />}
      />

      <StatCard
        title="Tỷ lệ chuyển đổi"
        value={`${conversionRate}%`}
        change="Phụ huynh trả phí / Tổng phụ huynh"
        changeSuffix=""
        variant="secondary"
        icon={<TrendingUp className="w-5 h-5 text-secondary-dark" />}
      />

      <StatCard
        title="Tỷ lệ rời bỏ (Churn)"
        value={`${churnRate}%`}
        change="Hết hạn không gia hạn trong kỳ"
        changeSuffix=""
        variant={churnRate > 5 ? 'error' : 'primary'}
        icon={<UserMinus className="w-5 h-5 text-text-muted" />}
      />
    </div>
  );
};

export default RevenueKpiCards;
