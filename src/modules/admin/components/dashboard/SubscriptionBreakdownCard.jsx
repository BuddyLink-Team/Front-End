import React from 'react';
import { Crown } from 'lucide-react';
import { SUBSCRIPTION_PLAN_SEGMENTS } from '../../constants/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { DonutBreakdown } from './DonutBreakdown';

export const SubscriptionBreakdownCard = ({ subscriptions, isLoading }) => {
  const segments = SUBSCRIPTION_PLAN_SEGMENTS.map((segment) => ({
    ...segment,
    count: subscriptions?.byPlan?.[segment.key] || 0,
  }));

  return (
    <DashboardCard
      title="Gói dịch vụ"
      description="Phân bổ tài khoản theo gói Free và Premium."
      isLoading={isLoading}
      isEmpty={!segments.some(({ count }) => count > 0)}
      emptyIcon={<Crown className="w-6 h-6" />}
      emptyTitle="Chưa có dữ liệu gói"
      emptyDescription="Chưa có tài khoản nào đăng ký gói dịch vụ."
    >
      <DonutBreakdown segments={segments} totalLabel="Tài khoản" unit="tài khoản" />
    </DashboardCard>
  );
};

export default SubscriptionBreakdownCard;
