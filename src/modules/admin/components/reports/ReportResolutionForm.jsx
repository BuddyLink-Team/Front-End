import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  REPORT_RESOLUTION_LABELS,
  REPORT_STATUS_DISPLAY,
} from '../../constants/admin.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { ReportSection } from './ReportChips';

/**
 * Outcome of a closed report
 */
export const ReportClosedSummary = ({ report }) => (
  <ReportSection
    icon={CheckCircle2}
    title={`Kết luận: ${REPORT_STATUS_DISPLAY[report.status]?.label || report.status}`}
  >
    <p className="text-label-md text-text-primary">
      <strong>Kết quả:</strong>{' '}
      {REPORT_RESOLUTION_LABELS[report.resolution] || report.resolution}
    </p>
    <p className="text-label-md text-text-primary">
      <strong>Ghi chú:</strong> {report.adminNotes || '—'}
    </p>
    <p className="text-label-xs text-text-muted">
      Đóng bởi: {report.resolvedBy?.fullName || 'Không rõ'} ·{' '}
      {formatDateTime(report.resolvedAt)}
    </p>
  </ReportSection>
);

export default ReportClosedSummary;
