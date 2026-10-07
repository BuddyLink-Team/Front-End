import React from 'react';
import { cn } from '../../utils/cn';

export const InterestTag = ({ label, className, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-surface-container-low text-secondary-dark border border-surface-container-high transition-colors',
        onClick && 'cursor-pointer hover:bg-surface-container-high',
        className
      )}
    >
      {label}
    </span>
  );
};
