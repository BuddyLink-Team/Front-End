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
import { CHART_COLOR_VARS, CHART_SIZE } from '../../../../constants/chart.constants';

const getCssColor = (name) =>
  typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined
    : undefined;

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
  const barColor = getCssColor(CHART_COLOR_VARS.BAR);
  const gridColor = getCssColor(CHART_COLOR_VARS.GRID);
  const tick = { fontSize: CHART_SIZE.TICK_FONT, fill: getCssColor(CHART_COLOR_VARS.TICK) };

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
            <RechartsBarChart
              data={chartData}
              margin={{ top: CHART_SIZE.MARGIN_TOP, right: CHART_SIZE.MARGIN_RIGHT, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="period"
                tickFormatter={(val) => formatDate(val)}
                tick={tick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => formatCompactNumber(val)}
                tick={tick}
                axisLine={false}
                tickLine={false}
                width={CHART_SIZE.Y_AXIS_WIDTH}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill={barColor}
                radius={[CHART_SIZE.BAR_RADIUS_SM, CHART_SIZE.BAR_RADIUS_SM, 0, 0]}
                maxBarSize={CHART_SIZE.BAR_MAX}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueBarChart;
