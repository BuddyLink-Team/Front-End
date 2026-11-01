import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Select } from '../../../../components/ui/Select';
import { formatDateTime } from '../../../../utils/formatters';
import { REPORT_SEVERITY_OPTIONS, REPORT_UNCLASSIFIED_LABEL, getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportOverdueChip, ReportSeverityChip, ReportStatusChip } from './ReportChips';

const SEVERITY_CHOICES = REPORT_SEVERITY_OPTIONS.filter((option) => option.value);

/**
 * Status, severity (editable while reviewing), category, dates and assignee
 */
export const ReportDrawerHeader = ({ report, actionState, isActionLoading, onUpdateSeverity }) => {
  const { isReviewing } = actionState;
  const [isEditingSeverity, setIsEditingSeverity] = useState(false);
  const [severity, setSeverity] = useState(report.severity);

  useEffect(() => {
    setSeverity(report.severity);
    setIsEditingSeverity(false);
  }, [report.id, report.severity]);

  const saveSeverity = async () => {
    if (severity && severity !== report.severity) await onUpdateSeverity(report.id, severity);
    setIsEditingSeverity(false);
  };

  return (
    <div className="border-b border-hairline pb-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <ReportStatusChip status={report.status} />
        <ReportSeverityChip severity={report.severity} />
        {report.isOverdue && <ReportOverdueChip />}
      </div>

      {isReviewing && (
        <div className="flex items-center gap-2 text-label-md">
          <span className="text-text-muted shrink-0">Mức độ nghiêm trọng:</span>
          {isEditingSeverity ? (
            <div className="flex items-center gap-2">
              <Select aria-label="Mức độ nghiêm trọng" value={severity || ''} onChange={(event) => setSeverity(event.target.value)}>
                {!severity && <option value="">{REPORT_UNCLASSIFIED_LABEL}</option>}
                {SEVERITY_CHOICES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="primary" disabled={isActionLoading} onClick={saveSeverity}>
                Lưu
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingSeverity(false)}>
                Hủy
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingSeverity(true)}
              className="text-primary-dark hover:underline font-medium text-label-sm"
            >
              Thay đổi
            </button>
          )}
        </div>
      )}

      <p className="text-label-sm text-text-muted flex flex-wrap gap-x-3">
        <span>{getReportCategoryLabel(report.category)}</span>
        <span>Tạo lúc: {formatDateTime(report.createdAt)}</span>
        <span>
          Phụ trách:{' '}
          <strong className="text-text-primary">{report.assignedTo?.fullName || 'Chưa phân công'}</strong>
        </span>
      </p>
    </div>
  );
};

export default ReportDrawerHeader;
