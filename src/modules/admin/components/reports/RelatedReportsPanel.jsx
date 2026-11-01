import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { formatDateTime } from '../../../../utils/formatters';
import { getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportSection, ReportSeverityChip } from './ReportChips';

/**
 * Other open reports against the same user. They can be closed with this one once it has a
 * suspension or a ban: they then get the same sanction and notes.
 */
export const RelatedReportsPanel = ({ reports, selectedIds, onToggle, canSelect }) => (
  <ReportSection
    icon={AlertTriangle}
    title={`Báo cáo mở liên quan (${reports.length})`}
    hint={canSelect ? 'Chọn để áp dụng cùng chế tài và ghi chú' : 'Chọn được sau khi đình chỉ hoặc khóa tài khoản'}
  >
    {reports.map((related) => (
      <div key={related.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-hairline">
        <Checkbox
          checked={selectedIds.includes(related.id)}
          onChange={() => onToggle(related.id)}
          disabled={!canSelect}
          label={getReportCategoryLabel(related.category)}
          description={`Từ: ${related.reporterName} · ${formatDateTime(related.createdAt)}`}
        />
        <ReportSeverityChip severity={related.severity} />
      </div>
    ))}
  </ReportSection>
);

export default RelatedReportsPanel;
