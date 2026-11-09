import React from 'react';
import {
  Activity,
  FileSearch,
  Scale,
  UserCheck,
} from 'lucide-react';

const SANCTION_LABEL_MAP = {
  warn: 'Gửi cảnh cáo',
  delete_message: 'Xóa tin nhắn vi phạm',
  cancel_playdate: 'Hủy buổi hẹn chơi',
  suspend: 'Tạm đình chỉ tài khoản',
  ban: 'Khóa tài khoản vĩnh viễn',
};

const RISK_BADGE_MAP = {
  high: {
    label: 'High risk',
    className: 'bg-error-soft text-error-dark border-error/20',
  },
  medium: {
    label: 'Medium risk',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  low: {
    label: 'Low risk',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

/**
 * AI Report Monitoring sub-card for a reported parent cluster.
 * Displays the 3 enforcement pillars (Velocity, Credibility, Evidence), investigation steps, and sanction recommendations.
 */
export const SentinelMonitoringBlock = ({ cluster }) => {
  const riskBadge = RISK_BADGE_MAP[cluster.riskLevel] || RISK_BADGE_MAP.high;

  return (
    <div className="rounded-2xl border border-border-default bg-surface-subtle p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-body-md font-bold text-text-primary">
          AI Report Monitoring
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold ${riskBadge.className}`}
        >
          {riskBadge.label}
        </span>
      </div>

      {/* 2 Big Metric Columns: Reports received & Time window */}
      <div className="grid grid-cols-2 gap-4 border-b border-border-default pb-3.5">
        <div>
          <div className="text-headline-md font-bold text-text-primary leading-tight">
            {cluster.reportsReceived}
          </div>
          <div className="text-body-sm text-text-muted">
            Reports received (Số báo cáo ghi nhận)
          </div>
        </div>
        <div>
          <div className="text-headline-md font-bold text-text-primary leading-tight">
            {cluster.timeWindow}
          </div>
          <div className="text-body-sm text-text-muted">
            Time window (Khung thời gian)
          </div>
        </div>
      </div>

      {/* 3 Enforcement Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-surface-card p-3 border border-border-default shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <Activity size={13} className="text-primary-dark" />
            <span>1. Report velocity</span>
          </div>
          <p className="mt-1 text-label-xs text-text-secondary">
            {cluster.reportsReceived} report trong {cluster.timeWindow} ({cluster.uniqueReportersCount} người báo cáo)
          </p>
        </div>

        <div className="rounded-xl bg-surface-card p-3 border border-border-default shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <UserCheck size={13} className="text-primary-dark" />
            <span>2. Reporter credibility</span>
          </div>
          <p className="mt-1 text-label-xs text-text-secondary">
            {cluster.credibilityLabel}
          </p>
        </div>

        <div className="rounded-xl bg-surface-card p-3 border border-border-default shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <FileSearch size={13} className="text-primary-dark" />
            <span>3. Violation evidence</span>
          </div>
          <p className="mt-1 text-label-xs text-text-secondary">
            Độ tự tin AI: {cluster.confidenceScore}% • Đã đối chiếu ngữ cảnh &amp; tiền sử vi phạm
          </p>
        </div>
      </div>

      {/* Two-column AI Investigation & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        <div className="rounded-xl bg-surface-card p-3.5 border border-border-default space-y-2">
          <h6 className="text-body-sm font-bold text-text-primary">
            AI investigation (Tổng hợp điều tra)
          </h6>
          <ul className="list-disc pl-5 space-y-1 text-label-sm text-text-secondary">
            {cluster.investigationSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface-card p-3.5 border border-border-default space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h6 className="text-body-sm font-bold text-text-primary">
              AI recommendation (Đề xuất xử lý)
            </h6>
            <span className="inline-flex items-center rounded-full bg-error-soft px-2.5 py-0.5 text-label-xs font-bold text-error-dark border border-error/20">
              Temporary restriction
            </span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-label-sm text-text-secondary">
            {cluster.tempRestrictionSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>

          <div className="pt-2 border-t border-border-default flex flex-wrap items-center gap-1.5">
            <Scale size={13} className="text-primary-dark" />
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

