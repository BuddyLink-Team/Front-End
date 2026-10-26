import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DataTable } from '../../../../components/ui/DataTable';
import { Pagination } from '../../../../components/navigation/Pagination';
import { useServerTable } from '../../../../hooks/useServerTable';
import { adminSubscriptionApi } from '../../api/adminSubscriptionApi';
import { PaymentDetailModal } from './PaymentDetailModal';
import { Search, Eye, QrCode, Calendar } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

const PLAN_BADGE_MAP = {
  free: { label: 'Free', className: 'bg-slate-200 text-black font-medium' },
  premium_monthly: { label: 'Premium Tháng', className: 'bg-green-200 text-black font-semibold' },
  premium_yearly: { label: 'Premium Năm', className: 'bg-blue-200 text-black font-semibold' },
};

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'success', label: 'Thành công (Success)' },
  { value: 'pending', label: 'Chờ thanh toán (Pending)' },
  { value: 'creating', label: 'Khởi tạo (Creating)' },
  { value: 'failed', label: 'Thất bại (Failed)' },
  { value: 'cancelled', label: 'Đã hủy (Cancelled)' },
  { value: 'expired', label: 'Hết hạn (Expired)' },
];

const STATUS_CONFIG = {
  creating: { label: 'Khởi tạo', className: 'bg-surface-container text-on-surface-variant', dot: 'bg-outline' },
  pending: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  success: { label: 'Thành công', className: 'bg-primary-soft text-primary-dark font-semibold', dot: 'bg-primary' },
  failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800 font-semibold', dot: 'bg-red-500' },
  cancelled: { label: 'Đã hủy', className: 'bg-orange-100 text-orange-800 font-semibold', dot: 'bg-orange-500' },
  expired: { label: 'Hết hạn', className: 'bg-surface-container-highest text-on-surface-variant', dot: 'bg-outline' },
};

export const TransactionsTable = () => {
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

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleOpenDetail = async (id) => {
    setSelectedPaymentId(id);
    setIsDetailLoading(true);
    try {
      const res = await adminSubscriptionApi.getPaymentDetail(id);
      setPaymentDetail(res?.data || res);
    } catch {
      setPaymentDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'orderCode',
      label: 'Mã giao dịch',
      cell: (row) => (
        <span className="font-mono text-xs text-secondary font-bold">
          #{row.orderCode || row.id?.slice(-8)}
        </span>
      ),
    },
    {
      key: 'parent',
      label: 'Phụ huynh',
      cell: (row) => (
        <div>
          <div className="font-semibold text-on-surface text-xs">
            {row.parent?.fullName || 'Chưa cập nhật'}
          </div>
          <div className="text-xs text-on-surface-variant">
            {row.parent?.email || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'planSnapshot',
      label: 'Gói dịch vụ',
      cell: (row) => {
        const planCode = row.planSnapshot?.planCode || row.planCode;
        const badge = PLAN_BADGE_MAP[planCode] || {
          label: row.planSnapshot?.name || 'Gói dịch vụ',
          className: 'bg-slate-200 text-black font-medium',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Số tiền',
      cell: (row) => (
        <span className="font-semibold text-on-surface text-xs">
          {formatCurrency(row.amount)} {row.currency || 'đ'}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface">
          <QrCode className="w-3.5 h-3.5 text-secondary" />
          <span>{row.paymentMethod === 'payos' ? 'VietQR' : row.paymentMethod || 'PayOS'}</span>
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      cell: (row) => (
        <span className="text-xs text-on-surface-variant font-mono">
          {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      cell: (row) => {
        const conf = STATUS_CONFIG[row.status] || {
          label: row.status,
          className: 'bg-surface-container text-on-surface',
          dot: 'bg-outline',
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs ${conf.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      cell: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(row.id || row._id)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
            title="Xem chi tiết Hóa đơn e-Invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-hairline shadow-xs overflow-hidden">
      {/* Toolbar Search & Filter */}
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-on-surface">
              Lịch sử Đối soát &amp; Giao dịch Thanh toán
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">
              Thời gian thực
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Xử lý hóa đơn điện tử e-Invoice, sao kê cổng thanh toán và quản lý đối soát.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mã GD (#BL-...) hoặc phụ huynh..."
              className="pl-9 pr-3 py-1.5 rounded-full bg-surface-container-low text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-60 border-0"
            />
          </div>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value || null)}
            className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface text-xs border-0 focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {PAYMENT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Date range inputs */}
          <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-hairline">
            <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => setFilters({ fromDate: e.target.value })}
              className="bg-transparent border-0 p-0 text-xs text-on-surface focus:ring-0"
              title="Từ ngày"
            />
            <span className="text-xs text-on-surface-variant">-</span>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => setFilters({ toDate: e.target.value })}
              className="bg-transparent border-0 p-0 text-xs text-on-surface focus:ring-0"
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        onRowClick={(row) => handleOpenDetail(row.id || row._id)}
        emptyMessage={
          error ? 'Đã có lỗi xảy ra khi tải danh sách giao dịch' : 'Không tìm thấy giao dịch nào phù hợp.'
        }
      />

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="p-4 bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-hairline">
          <div className="text-xs text-on-surface-variant">
            Hiển thị trang {pagination.page} trong tổng số {pagination.totalPages || 1} trang ({pagination.total} giao dịch)
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* e-Invoice Detail Modal */}
      <PaymentDetailModal
        payment={paymentDetail}
        isOpen={Boolean(selectedPaymentId)}
        onClose={() => {
          setSelectedPaymentId(null);
          setPaymentDetail(null);
        }}
        isLoading={isDetailLoading}
      />
    </div>
  );
};

export default TransactionsTable;
