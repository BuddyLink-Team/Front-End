import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';

export const DiscoveryFilterBar = ({ meta, onOpenFilter }) => {
  const filters = useSelector((s) => s.discovery?.filters);
  const hasActiveFilter =
    filters &&
    (filters.maxDistance !== 20 ||
      filters.minAge !== 1 ||
      filters.maxAge !== 12 ||
      filters.personalities?.length > 0);

  return (
    <div className="w-full max-w-[740px] flex flex-col gap-3 mb-6 z-10 relative">
      {/* Top bar: child selector + quota + upgrade */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full bg-surface-container-lowest p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-outline-variant/40 shadow-sm transition-all">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5 bg-surface-container-low hover:bg-surface-container hover:border-primary-container border border-outline-variant/30 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-sm shadow-xs flex-shrink-0">
              🐻
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-on-surface-variant font-medium leading-none">
                Đang tìm bạn cho:
              </span>
              <span className="text-sm font-bold text-on-surface leading-tight mt-0.5 group-hover:text-primary transition-colors">
                Bé của bạn
              </span>
            </div>
            <ChevronDown size={18} strokeWidth={1.5} className="text-on-surface-variant ml-1" />
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/60">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-1 text-tertiary">
              <span className="text-base">⚡</span>
              <span className="text-xs font-semibold text-on-surface">
                {meta?.remainingViews !== undefined ? `${meta.remainingViews} lượt` : '...'}
              </span>
            </div>
          </div>
          {!meta?.isPremium && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold hover:bg-tertiary-container hover:text-on-tertiary-container transition-all shadow-sm active:scale-95 flex-shrink-0"
              type="button"
            >
              <span className="text-xs">👑</span>
              <span className="font-medium">Nâng cấp</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom bar: quick filter chips + filter button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Distance chip */}
          <button
            type="button"
            onClick={onOpenFilter}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:border-primary hover:bg-[#E8F3EB]/60 text-on-surface text-xs font-medium transition-all shadow-xs"
          >
            <span className="text-xs">📍</span>
            <span className="text-on-surface-variant group-hover:text-on-surface">Bán kính:</span>
            <span className="font-semibold text-primary">
              {filters?.maxDistance && filters.maxDistance !== 20 ? `${filters.maxDistance} km` : 'Tất cả'}
            </span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
          {/* Age chip */}
          <button
            type="button"
            onClick={onOpenFilter}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:border-primary hover:bg-[#E8F3EB]/60 text-on-surface text-xs font-medium transition-all shadow-xs"
          >
            <span className="text-xs">👶</span>
            <span className="text-on-surface-variant group-hover:text-on-surface">Độ tuổi:</span>
            <span className="font-semibold text-primary">
              {(filters?.minAge !== 1 || filters?.maxAge !== 12) && filters?.minAge !== undefined
                ? `${filters.minAge}-${filters.maxAge} tuổi`
                : 'Tất cả'}
            </span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
        </div>
        {/* Advanced filter toggle button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-xs
            ${hasActiveFilter
              ? 'bg-primary-container border-primary text-on-primary-container'
              : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          Bộ lọc
          {hasActiveFilter && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">!</span>
          )}
        </button>
      </div>
    </div>
  );
};
