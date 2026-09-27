import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({
  children,
  className,
  hoverable = false,
  padding = 'default',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-5 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div
      className={cn(
        'bg-white border border-hairline rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200',
        paddingStyles[padding],
        hoverable && 'hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
