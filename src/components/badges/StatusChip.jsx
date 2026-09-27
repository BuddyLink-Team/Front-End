import React from 'react';
import { cn } from '../../utils/cn';

export const StatusChip = ({ status, className }) => {
  const normalizedStatus = (status || '').toLowerCase();

  const statusStyles = {
    pending: 'bg-[#fef7e6] text-[#755a1b] border-[#fae4b2]',
    confirmed: 'bg-[#eaf3ec] text-[#3d6841] border-[#d2e7d7]',
    cancelled: 'bg-[#edf2f0] text-[#718096] border-[#d9e2de]',
    reported: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]',
    completed: 'bg-[#e7eeff] text-[#30647b] border-[#b1e4fe]',
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
