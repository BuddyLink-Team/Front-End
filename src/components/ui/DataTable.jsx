import React from 'react';
import { useTableSort } from '../../hooks/useTableSort';
import { LoadingOverlay } from '../feedback/LoadingOverlay';
import { EmptyState } from '../cards/EmptyState';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * DataTable – generic sortable table conforming to BuddyLink design tokens.
 *
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: Function}>} columns
 * @param {Array<object>} rows
 * @param {boolean} [isLoading=false]
 * @param {string} [emptyTitle='Chưa có dữ liệu']
 * @param {string} [emptyMessage='Không có kết quả phù hợp.']
 * @param {Function} [onRowClick]
 * @param {Function} [renderCell]
 * @param {string} [className]
 */
export const DataTable = ({
  columns = [],
  rows = [],
  isLoading = false,
  emptyTitle = 'Chưa có dữ liệu',
  emptyMessage = 'Không có kết quả phù hợp.',
  onRowClick,
  renderCell,
  className,
}) => {
  const { sortKey, sortDir, sortedRows, handleSort } = useTableSort(rows);

  return (
    <div
      className={cn(
        'relative w-full overflow-x-auto rounded-2xl border border-hairline bg-white shadow-xs',
        className
      )}
    >
      <LoadingOverlay show={isLoading} fullPage={false} />

      <table className="w-full text-left border-collapse text-sm">
        {/* Table Head */}
        <thead className="bg-surface-muted/70 border-b border-hairline">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider select-none ${
                  col.sortable
                    ? 'cursor-pointer hover:text-text-primary transition-colors'
                    : ''
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && (
                    <span className="inline-flex text-text-muted">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-hairline">
          {!isLoading && sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8">
                <EmptyState title={emptyTitle} description={emptyMessage} />
              </td>
            </tr>
          ) : (
            sortedRows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-surface-low'
                    : 'hover:bg-gray-50/50'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-text-primary">
                    {renderCell
                      ? renderCell(col.key, row[col.key], row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
