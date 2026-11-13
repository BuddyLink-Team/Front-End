import React, { useEffect, useState } from 'react';
import { cn } from '../../../../utils/cn';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSearch,
  RefreshCw,
  Scale,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { StatusChip } from '../../../../components/badges/StatusChip';
import {
  buildSentinelView,
  SENTINEL_RISK_BADGES,
  SENTINEL_SANCTION_LABELS,
} from '../../utils/sentinelView';
import { ReportSection } from './ReportChips';

const Pillar = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl border border-hairline-strong bg-surface-container-low p-2.5">
    <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
      <Icon size={ICON_SIZE.SM} className="text-primary" />
      <span>{title}</span>
    </div>
    <p className="mt-1 text-label-xs text-on-surface-variant">{children}</p>
  </div>
);

const Draft = ({ label, children }) =>
  children ? (
    <div className="space-y-1">
      <span className="text-label-xs font-bold uppercase text-text-muted">
        {label}
      </span>
      <p className="rounded-lg border border-hairline-strong bg-surface-container-lowest p-2.5 text-label-sm text-on-surface-variant">
        {children}
      </p>
    </div>
  ) : null;

/**
 * Suggestion of the Sentinel AI for the case, below the evidence: its conclusion, a summary and the
 * sanctions it recommends. The admin decides from the drawer footer, where the recommendation is preselected.
 * The figures behind the suggestion (same content as the scan overview) are shown on demand.
 */
