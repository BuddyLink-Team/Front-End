import React from 'react';
import { cn } from '../../../../utils/cn';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { Activity, FileSearch, Scale, UserCheck, Users } from 'lucide-react';
import { StatusChip } from '../../../../components/badges/StatusChip';
import {
  SENTINEL_RISK_BADGES,
  SENTINEL_SANCTION_LABELS,
} from '../../utils/sentinelView';

/**
 * Giám sát báo cáo bằng AI sub-card for a reported parent cluster.
 * Shows the assessment of the cluster's primary report with the same content as the report drawer
 * (cluster.view, from buildSentinelView): verdict, enforcement pillars, investigation steps, sanctions.
 */
export const SentinelMonitoringBlock = ({ cluster }) => {
  const view = cluster.view;

  if (!view) {
    return (
      <div className="rounded-2xl border border-hairline-strong bg-surface-container-low p-4 text-body-md text-text-muted">
        Chưa có bản phân tích tự động cho các báo cáo của đối tượng này. Mở chi
        tiết báo cáo để chạy AI điều tra.
      </div>
    );
  }

  const riskBadge =
    SENTINEL_RISK_BADGES[view.riskLevel] || SENTINEL_RISK_BADGES.low;

  return (
    <div className="rounded-2xl border border-hairline-strong bg-surface-container-low p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-md font-bold text-text-primary">
            Giám sát báo cáo bằng AI
          </span>
          <StatusChip
            tone={view.verdictDisplay.tone}
            label={view.verdictDisplay.label}
          />
        </div>
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
            {view.reportsReceived}
          </div>
          <div className="text-body-md text-text-muted">
            Số báo cáo ghi nhận
          </div>
        </div>
        <div>
          <div className="text-headline-md font-bold text-text-primary leading-tight">
            {view.timeWindow}
          </div>
          <div className="text-body-md text-text-muted">
            Khung thời gian giám sát
          </div>
        </div>
      </div>

      {/* Enforcement Pillars */}
      <div
        className={cn(
          'grid grid-cols-1 gap-2.5',
          view.corroboration ? 'md:grid-cols-2' : 'md:grid-cols-3',
        )}
      >
        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <Activity size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>1. Mật độ báo cáo</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            {view.densityLabel}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <UserCheck size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>2. Độ tin cậy người báo cáo</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            {view.credibilityLabel}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
            <FileSearch size={ICON_SIZE.SM} className="text-primary-dark" />
            <span>3. Bằng chứng vi phạm</span>
          </div>
          <p className="mt-1 text-label-xs text-on-surface-variant">
            {view.evidenceLabel} • Độ tự tin AI: {view.confidence}%
          </p>
        </div>

        {view.corroboration && (
          <div className="rounded-xl bg-surface-container-lowest p-3 border border-hairline-strong shadow-2xs">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <Users size={ICON_SIZE.SM} className="text-primary-dark" />
              <span>4. Xác thực chéo</span>
            </div>
            <p className="mt-1 text-label-xs text-on-surface-variant">
              {view.corroborationLabel}
            </p>
          </div>
        )}
      </div>

      {/* Two-column AI Investigation & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        <div className="rounded-xl bg-surface-container-lowest p-3.5 border border-hairline-strong space-y-2">
          <h6 className="text-body-md font-bold text-text-primary">
            Điều tra &amp; tổng hợp của AI
          </h6>
          <ul className="list-disc pl-5 space-y-1 text-label-sm text-on-surface-variant">
            {view.investigationSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-3.5 border border-hairline-strong space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h6 className="text-body-md font-bold text-text-primary">
              Khuyến nghị xử lý của AI
            </h6>
            {view.isRestrictionApplied && (
              <span className="inline-flex items-center rounded-full bg-error-soft px-2.5 py-0.5 text-label-xs font-bold text-error-dark border border-error/20">
                {view.restrictionBadgeLabel}
              </span>
            )}
          </div>
          {view.restrictionSteps.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 text-label-sm text-on-surface-variant">
              {view.restrictionSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}

          <p className="text-label-xs text-on-surface-variant">
            <span className="font-semibold text-text-primary">
              Khung quy chuẩn tham chiếu:
            </span>{' '}
            {view.policyClause} • Lần vi phạm thứ {view.strikeCount}
          </p>

          <div className="pt-2 border-t border-hairline-strong flex flex-wrap items-center gap-1.5">
            <Scale size={ICON_SIZE.SM} className="text-primary-dark" />
            <span className="text-label-xs font-semibold text-text-muted">
              Chế tài chính thức đề xuất:
            </span>
            {view.recommendedSanctions.map((s, sIdx) => (
              <span
                key={sIdx}
                className="inline-flex items-center gap-1 rounded-md bg-primary-soft px-2 py-0.5 text-label-xs font-bold text-primary-dark border border-primary/20"
              >
                {SENTINEL_SANCTION_LABELS[s.type] || s.type}
                {s.durationDays ? ` (${s.durationDays} ngày)` : ''}
              </span>
            ))}
            {view.noSanctionReason && (
              <span className="text-label-xs text-on-surface-variant">
                {view.noSanctionReason}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelMonitoringBlock;
