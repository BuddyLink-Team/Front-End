import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-[#2d3748]/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={cn(
          'relative w-full bg-white rounded-3xl p-6 shadow-[0_16px_40px_-8px_rgba(45,55,72,0.12)] border border-hairline z-10 animate-in fade-in zoom-in-95 duration-150',
          maxWidth,
          className
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};
