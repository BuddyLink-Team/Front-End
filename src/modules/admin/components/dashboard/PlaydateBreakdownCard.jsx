import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Calendar } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount } from '../../../../utils/formatters';
import { CHART_COLOR_VARS, CHART_SIZE } from '../../../../constants/chart.constants';

const getCssColor = (name) =>
  typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined
    : undefined;

const STATUS_CONFIG = {
  scheduled: { label: 'Đã lên lịch', colorVar: CHART_COLOR_VARS.SECONDARY, dotClass: 'bg-secondary' },
  upcoming: { label: 'Sắp diễn ra', colorVar: CHART_COLOR_VARS.SECONDARY, dotClass: 'bg-secondary' },
  in_progress: { label: 'Đang diễn ra', colorVar: CHART_COLOR_VARS.TERTIARY, dotClass: 'bg-tertiary' },
  completed: { label: 'Đã hoàn thành', colorVar: CHART_COLOR_VARS.PRIMARY, dotClass: 'bg-primary' },
  cancelled: { label: 'Đã hủy', colorVar: CHART_COLOR_VARS.ERROR, dotClass: 'bg-error' },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const cfg = STATUS_CONFIG[item.name] || { label: item.name };
  return (
    <div className="rounded-xl border border-hairline bg-white px-3 py-2 shadow-popover text-xs">
      <p className="font-semibold text-text-primary">{cfg.label}</p>
      <p className="font-bold text-text-muted mt-0.5">{formatCount(item.value)} buổi</p>
    </div>
  );
};

export const PlaydateBreakdownCard = ({ playdates = {}, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const rawByStatus = playdates?.byStatus;
  let byStatus = [];
  if (Array.isArray(rawByStatus)) {
    byStatus = rawByStatus.map((d) => ({
      status: d.status,
      count: Number(d.count || 0),
    }));
  } else if (rawByStatus && typeof rawByStatus === 'object') {
    byStatus = [
      { status: 'upcoming', count: Number(rawByStatus.upcoming || 0) },
      { status: 'completed', count: Number(rawByStatus.completed || 0) },
      { status: 'cancelled', count: Number(rawByStatus.cancelled || 0) },
    ];
  }

  const total = byStatus.reduce((sum, item) => sum + (item.count || 0), 0);
  const hasData = total > 0;
  const fallbackColor = getCssColor(CHART_COLOR_VARS.MUTED);

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-text-primary">Trạng thái buổi Playdate</h2>
          <p className="text-xs text-text-muted mt-0.5">Phân bổ các buổi giao lưu theo tình trạng tổ chức</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="Chưa có dữ liệu Playdate"
          description="Chưa có buổi playdate nào được tạo trong hệ thống."
          className="h-64"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={CHART_SIZE.PIE_INNER_RADIUS}
                  outerRadius={CHART_SIZE.PIE_OUTER_RADIUS}
                  paddingAngle={CHART_SIZE.PIE_PADDING_ANGLE}
                >
                  {byStatus.map((entry) => {
                    const colorVar = STATUS_CONFIG[entry.status]?.colorVar;
                    return (
                      <Cell
                        key={entry.status}
                        fill={(colorVar && getCssColor(colorVar)) || fallbackColor}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-text-primary">{formatCount(total)}</span>
              <span className="text-label-sm text-text-muted">Tổng buổi</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {byStatus.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || { label: item.status, dotClass: 'bg-text-muted' };
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.status} className="flex items-center justify-between py-1 border-b border-hairline/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                    <span className="font-medium text-text-primary">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{formatCount(item.count)}</span>
                    <span className="text-text-muted w-8 text-right font-medium">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaydateBreakdownCard;
