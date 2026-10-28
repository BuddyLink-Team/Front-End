import React from 'react';
import { Eye, Crown } from 'lucide-react';
import { AdminListToolbar } from '../AdminListToolbar';
import { AdminFilterDropdown } from '../AdminFilterDropdown';
import { PaymentDetailModal } from './PaymentDetailModal';
import { DataTable } from '../../../../components/ui/DataTable';
import { Pagination } from '../../../../components/navigation/Pagination';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { useAdminTransactions } from '../../hooks/useAdminTransactions';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CHIPS,
  SUBSCRIPTION_PLAN_FILTER_OPTIONS,
  SUBSCRIPTION_PLAN_NAMES,
  TRANSACTION_STATUS_CHIPS,
} from '../../constants/admin.constants';
import { formatCurrency, formatDateTime } from '../../../../utils/formatters';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

const COLUMNS = [
  { key: 'orderCode', label: 'Mã đơn', headerClassName: 'min-w-col-md' },
  { key: 'parent', label: 'Phụ huynh', headerClassName: 'min-w-col-2xl' },
  { key: 'plan', label: 'Gói dịch vụ', headerClassName: 'min-w-col-plan' },
  { key: 'amount', label: 'Số tiền', align: 'right', headerClassName: 'min-w-col-md' },
  { key: 'paymentMethod', label: 'Phương thức', headerClassName: 'min-w-col-md' },
  { key: 'createdAt', label: 'Thời gian', headerClassName: 'min-w-col-lg' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-md' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions' },
];

/**
 * Transactions tab: payments of every parent, filtered by status, plan and creation date.
 */
export const TransactionsTable = () => {
  const {
    rows,
    pagination,
    isLoading,
    listErrorMessage,
    searchInput,
    setSearch,
    filters,
    setFilter,
    setFilters,
    setPage,
    isDetailOpen,
    detail,
    isDetailLoading,
    detailErrorMessage,
    openDetail,
    closeDetail,
  } = useAdminTransactions();

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'orderCode':
        return <span className="font-mono text-body-md font-semibold text-text-primary">#{row.orderCode}</span>;

      case 'parent':
        return (
          <div className="text-body-md">
            <p className="font-semibold text-text-primary">{row.parent?.fullName || '—'}</p>
            <p className="text-label-md text-text-muted mt-0.5">{row.parent?.email || '—'}</p>
          </div>
        );

      case 'plan': {
        const planCode = row.planSnapshot?.planCode;
        return (
          <span className="text-body-md text-text-primary whitespace-nowrap">
            {SUBSCRIPTION_PLAN_NAMES[planCode] || row.planSnapshot?.name || '—'}
          </span>
        );
      }

      case 'amount':
        return <span className="font-semibold text-text-primary whitespace-nowrap">{formatCurrency(row.amount)}</span>;

      case 'paymentMethod':
        return (
          <span className="text-body-md text-text-muted whitespace-nowrap">
            {PAYMENT_METHOD_LABELS[row.paymentMethod] || row.paymentMethod || '—'}
          </span>
        );

      case 'createdAt':
        return <span className="text-body-md text-text-muted whitespace-nowrap">{formatDateTime(row.createdAt)}</span>;

      case 'status': {
        const chip = PAYMENT_STATUS_CHIPS[row.status];
        return <StatusChip status={chip?.status || row.status} label={chip?.label} />;
      }

      case 'actions':
        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetail(row.id);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-low transition-colors"
              aria-label="Xem chi tiết giao dịch"
            >
              <Eye size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo mã đơn, tên hoặc email phụ huynh..."
        statusChips={{
          options: TRANSACTION_STATUS_CHIPS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
        }}
        dateRange={{
          from: filters.fromDate || '',
          to: filters.toDate || '',
          onChange: ({ from, to }) => setFilters({ fromDate: from || undefined, toDate: to || undefined }),
        }}
      >
        <AdminFilterDropdown
          icon={Crown}
          header="Gói dịch vụ"
          options={SUBSCRIPTION_PLAN_FILTER_OPTIONS}
          value={filters.planCode}
          onChange={(val) => setFilter('planCode', val || undefined)}
        />
      </AdminListToolbar>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        onRowClick={(row) => openDetail(row.id)}
        renderCell={renderCell}
        emptyTitle={listErrorMessage ? 'Không tải được danh sách' : 'Chưa có giao dịch'}
        emptyMessage={listErrorMessage || 'Không tìm thấy giao dịch nào phù hợp với bộ lọc.'}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-md text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} giao dịch)
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            inactiveItemClassName="bg-surface-container-lowest hover:bg-surface-container-low"
          />
        </div>
      )}

      <PaymentDetailModal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        payment={detail}
        isLoading={isDetailLoading}
        errorMessage={detailErrorMessage}
      />
    </div>
  );
};

export default TransactionsTable;
