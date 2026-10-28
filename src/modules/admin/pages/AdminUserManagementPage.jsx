import React from 'react';
import { Lock, Unlock, Eye, Users, ShieldCheck, ShieldAlert, RotateCcw } from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminUserDetailDrawer } from '../components/AdminUserDetailDrawer';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { useAdminUsers } from '../hooks/useAdminUsers';
import {
  USER_STATUS_CHIPS,
  USER_STAT_CARDS,
  VERIFICATION_FILTER_OPTIONS,
  SUBSCRIPTION_PLAN_NAMES,
  PROFILE_HIDDEN_CHIP,
} from '../constants/admin.constants';
import { formatDate, formatDateTime } from '../../../utils/formatters';
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

const ICON_BUTTON_CLASS = 'p-1.5 rounded-lg';

export const AdminUserManagementPage = () => {
  const {
    rows,
    pagination,
    isLoading,
    listErrorMessage,
    searchInput,
    setSearch,
    filters,
    setFilter,
    setPage,
    stats,
    hasActiveFilters,
    resetFilters,
    selectedUserId,
    openUserDetail,
    closeUserDetail,
    detailVersion,
    lockTargetUser,
    openLockDialog,
    closeLockDialog,
    isUpdatingStatus,
    confirmLockToggle,
    openChildProfile,
  } = useAdminUsers();

  const isLockAction = Boolean(lockTargetUser?.isActive);

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'user':
        return (
          <div className="flex items-center gap-3">
            <Avatar src={row.avatar} alt={row.fullName} size="md" />
            <p className="min-w-0 font-semibold text-text-primary text-body-md truncate">{row.fullName}</p>
          </div>
        );

      case 'contact':
        return (
          <div className="text-body-md">
            <p className="text-text-primary font-medium">{row.email}</p>
            {row.phone && <p className="text-label-md text-text-muted mt-0.5">{row.phone}</p>}
          </div>
        );

      case 'city':
        return <span className="text-body-md text-text-muted whitespace-nowrap">{row.city || '—'}</span>;

      case 'verification':
        return row.isVerifiedParent ? (
          <VerifiedBadge size="sm" />
        ) : (
          <span className="inline-flex items-center gap-1.5 text-label-sm text-text-muted bg-surface-muted border border-hairline px-2.5 py-0.5 rounded-full whitespace-nowrap">
            <ShieldAlert size={ICON_SIZE.XS} className="opacity-60" /> Chưa xác thực
          </span>
        );

      case 'childrenCount':
        return (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 font-semibold text-text-primary text-label-md bg-surface-muted/60 px-2.5 py-0.5 rounded-full border border-hairline whitespace-nowrap">
              <Users size={ICON_SIZE.XS} className="text-primary" /> {row.childrenCount}
            </span>
          </div>
        );

      case 'currentPlan': {
        const { planCode, isPremium, endDate } = row.currentPlan || {};
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span
              className={cn(
                'inline-flex text-label-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border',
                isPremium
                  ? 'bg-tertiary-soft text-tertiary-dark border-tertiary-border'
                  : 'bg-surface-muted text-text-muted border-hairline'
              )}
            >
              {SUBSCRIPTION_PLAN_NAMES[planCode] || planCode}
            </span>
            {isPremium && endDate && (
              <span className="text-label-xs text-text-muted whitespace-nowrap">Đến {formatDate(endDate)}</span>
            )}
          </div>
        );
      }

      case 'status':
        return (
          <div className="flex flex-col items-start gap-1">
            <StatusChip
              status={row.isActive ? 'active' : 'locked'}
              label={row.isActive ? 'Đang hoạt động' : 'Đã khóa'}
            />
            {row.isProfileHidden && <StatusChip {...PROFILE_HIDDEN_CHIP} />}
          </div>
        );

      case 'createdAt':
        return (
          <span className="text-label-sm text-text-muted whitespace-nowrap">
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
              onClick={() => openUserDetail(row.id)}
              className={cn(ICON_BUTTON_CLASS, 'text-text-muted hover:text-text-primary')}
              title="Xem chi tiết"
              aria-label="Xem chi tiết"
            >
              <Eye size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
            </Button>
            <Button
              type="button"
              variant={row.isActive ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => openLockDialog(row)}
              className={cn(
                ICON_BUTTON_CLASS,
                row.isActive ? 'text-error hover:bg-error-container/40' : 'text-primary hover:bg-primary-soft'
              )}
              title={row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              aria-label={row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
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
          <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">Quản lý phụ huynh</h1>
          <p className="text-body-md text-text-muted mt-1">
            Danh sách tài khoản phụ huynh, trạng thái xác thực, gói cước và lịch sử hoạt động.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold bg-surface-muted border border-hairline text-text-muted">
          Kết quả: <span className="text-text-primary">{pagination.total}</span> phụ huynh
        </span>
      </div>

      {/* Platform-wide counts */}
      <AdminStatStrip
        cards={USER_STAT_CARDS}
        stats={stats.stats}
        isLoading={stats.isLoading}
        hasError={stats.hasError}
      />

      {/* Toolbar & Filters */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo họ tên, email, SĐT..."
        statusChips={{
          options: USER_STATUS_CHIPS,
          selected: filters.status ?? '',
          onChange: (val) => setFilter('status', val),
        }}
        actions={
          hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-text-muted hover:text-error hover:bg-error-container/40"
              leftIcon={<RotateCcw size={ICON_SIZE.XS} />}
            >
              Đặt lại bộ lọc
            </Button>
          )
        }
      >
        <AdminFilterDropdown
          icon={ShieldCheck}
          header="Trạng thái xác thực"
          options={VERIFICATION_FILTER_OPTIONS}
          value={filters.isVerified}
          onChange={(val) => setFilter('isVerified', val)}
        />
      </AdminListToolbar>

      {/* Main Data Table */}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        tableClassName="min-w-table-users"
        onRowClick={(row) => openUserDetail(row.id)}
        renderCell={renderCell}
        emptyTitle={listErrorMessage ? 'Không tải được danh sách' : 'Chưa có tài khoản phụ huynh'}
        emptyMessage={listErrorMessage || 'Không tìm thấy tài khoản phụ huynh nào phù hợp với bộ lọc.'}
      />

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-md text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} phụ huynh)
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            inactiveItemClassName="bg-surface-container-lowest hover:bg-surface-container-low"
          />
        </div>
      )}

      {/* Detail Drawer */}
      <AdminUserDetailDrawer
        userId={selectedUserId}
        isOpen={Boolean(selectedUserId)}
        reloadKey={detailVersion}
        onClose={closeUserDetail}
        onLockToggle={openLockDialog}
        onSelectChild={openChildProfile}
      />

      {/* Lock / Unlock Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(lockTargetUser)}
        isLoading={isUpdatingStatus}
        variant={isLockAction ? 'danger' : 'info'}
        title={isLockAction ? 'Khóa tài khoản phụ huynh' : 'Mở khóa tài khoản phụ huynh'}
        description={
          isLockAction
            ? `Bạn có chắc chắn muốn khóa tài khoản "${lockTargetUser.fullName}"? Phụ huynh sẽ bị đăng xuất, không thể đăng nhập lại, và các bé sẽ bị ẩn khỏi Khám phá.`
            : `Mở khóa cho tài khoản "${lockTargetUser?.fullName}"? Phụ huynh sẽ có thể đăng nhập và xuất hiện trở lại trên nền tảng.`
        }
        confirmLabel={isLockAction ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelLabel="Hủy bỏ"
        onConfirm={confirmLockToggle}
        onCancel={closeLockDialog}
      />
    </div>
  );
};

export default AdminUserManagementPage;
