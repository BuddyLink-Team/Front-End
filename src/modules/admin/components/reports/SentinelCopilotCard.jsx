import React, { useState } from 'react';
import { cn } from '../../../../utils/cn';
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
  Users,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { StatusChip } from '../../../../components/badges/StatusChip';
import {
  formatPolicyClause,
  formatTimeWindow,
  getReportCategoryLabel,
  getSentinelVerdict,
  SENTINEL_VERDICT_DISPLAY,
} from '../../constants/admin.constants';

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
      <div className="rounded-2xl border border-hairline-strong bg-surface-container-low p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={ICON_SIZE.MD} />
            </div>
            <div>
              <h4 className="text-body-md font-semibold text-text-primary">
                Giám sát báo cáo bằng AI (BuddyLink Sentinel)
              </h4>
              <p className="text-body-md text-text-muted">
                Chưa có bản phân tích tự động (mật độ báo cáo, độ tin cậy người
                báo cáo, bằng chứng vi phạm) cho vụ việc này.
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

  // Numbers come from the backend, recomputed on each read: nothing is guessed here
  const confidence = assessment.confidenceScore ?? 0;
  const confidenceColor =
    confidence >= 90
      ? 'text-primary-dark bg-primary-soft border-primary-border'
      : 'text-tertiary-dark bg-tertiary-soft border-tertiary-border';

  const monitoring = assessment.monitoring || {};
  const reportsReceived = monitoring.reportsReceived ?? 1;
  const timeWindow = formatTimeWindow(monitoring.timeWindow);
  const riskBadge = RISK_BADGE_MAP[monitoring.riskLevel] || RISK_BADGE_MAP.low;
  // AI recommendation: follows the AI verdict (none without a violation). The matrix stays in the policy panel.
  const verdict = getSentinelVerdict(assessment);
  const verdictDisplay = SENTINEL_VERDICT_DISPLAY[verdict];
  const isViolation = verdict === 'violation';
  const recommendedSanctions = isViolation
    ? assessment.recommendedSanctions || []
    : [];
  const newReportsCount = assessment.newReportsSinceAssessment || 0;
  const isReviewing = report?.status === 'reviewing';
  const appliedTypes = new Set((report?.actions || []).map((a) => a.type));
  const missingSanctions = recommendedSanctions.filter(
    (sanction) => !appliedTypes.has(sanction.type),
  );

  const credibilityLabel =
    monitoring.reporterCredibility?.label ||
    'Đáng tin cậy — Không phát hiện dấu hiệu nhiều tài khoản phối hợp báo cáo giả';

  const investigationSteps =
    monitoring.investigationSteps?.length > 0
      ? monitoring.investigationSteps
      : [
          `Phân loại nội dung báo cáo: Danh mục "${getReportCategoryLabel(report?.category)}" — ${assessment.violationType || 'Vi phạm quy chuẩn giao tiếp'}.`,
          `Kiểm tra các tin nhắn liên quan: ${assessment.evidenceAnalysis?.notes || 'Đã đối chiếu ngữ cảnh hội thoại và bằng chứng đính kèm.'}`,
          `Xác định các báo cáo có cùng một sự việc hay là những sự việc độc lập: Ghi nhận ${reportsReceived} báo cáo liên quan đến tài khoản này từ các phụ huynh độc lập.`,
          `Kiểm tra lịch sử vi phạm đã được xác nhận: Tài khoản bị báo cáo đang ở lần vi phạm thứ ${assessment.strikeCount ?? 1}/3.`,
          `Đánh giá khả năng báo cáo phối hợp hoặc báo cáo giả: ${credibilityLabel}.`,
        ];

  // Sanctions are only automated once enough distinct parents reported the same violation
  const corroboration = assessment.corroboration || null;

  const isRestrictionApplied = Boolean(
    monitoring.temporaryRestriction?.applied,
  );
  const tempRestrictionSteps = isRestrictionApplied
    ? monitoring.temporaryRestriction.steps || []
    : [];

  return (
    <div className="rounded-2xl border border-primary/20 bg-surface-container-lowest p-5 shadow-xs transition-all space-y-4">
      {/* Top Copilot Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline-strong pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <ShieldCheck size={ICON_SIZE.MD} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-body-md font-bold text-text-primary">
                Hệ thống xử lý tự động — Sentinel AI
              </h4>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-label-xs font-semibold',
                  confidenceColor,
                )}
              >
                <Zap size={ICON_SIZE.XS} />
                Độ tự tin: {confidence}%
              </span>
              <StatusChip
                tone={verdictDisplay.tone}
                label={verdictDisplay.label}
              />
            </div>
            <p className="text-label-sm text-text-muted">
              AI tổng hợp đa chiều &amp; đề xuất hạn chế tạm thời — Admin là
              người xác nhận quyết định cuối cùng
            </p>
          </div>
        </div>

        {!isClosed && (
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
        )}
      </div>

      {/* Reports filed after the AI assessment: numbers below are already updated, the AI text is not */}
      {newReportsCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-tertiary-border bg-tertiary-soft px-3.5 py-2.5 text-label-sm text-tertiary-dark">
          <RefreshCw size={ICON_SIZE.SM} className="mt-0.5 shrink-0" />
          <span>
            Có <strong>{newReportsCount} báo cáo mới</strong> về người này kể từ
            lần AI phân tích lúc {formatDateTime(assessment.assessedAt)}. Số
            liệu và đề xuất bên dưới đã được cập nhật; bấm{' '}
            <strong>Phân tích lại</strong> để AI viết lại bản tóm tắt.
          </span>
        </div>
      )}

      {/* AI report monitoring card */}
      <div className="rounded-2xl border border-hairline-strong bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h5 className="text-title-md font-bold text-text-primary">
            Giám sát báo cáo bằng AI
          </h5>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold',
              riskBadge.className,
            )}
          >
            {riskBadge.label}
          </span>
        </div>

        {/* 2 Metric Columns: Reports received & Time window */}
        <div className="grid grid-cols-2 gap-4 border-b border-hairline-strong pb-4">
          <div>
            <div className="text-headline-md font-bold text-text-primary leading-tight">
              {reportsReceived}
            </div>
            <div className="text-body-md text-text-muted mt-0.5">
              Số báo cáo ghi nhận
            </div>
          </div>
          <div>
            <div className="text-headline-md font-bold text-text-primary leading-tight">
              {timeWindow}
            </div>
            <div className="text-body-md text-text-muted mt-0.5">
              Khung thời gian giám sát
            </div>
          </div>
        </div>

        {/* 3 Enforcement Pillars Summary Chips */}
        <div
          className={cn(
            'grid grid-cols-1 gap-2.5',
            corroboration ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
          )}
        >
          <div className="rounded-xl bg-surface-container-low p-2.5 border border-hairline-strong">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <Activity size={ICON_SIZE.SM} className="text-primary" />
              <span>1. Mật độ báo cáo</span>
            </div>
            <p className="mt-1 text-label-xs text-on-surface-variant">
              {reportsReceived} báo cáo trong {timeWindow} (
              {monitoring.uniqueReportersCount ?? reportsReceived} tài khoản báo
              cáo)
            </p>
          </div>

          <div className="rounded-xl bg-surface-container-low p-2.5 border border-hairline-strong">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <UserCheck size={ICON_SIZE.SM} className="text-primary" />
              <span>2. Độ tin cậy người báo cáo</span>
            </div>
            <p
              className="mt-1 text-label-xs text-on-surface-variant line-clamp-2"
              title={credibilityLabel}
            >
              {credibilityLabel}
            </p>
          </div>

          <div className="rounded-xl bg-surface-container-low p-2.5 border border-hairline-strong">
            <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
              <FileSearch size={ICON_SIZE.SM} className="text-primary" />
              <span>3. Bằng chứng vi phạm</span>
            </div>
            <p className="mt-1 text-label-xs text-on-surface-variant line-clamp-2">
              {assessment.evidenceAnalysis?.isValid
                ? 'Bằng chứng tin nhắn / hình ảnh khớp với nội dung tố cáo'
                : 'Cần Admin kiểm tra thêm ngữ cảnh trực tiếp'}
            </p>
          </div>

          {corroboration && (
            <div className="rounded-xl bg-surface-container-low p-2.5 border border-hairline-strong">
              <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
                <Users size={ICON_SIZE.SM} className="text-primary" />
                <span>4. Xác thực chéo</span>
              </div>
              <p className="mt-1 text-label-xs text-on-surface-variant">
                {corroboration.reporterCount}/{corroboration.requiredReporters}{' '}
                phụ huynh báo cáo trong {corroboration.windowDays} ngày —{' '}
                {corroboration.isCorroborated
                  ? 'đủ điều kiện để AI tự xử lý'
                  : 'chưa đủ, AI không tự áp dụng chế tài'}
              </p>
            </div>
          )}
        </div>

        {/* AI investigation bullet list */}
        <div className="space-y-2 border-b border-hairline-strong pb-4">
          <h6 className="text-body-md font-bold text-text-primary">
            Điều tra &amp; tổng hợp của AI
          </h6>
          <ul className="list-disc pl-5 space-y-1.5 text-body-md text-on-surface-variant">
            {investigationSteps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Messaging restriction really applied by Auto-Shield */}
        {isRestrictionApplied && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <h6 className="text-body-md font-bold text-text-primary">
                Khuyến nghị xử lý của AI
              </h6>
              <span className="inline-flex items-center rounded-full bg-error-soft px-3 py-0.5 text-label-xs font-bold text-error-dark border border-error/20">
                {monitoring.temporaryRestriction?.badgeLabel ||
                  'Đang hạn chế nhắn tin'}
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-body-md text-on-surface-variant">
              {tempRestrictionSteps.map((step, index) => (
                <li key={index} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Policy Clause & Strike Count */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low px-3.5 py-2.5 text-body-md text-on-surface-variant border border-hairline-strong">
        <Scale size={ICON_SIZE.SM} className="text-primary shrink-0" />
        <span className="font-semibold text-text-primary">
          Khung quy chuẩn tham chiếu:
        </span>
        <span className="font-medium text-on-surface-variant">
          {formatPolicyClause(assessment.policyClause) ||
            'Quy chuẩn kiểm duyệt cơ bản'}
        </span>
        <span className="ml-auto inline-flex items-center rounded-md bg-white px-2 py-0.5 text-label-xs font-semibold text-text-primary shadow-xs border border-hairline-strong">
          Lần vi phạm thứ {assessment.strikeCount ?? 1}
        </span>
      </div>

      {/* AI Context Summary */}
      {assessment.summary && (
        <div className="space-y-1.5">
          <h5 className="text-label-sm font-semibold uppercase tracking-wider text-text-muted">
            Bản phân tích chi tiết của AI cho Admin
          </h5>
          <div className="rounded-xl bg-surface-container-lowest p-3 text-body-md text-on-surface-variant leading-relaxed border border-hairline-strong whitespace-pre-line">
            {assessment.summary}
          </div>
        </div>
      )}

      {/* Multimodal Evidence Analysis */}
      {assessment.evidenceAnalysis?.notes && (
        <div className="flex items-start gap-2.5 rounded-xl border border-primary-border bg-primary-soft p-3 text-body-md">
          <CheckCircle2
            size={ICON_SIZE.SM}
            className="text-primary-dark shrink-0 mt-0.5"
          />
          <div>
            <span className="font-semibold text-primary-ink">
              Thẩm định bằng chứng:{' '}
            </span>
            <span className="text-on-surface-variant">
              {assessment.evidenceAnalysis.notes}
            </span>
          </div>
        </div>
      )}

      {/* Recommended Official Sanctions (Pending Admin Confirmation) */}
      <div className="space-y-2">
        <h5 className="text-label-sm font-semibold uppercase tracking-wider text-text-muted">
          Hình phạt chính thức đề xuất (chờ Admin xác nhận)
        </h5>
        {!isViolation && (
          <p className="rounded-xl border border-hairline-strong bg-surface-container-low px-3 py-2 text-body-md text-on-surface-variant">
            {verdict === 'no_violation'
              ? 'AI kết luận không có vi phạm nên không đề xuất chế tài. Nếu đồng ý, bấm Bác bỏ báo cáo ở cuối cửa sổ: lý do của AI được điền sẵn.'
              : assessment.verdict
                ? 'AI chưa đủ căn cứ để đề xuất chế tài. Đối chiếu khung kỷ luật bên dưới và tự quyết định.'
                : 'Bản phân tích này chưa có kết luận của AI. Bấm Phân tích lại để AI kết luận và đề xuất chế tài.'}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {recommendedSanctions.map((sanction, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-body-md font-semibold text-primary"
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
        <div className="border-t border-hairline-strong pt-3">
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
            <div className="mt-3 space-y-3 rounded-xl bg-surface-container-low p-3 text-body-md border border-hairline-strong">
              {assessment.draftNotes.reportedUserNotice && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Gửi người vi phạm:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-on-surface-variant border border-hairline-strong text-label-sm">
                    {assessment.draftNotes.reportedUserNotice}
                  </p>
                </div>
              )}
              {assessment.draftNotes.reporterFeedback && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Phản hồi người báo cáo:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-on-surface-variant border border-hairline-strong text-label-sm">
                    {assessment.draftNotes.reporterFeedback}
                  </p>
                </div>
              )}
              {assessment.draftNotes.adminNote && (
                <div className="space-y-1">
                  <span className="text-label-xs font-bold text-text-muted uppercase">
                    Ghi chú nội bộ cho Admin:
                  </span>
                  <p className="rounded-lg bg-white p-2.5 text-on-surface-variant border border-hairline-strong text-label-sm font-mono text-label-xs">
                    {assessment.draftNotes.adminNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Applies the recommended sanctions still missing; the report is concluded from the footer */}
      {!isClosed && isViolation && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onApplySentinel(report)}
            disabled={
              isActionLoading || !isReviewing || missingSanctions.length === 0
            }
            className="w-full gap-2 py-3 text-body-md font-bold shadow-sm"
          >
            <Sparkles size={ICON_SIZE.MD} />
            <span>Áp dụng chế tài AI đề xuất</span>
          </Button>
          <p className="mt-1.5 text-center text-label-xs text-text-muted">
            {!isReviewing
              ? 'Bấm Bắt đầu xử lý ở cuối cửa sổ để áp dụng chế tài.'
              : missingSanctions.length === 0
                ? 'Đã áp dụng đủ chế tài đề xuất. Bấm Kết luận & đóng báo cáo ở cuối cửa sổ.'
                : 'Chỉ áp dụng các chế tài còn thiếu, báo cáo vẫn mở. Sau đó kết luận ở cuối cửa sổ.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SentinelCopilotCard;
