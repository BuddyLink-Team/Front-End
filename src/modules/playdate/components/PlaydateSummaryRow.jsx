import React from 'react';

/**
 * One row of the playdate summary panel (create & detail pages)
 */
export const PlaydateSummaryRow = ({ icon: Icon, label, value, placeholder = 'Chưa chọn' }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary-dark flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`text-sm truncate ${value ? 'font-medium text-text-primary' : 'text-text-muted/70'}`}>
        {value || placeholder}
      </p>
    </div>
  </div>
);

export default PlaydateSummaryRow;
