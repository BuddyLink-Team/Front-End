import React from 'react';
import { SlidersHorizontal, ChevronDown, Baby, Zap, MapPin } from 'lucide-react';
import { UpgradeButton } from '../../../components/ui/UpgradeButton';
import { Select } from '../../../components/ui/Select';
import { cn } from '../../../utils/cn';

const CHIP_CLASS =
  'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 hover:border-primary hover:bg-primary-soft text-on-surface text-xs font-medium transition-all shadow-xs';

/**
 * @param {Object} props
 * @param {Object} props.meta - Discovery meta (isPremium...)
 * @param {string} props.remainingViewsLabel
 * @param {string} props.searchingForLabel - Name of the child the matches are for
 * @param {Array<{value: string, label: string}>} props.childOptions - The parent's children
 * @param {string|null} props.selectedChildId
 * @param {(childId: string) => void} props.onSelectChild
 * @param {{ hasActiveFilter: boolean, distanceLabel: string, ageLabel: string }} props.filterSummary
 * @param {() => void} props.onOpenFilter
 * @param {() => void} props.onUpgrade
 */
export const DiscoveryFilterBar = ({
  meta,
  remainingViewsLabel,
  searchingForLabel,
  childOptions = [],
  selectedChildId,
  onSelectChild,
  filterSummary,
  onOpenFilter,
  onUpgrade,
}) => {
  const { hasActiveFilter, distanceLabel, ageLabel } = filterSummary;
  const hasSeveralChildren = childOptions.length > 1;

  return (
    <div className="w-full max-w-[740px] flex flex-col gap-3 mb-3 z-10 relative">
      {/* Top bar: children being matched + quota + upgrade */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full bg-surface-container-lowest p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-outline-variant/40 shadow-sm transition-all">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2.5 bg-surface-container-low border border-outline-variant/30 px-3 py-1.5 rounded-xl shadow-sm">
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary-on-fixed flex items-center justify-center shadow-xs flex-shrink-0">
              <Baby size={16} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-on-surface-variant font-medium leading-none">Đang tìm bạn cho:</span>
              {hasSeveralChildren ? (
                <Select
                  aria-label="Chọn bé để tìm bạn"
                  options={childOptions}
                  value={selectedChildId || ''}
                  onChange={(e) => onSelectChild(e.target.value)}
                  placeholder=""
                  className="mt-1 py-1 pl-2.5 pr-8 text-sm font-bold text-on-surface min-w-[140px]"
                />
              ) : (
                <span className="text-sm font-bold text-on-surface leading-tight mt-0.5">{searchingForLabel}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-surface-container-high/60">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-1 text-tertiary-dark">
              <Zap size={14} strokeWidth={1.75} />
              <span className="text-xs font-semibold text-on-surface">{remainingViewsLabel}</span>
            </div>
          </div>
          {!meta?.isPremium && (
            <UpgradeButton size="sm" onClick={onUpgrade} className="flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Bottom bar: quick filter chips + filter button */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Distance chip */}
          <button type="button" onClick={onOpenFilter} className={CHIP_CLASS}>
            <MapPin size={13} strokeWidth={1.75} className="text-primary" />
            <span className="text-on-surface-variant group-hover:text-on-surface">Bán kính:</span>
            <span className="font-semibold text-primary">{distanceLabel}</span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
          {/* Age chip */}
          <button type="button" onClick={onOpenFilter} className={CHIP_CLASS}>
            <Baby size={13} strokeWidth={1.75} className="text-primary" />
            <span className="text-on-surface-variant group-hover:text-on-surface">Độ tuổi:</span>
            <span className="font-semibold text-primary">{ageLabel}</span>
            <ChevronDown size={14} strokeWidth={1.75} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
        </div>
        {/* Advanced filter toggle button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-xs',
            hasActiveFilter
              ? 'bg-primary-soft border-primary text-primary-ink'
              : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary',
          )}
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          Bộ lọc
          {hasActiveFilter && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-primary-on-primary text-[10px] flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
