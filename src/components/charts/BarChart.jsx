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
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '../feedback/Skeleton';
import { EmptyState } from '../cards/EmptyState';
import { cn } from '../../utils/cn';
import { CHART_COLOR_VARS, CHART_SIZE } from '../../constants/chart.constants';

// SVG attributes need real colors: read the palette variables that styles/index.css fills from tailwind.config.js
const getCssColor = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;

const ChartTooltip = ({ active, payload, label, valueFormatter, labelFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3 py-2 shadow-popover text-xs">
      <p className="font-semibold text-text-primary mb-0.5">{labelFormatter(label)}</p>
      <p className="text-text-muted">{valueFormatter(payload[0].value)}</p>
    </div>
  );
};

/**
 * BarChart - single-series bar chart on the BuddyLink palette (e.g. revenue by month).
 *
 * @param {Array<object>} [data=[]]
 * @param {string} xKey - Category field (x axis)
 * @param {string} yKey - Value field (bar height)
 * @param {Function} [valueFormatter=String] - Formats values in the tooltip and on the y axis (e.g. formatCurrency)
 * @param {Function} [axisValueFormatter] - Shorter y axis labels; defaults to `valueFormatter`
 * @param {Function} [labelFormatter=String] - Formats the x axis categories
 * @param {boolean} [isLoading=false]
 * @param {string} [emptyTitle='Chưa có dữ liệu']
 * @param {string} [emptyMessage='Không có số liệu trong khoảng thời gian này.']
 * @param {string} [className]
 */
export const BarChart = ({
  data = [],
  xKey,
  yKey,
  valueFormatter = String,
  axisValueFormatter,
  labelFormatter = String,
  isLoading = false,
  emptyTitle = 'Chưa có dữ liệu',
  emptyMessage = 'Không có số liệu trong khoảng thời gian này.',
  className,
}) => {
  if (isLoading) {
    return <Skeleton className={cn('w-full h-chart rounded-2xl', className)} />;
  }

  if (!data.length) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-6 h-6" />}
        title={emptyTitle}
        description={emptyMessage}
        className={cn('h-chart', className)}
      />
    );
  }

  const barColor = getCssColor(CHART_COLOR_VARS.BAR);
  const gridColor = getCssColor(CHART_COLOR_VARS.GRID);
  const tick = { fill: getCssColor(CHART_COLOR_VARS.TICK), fontSize: CHART_SIZE.TICK_FONT };

  return (
    <div className={cn('w-full h-chart', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: CHART_SIZE.MARGIN_TOP, right: CHART_SIZE.MARGIN_RIGHT, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey={xKey}
            tickFormatter={labelFormatter}
            tick={tick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={axisValueFormatter || valueFormatter}
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={CHART_SIZE.Y_AXIS_WIDTH}
          />
          <Tooltip
            cursor={{ fill: gridColor }}
            content={<ChartTooltip valueFormatter={valueFormatter} labelFormatter={labelFormatter} />}
          />
          <Bar
            dataKey={yKey}
            fill={barColor}
            radius={[CHART_SIZE.BAR_RADIUS, CHART_SIZE.BAR_RADIUS, 0, 0]}
            maxBarSize={CHART_SIZE.BAR_MAX}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
