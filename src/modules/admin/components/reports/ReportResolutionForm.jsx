import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Textarea } from '../../../../components/ui/Textarea';
import { REPORT_RESOLUTION_LABELS, REPORT_STATUS_DISPLAY } from '../../constants/admin.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { ReportSection } from './ReportChips';

/**
 * Notes required to close a report. The buttons that submit them are in ReportDrawerFooter.
 */
export const ReportResolutionForm = ({ form, actionState }) => {
  const { isReviewing, hasActions } = actionState;
  const { register, formState: { errors } } = form;

  return (
    <ReportSection icon={CheckCircle2} title="Kết luận và đóng báo cáo">
      <Textarea
        label="Ghi chú xử lý"
        required
        rows={3}
        placeholder="Ghi rõ căn cứ xử lý hoặc lý do bác bỏ báo cáo này..."
        error={errors.adminNotes?.message}
        {...register('adminNotes')}
      />
      {isReviewing && !hasActions && (
        <p className="text-label-sm text-text-muted">Cần thi hành ít nhất 1 chế tài trước khi đánh dấu đã xử lý.</p>
      )}
    </ReportSection>
  );
};

/**
 * Outcome of a closed report
 */
export const ReportClosedSummary = ({ report }) => (
  <ReportSection icon={CheckCircle2} title={`Kết luận: ${REPORT_STATUS_DISPLAY[report.status]?.label || report.status}`}>
    <p className="text-label-md text-text-primary">
      <strong>Kết quả:</strong> {REPORT_RESOLUTION_LABELS[report.resolution] || report.resolution}
    </p>
    <p className="text-label-md text-text-primary">
      <strong>Ghi chú:</strong> {report.adminNotes || '—'}
    </p>
    <p className="text-label-xs text-text-muted">
      Đóng bởi: {report.resolvedBy?.fullName || 'Không rõ'} · {formatDateTime(report.resolvedAt)}
    </p>
  </ReportSection>
);

export default ReportResolutionForm;
