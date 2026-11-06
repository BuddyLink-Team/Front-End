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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={ICON_SIZE.MD} />
            </div>
            <div>
              <h4 className="text-body-md font-semibold text-text-primary">
                BuddyLink Sentinel AI
              </h4>
              <p className="text-body-sm text-text-muted">
                Chưa có kết quả thẩm định tự động cho vụ việc này.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssessSentinel(report.id, false)}
            disabled={isActionLoading}
            className="gap-2"
          >
            <Sparkles size={ICON_SIZE.SM} className="text-primary" />
            <span>Kích hoạt AI Thẩm định</span>
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

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-surface-card to-surface-card p-5 shadow-xs transition-all space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
            <ShieldCheck size={ICON_SIZE.MD} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-body-md font-bold text-text-primary">
                Sentinel AI Copilot
              </h4>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-label-xs font-semibold ${confidenceColor}`}
              >
                <Zap size={12} />
                Độ tự tin: {confidence}%
              </span>
            </div>
            <p className="text-label-sm text-text-muted">
              Đánh giá vi phạm & đề xuất chế tài dựa trên Quy chế Cộng đồng
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

      {/* Policy Clause & Strike Count */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-subtle px-3.5 py-2.5 text-body-sm text-text-secondary border border-border-default/60">
        <Scale size={ICON_SIZE.SM} className="text-primary shrink-0" />
        <span className="font-semibold text-text-primary">
          Khung quy chuẩn:
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
            Tóm tắt vụ việc (AI Summary)
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
              Thẩm định bằng chứng (Gemini Vision):{' '}
            </span>
            <span className="text-blue-800">
              {assessment.evidenceAnalysis.notes}
            </span>
          </div>
        </div>
      )}

      {/* Recommended Sanctions */}
      <div className="space-y-2">
        <h5 className="text-label-sm font-semibold uppercase tracking-wider text-text-muted">
          Chế tài đề xuất thi hành
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

      {/* 1-Click Approve Action Button */}
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
            <span>Phê duyệt & Thi hành theo đề xuất Sentinel</span>
          </Button>
          <p className="mt-1.5 text-center text-label-xs text-text-muted">
            Hệ thống sẽ tự động đồng bộ mức độ, áp dụng các chế tài chuẩn và
            đóng báo cáo.
          </p>
        </div>
      )}
    </div>
  );
};

export default SentinelCopilotCard;
