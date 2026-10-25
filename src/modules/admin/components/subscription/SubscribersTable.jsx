import React from 'react';
import dayjs from 'dayjs';
import { DataTable } from '../../../../components/ui/DataTable';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { Avatar } from '../../../../components/ui/Avatar';
import { Pagination } from '../../../../components/navigation/Pagination';
import { AdminListToolbar } from '../AdminListToolbar';
import { useServerTable } from '../../../../hooks/useServerTable';
import { adminSubscriptionApi } from '../../api/adminSubscriptionApi';

const PLAN_BADGE_MAP = {
  free: { label: 'Miễn phí (Free)', className: 'bg-hairline text-on-surface-variant' },
  premium_monthly: { label: 'Premium 1 Tháng', className: 'bg-primary-soft text-primary-ink font-semibold' },
  premium_yearly: { label: 'Premium 1 Năm', className: 'bg-tertiary-soft text-tertiary-dark font-semibold' },
};

const PLAN_FILTER_OPTIONS = [
  { value: null, label: 'Tất cả gói' },
  { value: 'free', label: 'Gói Free' },
  { value: 'premium_monthly', label: 'Gói Tháng' },
  { value: 'premium_yearly', label: 'Gói Năm' },
];

const STATUS_FILTER_OPTIONS = [
  { value: null, label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'expired', label: 'Đã hết hạn' },
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

  const columns = [
    {
      header: 'Phụ huynh',
      accessorKey: 'parent',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.parent?.avatarUrl}
            alt={row.parent?.fullName || 'Parent'}
            size="sm"
            fallbackText={row.parent?.fullName || 'PH'}
          />
          <div>
            <div className="font-semibold text-on-surface text-sm">
              {row.parent?.fullName || 'Chưa cập nhật tên'}
            </div>
            <div className="text-xs text-on-surface-variant">
              {row.parent?.email || '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Gói hiện tại',
      accessorKey: 'planCode',
      cell: (row) => {
        const badge = PLAN_BADGE_MAP[row.planCode] || {
          label: row.planCode,
          className: 'bg-hairline text-on-surface',
        };
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (row) => <StatusChip status={row.status} />,
    },
    {
      header: 'Ngày bắt đầu',
      accessorKey: 'startDate',
      cell: (row) => (
        <span className="text-xs text-on-surface-variant font-mono">
          {row.startDate ? dayjs(row.startDate).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      ),
    },
    {
      header: 'Ngày hết hạn',
      accessorKey: 'endDate',
      cell: (row) => (
        <span className="text-xs text-on-surface-variant font-mono">
          {row.endDate ? dayjs(row.endDate).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      ),
    },
    {
      header: 'Tháng đã mua',
      accessorKey: 'purchasedMonths',
      cell: (row) => (
        <span className="text-xs font-semibold text-on-surface">
          {row.purchasedMonths ? `${row.purchasedMonths} tháng` : '0'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên hoặc email phụ huynh..."
      >
        <div className="flex flex-wrap items-center gap-2">
          {PLAN_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value ?? 'all'}
              type="button"
              onClick={() => setFilter('planCode', opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                (filters.planCode || null) === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-hairline text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <span className="text-hairline-strong">|</span>

          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value ?? 'all'}
              type="button"
              onClick={() => setFilter('status', opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                (filters.status || null) === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-hairline text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </AdminListToolbar>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage={error ? 'Đã có lỗi xảy ra khi tải danh sách' : 'Không tìm thấy thuê bao nào'}
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
    </div>
  );
};

export default SubscribersTable;