export const SentinelCopilotCard = ({
  report,
  isActionLoading,
  onAssessSentinel,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const view = buildSentinelView(report);
  const isClosed =
    report?.status === 'resolved' || report?.status === 'dismissed';

  useEffect(() => {
    setShowDetails(false);
  }, [report?.id]);

  if (!view) {
    return (
      <ReportSection icon={Sparkles} title="Gợi ý của AI">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-text-muted">
            Chưa có bản phân tích của AI cho vụ việc này.
          </p>
          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssessSentinel(report.id, false)}
              disabled={isActionLoading}
              leftIcon={<Sparkles size={ICON_SIZE.SM} className="text-primary" />}
            >
              Chạy AI phân tích
            </Button>
          )}
        </div>
      </ReportSection>
    );
  }

  const { assessment, verdict } = view;
  const riskBadge =
    SENTINEL_RISK_BADGES[view.riskLevel] || SENTINEL_RISK_BADGES.low;
  const newReportsCount = assessment.newReportsSinceAssessment || 0;
  const drafts = assessment.draftNotes;

  return (
    <ReportSection icon={Sparkles} title="Gợi ý của AI">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip
            tone={view.verdictDisplay.tone}
            label={view.verdictDisplay.label}
          />
          <span className="text-label-sm text-text-muted">
            Độ tự tin: {view.confidence}%
          </span>
        </div>
        {!isClosed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAssessSentinel(report.id, true)}
            disabled={isActionLoading}
            className="text-text-muted hover:text-text-primary"
            leftIcon={
              <RefreshCw
                size={ICON_SIZE.SM}
                className={isActionLoading ? 'animate-spin' : ''}
              />
            }
          >
            Phân tích lại
          </Button>
        )}
      </div>

      {/* Reports filed after the AI assessment: the numbers are already updated, the AI text is not */}
      {newReportsCount > 0 && (
        <p className="rounded-xl border border-tertiary-border bg-tertiary-soft px-3 py-2 text-label-sm text-tertiary-dark">
          Có <strong>{newReportsCount} báo cáo mới</strong> về người này kể từ
          lần AI phân tích lúc {formatDateTime(assessment.assessedAt)}. Bấm{' '}
          <strong>Phân tích lại</strong> để AI viết lại bản tóm tắt.
        </p>
      )}

      {view.summary && (
        <p className="whitespace-pre-line leading-relaxed text-on-surface-variant">
          {view.summary}
        </p>
      )}

      <div className="space-y-1.5">
        <span className="text-label-sm font-semibold text-text-primary">
          Hình phạt AI đề xuất
        </span>
        {view.isViolation ? (
          <div className="flex flex-wrap gap-2">
            {view.recommendedSanctions.map((sanction, index) => (
              <span
                key={`${sanction.type}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-label-md font-semibold text-primary"
              >
                {SENTINEL_SANCTION_LABELS[sanction.type] || sanction.type}
                {sanction.durationDays ? ` (${sanction.durationDays} ngày)` : ''}
              </span>
            ))}
            {view.recommendedSanctions.length === 0 && (
              <span className="text-on-surface-variant">
                AI không đề xuất hình phạt cụ thể.
              </span>
            )}
          </div>
        ) : (
          <p className="text-on-surface-variant">
            {view.noSanctionReason}{' '}
            {verdict === 'no_violation'
              ? 'Nếu đồng ý, bấm Không vi phạm — bác bỏ: lý do của AI được điền sẵn.'
              : assessment.verdict
                ? 'Hãy xem bằng chứng và tự quyết định.'
                : 'Bấm Phân tích lại để AI kết luận.'}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-expanded={showDetails}
        onClick={() => setShowDetails((isOpen) => !isOpen)}
        className="flex w-full items-center justify-between border-t border-hairline pt-3 text-label-md font-semibold text-text-muted hover:text-text-primary"
      >
        <span>Xem chi tiết phân tích</span>
        {showDetails ? (
          <ChevronUp size={ICON_SIZE.SM} />
        ) : (
          <ChevronDown size={ICON_SIZE.SM} />
        )}
      </button>

      {showDetails && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-label-sm text-on-surface-variant">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold',
                riskBadge.className,
              )}
            >
              {riskBadge.label}
            </span>
            <span>
              {view.reportsReceived} báo cáo ghi nhận trong {view.timeWindow}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Pillar icon={Activity} title="Mật độ báo cáo">
              {view.densityLabel}
            </Pillar>
            <Pillar icon={UserCheck} title="Độ tin cậy người báo cáo">
              {view.credibilityLabel}
            </Pillar>
            <Pillar icon={FileSearch} title="Bằng chứng vi phạm">
              {view.evidenceLabel}
            </Pillar>
            {view.corroboration && (
              <Pillar icon={Users} title="Xác thực chéo">
                {view.corroborationLabel}
              </Pillar>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-label-sm font-semibold text-text-primary">
              Các bước AI đã kiểm tra
            </span>
            <ul className="list-disc space-y-1 pl-5 text-on-surface-variant">
              {view.investigationSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          {view.isRestrictionApplied && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-label-sm font-semibold text-text-primary">
                  Đã tự động áp dụng
                </span>
                <span className="inline-flex items-center rounded-full border border-error/20 bg-error-soft px-2.5 py-0.5 text-label-xs font-bold text-error-dark">
                  {view.restrictionBadgeLabel}
                </span>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-on-surface-variant">
                {view.restrictionSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="flex flex-wrap items-center gap-1.5 text-label-sm text-on-surface-variant">
            <Scale size={ICON_SIZE.SM} className="shrink-0 text-primary" />
            <span>
              Khung quy chuẩn tham chiếu: {view.policyClause} · lần vi phạm thứ{' '}
              {view.strikeCount}
            </span>
          </p>

          {view.evidenceNotes && (
            <p className="flex items-start gap-2 rounded-xl border border-primary-border bg-primary-soft p-3">
              <CheckCircle2
                size={ICON_SIZE.SM}
                className="mt-0.5 shrink-0 text-primary-dark"
              />
              <span className="text-on-surface-variant">
                <strong className="text-primary-ink">Thẩm định bằng chứng: </strong>
                {view.evidenceNotes}
              </span>
            </p>
          )}

          {drafts && (
            <div className="space-y-3 rounded-xl border border-hairline-strong bg-surface-container-low p-3">
              <span className="block text-label-sm font-semibold text-text-primary">
                Thông báo AI soạn sẵn
              </span>
              <span className="block text-label-xs text-text-muted">
                Được điền sẵn vào hộp thoại xử lý khi quyết định trùng kết luận
                của AI. Bạn sửa được trước khi gửi.
              </span>
              <Draft label="Gửi người vi phạm">{drafts.reportedUserNotice}</Draft>
              <Draft label="Phản hồi người báo cáo">
                {drafts.reporterFeedback}
              </Draft>
              <Draft label="Ghi chú nội bộ">{drafts.adminNote}</Draft>
            </div>
          )}
        </div>
      )}
    </ReportSection>
  );
};

export default SentinelCopilotCard;
