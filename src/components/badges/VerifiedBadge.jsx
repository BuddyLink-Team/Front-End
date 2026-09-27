import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export const VerifiedBadge = ({
  text = 'Đã xác thực',
  className,
  showIcon = true,
  size = 'md',
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

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium bg-[#eaf3ec] text-[#3d6841] rounded-full border border-[#d2e7d7] shadow-xs select-none',
        sizes[size],
        className
      )}
    >
      {showIcon && <ShieldCheck className={cn(iconSizes[size], 'text-primary fill-primary/20')} />}
      <span>{text}</span>
    </span>
  );
};
