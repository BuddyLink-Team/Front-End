import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DollarSign } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCurrency, formatCompactNumber, formatDate } from '../../../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 shadow-popover text-xs space-y-1">
      <p className="font-semibold text-text-primary">{formatDate(label)}</p>
      <p className="text-primary-dark font-bold text-sm">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export const RevenueBarChart = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const chartData = (data || []).map((d) => ({
    period: d.period || d.date,
    revenue: d.revenue || 0,
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.revenue > 0);

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Doanh thu theo chu kỳ</h2>
          <p className="text-xs text-text-muted mt-0.5">Biến động doanh thu từ gói đăng ký và dịch vụ BuddyLink</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<DollarSign className="w-6 h-6" />}
          title="Chưa có phát sinh doanh thu"
          description="Chưa có giao dịch thành công nào trong khoảng thời gian đã chọn."
          className="h-64"
        />
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="period"
                tickFormatter={(val) => formatDate(val)}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => formatCompactNumber(val)}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#4A7C59"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueBarChart;
