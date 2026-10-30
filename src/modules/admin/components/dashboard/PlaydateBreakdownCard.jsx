import React from 'react';
import { Calendar } from 'lucide-react';
import { PLAYDATE_STATUS_SEGMENTS } from '../../constants/dashboard.constants';
import { DashboardCard } from './DashboardCard';
import { DonutBreakdown } from './DonutBreakdown';

export const PlaydateBreakdownCard = ({ playdates, isLoading }) => {
  const segments = PLAYDATE_STATUS_SEGMENTS.map((segment) => ({
    ...segment,
    count: playdates?.byStatus?.[segment.key] || 0,
  }));

  return (
    <DashboardCard
      title="Buổi hẹn chơi"
      description="Phân bổ các buổi hẹn theo trạng thái."
      isLoading={isLoading}
      isEmpty={!segments.some(({ count }) => count > 0)}
      emptyIcon={<Calendar className="w-6 h-6" />}
      emptyTitle="Chưa có buổi hẹn chơi"
      emptyDescription="Chưa có buổi hẹn nào được tạo trong khoảng thời gian này."
    >
      <DonutBreakdown segments={segments} totalLabel="Tổng buổi" unit="buổi" />
    </DashboardCard>
  );
};

export default PlaydateBreakdownCard;
