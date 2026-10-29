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
import { Baby } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount } from '../../../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 shadow-popover text-xs space-y-1">
      <p className="font-semibold text-text-primary">Độ tuổi: {label}</p>
      <p className="text-secondary-dark font-bold text-sm">{formatCount(payload[0].value)} trẻ</p>
    </div>
  );
};

export const ChildAgeGroupsCard = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const hasData = Array.isArray(data) && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Phân bố độ tuổi của trẻ</h2>
          <p className="text-xs text-text-muted mt-0.5">Số lượng hồ sơ trẻ em được phân theo nhóm tuổi</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Baby className="w-6 h-6" />}
          title="Chưa có hồ sơ trẻ em"
          description="Chưa có dữ liệu độ tuổi trẻ em trong hệ thống."
          className="h-64"
        />
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="group"
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
              <Bar
                dataKey="count"
                fill="#E29578"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChildAgeGroupsCard;
