import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, UserX } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import {
  REPORT_ACTION_LABELS,
  getReportCategoryLabel,
} from '../../constants/admin.constants';
import {
  ReportSection,
  ReportSeverityChip,
  ReportStatusChip,
} from './ReportChips';

const toAccountChip = ({ isActive, isBanned, suspensionUntil }) => {
  if (isActive) return { tone: 'success', label: 'Hoạt động' };
  if (isBanned) return { tone: 'danger', label: 'Đã khóa vĩnh viễn' };
  if (suspensionUntil)
    return {
      tone: 'warning',
      label: `Đình chỉ đến ${formatDateTime(suspensionUntil)}`,
    };
  return { tone: 'danger', label: 'Đã khóa' };
};

/**
 * The reported parent: account state, how many violations were already sanctioned (what the sanction
 * matrix counts), the other open cases against them, and their past reports and sanctions on demand.
 */
export const ReportedUserCard = ({ report }) => {
  const { reportedUser } = report;
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const violationCount = reportedUser.priorViolationCount ?? 0;
  const otherCaseCount = (report.otherOpenCases || []).length;

  useEffect(() => {
    setIsHistoryOpen(false);
  }, [report.id]);

  // Other reports against this user and the sanctions they led to, newest first
  const timeline = useMemo(() => {
    const reports = (reportedUser.pastReports || []).map((item) => ({
      key: `report-${item.id}`,
      at: item.createdAt,
      report: item,
    }));
    const sanctions = (reportedUser.previousSanctions || []).map(
      (sanction, index) => ({
        key: `sanction-${sanction.reportId}-${index}`,
        at: sanction.performedAt,
        sanction,
      }),
    );
    return [...reports, ...sanctions].sort(
      (a, b) => new Date(b.at) - new Date(a.at),
    );
  }, [reportedUser]);

  return (
    <ReportSection icon={UserX} title="Người bị báo cáo">
      <div className="flex items-center gap-3">
        <Avatar
          src={reportedUser.avatarUrl}
          alt={reportedUser.fullName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary break-words">
            {reportedUser.fullName}
          </p>
          <p className="text-label-sm text-text-muted break-words">
            {reportedUser.email || '—'}
          </p>
          {reportedUser.phone && (
            <p className="text-label-sm text-text-muted">{reportedUser.phone}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip {...toAccountChip(reportedUser)} />
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-label-xs text-text-primary">
          {violationCount > 0
            ? `Đã vi phạm ${violationCount} lần`
            : 'Chưa có vi phạm nào bị xử lý'}
        </span>
        {otherCaseCount > 0 && (
          <span className="rounded-full bg-tertiary-soft px-2 py-0.5 text-label-xs font-semibold text-tertiary-dark">
            {otherCaseCount} vụ khác đang mở
          </span>
        )}
      </div>

      <button
        type="button"
        aria-expanded={isHistoryOpen}
        onClick={() => setIsHistoryOpen((isOpen) => !isOpen)}
        className="flex w-full items-center justify-between border-t border-hairline pt-3 text-label-md font-semibold text-text-muted hover:text-text-primary"
      >
        <span>Lịch sử báo cáo và chế tài ({timeline.length})</span>
        {isHistoryOpen ? (
          <ChevronUp size={ICON_SIZE.SM} />
        ) : (
          <ChevronDown size={ICON_SIZE.SM} />
        )}
      </button>
      {isHistoryOpen && (
        <div className="space-y-2.5">
          {timeline.length === 0 && (
            <p className="text-text-muted">
              Chưa có báo cáo hoặc chế tài nào trước đây.
            </p>
          )}
          {timeline.map(({ key, at, report: past, sanction }) => (
            <div
              key={key}
              className="flex items-start gap-3 border-b border-hairline pb-2.5 last:border-none last:pb-0"
            >
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                {past ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-text-primary">
                      Báo cáo: {getReportCategoryLabel(past.category)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ReportSeverityChip severity={past.severity} />
                      <ReportStatusChip status={past.status} />
                    </span>
                  </div>
                ) : (
                  <p className="font-medium text-text-primary">
                    Chế tài: {REPORT_ACTION_LABELS[sanction.type] || sanction.type}
                    {sanction.params?.durationDays
                      ? ` (${sanction.params.durationDays} ngày)`
                      : ''}
                  </p>
                )}
                <p className="text-label-sm text-text-muted">
                  {formatDateTime(at)}
                  {sanction?.note ? ` · ${sanction.note}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ReportSection>
  );
};

export default ReportedUserCard;
