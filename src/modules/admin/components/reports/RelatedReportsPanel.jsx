import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { formatDateTime } from '../../../../utils/formatters';
import { getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportSection, ReportSeverityChip } from './ReportChips';

/**
 * Other open reports against the same user. They can be closed with this one once it has a
 * suspension or a ban: they then get the same sanction and notes.
 * Without `onToggle` it is a read-only list (the choice is made in the conclusion dialog).
 */
export const RelatedReportsPanel = ({
  reports,
  selectedIds = [],
  onToggle,
  canSelect = false,
}) => {
  const isSelectable = Boolean(onToggle);
  const hint = !isSelectable
    ? 'Có thể đóng cùng khi kết luận báo cáo (cần đình chỉ hoặc khóa tài khoản)'
    : canSelect
      ? 'Chọn để áp dụng cùng chế tài và ghi chú'
      : 'Chọn được khi kết luận có đình chỉ hoặc khóa tài khoản';

  return (
    <ReportSection
      icon={AlertTriangle}
      title={`Báo cáo mở liên quan (${reports.length})`}
      hint={hint}
    >
      {reports.map((related) => {
        const label = getReportCategoryLabel(related.category);
        const description = `Từ: ${related.reporterName} · ${formatDateTime(related.createdAt)}`;
        return (
          <div
            key={related.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-hairline"
          >
            {isSelectable ? (
              <Checkbox
                checked={selectedIds.includes(related.id)}
                onChange={() => onToggle(related.id)}
                disabled={!canSelect}
                label={label}
                description={description}
              />
            ) : (
              <div className="min-w-0">
                <p className="text-label-lg text-text-primary">{label}</p>
                <p className="text-label-sm text-text-muted">{description}</p>
              </div>
            )}
            <ReportSeverityChip severity={related.severity} />
          </div>
        );
      })}
    </ReportSection>
  );
};

export default RelatedReportsPanel;
