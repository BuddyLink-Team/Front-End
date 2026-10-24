import React from 'react';
import { cn } from '../../utils/cn';

const TONE_STYLES = {
  success: 'bg-primary-soft text-primary-ink border-primary-border',
  warning: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
  danger: 'bg-error-container text-error border-error-container-hover',
  info: 'bg-surface-container text-secondary-dark border-secondary-container',
  neutral: 'bg-hairline text-text-muted border-hairline-strong',
};

// Statuses not listed here (e.g. accepted, declined, upcoming) keep the warning tone
const STATUS_TONES = {
  pending: 'warning',
  creating: 'warning',
  confirmed: 'success',
  active: 'success',
  success: 'success',
  completed: 'info',
  cancelled: 'neutral',
  expired: 'neutral',
  removed: 'neutral',
  archived: 'neutral',
  reported: 'danger',
  locked: 'danger',
  failed: 'danger',
};

const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  confirmed: 'Đã xác nhận',
  accepted: 'Đã tham gia',
  declined: 'Đã từ chối',
  cancelled: 'Đã hủy',
  reported: 'Báo cáo vi phạm',
  completed: 'Đã hoàn thành',
  upcoming: 'Sắp diễn ra',
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
  expired: 'Đã hết hạn',
  creating: 'Đang khởi tạo',
  success: 'Thành công',
  failed: 'Thất bại',
  removed: 'Đã gỡ',
  archived: 'Đã xóa',
};

/**
 * @param {string} status - Picks the color (and the default label)
 * @param {React.ReactNode} [label] - Overrides the default label of the status
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [tone] - Overrides the color picked from `status`
 * @param {React.ComponentType} [icon] - Icon shown before the label
 * @param {string} [className]
 */
export const StatusChip = ({ status, label, tone, icon: Icon, className }) => {
  const normalizedStatus = (status || '').toLowerCase();

  const currentStyle = TONE_STYLES[tone] || TONE_STYLES[STATUS_TONES[normalizedStatus]] || TONE_STYLES.warning;
  const currentLabel = label ?? STATUS_LABELS[normalizedStatus] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs select-none whitespace-nowrap',
        currentStyle,
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0 stroke-2.5" />}
      {currentLabel}
    </span>
  );
};
