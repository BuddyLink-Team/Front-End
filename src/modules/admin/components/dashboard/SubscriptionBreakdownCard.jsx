import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Crown } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount } from '../../../../utils/formatters';

const PLAN_CONFIG = {
  free: { label: 'Gói Miễn phí', color: '#9CA3AF' },
  premium_monthly: { label: 'Premium Tháng', color: '#4A7C59' },
  premium_yearly: { label: 'Premium Năm', color: '#D97706' },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const cfg = PLAN_CONFIG[item.name] || { label: item.name };
  return (
    <div className="rounded-xl border border-hairline bg-white px-3 py-2 shadow-popover text-xs">
      <p className="font-semibold text-text-primary">{cfg.label}</p>
      <p className="font-bold text-text-muted mt-0.5">{formatCount(item.value)} người dùng</p>
    </div>
  );
};

export const SubscriptionBreakdownCard = ({ subscriptions = {}, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const byPlan = subscriptions.byPlan || [];
  const total = byPlan.reduce((sum, item) => sum + (item.count || 0), 0);
  const hasData = total > 0;

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-text-primary">Cơ cấu gói dịch vụ</h2>
          <p className="text-xs text-text-muted mt-0.5">Phân bổ người dùng theo gói tài khoản Free và Premium</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Crown className="w-6 h-6" />}
          title="Chưa có dữ liệu gói"
          description="Chưa có thông tin gói đăng ký của người dùng."
          className="h-64"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byPlan}
                  dataKey="count"
                  nameKey="plan"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {byPlan.map((entry) => (
                    <Cell
                      key={entry.plan}
                      fill={PLAN_CONFIG[entry.plan]?.color || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-text-primary">{formatCount(total)}</span>
              <span className="text-[11px] text-text-muted">Tài khoản</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {byPlan.map((item) => {
              const cfg = PLAN_CONFIG[item.plan] || { label: item.plan, color: '#9CA3AF' };
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.plan} className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="font-medium text-text-primary">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{formatCount(item.count)}</span>
                    <span className="text-text-muted w-8 text-right font-medium">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionBreakdownCard;
