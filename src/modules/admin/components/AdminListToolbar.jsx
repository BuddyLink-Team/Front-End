import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { SearchBar } from '../../../components/search/SearchBar';
import { FilterChips } from '../../../components/search/FilterChips';
import { DateRangeFilter } from '../../../components/search/DateRangeFilter';
import { cn } from '../../../utils/cn';

/**
 * AdminListToolbar - the row above every admin table: search, status chips, date range,
 * extra filters and page actions. Stacks into rows on mobile.
 * Pairs with useServerTable: pass `searchInput` / `setSearch`, `filters.x` / `setFilter('x', ...)`.
 *
 * @param {string} [searchValue]
 * @param {Function} [onSearchChange] - Receives the typed text; no search bar when omitted
 * @param {string} [searchPlaceholder='Tìm kiếm...']
 * @param {{ options: Array<object>, selected: string|null, onChange: Function }} [statusChips] - FilterChips props
 * @param {{ from: string, to: string, onChange: Function }} [dateRange] - DateRangeFilter props
 * @param {React.ReactNode} [children] - Extra filters (e.g. a Select), shown after the search bar
 * @param {React.ReactNode} [actions] - Right-aligned buttons (e.g. export)
 * @param {Function} [onExport] - Callback to trigger Excel export
 * @param {boolean} [isExporting=false] - Loading state for Excel export button
 * @param {string} [exportLabel='Xuất Excel']
 * @param {string} [className]
 */
export const AdminListToolbar = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  statusChips,
  dateRange,
  children,
  actions,
  onExport,
  isExporting = false,
  exportLabel = 'Xuất Excel',
  className,
}) => (
  <div className={cn('flex flex-col gap-3', className)}>
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {onSearchChange && (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder={searchPlaceholder}
          className="md:max-w-sm"
        />
      )}
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {(actions || onExport) && (
        <div className="flex items-center gap-2 md:ml-auto">
          {actions}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border-default bg-surface hover:bg-surface-muted text-text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-subtle"
              title="Xuất dữ liệu ra file Excel"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Download className="w-4 h-4 text-text-muted" />
              )}
              <span>{exportLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>

    {(statusChips || dateRange) && (
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        {statusChips && (
          <FilterChips
            options={statusChips.options}
            selected={statusChips.selected}
            onChange={statusChips.onChange}
          />
        )}
        {dateRange && <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={dateRange.onChange} />}
      </div>
    )}
  </div>
);

export default AdminListToolbar;
