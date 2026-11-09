import React from 'react';
import {
  Ban,
  CalendarX,
  CheckCircle2,
  Lock,
  Scale,
  ShieldAlert,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserX,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import {
  REPORT_ACTION_LABELS,
  REPORT_OVERRIDE_MIN_LENGTH,
  REPORT_SUSPEND_DURATIONS,
} from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

/**
 * Policy-governed sanction panel with progressive strike matrix and mandatory Policy Override justification.
 * Accessible for manual moderation even before Sentinel AI runs, with policy enforcement applied once AI assesses.
 */
export const ReportSanctionPanel = ({
  targetType,
  actionState,
  hasSentinelAssessment = false,
  onAssessSentinel,
  policyGuidance,
  isPolicyOverride,
  onTogglePolicyOverride,
  overrideReason,
  onOverrideReasonChange,
  isOverrideValid,
  suspendDays,
  onSuspendDaysChange,
  onAskSanction,
  isActionLoading,
}) => {
  const {
    isPending,
    isReviewing,
    appliedActions,
    canWarn,
    canDeleteMessage,
    canCancelPlaydate,
    canSuspend,
    canBan,
  } = actionState;

  const allowedTypes = policyGuidance?.allowedActionTypes || [];
  const standardActions = policyGuidance?.standardActions || [];
  const trimmedReasonLength = (overrideReason || '').trim().length;
  const remainingChars = Math.max(0, REPORT_OVERRIDE_MIN_LENGTH - trimmedReasonLength);

  const isActionAllowedByPolicy = (type) => {
    if (!isReviewing) return false;
    if (!hasSentinelAssessment) return true;
    const isStandard = allowedTypes.length === 0 || allowedTypes.includes(type);
    if (isPolicyOverride) {
      return isOverrideValid;
    }
    return isStandard;
  };

  const renderPolicyBadge = (type, alreadyApplied) => {
    if (!hasSentinelAssessment || alreadyApplied || allowedTypes.length === 0) return null;
    const isStandard = allowedTypes.includes(type);
    if (isStandard) {
      return (
        <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
          Chuẩn
        </span>
      );
    }
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
        <Lock size={10} />
        Ngoại lệ
      </span>
    );
  };

  return (
    <ReportSection icon={ShieldAlert} title="Khung kỷ luật & Thi hành chế tài">
      {/* 1A. Informative Banner when No AI Assessment Exists */}
      {!hasSentinelAssessment && (
        <div className="rounded-xl border border-hairline-strong bg-surface-container-low p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-dark">
              <Sparkles size={ICON_SIZE.SM} />
            </div>
            <div className="space-y-1">
              <p className="text-label-sm font-bold text-text-primary">
                Chưa có đánh giá AI — Bạn đang áp dụng chế tài thủ công
              </p>
              <p className="text-label-xs text-text-muted leading-relaxed">
                Quản trị viên có thể thi hành chế tài trực tiếp mà không cần giải trình ngoại lệ chính sách (Policy Override). Hoặc bấm kích hoạt AI Thẩm định để đối chiếu khung quy chuẩn tự động.
              </p>
            </div>
          </div>
          {onAssessSentinel && (
            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                variant="outline"
                isLoading={isActionLoading}
                leftIcon={<Sparkles size={ICON_SIZE.XS} className="text-primary" />}
                onClick={onAssessSentinel}
              >
                Kích hoạt AI Thẩm định
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 1B. Standard Sanction Policy Matrix Banner (when AI Assessment Exists) */}
      {hasSentinelAssessment && policyGuidance && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-label-sm font-bold text-primary">
              <Scale size={ICON_SIZE.SM} />
              <span>Khung Kỷ Luật Quy Chuẩn (Standard Policy Matrix)</span>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-label-xs font-bold text-amber-800 border border-amber-500/30">
              Vi phạm lần {policyGuidance.strikeCount || 1} (Strike {policyGuidance.strikeLevel || 1}/3)
            </span>
          </div>

          <p className="text-label-xs font-semibold text-text-primary">
            📜 {policyGuidance.clause}
          </p>

          {standardActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-label-xs text-text-muted">Chế tài đúng quy định:</span>
              {standardActions.map((act, index) => (
                <span
                  key={`${act.type}-${index}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-label-xs font-semibold text-emerald-800 border border-emerald-500/25"
                >
                  <CheckCircle2 size={12} />
                  {REPORT_ACTION_LABELS[act.type] || act.type}
                  {act.durationDays ? ` (${act.durationDays} ngày)` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 px-3.5 py-2.5 text-label-xs text-amber-900">
          💡 Vụ việc đang ở trạng thái <strong>Chờ xử lý</strong>. Nhấn nút{' '}
          <strong>Tiếp nhận xử lý</strong> ở thanh công cụ phía dưới để mở khóa các nút thi hành chế tài.
        </div>
      )}

      {/* 2. Policy Override Checkbox & Mandatory 20-char Justification (Only for assessed reports) */}
      {hasSentinelAssessment && (
        <div className="rounded-xl border border-hairline-strong bg-surface-container-low p-3.5 space-y-3">
          <Checkbox
            id="policy-override-checkbox"
            checked={isPolicyOverride}
            disabled={!isReviewing || isActionLoading}
            onChange={(e) => onTogglePolicyOverride(e.target.checked)}
            label="Áp dụng ngoại lệ chính sách (Policy Override)"
            description="Bắt buộc tích chọn và nhập lý do giải trình (ít nhất 20 ký tự) nếu muốn phạt ngoài khung quy định AI đề xuất. Lý do này được ghi vĩnh viễn vào Nhật ký kiểm toán để Super Admin kiểm tra."
          />

          {isPolicyOverride && (
            <div className="space-y-1.5 pt-1 border-t border-hairline">
              <Textarea
                id="policy-override-reason"
                rows={3}
                required
                disabled={!isReviewing || isActionLoading}
                value={overrideReason}
                onChange={(e) => onOverrideReasonChange(e.target.value)}
                label="Lý do giải trình ngoại lệ chính sách (tối thiểu 20 ký tự)"
                placeholder="Ví dụ: Người bị báo cáo đã chủ động xin lỗi và hai gia đình đã hòa giải thành công, hoặc vi phạm có tình tiết nghiêm trọng cần khóa tài khoản ngay..."
                error={
                  trimmedReasonLength > 0 && remainingChars > 0
                    ? `Cần nhập thêm ít nhất ${remainingChars} ký tự nữa (hiện tại: ${trimmedReasonLength}/${REPORT_OVERRIDE_MIN_LENGTH} ký tự).`
                    : undefined
                }
              />
              <div className="flex items-center justify-between text-label-xs">
                <span className="text-text-muted">
                  🔒 Lưu vĩnh viễn vào <code className="font-mono">ReportAuditLog</code> phục vụ hậu kiểm Super Admin
                </span>
                <span
                  className={
                    isOverrideValid
                      ? 'font-bold text-emerald-700'
                      : 'font-semibold text-amber-700'
                  }
                >
                  {trimmedReasonLength}/{REPORT_OVERRIDE_MIN_LENGTH} ký tự tối thiểu
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Sanction Execution Buttons */}
      <div className="space-y-1.5">
        {hasSentinelAssessment && (
          <p className="text-label-xs text-text-muted">
            Các chế tài gắn nhãn <strong>Chuẩn</strong> tuân theo khung quy định. Các chế tài gắn nhãn{' '}
            <strong>Ngoại lệ</strong> chỉ mở khóa khi đã tích chọn <em>Áp dụng ngoại lệ chính sách</em> và nhập đủ 20 ký tự giải trình.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            disabled={isActionLoading || !canWarn || !isActionAllowedByPolicy('warn')}
            leftIcon={<TriangleAlert size={ICON_SIZE.XS} />}
            onClick={() => onAskSanction('warn')}
          >
            <span>{appliedActions.has('warn') ? 'Đã cảnh cáo' : 'Cảnh cáo'}</span>
            {renderPolicyBadge('warn', appliedActions.has('warn'))}
          </Button>

          {targetType === 'message' && (
            <Button
              size="sm"
              variant="danger"
              disabled={isActionLoading || !canDeleteMessage || !isActionAllowedByPolicy('delete_message')}
              leftIcon={<Trash2 size={ICON_SIZE.XS} />}
              onClick={() => onAskSanction('delete_message')}
            >
              <span>{appliedActions.has('delete_message') ? 'Đã xóa tin nhắn' : 'Xóa tin nhắn'}</span>
              {renderPolicyBadge('delete_message', appliedActions.has('delete_message'))}
            </Button>
          )}

          {targetType === 'playdate' && (
            <Button
              size="sm"
              variant="danger"
              disabled={isActionLoading || !canCancelPlaydate || !isActionAllowedByPolicy('cancel_playdate')}
              leftIcon={<CalendarX size={ICON_SIZE.XS} />}
              onClick={() => onAskSanction('cancel_playdate')}
            >
              <span>{appliedActions.has('cancel_playdate') ? 'Đã hủy cuộc hẹn' : 'Hủy cuộc hẹn'}</span>
              {renderPolicyBadge('cancel_playdate', appliedActions.has('cancel_playdate'))}
            </Button>
          )}

          <div className="flex items-center gap-1.5">
            <div className="w-28">
              <Select
                aria-label="Thời hạn đình chỉ"
                value={suspendDays}
                disabled={isActionLoading || !canSuspend || !isActionAllowedByPolicy('suspend')}
                onChange={(event) => onSuspendDaysChange(Number(event.target.value))}
              >
                {REPORT_SUSPEND_DURATIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} ngày
                  </option>
                ))}
              </Select>
            </div>
            <Button
              size="sm"
              variant="danger"
              disabled={isActionLoading || !canSuspend || !isActionAllowedByPolicy('suspend')}
              leftIcon={<UserX size={ICON_SIZE.XS} />}
              onClick={() => onAskSanction('suspend')}
            >
              <span>{appliedActions.has('suspend') ? 'Đã đình chỉ' : 'Tạm đình chỉ'}</span>
              {renderPolicyBadge('suspend', appliedActions.has('suspend'))}
            </Button>
          </div>

          <Button
            size="sm"
            variant="danger"
            disabled={isActionLoading || !canBan || !isActionAllowedByPolicy('ban')}
            leftIcon={<Ban size={ICON_SIZE.XS} />}
            onClick={() => onAskSanction('ban')}
          >
            <span>{canBan ? 'Khóa vĩnh viễn' : 'Đã khóa vĩnh viễn'}</span>
            {renderPolicyBadge('ban', !canBan)}
          </Button>
        </div>
      </div>
    </ReportSection>
  );
};

export default ReportSanctionPanel;
