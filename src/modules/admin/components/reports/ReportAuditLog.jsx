import React from 'react';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import {
  CheckCircle2,
  History,
  Scale,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';
import { formatDateTime } from '../../../../utils/formatters';
import {
  REPORT_ACTION_LABELS,
  REPORT_STATUS_DISPLAY,
  formatPolicyClause,
} from '../../constants/admin.constants';
import { ReportSection } from './ReportChips';

const statusLabel = (status) => REPORT_STATUS_DISPLAY[status]?.label || status;

/**
 * Sanctions applied on this report and its full immutable audit history (ReportAuditLog),
 * including Policy Override justifications for Super Admin inspection.
 */
export const ReportAuditLog = ({ actions = [], history = [] }) => (
  <>
    {actions.length > 0 && (
      <ReportSection icon={ShieldAlert} title="Chế tài đã áp dụng">
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`rounded-xl border p-3 space-y-1.5 ${
                action.isPolicyOverride
                  ? 'border-tertiary-border bg-tertiary-soft'
                  : 'border-hairline bg-surface-container-low/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-text-primary">
                  {REPORT_ACTION_LABELS[action.type] || action.type}
                  {action.params?.durationDays
                    ? ` (${action.params.durationDays} ngày)`
                    : ''}
                </p>
                {action.isPolicyOverride ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-soft px-2.5 py-0.5 text-label-xs font-bold text-tertiary-dark border border-tertiary-border">
                    <TriangleAlert size={ICON_SIZE.XS} />
                    Ngoại lệ chính sách
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-label-xs font-semibold text-primary-ink border border-primary-border">
                    <CheckCircle2 size={ICON_SIZE.XS} />
                    Đúng khung quy chuẩn
                  </span>
                )}
              </div>

              <p className="text-label-xs text-text-muted">
                {formatDateTime(action.performedAt)} · Quản trị viên:{' '}
                <strong className="text-text-primary">
                  {action.performedBy?.fullName || 'Không rõ'}
                </strong>
              </p>

              {action.policyClause && (
                <p className="flex items-center gap-1 text-label-xs text-text-muted">
                  <Scale
                    size={ICON_SIZE.XS}
                    className="shrink-0 text-primary"
                  />
                  <span>
                    Điều khoản tham chiếu:{' '}
                    {formatPolicyClause(action.policyClause)}
                  </span>
                </p>
              )}

              {action.isPolicyOverride && action.overrideReason && (
                <div className="mt-1.5 rounded-lg border border-tertiary-border bg-surface-container-lowest px-3 py-2 text-label-xs text-tertiary-dark">
                  <span className="font-bold block text-tertiary-dark">
                    Lý do giải trình ngoại lệ (lưu để hậu kiểm):
                  </span>
                  <span className="italic">
                    &ldquo;{action.overrideReason}&rdquo;
                  </span>
                </div>
              )}

              {action.note && (
                <p className="text-label-sm text-text-primary pt-0.5">
                  <span className="text-text-muted">Ghi chú: </span>
                  {action.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </ReportSection>
    )}

    {history.length > 0 && (
      <ReportSection icon={History} title="Nhật ký thao tác">
        <div className="space-y-2.5">
          {history.map((entry) => {
            const isOverrideEvent =
              entry.eventType === 'policy_overridden' ||
              entry.metadata?.isPolicyOverride;
            const isLiftedEvent = entry.eventType === 'sanction_lifted';
            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 border-b border-hairline last:border-none pb-2.5 last:pb-0 ${
                  isOverrideEvent
                    ? 'rounded-lg bg-tertiary-soft px-2.5 py-2 border border-tertiary-border'
                    : ''
                }`}
              >
                <div
                  className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                    isOverrideEvent ? 'bg-tertiary-dark' : 'bg-primary'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-label-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-primary truncate">
                        {entry.by?.fullName || 'Hệ thống / Sentinel AI'}
                      </span>
                      {isOverrideEvent && (
                        <span className="rounded bg-tertiary-soft px-1.5 py-0.5 text-label-xs font-bold text-tertiary-dark">
                          Ngoại lệ chính sách
                        </span>
                      )}
                      {isLiftedEvent && (
                        <span className="rounded bg-error-soft px-1.5 py-0.5 text-label-xs font-bold text-error-dark">
                          Hình phạt chấm dứt sớm
                        </span>
                      )}
                    </div>
                    <span className="text-text-muted shrink-0">
                      {formatDateTime(entry.at)}
                    </span>
                  </div>
                  {entry.fromStatus !== entry.toStatus && (
                    <p className="text-label-xs text-text-muted">
                      {statusLabel(entry.fromStatus)} →{' '}
                      {statusLabel(entry.toStatus)}
                    </p>
                  )}
                  <p className="text-label-md text-text-primary mt-0.5">
                    {entry.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ReportSection>
    )}
  </>
);

export default ReportAuditLog;
