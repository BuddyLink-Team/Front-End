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
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNewParents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A7C59" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E29578" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E29578" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="period"
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
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                formatter={(value) => (value === 'newParents' ? 'Phụ huynh mới' : 'Người dùng hoạt động')}
              />
              <Area
                type="monotone"
                dataKey="newParents"
                stroke="#4A7C59"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNewParents)"
                name="newParents"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#E29578"
                strokeWidth={2}
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
