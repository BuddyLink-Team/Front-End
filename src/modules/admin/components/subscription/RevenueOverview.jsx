import React from 'react';
import { AdminStatStrip } from '../AdminStatStrip';
import { Card } from '../../../../components/cards/Card';
import { BarChart } from '../../../../components/charts/BarChart';
import { DateRangeFilter } from '../../../../components/search/DateRangeFilter';
import { REVENUE_DATE_PRESETS, REVENUE_STAT_CARDS } from '../../constants/admin.constants';
import { formatCompactNumber, formatCount, formatCurrency, formatDate } from '../../../../utils/formatters';

/**
 * Overview tab: date range, revenue KPIs and revenue by month (successful payments only).
 *
 * @param {Object|null} summary - GET /revenue/summary data
 * @param {boolean} isLoading
 * @param {string|null} [errorMessage]
 * @param {{ from: string, to: string }} dateRange
 * @param {Function} onDateRangeChange - ({ from, to }) => void
 */
export const RevenueOverview = ({ summary, isLoading, errorMessage, dateRange, onDateRangeChange }) => {
  const overview = summary?.overview;

  return (
    <div className="space-y-6">
      <DateRangeFilter
        from={dateRange.from}
        to={dateRange.to}
        onChange={onDateRangeChange}
        presets={REVENUE_DATE_PRESETS}
      />

      <AdminStatStrip
        cards={REVENUE_STAT_CARDS}
        stats={overview}
        isLoading={isLoading}
        hasError={Boolean(errorMessage)}
      />

      {overview && (
        <p className="text-body-md text-text-muted">
          {formatCount(overview.successfulTransactions)} giao dịch thành công từ{' '}
          {formatCount(overview.payingParentsCount)} phụ huynh, từ {formatDate(summary.filter.fromDate)} đến{' '}
          {formatDate(summary.filter.toDate)}.
        </p>
      )}

      <Card className="space-y-4">
        <div>
          <h2 className="text-title-md text-text-primary">Doanh thu theo tháng</h2>
          <p className="text-body-md text-text-muted mt-1">Tổng tiền của các giao dịch thanh toán thành công.</p>
        </div>
        <BarChart
          data={summary?.monthlyRevenue || []}
          xKey="label"
          yKey="revenue"
          valueFormatter={formatCurrency}
          axisValueFormatter={formatCompactNumber}
          isLoading={isLoading && !summary}
          emptyMessage={errorMessage || 'Không có số liệu trong khoảng thời gian này.'}
        />
      </Card>
    </div>
  );
};

export default RevenueOverview;
