import React from 'react';
import { Lock, Scale } from 'lucide-react';
import { Modal } from '../../../../components/feedback/Modal';
import { Button } from '../../../../components/ui/Button';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { cn } from '../../../../utils/cn';
import {
  REPORT_ACTION_LABELS,
  REPORT_OVERRIDE_MIN_LENGTH,
  REPORT_TARGET_TYPE_LABELS,
  formatPolicyClause,
  getReportCategoryLabel,
} from '../../constants/admin.constants';
import { useReportDecisionForm } from '../../hooks/useReportInvestigation';

const FORM_ID = 'report-decision-form';
const NO_SANCTION = 'none';

const COPY = {
  violation: {
    title: 'Có vi phạm — xử lý vụ việc',
    submit: 'Xác nhận xử lý',
    notesLabel: 'Ghi chú xử lý (nội bộ)',
    notesPlaceholder: 'Ghi rõ căn cứ xử lý vụ việc...',
  },
  dismiss: {
    title: 'Không vi phạm — bác bỏ vụ việc',
    submit: 'Xác nhận bác bỏ',
    notesLabel: 'Lý do bác bỏ (nội bộ)',
    notesPlaceholder:
      'Ví dụ: báo cáo sai sự thật, trùng lặp hoặc không đủ bằng chứng...',
  },
};

const SectionTitle = ({ children }) => (
  <legend className="text-label-lg font-semibold text-text-primary">
    {children}
  </legend>
);

/**
 * One choice of the sanction list: a radio with its label and why it cannot be chosen
 */
