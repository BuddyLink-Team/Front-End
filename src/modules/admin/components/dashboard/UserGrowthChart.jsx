import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Users } from 'lucide-react';
import { CHART_COLOR_VARS, CHART_SIZE } from '../../../../constants/chart.constants';
import { getCssColor } from '../../../../utils/chartUtils';
import { DashboardCard } from './DashboardCard';

const SERIES_NAME = 'Phụ huynh mới';

const GrowthTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 shadow-popover text-xs space-y-1">
      <p className="font-semibold text-text-primary">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-text-muted">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
          {SERIES_NAME}
        </span>
        <span className="font-semibold text-text-primary">{payload[0].value}</span>
      </div>
    </div>
  );
};

export const UserGrowthChart = ({ data = [], isLoading }) => {
  const primaryColor = getCssColor(CHART_COLOR_VARS.PRIMARY);
  const tick = { fontSize: CHART_SIZE.TICK_FONT, fill: getCssColor(CHART_COLOR_VARS.TICK) };

  return (
    <DashboardCard
      title="Tăng trưởng người dùng"
      description="Số phụ huynh đăng ký mới theo từng kỳ."
      isLoading={isLoading}
      isEmpty={!data.some((row) => row.count > 0)}
      emptyIcon={<Users className="w-6 h-6" />}
      emptyTitle="Chưa có dữ liệu tăng trưởng"
      emptyDescription="Chưa có phụ huynh đăng ký trong khoảng thời gian này."
    >
      <div className="w-full h-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: CHART_SIZE.MARGIN_TOP, right: CHART_SIZE.MARGIN_RIGHT, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNewParents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={getCssColor(CHART_COLOR_VARS.GRID)} />
            <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={16} />
            <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} width={CHART_SIZE.Y_AXIS_WIDTH_COMPACT} />
            <Tooltip content={<GrowthTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: CHART_SIZE.MARGIN_TOP, fontSize: CHART_SIZE.TICK_FONT }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name={SERIES_NAME}
              stroke={primaryColor}
              strokeWidth={CHART_SIZE.LINE_STROKE}
              fillOpacity={1}
              fill="url(#colorNewParents)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default UserGrowthChart;
