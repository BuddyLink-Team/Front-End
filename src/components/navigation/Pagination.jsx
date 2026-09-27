import React from 'react';
import { usePagination } from '../../hooks/usePagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Pagination – page numbering control with ellipsis support.
 *
 * @param {number} [currentPage=1]
 * @param {number} [totalPages=1]
 * @param {Function} onPageChange
 * @param {boolean} [showPageNumbers=true]
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  className,
}) => {
  const { isPrevDisabled, isNextDisabled, pages } = usePagination(
    currentPage,
    totalPages
  );

  const baseBtnClass =
    'min-w-[36px] h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 select-none';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Prev button */}
      <button
        onClick={() => !isPrevDisabled && onPageChange?.(currentPage - 1)}
        disabled={isPrevDisabled}
        aria-label="Trang trước"
        className={cn(
          baseBtnClass,
          'px-2.5 gap-1 border border-hairline text-text-muted hover:bg-surface-low hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Numbered buttons */}
      {showPageNumbers &&
        pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className={cn(baseBtnClass, 'text-text-muted cursor-default')}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                baseBtnClass,
                page === currentPage
                  ? 'bg-primary text-white shadow-xs'
                  : 'border border-hairline text-text-muted hover:bg-surface-low hover:text-text-primary'
              )}
            >
              {page}
            </button>
          )
        )}

      {/* Next button */}
      <button
        onClick={() => !isNextDisabled && onPageChange?.(currentPage + 1)}
        disabled={isNextDisabled}
        aria-label="Trang sau"
        className={cn(
          baseBtnClass,
          'px-2.5 gap-1 border border-hairline text-text-muted hover:bg-surface-low hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
