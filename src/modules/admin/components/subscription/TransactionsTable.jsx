import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DataTable } from '../../../../components/ui/DataTable';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { Pagination } from '../../../../components/navigation/Pagination';
import { AdminListToolbar } from '../AdminListToolbar';
import { useServerTable } from '../../../../hooks/useServerTable';
import { adminSubscriptionApi } from '../../api/adminSubscriptionApi';
import { PaymentDetailModal } from './PaymentDetailModal';
import { Eye } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

const PAYMENT_STATUS_OPTIONS = [
  { value: null, label: 'Tất cả' },
  { value: 'creating', label: 'Khởi tạo' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'success', label: 'Thành công' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'expired', label: 'Hết hạn' },
];

export const TransactionsTable = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const {
    rows,
    pagination,
    isLoading,
    error,
    filters,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
  } = useServerTable({
    fetcher: adminSubscriptionApi.getPayments,
    syncWithUrl: false,
  });

  const columns = [
    {
      header: 'Mã đơn',
      accessorKey: 'orderCode',
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-on-surface">
          #{row.orderCode}
        </span>
      ),
    },
    {
      header: 'Phụ huynh',
      accessorKey: 'parent',
      cell: (row) => (
        <div>
          <div className="font-semibold text-on-surface text-xs">
            {row.parent?.fullName || '—'}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {row.parent?.email || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Gói dịch vụ',
      accessorKey: 'planSnapshot',
      cell: (row) => (
        <div>
          <div className="font-medium text-xs text-on-surface">
            {row.planSnapshot?.name || '—'}
          </div>
          <div className="text-[11px] text-on-surface-variant font-mono">
            {row.planSnapshot?.durationMonths ? `${row.planSnapshot.durationMonths} tháng` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Số tiền',
      accessorKey: 'amount',
      cell: (row) => (
        <span className="font-semibold text-xs text-primary-ink">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (row) => <StatusChip status={row.status} />,
    },
    {
      header: 'Thời gian',
      accessorKey: 'createdAt',
      cell: (row) => (
        <div className="text-[11px] text-on-surface-variant space-y-0.5">
          <div title="Thời gian tạo đơn">
            Tạo: {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YY HH:mm') : '—'}
          </div>
          {row.paidAt && (
            <div className="text-primary-dark font-medium" title="Thời gian thanh toán">
              Trả: {dayjs(row.paidAt).format('DD/MM/YY HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Thời hạn kích hoạt',
      accessorKey: 'effectivePeriod',
      cell: (row) => {
        if (!row.effectivePeriod?.effectiveStartDate) {
          return <span className="text-xs text-on-surface-variant">—</span>;
        }
        return (
          <div className="text-[11px] text-on-surface font-mono">
            <div>{dayjs(row.effectivePeriod.effectiveStartDate).format('DD/MM/YY')}</div>
            <div className="text-on-surface-variant">
              đến {dayjs(row.effectivePeriod.effectiveEndDate).format('DD/MM/YY')}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Thao tác',
      accessorKey: '_id',
      cell: (row) => (
        <button
          type="button"
          onClick={() => setSelectedPaymentId(row.id || row._id)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          title="Xem chi tiết đối soát"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Chi tiết</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm mã đơn hoặc tên phụ huynh..."
        statusChips={{
          options: PAYMENT_STATUS_OPTIONS,
          selected: filters.status || null,
          onChange: (status) => setFilter('status', status),
        }}
        dateRange={{
          from: filters.fromDate || '',
          to: filters.toDate || '',
          onChange: ({ from, to }) => setFilters({ fromDate: from, toDate: to }),
        }}
      />

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        onRowClick={(row) => setSelectedPaymentId(row.id || row._id)}
        emptyMessage={
          error ? 'Đã có lỗi xảy ra khi tải danh sách giao dịch' : 'Không tìm thấy giao dịch nào'
        }
      />

      {pagination.totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <PaymentDetailModal
        paymentId={selectedPaymentId}
        isOpen={Boolean(selectedPaymentId)}
        onClose={() => setSelectedPaymentId(null)}
      />
    </div>
  );
};

export default TransactionsTable;
