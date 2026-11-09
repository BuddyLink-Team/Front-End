import React from 'react';
import { CheckCircle2, CircleSlash } from 'lucide-react';
import { Modal } from '../../../../components/feedback/Modal';
import { Button } from '../../../../components/ui/Button';
import { Textarea } from '../../../../components/ui/Textarea';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { cn } from '../../../../utils/cn';
import { REPORT_ACTION_LABELS } from '../../constants/admin.constants';
import { useReportConclusionForm } from '../../hooks/useReportInvestigation';
import { RelatedReportsPanel } from './RelatedReportsPanel';

const FORM_ID = 'report-conclusion-form';

const OUTCOMES = [
  {
    value: 'action_taken',
    icon: CheckCircle2,
    title: 'Có vi phạm — đã xử lý bằng chế tài',
    description: 'Báo cáo đúng, người vi phạm đã nhận các chế tài bên trên.',
  },
  {
    value: 'no_action',
    icon: CircleSlash,
    title: 'Có vi phạm nhưng không kỷ luật',
    description: 'Báo cáo đúng nhưng nhẹ, đã hòa giải hoặc không cần xử phạt.',
  },
];

const COPY = {
  resolve: {
    title: 'Kết luận và đóng báo cáo',
    submit: 'Đóng báo cáo',
    notesLabel: 'Ghi chú xử lý',
    notesPlaceholder: 'Ghi rõ căn cứ xử lý vụ việc...',
  },
  dismiss: {
    title: 'Bác bỏ báo cáo',
    submit: 'Xác nhận bác bỏ',
    notesLabel: 'Lý do bác bỏ',
    notesPlaceholder:
      'Ví dụ: báo cáo sai sự thật, trùng lặp hoặc không đủ bằng chứng...',
  },
};

/**
 * The only place a report is closed: a resolution with its outcome, notes and related reports,
 * or a dismissal (no violation) with its reason.
 * @param {Object} report
 * @param {'resolve'|'dismiss'|null} mode - null when closed
 */
export const ReportConclusionDialog = ({
  report,
  mode,
  onClose,
  onResolve,
  isActionLoading,
}) => {
  const {
    form,
    actionState,
    outcome,
    canCloseRelated,
    selectedRelatedIds,
    toggleRelatedReport,
    submit,
  } = useReportConclusionForm(report, mode, onResolve, onClose);
  const {
    register,
    setValue,
    formState: { errors },
  } = form;
  const copy = COPY[mode] || COPY.resolve;
  const relatedReports = report?.relatedOpenReports || [];
  const appliedLabels = [...actionState.appliedActions].map(
    (type) => REPORT_ACTION_LABELS[type] || type,
  );
  const { hasOfficialActions } = actionState;
  // A dismissal says there was no violation: impossible once a sanction was applied
  const isDismissBlocked = mode === 'dismiss' && hasOfficialActions;

  // Only the outcome that matches the sanctions can be chosen
  const lockReason = (value) => {
    if (value === 'action_taken' && !hasOfficialActions) {
      return 'Chưa có chế tài nào: thi hành chế tài trước để chọn kết quả này.';
    }
    if (value === 'no_action' && hasOfficialActions) {
      return `Đã thi hành ${appliedLabels.join(', ')}: không thể kết luận là không kỷ luật.`;
    }
    return null;
  };

  return (
    <Modal
      isOpen={Boolean(mode)}
      onClose={onClose}
      title={copy.title}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant={mode === 'dismiss' ? 'danger' : 'primary'}
            disabled={isActionLoading || isDismissBlocked}
          >
            {copy.submit}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        {isDismissBlocked && (
          <p className="rounded-xl border border-error-container-hover bg-error-soft px-3 py-2 text-label-md text-error-dark">
            Báo cáo đã có chế tài ({appliedLabels.join(', ')}) nên không thể bác
            bỏ. Hãy dùng Kết luận &amp; đóng báo cáo.
          </p>
        )}
        {mode === 'dismiss' ? (
          <p className="text-label-md text-on-surface-variant">
            Bác bỏ khi báo cáo <strong>không có vi phạm</strong>: sai sự thật,
            trùng lặp hoặc không đủ bằng chứng. Người bị báo cáo không bị tính
            thêm lần vi phạm nào.
          </p>
        ) : (
          <div className="space-y-2" role="radiogroup" aria-label="Kết quả">
            {OUTCOMES.map((option) => {
              const Icon = option.icon;
              const locked = lockReason(option.value);
              const isDisabled = Boolean(locked);
              const isSelected = outcome === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isDisabled}
                  onClick={() => setValue('outcome', option.value)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary-soft'
                      : 'border-hairline-strong bg-surface-container-lowest hover:bg-surface-container-low',
                    isDisabled && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <Icon
                    size={ICON_SIZE.MD}
                    className={cn(
                      'mt-0.5 shrink-0',
                      isSelected ? 'text-primary-dark' : 'text-text-muted',
                    )}
                  />
                  <span className="space-y-0.5">
                    <span className="block text-label-lg text-text-primary">
                      {option.title}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant">
                      {locked
                        ? locked
                        : option.value === 'action_taken' &&
                            appliedLabels.length > 0
                          ? `Chế tài đã thi hành: ${appliedLabels.join(', ')}.`
                          : option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <Textarea
          label={copy.notesLabel}
          required
          rows={3}
          placeholder={copy.notesPlaceholder}
          error={errors.adminNotes?.message}
          {...register('adminNotes')}
        />

        {mode === 'resolve' && relatedReports.length > 0 && (
          <RelatedReportsPanel
            reports={relatedReports}
            selectedIds={selectedRelatedIds}
            onToggle={toggleRelatedReport}
            canSelect={canCloseRelated}
          />
        )}
      </form>
    </Modal>
  );
};

export default ReportConclusionDialog;
