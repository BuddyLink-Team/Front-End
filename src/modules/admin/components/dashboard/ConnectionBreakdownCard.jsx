import React from 'react';
import { UserCheck } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount, formatPercent } from '../../../../utils/formatters';

const STATUS_LABELS = {
  accepted: { label: 'Đã chấp nhận (ghép nối thành công)', color: 'bg-emerald-500' },
  pending: { label: 'Đang chờ phản hồi', color: 'bg-amber-500' },
  rejected: { label: 'Đã từ chối', color: 'bg-rose-400' },
  cancelled: { label: 'Đã thu hồi', color: 'bg-gray-400' },
  disconnected: { label: 'Đã hủy kết nối', color: 'bg-gray-500' },
};

export const ConnectionBreakdownCard = ({ connections = {}, acceptanceRate = 0, isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const byStatus = connections.byStatus || [];
  const total = byStatus.reduce((sum, item) => sum + (item.count || 0), 0);
  const hasData = total > 0;

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Tương tác ghép đôi & kết nối</h2>
          <p className="text-xs text-text-muted mt-0.5">Tỷ lệ phụ huynh đồng ý kết nối và phân bổ trạng thái lời mời</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-muted block font-medium">Tỷ lệ chấp thuận</span>
          <span className="text-base font-bold text-primary-dark">
            {formatPercent(acceptanceRate / 100, 1)}
          </span>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<UserCheck className="w-6 h-6" />}
          title="Chưa có lời mời kết nối"
          description="Chưa có lượt kết nối nào được tạo trong hệ thống."
          className="h-64"
        />
      ) : (
        <div className="space-y-3 py-1">
          {byStatus.map((item) => {
            const cfg = STATUS_LABELS[item.status] || { label: item.status, color: 'bg-gray-400' };
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">{cfg.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{formatCount(item.count)}</span>
                    <span className="text-text-muted font-medium w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${cfg.color}`}
                    style={{ width: `${Math.max(item.count > 0 ? 3 : 0, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectionBreakdownCard;
