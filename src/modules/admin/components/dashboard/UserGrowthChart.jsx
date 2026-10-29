import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Users } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatDate } from '../../../../utils/formatters';
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
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name === 'newParents' ? 'Phụ huynh mới' : 'Người dùng hoạt động'}
          </span>
          <span className="font-semibold text-text-primary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const UserGrowthChart = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const chartData = (data || []).map((d) => ({
    period: d.period || d.date,
    newParents: d.newParents ?? d.count ?? 0,
    activeUsers: d.activeUsers ?? 0,
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.newParents > 0 || d.activeUsers > 0);
  const primaryColor = getCssColor(CHART_COLOR_VARS.PRIMARY);
  const secondaryColor = getCssColor(CHART_COLOR_VARS.SECONDARY);
  const gridColor = getCssColor(CHART_COLOR_VARS.GRID);
  const tick = { fontSize: CHART_SIZE.TICK_FONT, fill: getCssColor(CHART_COLOR_VARS.TICK) };

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Tăng trưởng người dùng</h2>
          <p className="text-xs text-text-muted mt-0.5">Số lượng đăng ký mới và người dùng hoạt động theo chu kỳ</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Chưa có dữ liệu tăng trưởng"
          description="Chưa ghi nhận hoạt động người dùng trong khoảng thời gian đã chọn."
          className="h-64"
        />
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: CHART_SIZE.MARGIN_TOP, right: CHART_SIZE.MARGIN_RIGHT, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNewParents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="period"
                tickFormatter={(val) => formatDate(val)}
                tick={tick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={tick}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={CHART_SIZE.Y_AXIS_WIDTH_COMPACT}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: CHART_SIZE.MARGIN_TOP, fontSize: CHART_SIZE.TICK_FONT }}
                formatter={(value) => (value === 'newParents' ? 'Phụ huynh mới' : 'Người dùng hoạt động')}
              />
              <Area
                type="monotone"
                dataKey="newParents"
                stroke={primaryColor}
                strokeWidth={CHART_SIZE.LINE_STROKE}
                fillOpacity={1}
                fill="url(#colorNewParents)"
                name="newParents"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke={secondaryColor}
                strokeWidth={CHART_SIZE.LINE_STROKE}
                fillOpacity={1}
                fill="url(#colorActiveUsers)"
                name="activeUsers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default UserGrowthChart;