const SanctionChoice = ({ value, label, hint, checked, disabled, onChange, children }) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5',
      checked ? 'border-primary bg-primary-soft' : 'border-hairline-strong',
      disabled && 'opacity-60',
    )}
  >
    <label
      className={cn(
        'flex min-w-0 flex-1 items-start gap-2.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <input
        type="radio"
        name="decision-sanction"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-label-lg text-text-primary">{label}</span>
        {hint && (
          <span className="block text-label-sm text-on-surface-variant">{hint}</span>
        )}
      </span>
    </label>
    {children}
  </div>
);

/**
 * The only place a case is closed, in one step:
 * - violation: one form of sanction (or none: a violation without discipline), the other open cases of
 *   the same parent closed with it, the notices the parents read, and the notes
 * - dismiss: no violation, the notice the reporters read, and the reason
 * The dialog keeps one height whatever is chosen: only its body scrolls.
 * @param {Object} report
 * @param {'violation'|'dismiss'|null} mode - null when closed
 */
export const ReportDecisionDialog = ({
  report,
  mode,
  onClose,
  onDecide,
  isActionLoading,
}) => {
  const {
    form,
    actionState,
    options,
    sanction,
    setSanction,
    suspendDays,
    setSuspendDays,
    suspendChoices,
    isOutsidePolicy,
    needsOverride,
    isOverrideValid,
    overrideReason,
    setOverrideReason,
    alsoCloseIds,
    toggleAlsoClose,
    closingCount,
    offenderNotice,
    setOffenderNotice,
    reporterNotice,
    setReporterNotice,
    submit,
  } = useReportDecisionForm(report, mode, onDecide, onClose);
  const {
    register,
    formState: { errors },
  } = form;
  const copy = COPY[mode] || COPY.violation;
  const isDismiss = mode === 'dismiss';
  const policy = report?.policyGuidance;
  const otherCases = report?.otherOpenCases || [];
  // A dismissal says there was no violation: impossible once a sanction was decided
  const isDismissBlocked = isDismiss && actionState.hasOfficialActions;
  const overrideLength = overrideReason.trim().length;

  return (
    <Modal
      isOpen={Boolean(mode)}
      onClose={onClose}
      title={copy.title}
      maxWidth="max-w-xl"
      className="h-decision-modal"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant={isDismiss ? 'danger' : 'primary'}
            disabled={isActionLoading || isDismissBlocked || !isOverrideValid}
          >
            {copy.submit}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-5">
        {isDismiss ? (
          isDismissBlocked ? (
            <p className="rounded-xl border border-error-container-hover bg-error-soft px-3 py-2 text-label-md text-error-dark">
              Vụ việc đã có chế tài nên không thể bác bỏ. Hãy dùng Có vi phạm —
              xử lý.
            </p>
          ) : (
            <p className="text-label-md text-on-surface-variant">
              Bác bỏ khi báo cáo <strong>không có vi phạm</strong>: sai sự thật,
              trùng lặp hoặc không đủ bằng chứng. Người bị báo cáo không bị tính
              thêm lần vi phạm nào.
            </p>
          )
        ) : (
          <>
            <fieldset className="space-y-2">
              <SectionTitle>Hình thức xử lý (chọn một)</SectionTitle>
              {policy && (
                <p className="flex flex-wrap items-center gap-1.5 text-label-sm text-on-surface-variant">
                  <Scale size={ICON_SIZE.SM} className="text-primary" />
                  <span>
                    Khung kỷ luật: {formatPolicyClause(policy.clause)} · lần vi
                    phạm thứ {policy.strikeCount || 1}
                  </span>
                </p>
              )}
              <div className="space-y-2">
                {options.map(({ type, disabledReason }) => {
                  const isSelected = sanction === type;
                  return (
                    <SanctionChoice
                      key={type}
                      value={type}
                      label={REPORT_ACTION_LABELS[type] || type}
                      hint={disabledReason}
                      checked={isSelected}
                      disabled={Boolean(disabledReason) || isActionLoading}
                      onChange={() => setSanction(type)}
                    >
                      <div className="flex items-center gap-2">
                        {type === 'suspend' && (
                          <div className="w-28">
                            <Select
                              aria-label="Thời hạn đình chỉ"
                              value={suspendDays}
                              disabled={!isSelected || isActionLoading}
                              onChange={(event) =>
                                setSuspendDays(Number(event.target.value))
                              }
                            >
                              {suspendChoices.map((days) => (
                                <option key={days} value={days}>
                                  {days} ngày
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}
                        {isSelected && isOutsidePolicy(type) && (
                          <StatusChip tone="warning" icon={Lock} label="Ngoại lệ" />
                        )}
                      </div>
                    </SanctionChoice>
                  );
                })}
                <SanctionChoice
                  value={NO_SANCTION}
                  label="Không áp dụng hình phạt"
                  hint="Có vi phạm nhưng không kỷ luật (nhẹ hoặc đã hòa giải)"
                  checked={sanction === null}
                  disabled={isActionLoading}
                  onChange={() => setSanction(null)}
                />
              </div>
            </fieldset>

            {needsOverride && (
              <Textarea
                id="decision-override-reason"
                rows={3}
                required
                disabled={isActionLoading}
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                label={`Lý do áp dụng ngoại lệ chính sách (tối thiểu ${REPORT_OVERRIDE_MIN_LENGTH} ký tự)`}
                placeholder="Vì sao vụ việc này cần hình phạt khác khung kỷ luật..."
                error={
                  overrideLength > 0 && !isOverrideValid
                    ? `Cần nhập thêm ít nhất ${REPORT_OVERRIDE_MIN_LENGTH - overrideLength} ký tự nữa.`
                    : undefined
                }
              />
            )}

            {otherCases.length > 0 && (
              <fieldset className="space-y-2">
                <SectionTitle>Đóng kèm vụ khác của người này</SectionTitle>
                <p className="text-label-sm text-text-muted">
                  Chọn khi đó là cùng một chuyện: vụ được đóng kèm không bị phạt
                  thêm và không tính thêm lần vi phạm.
                </p>
                <div className="space-y-2 rounded-xl border border-hairline-strong p-3">
                  {otherCases.map((item) => (
                    <Checkbox
                      key={item.id}
                      id={`decision-also-close-${item.id}`}
                      checked={alsoCloseIds.includes(item.id)}
                      disabled={isActionLoading}
                      onChange={() => toggleAlsoClose(item.id)}
                      label={`${REPORT_TARGET_TYPE_LABELS[item.targetType] || 'Báo cáo'} · ${getReportCategoryLabel(item.category)}`}
                      description={`${item.reporterCount} người báo cáo`}
                    />
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}

        {!isDismissBlocked && (
          <fieldset className="space-y-3">
            <SectionTitle>Thông báo gửi các bên</SectionTitle>
            <p className="text-label-sm text-text-muted">
              Các bên nhận đúng nội dung dưới đây. AI soạn sẵn khi kết luận của
              AI trùng với quyết định này; bạn có thể sửa trước khi gửi.
            </p>
            {!isDismiss && (
              <Textarea
                id="decision-offender-notice"
                rows={3}
                disabled={isActionLoading || !sanction}
                value={sanction ? offenderNotice : ''}
                onChange={(event) => setOffenderNotice(event.target.value)}
                label="Gửi người bị báo cáo"
                placeholder={
                  sanction
                    ? 'Để trống: gửi thông báo mặc định của hình phạt.'
                    : 'Không áp dụng hình phạt: không gửi thông báo cho người bị báo cáo.'
                }
                maxLength={1000}
              />
            )}
            <Textarea
              id="decision-reporter-notice"
              rows={3}
              disabled={isActionLoading}
              value={reporterNotice}
              onChange={(event) => setReporterNotice(event.target.value)}
              label="Gửi người báo cáo"
              maxLength={1000}
            />
          </fieldset>
        )}

        <Textarea
          label={copy.notesLabel}
          required
          rows={3}
          placeholder={copy.notesPlaceholder}
          error={errors.adminNotes?.message}
          {...register('adminNotes')}
        />

        {!isDismissBlocked && (
          <p className="rounded-xl bg-surface-container-low px-3 py-2 text-label-md text-on-surface-variant">
            <strong className="text-text-primary">Sẽ thực hiện:</strong>{' '}
            {isDismiss
              ? `bác bỏ ${closingCount} báo cáo của vụ việc`
              : `${
                  sanction
                    ? `áp dụng ${REPORT_ACTION_LABELS[sanction].toLowerCase()}`
                    : 'không áp dụng hình phạt'
                }, đóng ${closingCount} báo cáo`}
            , gửi thông báo trên cho các bên.
          </p>
        )}
      </form>
    </Modal>
  );
};

export default ReportDecisionDialog;
