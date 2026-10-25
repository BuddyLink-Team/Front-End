import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Eye,
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Dropdown, DropdownItem, DropdownHeader } from '../../../components/ui/Dropdown';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { AdminUserDetailDrawer } from '../components/AdminUserDetailDrawer';
import { useServerTable } from '../../../hooks/useServerTable';
import { useToast } from '../../../hooks/useToast';
import { adminApi } from '../api/adminApi';
import {
  USER_STATUS_CHIPS,
  SUBSCRIPTION_PLAN_NAMES,
} from '../constants/admin.constants';
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

const COLUMNS = [
  { key: 'user', label: 'Phụ huynh', headerClassName: 'min-w-col-2xl' },
  { key: 'contact', label: 'Liên hệ', headerClassName: 'min-w-col-xl' },
  { key: 'city', label: 'Khu vực', headerClassName: 'min-w-col-sm' },
  { key: 'verification', label: 'Xác thực', headerClassName: 'min-w-col-md' },
  { key: 'childrenCount', label: 'Số bé', align: 'center', headerClassName: 'min-w-col-xs' },
  { key: 'currentPlan', label: 'Gói cước', headerClassName: 'min-w-col-plan' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-md' },
  { key: 'createdAt', label: 'Ngày tạo', headerClassName: 'min-w-col-lg' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions' },
];

export const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const {
    rows,
    pagination,
    isLoading,
    searchInput,
    setSearch,
    filters,
    setFilter,
    setFilters,
    setPage,
    refetch,
  } = useServerTable({
    fetcher: adminApi.getUsers,
    defaultParams: { limit: 10, isActive: '', isVerified: '' },
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [lockTargetUser, setLockTargetUser] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const hasActiveFilters = Boolean(searchInput || filters.isActive || filters.isVerified);

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ isActive: '', isVerified: '' });
  };

  const handleOpenLockDialog = (user) => {
    setLockTargetUser(user);
  };

  const handleConfirmLockToggle = async (reason) => {
    if (!lockTargetUser) return;
    const nextActive = !lockTargetUser.isActive;

    setIsUpdatingStatus(true);
    try {
      await adminApi.updateUserStatus(lockTargetUser.id, {
        isActive: nextActive,
        reason,
      });
      success(
        nextActive
          ? `Đã mở khóa tài khoản ${lockTargetUser.fullName} thành công.`
          : `Đã khóa tài khoản ${lockTargetUser.fullName}.`
      );
      setLockTargetUser(null);
      refetch();
    } catch (err) {
      toastError(
        err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái người dùng'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'user':
        return (
          <div className="flex items-center gap-3">
            <Avatar src={row.avatar} name={row.fullName} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-text-primary text-body-md truncate">
                {row.fullName}
              </p>
              <span className="text-label-sm text-text-muted font-mono">{row.id}</span>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="text-body-sm">
            <p className="text-text-primary font-medium">{row.email}</p>
            {row.phone && <p className="text-text-muted mt-0.5">{row.phone}</p>}
          </div>
        );

      case 'city':
        return <span className="text-body-sm text-text-muted whitespace-nowrap">{row.city || '—'}</span>;

      case 'verification':
        return row.verification?.isVerifiedParent ? (
          <VerifiedBadge size="sm" />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-label-sm font-medium text-text-muted bg-surface-muted border border-hairline px-2.5 py-0.5 rounded-full whitespace-nowrap">
            <ShieldAlert size={ICON_SIZE.XS} className="opacity-60" /> Chưa xác thực
          </span>
        );

      case 'childrenCount':
        return (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 font-semibold text-text-primary text-body-sm bg-surface-muted/60 px-2.5 py-0.5 rounded-full border border-hairline whitespace-nowrap">
              <Users size={ICON_SIZE.XS} className="text-primary" /> {row.childrenCount}
            </span>
          </div>
        );

      case 'currentPlan': {
        const planCode = row.currentPlan?.planCode || 'free';
        const isPremium = planCode !== 'free';
        return (
          <span
            className={`inline-flex text-label-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
              isPremium
                ? 'bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs'
                : 'bg-surface-muted text-text-muted border border-hairline'
            }`}
          >
            {SUBSCRIPTION_PLAN_NAMES[planCode] || planCode}
          </span>
        );
      }

      case 'status':
        return (
          <StatusChip
            status={row.isActive ? 'active' : 'locked'}
            label={row.isActive ? 'Đang hoạt động' : 'Đã khóa'}
          />
        );

      case 'createdAt':
        return (
          <span className="text-body-sm text-text-muted whitespace-nowrap font-mono text-label-sm">
            {formatDateTime(row.createdAt)}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedUserId(row.id)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
              title="Xem chi tiết"
            >
              <Eye size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
            </Button>
            <Button
              type="button"
              variant={row.isActive ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => handleOpenLockDialog(row)}
              className={`p-1.5 rounded-lg transition-colors ${
                row.isActive
                  ? 'text-error hover:bg-error-container/40'
                  : 'text-primary hover:bg-primary-soft'
              }`}
              title={row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            >
              {row.isActive ? (
                <Lock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
              ) : (
                <Unlock size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
              )}
            </Button>
          </div>
        );

      default:
        return String(row[key] ?? '—');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-md font-bold tracking-tight text-text-primary">
            Quản lý phụ huynh
          </h1>
          <p className="text-body-sm text-text-muted mt-1">
            Danh sách tài khoản phụ huynh, trạng thái xác thực, gói cước và lịch sử hoạt động.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold bg-surface-muted border border-hairline text-text-muted">
            Tổng cộng: <span className="text-text-primary font-bold">{pagination.total}</span> phụ huynh
          </span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo họ tên, email, SĐT..."
        statusChips={{
          options: USER_STATUS_CHIPS,
          selected: filters.isActive ?? '',
          onChange: (val) => setFilter('isActive', val),
        }}
        actions={
          hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-text-muted hover:text-error hover:bg-red-50 text-xs px-3 py-2 rounded-xl transition-colors select-none"
              leftIcon={<RotateCcw size={ICON_SIZE.XS} />}
            >
              Đặt lại bộ lọc
            </Button>
          )
        }
      >
        <Dropdown
          align="left"
          trigger={
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 shadow-2xs whitespace-nowrap cursor-pointer select-none',
                filters.isVerified
                  ? 'bg-primary-soft text-primary-dark border-primary-border font-semibold shadow-xs'
                  : 'bg-white text-text-primary border-hairline hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              <ShieldCheck
                size={ICON_SIZE.SM}
                className={filters.isVerified ? 'text-primary' : 'text-text-muted'}
              />
              <span>
                {filters.isVerified === 'true'
                  ? 'Đã xác thực'
                  : filters.isVerified === 'false'
                  ? 'Chưa xác thực'
                  : 'Tất cả xác thực'}
              </span>
              <ChevronDown size={ICON_SIZE.XS} className="text-text-muted opacity-70 ml-0.5" />
            </button>
          }
        >
          <DropdownHeader>Trạng thái xác thực</DropdownHeader>
          <DropdownItem
            onClick={() => setFilter('isVerified', '')}
            className={!filters.isVerified ? 'text-primary font-semibold bg-primary-soft/40' : ''}
          >
            Tất cả xác thực
          </DropdownItem>
          <DropdownItem
            icon={<ShieldCheck size={ICON_SIZE.SM} className="text-primary" />}
            onClick={() => setFilter('isVerified', 'true')}
            className={filters.isVerified === 'true' ? 'text-primary font-semibold bg-primary-soft/40' : ''}
          >
            Đã xác thực danh tính
          </DropdownItem>
          <DropdownItem
            icon={<ShieldAlert size={ICON_SIZE.SM} className="text-text-muted" />}
            onClick={() => setFilter('isVerified', 'false')}
            className={filters.isVerified === 'false' ? 'text-primary font-semibold bg-primary-soft/40' : ''}
          >
            Chưa xác thực
          </DropdownItem>
        </Dropdown>
      </AdminListToolbar>

      {/* Main Data Table */}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        tableClassName="min-w-table-users"
        onRowClick={(row) => setSelectedUserId(row.id)}
        renderCell={renderCell}
        emptyTitle="Chưa có tài khoản phụ huynh"
        emptyMessage="Không tìm thấy tài khoản phụ huynh nào phù hợp với bộ lọc."
      />

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-sm text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} phụ huynh)
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detail Drawer */}
      <AdminUserDetailDrawer
        userId={selectedUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
        onLockToggle={(user) => handleOpenLockDialog(user)}
        onSelectChild={(child) => {
          setSelectedUserId(null);
          navigate(`/admin/children?search=${encodeURIComponent(child.displayName)}`);
        }}
      />

      {/* Lock / Unlock Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(lockTargetUser)}
        isLoading={isUpdatingStatus}
        variant={lockTargetUser?.isActive ? 'danger' : 'info'}
        title={lockTargetUser?.isActive ? 'Khóa tài khoản phụ huynh' : 'Mở khóa tài khoản phụ huynh'}
        description={
          lockTargetUser?.isActive
            ? `Bạn có chắc chắn muốn khóa tài khoản "${lockTargetUser.fullName}"? Phụ huynh này và các bé sẽ bị ẩn khỏi Khám phá, đồng thời phiên đăng nhập sẽ bị thu hồi ngay lập tức.`
            : `Mở khóa cho tài khoản "${lockTargetUser?.fullName}"? Phụ huynh sẽ có thể đăng nhập và xuất hiện trở lại trên nền tảng.`
        }
        confirmLabel={lockTargetUser?.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelLabel="Hủy bỏ"
        reason={
          lockTargetUser?.isActive
            ? {
                required: false,
                label: 'Lý do khóa tài khoản',
                placeholder: 'Nhập lý do khóa tài khoản (tùy chọn)...',
                maxLength: 500,
              }
            : undefined
        }
        onConfirm={handleConfirmLockToggle}
        onCancel={() => setLockTargetUser(null)}
      />
    </div>
  );
};

export default AdminUserManagementPage;
