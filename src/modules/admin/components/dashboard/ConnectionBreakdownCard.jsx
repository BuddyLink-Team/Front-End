import React from 'react';
import { UserCheck } from 'lucide-react';
import { formatCount } from '../../../../utils/formatters';
import { CONNECTION_STATUS_ROWS } from '../../constants/dashboard.constants';
import { DashboardCard } from './DashboardCard';

export const ConnectionBreakdownCard = ({ connections, isLoading }) => {
  const sent = connections?.sent || 0;

  return (
    <DashboardCard
      title="Kết nối"
      description="Yêu cầu kết nối gửi trong khoảng thời gian này và trạng thái hiện tại."
      isLoading={isLoading}
      isEmpty={sent === 0}
      emptyIcon={<UserCheck className="w-6 h-6" />}
      emptyTitle="Chưa có yêu cầu kết nối"
      emptyDescription="Chưa có yêu cầu kết nối nào trong khoảng thời gian này."
      aside={
        <div className="text-right shrink-0">
          <p className="text-title-md font-semibold text-primary-dark">{connections?.acceptanceRate}%</p>
          <p className="text-label-sm text-text-muted">Tỷ lệ chấp nhận</p>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-label-md text-text-muted">
          Đã gửi: <span className="font-semibold text-text-primary">{formatCount(sent)}</span>
        </p>
        {CONNECTION_STATUS_ROWS.map(({ key, label, barClass }) => {
          const count = connections?.[key] || 0;
          const percent = Math.round((count / sent) * 100);
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-label-md">
                <span className="text-text-primary">{label}</span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-text-primary">{formatCount(count)}</span>
                  <span className="text-text-muted w-10 text-right">{percent}%</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default ConnectionBreakdownCard;
