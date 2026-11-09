import React from 'react';
import { cn } from '../../../../utils/cn';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { Activity, FileSearch, Scale, UserCheck } from 'lucide-react';

const SANCTION_LABEL_MAP = {
  warn: 'Gửi cảnh cáo',
  delete_message: 'Xóa tin nhắn vi phạm',
  cancel_playdate: 'Hủy buổi hẹn chơi',
  suspend: 'Tạm đình chỉ tài khoản',
  ban: 'Khóa tài khoản vĩnh viễn',
};

const RISK_BADGE_MAP = {
  high: {
    label: 'Rủi ro cao',
    className: 'bg-error-soft text-error-dark border-error/20',
  },
  medium: {
    label: 'Rủi ro trung bình',
    className: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
  },
  low: {
    label: 'Rủi ro thấp',
    className: 'bg-primary-soft text-primary-dark border-primary-border',
  },
};

/**
 * Giám sát báo cáo bằng AI sub-card for a reported parent cluster.
 * Displays the 3 enforcement pillars (Velocity, Credibility, Evidence), investigation steps, and sanction recommendations.
 */
export const SentinelMonitoringBlock = ({ cluster }) => {
  const riskBadge = RISK_BADGE_MAP[cluster.riskLevel] || RISK_BADGE_MAP.high;

  return (
    <div className="rounded-2xl border border-hairline-strong bg-surface-container-low p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-body-md font-bold text-text-primary">
          Giám sát báo cáo bằng AI
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold',
            riskBadge.className,
          )}
        >
          {riskBadge.label}
        </span>
      </div>

      {/* 2 Big Metric Columns: Reports received & Time window */}
      <div className="grid grid-cols-2 gap-4 border-b border-hairline-strong pb-3.5">
        <div>
          <div className="text-headline-md font-bold text-text-primary leading-tight">
            {cluster.reportsReceived}
          </div>
          <div className="text-body-md text-text-muted">
            Số báo cáo ghi nhận
          </div>
        </div>
        <div>
          <div className="text-headline-md font-bold text-text-primary leading-tight">
            {cluster.timeWindow}
          </div>
          <div className="text-body-md text-text-muted">
            Khung thời gian giám sát
          </div>
        </div>
      </div>

      {/* 3 Enforcement Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <Activity size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>1. Mật độ báo cáo</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            {cluster.reportsReceived} báo cáo trong {cluster.timeWindow} (
            {cluster.uniqueReportersCount} người báo cáo)
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <UserCheck size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>2. Độ tin cậy người báo cáo</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            {cluster.credibilityLabel}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <FileSearch size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>3. Bằng chứng vi phạm</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            Độ tự tin AI: {cluster.confidenceScore}% • Đã đối chiếu ngữ cảnh
            &amp; tiền sử vi phạm
          </p>
        </div>
      </div>

      {/* Two-column AI Investigation & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        <div className="rounded-xl bg-surface-container-lowest p-3.5 border border-hairline-strong space-y-2">
          <h6 className="text-body-md font-bold text-text-primary">
            Điều tra &amp; tổng hợp của AI
          </h6>
          <ul className="list-disc pl-5 space-y-1 text-label-sm text-on-surface-variant">
            {cluster.investigationSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3.5 border border-hairline-strong space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h6 className="text-body-md font-bold text-text-primary">
              Khuyến nghị xử lý của AI
            </h6>
            {cluster.isRestrictionApplied && (
              <span className="inline-flex items-center rounded-full bg-error-soft px-2.5 py-0.5 text-label-xs font-bold text-error-dark border border-error/20">
                Đang hạn chế nhắn tin
              </span>
            )}
          </div>
          {cluster.tempRestrictionSteps.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-label-sm text-on-surface-variant">
              {cluster.tempRestrictionSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}

          <div className="pt-2 border-t border-hairline-strong flex flex-wrap items-center gap-1.5">
            <Scale size={ICON_SIZE.SM} className="text-primary-dark" />
            <span className="text-label-xs font-semibold text-text-muted">
              Chế tài chính thức đề xuất:
            </span>
            {cluster.recommendedSanctions.map((s, sIdx) => (
              <span
                key={sIdx}
                className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-0.5 text-label-xs font-bold text-primary-dark border border-primary/20"
              >
                {SANCTION_LABEL_MAP[s.type] || s.type}
                {s.durationDays ? ` (${s.durationDays} ngày)` : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelMonitoringBlock;
