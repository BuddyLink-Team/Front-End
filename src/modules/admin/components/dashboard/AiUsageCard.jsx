import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Bot } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount, formatDate, maskEmail } from '../../../../utils/formatters';
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
      <p className="text-secondary-dark font-bold text-sm">{formatCount(payload[0].value)} lượt hỏi AI</p>
    </div>
  );
};

export const AiUsageCard = ({ aiUsage = {}, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const timeline = (aiUsage.timeline || []).map((d) => ({
    period: d.period || d.date,
    requests: d.requests ?? d.count ?? 0,
  }));
  const topUsers = aiUsage.topParents || aiUsage.topUsers || [];
  const hasData = timeline.some((d) => d.requests > 0) || topUsers.length > 0;
  const lineColor = getCssColor(CHART_COLOR_VARS.SECONDARY);
  const gridColor = getCssColor(CHART_COLOR_VARS.GRID);
  const tick = { fontSize: CHART_SIZE.TICK_FONT, fill: getCssColor(CHART_COLOR_VARS.TICK) };

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Sử dụng trợ lý AI Assistant</h2>
          <p className="text-xs text-text-muted mt-0.5">Tần suất tương tác và top 5 phụ huynh sử dụng AI tích cực nhất</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Bot className="w-6 h-6" />}
          title="Chưa có dữ liệu tương tác AI"
          description="Chưa có lượt đặt câu hỏi nào tới trợ lý AI trong khoảng thời gian này."
          className="h-64"
        />
      ) : (
        <div className="space-y-5">
          {/* Timeline Chart */}
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeline}
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
                  tick={tick}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={CHART_SIZE.Y_AXIS_WIDTH_COMPACT}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke={lineColor}
                  strokeWidth={CHART_SIZE.LINE_STROKE}
                  dot={{ r: CHART_SIZE.DOT_RADIUS, fill: lineColor }}
                  activeDot={{ r: CHART_SIZE.ACTIVE_DOT_RADIUS }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Active Parents Table */}
          {topUsers.length > 0 && (
            <div className="pt-3 border-t border-hairline">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Top phụ huynh sử dụng nhiều nhất
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-hairline/60 text-text-muted">
                      <th className="pb-1.5 font-semibold">Phụ huynh</th>
                      <th className="pb-1.5 font-semibold">Email</th>
                      <th className="pb-1.5 font-semibold text-right">Lượt hỏi</th>
                      <th className="pb-1.5 font-semibold text-right">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/40">
                    {topUsers.map((user, idx) => (
                      <tr key={user.parentId || user.userId || idx} className="hover:bg-surface-muted/50">
                        <td className="py-1.5 font-medium text-text-primary truncate max-w-truncate-xs">
                          {user.fullName || user.name || 'Phụ huynh'}
                        </td>
                        <td className="py-1.5 text-text-muted">{maskEmail(user.email)}</td>
                        <td className="py-1.5 text-right font-bold text-text-primary">
                          {formatCount(user.requestCount ?? user.requests ?? 0)}
                        </td>
                        <td className="py-1.5 text-right text-text-muted">
                          {user.tokens ? formatCount(user.tokens) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiUsageCard;
