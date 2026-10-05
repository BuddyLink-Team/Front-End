import React from 'react';
import { cn } from '../../utils/cn';

export const StatusChip = ({ status, className }) => {
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
    cancelled: 'Đã hủy',
    reported: 'Báo cáo vi phạm',
    completed: 'Đã hoàn thành',
  };

  const currentStyle = statusStyles[normalizedStatus] || statusStyles.pending;
  const currentLabel = statusLabels[normalizedStatus] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs select-none',
        currentStyle,
        className
      )}
    >
      {currentLabel}
    </span>
  );
};
