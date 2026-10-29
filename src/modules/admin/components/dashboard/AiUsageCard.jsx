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

  const timeline = aiUsage.timeline || [];
  const topUsers = aiUsage.topUsers || [];
  const hasData = timeline.some((d) => d.requests > 0) || topUsers.length > 0;

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
              <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => formatDate(val)}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#E29578"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#E29578' }}
                  activeDot={{ r: 5 }}
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
                      <tr key={user.userId || idx} className="hover:bg-surface-muted/50">
                        <td className="py-1.5 font-medium text-text-primary truncate max-w-[140px]">
                          {user.name || 'Phụ huynh'}
                        </td>
                        <td className="py-1.5 text-text-muted">{maskEmail(user.email)}</td>
                        <td className="py-1.5 text-right font-bold text-text-primary">
                          {formatCount(user.requests)}
                        </td>
                        <td className="py-1.5 text-right text-text-muted">
                          {formatCount(user.tokens)}
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
