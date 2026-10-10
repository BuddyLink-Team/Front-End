import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const FOCUSABLE_SELECTOR =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// Open modals, newest last: only the top one reacts to Escape / Tab
const openModalStack = [];

/**
 * Modal with a fixed header and footer: only the body scrolls when the content is long.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {React.ReactNode} [title] - Header with a close button; no header when omitted
 * @param {React.ReactNode} children - Body (scrollable)
 * @param {React.ReactNode} [footer] - Actions pinned at the bottom (e.g. Cancel / Submit).
 *   A submit button outside the <form> uses the `form` attribute: <Button type="submit" form="form-id">
 * @param {string} [maxWidth='max-w-lg']
 * @param {string} [className] - Extra classes for the modal box
 * @param {string} [bodyClassName] - Extra classes for the scrollable body
 * @param {string} [footerClassName] - Extra classes for the footer (default: actions aligned right)
 * @param {'center'|'sheet'} [placement='center'] - 'sheet' slides from the bottom on mobile (bottom sheet)
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className,
  bodyClassName,
  footerClassName,
  placement = 'center',
}) => {
  const isSheet = placement === 'sheet';
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Lock page scroll, close on Escape, keep Tab focus inside, restore focus on close
  useEffect(() => {
    if (!isOpen) return undefined;

    const modalId = Symbol('modal');
    openModalStack.push(modalId);
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keep a field the content auto-focused, otherwise focus the dialog itself
    if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
      dialogRef.current.focus();
    }

    const handleKeyDown = (event) => {
      if (openModalStack.at(-1) !== modalId || !dialogRef.current) return;

      if (event.key === 'Escape') {
        closeRef.current?.();
        return;
      }
      if (event.key === 'Tab') {
        const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      openModalStack.splice(openModalStack.indexOf(modalId), 1);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[200] flex justify-center',
        isSheet ? 'items-end sm:items-center sm:p-4' : 'items-center p-4'
      )}
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-text-primary/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box: header and footer stay fixed, the body scrolls */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'relative w-full max-h-[90vh] flex flex-col outline-none bg-surface-container-lowest shadow-[0_16px_40px_-8px_rgba(45,55,72,0.12)] border border-hairline z-10 animate-in fade-in duration-150',
          isSheet ? 'rounded-t-3xl sm:rounded-3xl max-h-[85vh] sm:max-h-[90vh]' : 'rounded-3xl zoom-in-95',
          maxWidth,
          className
        )}
      >
        {title && (
          <div className="shrink-0 flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-hairline">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className={cn('flex-1 min-h-0 overflow-y-auto px-6 py-4', bodyClassName)}>{children}</div>

        {footer && (
          <div
            className={cn(
              'shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
