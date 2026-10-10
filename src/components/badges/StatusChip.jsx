import React from 'react';
import { cn } from '../../utils/cn';

/**
 * @param {string} status - Picks the color (and the default label)
 * @param {React.ReactNode} [label] - Overrides the default label of the status
 * @param {React.ComponentType} [icon] - Icon shown before the label
 * @param {string} [className]
 */
export const StatusChip = ({ status, label, icon: Icon, className }) => {
  const normalizedStatus = (status || '').toLowerCase();

  const statusStyles = {
    pending: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    confirmed: 'bg-primary-soft text-primary-ink border-primary-border',
    cancelled: 'bg-hairline text-text-muted border-hairline-strong',
    reported: 'bg-error-container text-error border-error-container-hover',
    completed: 'bg-surface-container text-secondary-dark border-secondary-container',
  };

  const statusLabels = {
    pending: 'Chờ phản hồi',
    confirmed: 'Đã xác nhận',
    accepted: 'Đã tham gia',
    declined: 'Đã từ chối',
    cancelled: 'Đã hủy',
    reported: 'Báo cáo vi phạm',
    completed: 'Đã hoàn thành',
    upcoming: 'Sắp diễn ra',
  };

  const currentStyle = statusStyles[normalizedStatus] || statusStyles.pending;
  const currentLabel = label ?? statusLabels[normalizedStatus] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs select-none whitespace-nowrap',
        currentStyle,
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0 stroke-[2.5]" />}
      {currentLabel}
    </span>
  );
};
