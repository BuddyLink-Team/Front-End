import React from 'react';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { REPORT_SEVERITY_CONFIG, REPORT_STATUS_DISPLAY, REPORT_UNCLASSIFIED_LABEL } from '../../constants/admin.constants';

const FALLBACK = { tone: 'neutral' };
const SEVERITY_FALLBACK = { tone: 'neutral', label: REPORT_UNCLASSIFIED_LABEL };

export const ReportStatusChip = ({ status }) => {
  const display = REPORT_STATUS_DISPLAY[status] || FALLBACK;
  return <StatusChip status={status} tone={display.tone} label={display.label || status || '—'} />;
};

export const ReportSeverityChip = ({ severity }) => {
  const config = REPORT_SEVERITY_CONFIG[severity] || SEVERITY_FALLBACK;
  return <StatusChip status={severity} tone={config.tone} label={config.label} className={config.className} />;
};

export const ReportOverdueChip = () => <StatusChip tone="danger" label="Quá hạn" />;

/**
 * Titled block of the investigation drawer
 */
export const ReportSection = ({ icon: Icon, title, hint, children }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h5 className="text-label-lg font-semibold text-text-primary flex items-center gap-2">
        {Icon && <Icon size={ICON_SIZE.SM} className="text-primary" />}
        {title}
      </h5>
      {hint && <span className="text-label-xs text-text-muted">{hint}</span>}
    </div>
    <div className="rounded-2xl border border-hairline p-4 bg-surface-container-lowest space-y-3 text-body-md">{children}</div>
  </section>
);
