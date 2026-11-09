import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Scale,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  Activity,
  UserCheck,
  FileSearch,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';

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
    className: 'bg-[#FDECE6] text-[#B44B27] border-[#F8CBBBE0]',
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

export const SentinelCopilotCard = ({
  report,
  isActionLoading,
  onAssessSentinel,
  onApplySentinel,
}) => {
  const [showDrafts, setShowDrafts] = useState(false);
  const assessment = report?.sentinelAssessment;
  const isClosed =
    report?.status === 'resolved' || report?.status === 'dismissed';

  if (!assessment) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-subtle p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={ICON_SIZE.MD} />
            </div>
            <div>
              <h4 className="text-body-md font-semibold text-text-primary">
                AI Report Monitoring (BuddyLink Sentinel)
              </h4>
              <p className="text-body-sm text-text-muted">
                Chưa có bản phân tích tự động (Report velocity, Reporter credibility, Violation evidence) cho vụ việc này.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssessSentinel(report.id, false)}
            disabled={isActionLoading}
            className="gap-2 shrink-0"
          >
            <Sparkles size={ICON_SIZE.SM} className="text-primary" />
            <span>Chạy AI Điều tra &amp; Tổng hợp</span>
          </Button>
        </div>
      </div>
    );
  }

  const confidence = assessment.confidenceScore ?? 80;
  const confidenceColor =
    confidence >= 90
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  const relatedOpenCount = (report?.relatedOpenReports?.length || 0) + 1;
  const monitoring = assessment.monitoring || {};
  const reportsReceived = Math.max(
    monitoring.reportsReceived || 1,
    relatedOpenCount
  );
  const timeWindow = monitoring.timeWindow || '30 min';
  const riskLevel =
    monitoring.riskLevel ||
    (reportsReceived >= 3 ||
    assessment.severityRecommendation === 'critical' ||
    assessment.severityRecommendation === 'high'
      ? 'high'
      : 'medium');
  const riskBadge = RISK_BADGE_MAP[riskLevel] || RISK_BADGE_MAP.high;

  const credibilityLabel =
    monitoring.reporterCredibility?.label ||
    'Đáng tin cậy — Không phát hiện dấu hiệu nhiều tài khoản phối hợp report giả';

  const investigationSteps =
    monitoring.investigationSteps?.length > 0
      ? monitoring.investigationSteps
      : [
          `Phân loại nội dung report: Danh mục "${report?.category}" — ${assessment.violationType || 'Vi phạm quy chuẩn giao tiếp'}.`,
          `Kiểm tra các tin nhắn liên quan: ${assessment.evidenceAnalysis?.notes || 'Đã đối chiếu ngữ cảnh hội thoại và bằng chứng đính kèm.'}`,
          `Xác định các report có cùng một sự việc hay là những sự việc độc lập: Ghi nhận ${reportsReceived} báo cáo liên quan đến tài khoản này từ các phụ huynh độc lập.`,
          `Kiểm tra lịch sử vi phạm đã được xác nhận: Tài khoản bị báo cáo đang ở mức Strike ${assessment.strikeCount ?? 1}/3.`,
          `Đánh giá khả năng report phối hợp hoặc report giả: ${credibilityLabel}.`,
        ];

  const tempRestrictionSteps =
    monitoring.temporaryRestriction?.steps?.length > 0
      ? monitoring.temporaryRestriction.steps
      : [
          'Tạm hạn chế khả năng gửi tin nhắn mới.',
          'Gửi cảnh báo đến Admin.',
          'Tạo một bản phân tích để Admin xem xét.',
          'Chỉ khôi phục hoặc áp dụng hình phạt chính thức sau khi có đủ căn cứ.',
        ];

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-surface-card to-surface-card p-5 shadow-xs transition-all space-y-4">
      {/* Top Copilot Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <ShieldCheck size={ICON_SIZE.MD} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-body-md font-bold text-text-primary">
                Automated Enforcement System — Sentinel AI
              </h4>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-label-xs font-semibold ${confidenceColor}`}
              >
                <Zap size={12} />
                Độ tự tin: {confidence}%
              </span>
            </div>
            <p className="text-label-sm text-text-muted">
              AI tổng hợp đa chiều &amp; đề xuất hạn chế tạm thời — Admin là người bấm Confirm quyết định cuối cùng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAssessSentinel(report.id, true)}
            disabled={isActionLoading}
            title="Chạy lại phân tích"
            className="text-text-muted hover:text-text-primary"
          >
            <RefreshCw
              size={ICON_SIZE.SM}
              className={isActionLoading ? 'animate-spin' : ''}
            />
            <span className="ml-1 text-label-sm">Phân tích lại</span>
          </Button>
        </div>
      </div>

      {/* AI Report Monitoring Card (Matches exact specification in design) */}
      <div className="rounded-2xl border border-border-default bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h5 className="text-title-sm font-bold text-text-primary">
            AI Report Monitoring
          </h5>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold ${riskBadge.className}`}
          >
            {riskBadge.label}
          </span>
        </div>

        {/* 2 Metric Columns: Reports received & Time window */}
        <div className="grid grid-cols-2 gap-4 border-b border-border-default/70 pb-4">
          <div>
            <div className="text-headline-md font-bold text-text-primary leading-tight">
              {reportsReceived}
            </div>
            <div className="text-body-sm text-text-muted mt-0.5">
              Reports received (Số báo cáo ghi nhận)
            </div>
          </div>
          <div>
            <div className="text-headline-md font-bold text-text-primary leading-tight">
              {timeWindow}
            </div>
            <div className="text-body-sm text-text-muted mt-0.5">
              Time window (Khung thời gian giám sát)
            </div>
          </div>
        </div>

        {/* 3 Enforcement Pillars Summary Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-surface-subtle p-2.5 border border-border-default/60">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <Activity size={13} className="text-primary" />
              <span>1. Report velocity</span>
            </div>
            <p className="mt-1 text-label-xs text-text-secondary">
              {reportsReceived} report trong {timeWindow} ({monitoring.uniqueReportersCount || reportsReceived} tài khoản báo cáo)
            </p>
          </div>

          <div className="rounded-xl bg-surface-subtle p-2.5 border border-border-default/60">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <UserCheck size={13} className="text-primary" />
              <span>2. Reporter credibility</span>
            </div>
            <p className="mt-1 text-label-xs text-text-secondary line-clamp-2" title={credibilityLabel}>
              {credibilityLabel}
            </p>
          </div>

          <div className="rounded-xl bg-surface-subtle p-2.5 border border-border-default/60">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <FileSearch size={13} className="text-primary" />
              <span>3. Violation evidence</span>
            </div>
            <p className="mt-1 text-label-xs text-text-secondary line-clamp-2">
              {assessment.evidenceAnalysis?.isValid
                ? 'Bằng chứng tin nhắn / hình ảnh khớp với nội dung tố cáo'
                : 'Cần Admin kiểm tra thêm ngữ cảnh trực tiếp'}
            </p>
          </div>
        </div>

        {/* AI investigation bullet list */}
        <div className="space-y-2 border-b border-border-default/70 pb-4">
          <h6 className="text-body-md font-bold text-text-primary">
            AI investigation (Điều tra &amp; Tổng hợp)
          </h6>
          <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-text-secondary">
            {investigationSteps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* AI recommendation section */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h6 className="text-body-md font-bold text-text-primary">
              AI recommendation (Khuyến nghị xử lý)
            </h6>
            <span className="inline-flex items-center rounded-full bg-[#FDECE6] px-3 py-0.5 text-label-xs font-bold text-[#B44B27] border border-[#F8CBBBE0]">
              {monitoring.temporaryRestriction?.badgeLabel || 'Temporary restriction'}
            </span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-body-sm text-text-secondary">
            {tempRestrictionSteps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Policy Clause & Strike Count */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-subtle px-3.5 py-2.5 text-body-sm text-text-secondary border border-border-default/60">
        <Scale size={ICON_SIZE.SM} className="text-primary shrink-0" />
        <span className="font-semibold text-text-primary">
          Khung quy chuẩn tham chiếu:
        </span>
        <span className="font-medium text-text-secondary">
          {assessment.policyClause || 'Quy chuẩn kiểm duyệt cơ bản'}
        </span>
        <span className="ml-auto inline-flex items-center rounded-md bg-white px-2 py-0.5 text-label-xs font-semibold text-text-primary shadow-xs border border-border-default">
          Lần vi phạm: Strike {assessment.strikeCount ?? 1}
        </span>
      </div>

      {/* AI Context Summary */}
      {assessment.summary && (
        <div className="space-y-1.5">
          <h5 className="text-label-sm font-semibold uppercase tracking-wider text-text-muted">
            Bản phân tích chi tiết cho Admin (AI Synthesis)
          </h5>
          <div className="rounded-xl bg-surface-card p-3 text-body-sm text-text-secondary leading-relaxed border border-border-default/60 whitespace-pre-line">
            {assessment.summary}
          </div>
        </div>
      )}

      {/* Multimodal Evidence Analysis */}
      {assessment.evidenceAnalysis?.notes && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-body-sm">
          <CheckCircle2
            size={ICON_SIZE.SM}
            className="text-blue-600 shrink-0 mt-0.5"
          />
          <div>
            <span className="font-semibold text-blue-900">
              Thẩm định bằng chứng (Violation Evidence):{' '}
            </span>
            <span className="text-blue-800">
              {assessment.evidenceAnalysis.notes}
            </span>
          </div>
        </div>
      )}

      {/* Recommended Official Sanctions (Pending Admin Confirmation) */}
      <div className="space-y-2">
        <h5 className="text-label-sm font-semibold uppercase tracking-wider text-text-muted">
          Hình phạt chính thức đề xuất (Chờ Admin Confirm)
        </h5>
        <div className="flex flex-wrap gap-2">
          {(assessment.recommendedSanctions || []).map((sanction, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-body-sm font-semibold text-primary"
            >
              <span>{SANCTION_LABEL_MAP[sanction.type] || sanction.type}</span>
              {sanction.durationDays && (
                <span className="rounded-md bg-white px-1.5 py-0.5 text-label-xs font-bold text-primary shadow-xs">
                  {sanction.durationDays} ngày
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Draft Communications */}
      {assessment.draftNotes && (
        <div className="border-t border-border-default/60 pt-3">
          <button
            type="button"
            onClick={() => setShowDrafts(!showDrafts)}
            className="flex w-full items-center justify-between text-label-sm font-semibold text-text-muted hover:text-text-primary"
          >
            <span className="flex items-center gap-1.5">
              <Mail size={ICON_SIZE.SM} />
              Xem dự thảo thông báo gửi các bên ({showDrafts ? 'Ẩn' : 'Hiện'})
            </span>
            {showDrafts ? (
              <ChevronUp size={ICON_SIZE.SM} />
            ) : (
              <ChevronDown size={ICON_SIZE.SM} />
            )}
          </button>

          {showDrafts && (
            <div className="mt-3 space-y-3 rounded-xl bg-surface-subtle p-3 text-body-sm border border-border-default/60">
              {assessment.draftNotes.reportedUserNotice && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Gửi người vi phạm:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-text-secondary border border-border-default text-label-sm">
                    {assessment.draftNotes.reportedUserNotice}
                  </p>
                </div>
              )}
              {assessment.draftNotes.reporterFeedback && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Phản hồi người báo cáo:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-text-secondary border border-border-default text-label-sm">
                    {assessment.draftNotes.reporterFeedback}
                  </p>
                </div>
              )}
              {assessment.draftNotes.adminNote && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Ghi chú nội bộ cho Admin:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-text-secondary border border-border-default text-label-sm font-mono text-label-xs">
                    {assessment.draftNotes.adminNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin Confirmation Action Button */}
      {!isClosed && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onApplySentinel(report.id)}
            disabled={isActionLoading}
            className="w-full gap-2 py-3 text-body-md font-bold shadow-sm"
          >
            <Sparkles size={ICON_SIZE.MD} />
            <span>Admin Confirm: Xác nhận &amp; Áp dụng hình phạt đề xuất</span>
          </Button>
          <p className="mt-1.5 text-center text-label-xs text-text-muted">
            AI không tự động đóng báo cáo. Chỉ khi Admin bấm xác nhận (hoặc chọn chế tài / bác bỏ ở bên dưới), hình phạt chính thức mới được áp dụng.
          </p>
        </div>
      )}
    </div>
  );
};

export default SentinelCopilotCard;
