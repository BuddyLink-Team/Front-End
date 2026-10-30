import React from 'react';
import { Baby } from 'lucide-react';
import { BarChart } from '../../../../components/charts/BarChart';
import { CHART_COLOR_VARS } from '../../../../constants/chart.constants';
import { formatCount } from '../../../../utils/formatters';
import { DashboardCard } from './DashboardCard';

export const ChildAgeGroupsCard = ({ data = [], isLoading }) => (
  <DashboardCard
    title="Hồ sơ trẻ theo nhóm tuổi"
    description="Các hồ sơ trẻ chưa xóa trên toàn hệ thống."
    isLoading={isLoading}
    isEmpty={!data.some((row) => row.count > 0)}
    emptyIcon={<Baby className="w-6 h-6" />}
    emptyTitle="Chưa có hồ sơ trẻ"
    emptyDescription="Chưa có hồ sơ trẻ nào trên hệ thống."
  >
    <BarChart
      data={data}
      xKey="group"
      yKey="count"
      valueFormatter={formatCount}
      colorVar={CHART_COLOR_VARS.SECONDARY}
      valueClassName="text-secondary-dark font-bold text-sm"
    />
  </DashboardCard>
);

export default ChildAgeGroupsCard;
