import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DataTable } from '../../../../components/ui/DataTable';
import { Avatar } from '../../../../components/ui/Avatar';
import { Pagination } from '../../../../components/navigation/Pagination';
import { useServerTable } from '../../../../hooks/useServerTable';
import { adminSubscriptionApi } from '../../api/adminSubscriptionApi';
import { Search, Eye } from 'lucide-react';

const PLAN_BADGE_MAP = {
  free: { label: 'Free', className: 'bg-slate-200 text-black font-medium' },
  premium_monthly: { label: 'Premium Tháng', className: 'bg-green-200 text-black font-semibold' },
  premium_yearly: { label: 'Premium Năm', className: 'bg-blue-200 text-black font-semibold' },
};

const PLAN_OPTIONS = [
  { value: '', label: 'Tất cả gói' },
  { value: 'free', label: 'Free (Miễn phí)' },
  { value: 'premium_monthly', label: 'Premium Tháng' },
  { value: 'premium_yearly', label: 'Premium Năm' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động (Active)' },
  { value: 'expired', label: 'Đã hết hạn (Expired)' },
];

export const SubscribersTable = () => {
  const {
    rows,
    pagination,
    isLoading,
    error,
    filters,
    searchInput,
    setSearch,
    setFilter,
    setPage,
  } = useServerTable({
    fetcher: adminSubscriptionApi.getSubscriptions,
    syncWithUrl: false,
  });

  const [selectedSub, setSelectedSub] = useState(null);

  const columns = [
    {
      key: 'parent',
      label: 'Phụ huynh & Tài khoản',
      cell: (row) => (
        <div>
          <div className="font-semibold text-on-surface text-xs">
            {row.parent?.fullName || 'Chưa cập nhật tên'}
          </div>
          <div className="text-xs text-on-surface-variant">
            {row.parent?.email || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'planCode',
      label: 'Gói dịch vụ',
      cell: (row) => {
        const badge = PLAN_BADGE_MAP[row.planCode] || {
          label: row.planCode || 'Free',
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
      key: 'startDate',
      label: 'Ngày bắt đầu',
      cell: (row) => (
        <span className="text-xs text-on-surface-variant">
          {row.startDate ? dayjs(row.startDate).format('DD/MM/YYYY') : '—'}
        </span>
      ),
    },
    {
      key: 'endDate',
      label: 'Kỳ hạn kế tiếp',
      cell: (row) => {
        if (!row.endDate) {
          return <span className="text-xs text-on-surface-variant">Vô thời hạn</span>;
        }
        const isExpired = dayjs(row.endDate).isBefore(dayjs());
        return (
          <span className={`text-xs font-medium ${isExpired ? 'text-error' : 'text-on-surface'}`}>
            {dayjs(row.endDate).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      key: 'purchasedMonths',
      label: 'Tích lũy',
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-xs font-medium">
          {row.purchasedMonths ? `${row.purchasedMonths} tháng` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      cell: (row) => {
        const isActive = row.status === 'active';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-primary-soft text-primary-dark'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-outline'}`} />
            {isActive ? 'Active' : 'Expired'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      cell: (row) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSelectedSub(row)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
            title="Xem chi tiết hồ sơ thuê bao"
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
            <h2 className="text-base font-bold text-on-surface">Danh sách Thuê bao Hội viên</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold">
              {pagination.total || 0} Thuê bao
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Quản lý kỳ hạn, số tháng tích lũy và kiểm soát gia hạn tài khoản phụ huynh.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên phụ huynh, email..."
              className="pl-9 pr-3 py-1.5 rounded-full bg-surface-container-low text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-56 border-0"
            />
          </div>

          <select
            value={filters.planCode || ''}
            onChange={(e) => setFilter('planCode', e.target.value || null)}
            className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface text-xs border-0 focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value || null)}
            className="px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface text-xs border-0 focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={isLoading}
        emptyMessage={error ? 'Đã có lỗi xảy ra khi tải danh sách' : 'Không tìm thấy thuê bao nào phù hợp.'}
      />

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="p-4 bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-hairline">
          <div className="text-xs text-on-surface-variant">
            Hiển thị trang {pagination.page} trong tổng số {pagination.totalPages || 1} trang ({pagination.total} thuê bao)
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

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-on-surface">Chi tiết Thuê bao</h3>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                <Avatar
                  src={selectedSub.parent?.avatarUrl}
                  alt={selectedSub.parent?.fullName || 'Parent'}
                  size="md"
                  fallbackText={selectedSub.parent?.fullName || 'PH'}
                />
                <div>
                  <div className="font-semibold text-sm text-on-surface">{selectedSub.parent?.fullName}</div>
                  <div className="text-on-surface-variant">{selectedSub.parent?.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 border border-hairline rounded-xl">
                <div>
                  <span className="text-on-surface-variant block">Gói hiện tại:</span>
                  <span className="font-semibold text-on-surface capitalize">{selectedSub.planCode}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Trạng thái:</span>
                  <span className="font-semibold capitalize text-primary">{selectedSub.status}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Ngày bắt đầu:</span>
                  <span className="font-mono">{selectedSub.startDate ? dayjs(selectedSub.startDate).format('DD/MM/YYYY HH:mm') : '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Ngày hết hạn:</span>
                  <span className="font-mono">{selectedSub.endDate ? dayjs(selectedSub.endDate).format('DD/MM/YYYY HH:mm') : 'Vô thời hạn'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-full bg-surface-container text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersTable;
