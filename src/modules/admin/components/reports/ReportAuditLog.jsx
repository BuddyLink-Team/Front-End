import React from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { formatDateTime } from '../../../../utils/formatters';
import { REPORT_ACTION_LABELS, REPORT_STATUS_DISPLAY } from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

const statusLabel = (status) => REPORT_STATUS_DISPLAY[status]?.label || status;

/**
 * Sanctions applied on this report and its full history, with who did what and when
 */
export const ReportAuditLog = ({ actions = [], history = [] }) => (
  <>
    {actions.length > 0 && (
      <ReportSection icon={ShieldAlert} title="Chế tài đã áp dụng">
        {actions.map((action) => (
          <div key={action.id} className="border-b border-hairline last:border-none pb-2 last:pb-0">
            <p className="font-semibold text-text-primary">
              {REPORT_ACTION_LABELS[action.type] || action.type}
              {action.params?.durationDays ? ` (${action.params.durationDays} ngày)` : ''}
            </p>
            <p className="text-label-sm text-text-muted">
              {formatDateTime(action.performedAt)} · {action.performedBy?.fullName || 'Không rõ'}
            </p>
            {action.note && <p className="text-label-md text-text-primary">{action.note}</p>}
          </div>
        ))}
      </ReportSection>
    )}

    {history.length > 0 && (
      <ReportSection icon={History} title="Nhật ký kiểm duyệt">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 border-b border-hairline last:border-none pb-2.5 last:pb-0">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-label-xs">
                <span className="font-semibold text-text-primary truncate">{entry.by?.fullName || 'Không rõ'}</span>
                <span className="text-text-muted shrink-0">{formatDateTime(entry.at)}</span>
              </div>
              {entry.fromStatus !== entry.toStatus && (
                <p className="text-label-xs text-text-muted">
                  {statusLabel(entry.fromStatus)} → {statusLabel(entry.toStatus)}
                </p>
              )}
              <p className="text-label-md text-text-primary mt-0.5">{entry.note}</p>
            </div>
          </div>
        ))}
      </ReportSection>
    )}
  </>
);

export default ReportAuditLog;
