import React from 'react';
import { Filter, ArrowDown } from 'lucide-react';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { EmptyState } from '../../../../components/cards/EmptyState';
import { formatCount, formatPercent } from '../../../../utils/formatters';

const STEP_LABELS = {
  registered: '1. Đăng ký tài khoản',
  withChildProfile: '2. Tạo hồ sơ trẻ',
  firstConnection: '3. Có kết nối đầu tiên',
  firstPlaydate: '4. Tham gia Playdate',
  paid: '5. Nâng cấp gói Premium',
};

export const ConversionFunnelChart = ({ data = [], isLoading = false }) => {
  if (isLoading) {
    return <Skeleton className="w-full h-80 rounded-2xl" />;
  }

  const funnelData = Array.isArray(data) ? data : [];
  const hasData = funnelData.length > 0 && funnelData.some((d) => (d.count || 0) > 0);
  const topCount = funnelData[0]?.count || 1;

  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Phễu chuyển đổi phụ huynh</h2>
          <p className="text-xs text-text-muted mt-0.5">Tỷ lệ hoàn tất các mốc then chốt từ đăng ký đến thanh toán</p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<Filter className="w-6 h-6" />}
          title="Chưa có dữ liệu phễu"
          description="Chưa đủ dữ liệu người dùng để tính toán phễu chuyển đổi trong kỳ."
          className="h-64"
        />
      ) : (
        <div className="space-y-3 py-1">
          {funnelData.map((item, index) => {
            const stepLabel = STEP_LABELS[item.step] || item.step;
            const pctOfTop = Math.round((item.count / topCount) * 100);
            const dropRate = item.dropRate;

            return (
              <div key={item.step || index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">{stepLabel}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-text-primary">{formatCount(item.count)}</span>
                    <span className="text-text-muted font-medium w-12 text-right">{pctOfTop}%</span>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="w-full h-3 bg-surface-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, pctOfTop)}%` }}
                  />
                </div>

                {/* Drop rate chip between steps */}
                {index < data.length - 1 && dropRate !== null && dropRate !== undefined && (
                  <div className="flex items-center justify-end gap-1 text-[11px] text-rose-600 font-medium pt-0.5 pr-1">
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                    <span>Tỷ lệ rớt: {formatPercent(dropRate / 100, 1)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversionFunnelChart;
