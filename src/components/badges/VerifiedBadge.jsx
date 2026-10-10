import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const VerifiedBadge = ({
  text = 'Đã xác thực',
  className,
  showIcon = true,
  size = 'md',
  iconOnly = false,
}) => {
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Compact rows (member lists, side panels): only the shield, label kept for tooltip / screen readers
  if (iconOnly) {
    return (
      <ShieldCheck
        role="img"
        aria-label={text}
        className={cn(iconSizes[size], 'shrink-0 text-primary fill-primary/20', className)}
      >
        <title>{text}</title>
      </ShieldCheck>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium bg-primary-soft text-primary-ink rounded-full border border-primary-border shadow-xs select-none',
        sizes[size],
        className
      )}
    >
      {showIcon && <ShieldCheck className={cn(iconSizes[size], 'text-primary fill-primary/20')} />}
      <span>{text}</span>
    </span>
  );
};
