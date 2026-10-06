import React from 'react';
import { cn } from '../../utils/cn';

/**
 * LoadingOverlay – semi-transparent backdrop loader with spinner.
 *
 * @param {boolean} [show=true]
 * @param {string} [message='Đang tải...']
 * @param {boolean} [fullPage=false]
 */
export const LoadingOverlay = ({
  show = true,
  message = 'Đang tải...',
  fullPage = false,
  className,
}) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        fullPage ? 'fixed inset-0 z-[200]' : 'absolute inset-0 z-10',
        'flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs transition-opacity',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3.5 bg-white border border-hairline rounded-2xl px-8 py-6 shadow-[0_16px_40px_-8px_rgba(45,55,72,0.1)]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-surface-container-high" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-medium text-text-primary">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
