import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import { formatDateTime } from '../../../../utils/formatters';
import { REPORT_ACTION_LABELS, getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportSection, ReportSeverityChip, ReportStatusChip } from './ReportChips';

/**
 * Timeline of the other reports against this user and the sanctions they led to, newest first
 */
export const ReportedUserHistory = ({ reportedUser }) => {
  const timeline = useMemo(() => {
    const reports = (reportedUser.pastReports || []).map((report) => ({
      key: `report-${report.id}`,
      at: report.createdAt,
      report,
    }));
    const sanctions = (reportedUser.previousSanctions || []).map((sanction, index) => ({
      key: `sanction-${sanction.reportId}-${index}`,
      at: sanction.performedAt,
      sanction,
    }));
    return [...reports, ...sanctions].sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [reportedUser]);

  return (
    <ReportSection icon={History} title="Lịch sử của người bị báo cáo">
      {timeline.length === 0 && <p className="text-text-muted">Chưa có báo cáo hoặc chế tài nào trước đây.</p>}
      {timeline.map(({ key, at, report, sanction }) => (
        <div key={key} className="flex items-start gap-3 border-b border-hairline last:border-none pb-2.5 last:pb-0">
          <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
          <div className="min-w-0 flex-1">
            {report ? (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-medium text-text-primary">
                  Báo cáo: {getReportCategoryLabel(report.category)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ReportSeverityChip severity={report.severity} />
                  <ReportStatusChip status={report.status} />
                </span>
              </div>
            ) : (
              <p className="font-medium text-text-primary">
                Chế tài: {REPORT_ACTION_LABELS[sanction.type] || sanction.type}
                {sanction.params?.durationDays ? ` (${sanction.params.durationDays} ngày)` : ''}
              </p>
            )}
            <p className="text-label-sm text-text-muted">
              {formatDateTime(at)}
              {sanction?.note ? ` · ${sanction.note}` : ''}
            </p>
          </div>
        </div>
      ))}
    </ReportSection>
  );
};

export default ReportedUserHistory;
