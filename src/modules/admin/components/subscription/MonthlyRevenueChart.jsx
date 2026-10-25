import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card } from '../../../../components/cards/Card';
import { Skeleton } from '../../../../components/feedback/Skeleton';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface p-3 rounded-xl border border-hairline shadow-md text-xs space-y-1">
        <p className="font-semibold text-on-surface">{label || data.month}</p>
        <p className="text-primary-ink font-bold">{formatCurrency(data.revenue)}</p>
        <p className="text-on-surface-variant">{data.transactionCount} giao dịch thành công</p>
      </div>
    );
  }
  return null;
};

export const MonthlyRevenueChart = ({ data = [], isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div>
          <h2 className="text-title-md font-semibold text-on-surface">Biểu đồ doanh thu theo tháng</h2>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Tổng giá trị các giao dịch thanh toán thành công theo từng tháng
          </p>
        </div>
      </div>

      {(!data || data.length === 0) ? (
        <div className="h-64 flex items-center justify-center text-body-sm text-on-surface-variant">
          Chưa có dữ liệu giao dịch trong khoảng thời gian này
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F0" />
              <XAxis
                dataKey="label"
                stroke="#718096"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#EDF2F0' }}
              />
              <YAxis
                stroke="#718096"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)} tr`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#7BAE7F"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default MonthlyRevenueChart;
