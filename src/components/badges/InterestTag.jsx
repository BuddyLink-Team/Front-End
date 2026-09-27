import React from 'react';
import { cn } from '../../utils/cn';

export const InterestTag = ({ label, className, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#f0f3ff] text-[#30647b] border border-[#dee8ff] transition-colors',
        onClick && 'cursor-pointer hover:bg-[#dee8ff]',
        className
      )}
    >
      {label}
    </span>
  );
};
