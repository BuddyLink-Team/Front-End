import React, { useEffect, useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Select } from '../../../../components/ui/Select';
import { formatDateTime } from '../../../../utils/formatters';
import {
  REPORT_SEVERITY_OPTIONS,
  REPORT_UNCLASSIFIED_LABEL,
  getReportCategoryLabel,
} from '../../constants/admin.constants';
import {
  ReportOverdueChip,
  ReportSeverityChip,
  ReportStatusChip,
} from './ReportChips';

const SEVERITY_CHOICES = REPORT_SEVERITY_OPTIONS.filter((option) => option.value);

/**
 * The case at a glance: status, severity (editable while open), kind of violation, how many parents
 * reported it and since when.
 */
export const ReportDrawerHeader = ({
  report,
  actionState,
  isActionLoading,
  onUpdateSeverity,
}) => {
  const { isOpen } = actionState;
  const [isEditingSeverity, setIsEditingSeverity] = useState(false);
  const [severity, setSeverity] = useState(report.severity);
  const reporterCount = report.reporterCount || 1;
  const firstReportedAt = report.caseReports?.[0]?.createdAt || report.createdAt;

  useEffect(() => {
    setSeverity(report.severity);
    setIsEditingSeverity(false);
  }, [report.id, report.severity]);

  const saveSeverity = async () => {
    if (severity && severity !== report.severity)
      await onUpdateSeverity(report.id, severity);
    setIsEditingSeverity(false);
  };

  return (
    <div className="space-y-3 border-b border-hairline pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <ReportStatusChip status={report.status} />
        <ReportSeverityChip severity={report.severity} />
        {report.isOverdue && <ReportOverdueChip />}
      </div>

      <p className="flex flex-wrap gap-x-2 text-body-md text-text-primary">
        <strong>{getReportCategoryLabel(report.category)}</strong>
        <span className="text-text-muted">
          · {reporterCount} người báo cáo · từ {formatDateTime(firstReportedAt)}
        </span>
      </p>

      {isOpen && (
        <div className="flex items-center gap-2 text-label-md">
          <span className="shrink-0 text-text-muted">Mức độ:</span>
          {isEditingSeverity ? (
            <div className="flex items-center gap-2">
              <Select
                aria-label="Mức độ"
                value={severity || ''}
                onChange={(event) => setSeverity(event.target.value)}
              >
                {!severity && (
                  <option value="">{REPORT_UNCLASSIFIED_LABEL}</option>
                )}
                {SEVERITY_CHOICES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="primary"
                disabled={isActionLoading}
                onClick={saveSeverity}
              >
                Lưu
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingSeverity(false)}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingSeverity(true)}
              className="text-label-sm font-medium text-primary-dark hover:underline"
            >
              Thay đổi
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDrawerHeader;
