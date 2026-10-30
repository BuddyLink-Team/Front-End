import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { BarChart } from '../../../../components/charts/BarChart';
import { formatCompactNumber, formatCurrency } from '../../../../utils/formatters';
import { DashboardCard } from './DashboardCard';

export const RevenueBarChart = ({ data = [], isLoading }) => (
  <DashboardCard
    title="Doanh thu theo kỳ"
    description="Tổng tiền của các giao dịch thanh toán thành công."
    isLoading={isLoading}
    isEmpty={!data.some((row) => row.revenue > 0)}
    emptyIcon={<CircleDollarSign className="w-6 h-6" />}
    emptyTitle="Chưa có doanh thu"
    emptyDescription="Chưa có giao dịch thành công trong khoảng thời gian này."
  >
    <BarChart
      data={data}
      xKey="label"
      yKey="revenue"
      valueFormatter={formatCurrency}
      axisValueFormatter={formatCompactNumber}
      valueClassName="text-primary-dark font-bold text-sm"
    />
  </DashboardCard>
);

export default RevenueBarChart;
