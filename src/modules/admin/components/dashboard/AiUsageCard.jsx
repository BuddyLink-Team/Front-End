import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bot } from 'lucide-react';
import { CHART_COLOR_VARS, CHART_SIZE } from '../../../../constants/chart.constants';
import { getCssColor } from '../../../../utils/chartUtils';
import { formatCount, maskEmail } from '../../../../utils/formatters';
import { DashboardCard } from './DashboardCard';

const AiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 shadow-popover text-xs space-y-1">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-secondary-dark font-bold text-sm">{formatCount(payload[0].value)} lượt hỏi AI</p>
    </div>
  );
};

export const AiUsageCard = ({ aiUsage, isLoading }) => {
  const timeline = aiUsage?.timeline || [];
  const topParents = aiUsage?.topParents || [];
  const lineColor = getCssColor(CHART_COLOR_VARS.SECONDARY);
  const tick = { fontSize: CHART_SIZE.TICK_FONT, fill: getCssColor(CHART_COLOR_VARS.TICK) };

  return (
    <DashboardCard
      title="Trợ lý AI"
      description="Lượt hỏi theo từng kỳ và 5 phụ huynh dùng nhiều nhất."
      isLoading={isLoading}
      isEmpty={!timeline.some((row) => row.count > 0)}
      emptyIcon={<Bot className="w-6 h-6" />}
      emptyTitle="Chưa có lượt hỏi AI"
      emptyDescription="Chưa có câu hỏi nào gửi tới trợ lý AI trong khoảng thời gian này."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="w-full h-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: CHART_SIZE.MARGIN_TOP, right: CHART_SIZE.MARGIN_RIGHT, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={getCssColor(CHART_COLOR_VARS.GRID)} />
              <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} width={CHART_SIZE.Y_AXIS_WIDTH_COMPACT} />
              <Tooltip content={<AiTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={lineColor}
                strokeWidth={CHART_SIZE.LINE_STROKE}
                dot={{ r: CHART_SIZE.DOT_RADIUS, fill: lineColor }}
                activeDot={{ r: CHART_SIZE.ACTIVE_DOT_RADIUS }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-hairline text-text-muted">
                <th className="pb-1.5 font-semibold">Phụ huynh</th>
                <th className="pb-1.5 font-semibold">Email</th>
                <th className="pb-1.5 font-semibold text-right">Lượt hỏi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {topParents.map(({ parentId, fullName, email, requestCount }) => (
                <tr key={parentId} className="hover:bg-surface-muted">
                  <td className="py-1.5 font-medium text-text-primary">{fullName}</td>
                  <td className="py-1.5 text-text-muted">{maskEmail(email)}</td>
                  <td className="py-1.5 text-right font-bold text-text-primary">{formatCount(requestCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AiUsageCard;
