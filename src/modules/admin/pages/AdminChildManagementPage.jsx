import React from 'react';
import { Eye, Baby, Users, RotateCcw, Calendar } from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminChildDetailDrawer } from '../components/AdminChildDetailDrawer';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { useAdminChildren } from '../hooks/useAdminChildren';
import {
  CHILD_STATUS_CHIPS,
  CHILD_STAT_CARDS,
  CHILD_VISIBILITY_CHIPS,
  GENDER_FILTER_OPTIONS,
  GENDER_LABELS,
  AGE_RANGE_OPTIONS,
  withStatusQuery,
} from '../constants/admin.constants';
import { useDispatch } from 'react-redux';
import { useAdminExport } from '../hooks/useAdminExport';
import { fetchAllPages } from '../utils/excelExport';
import { fetchAdminChildren } from '../redux/adminSlice';
import { formatAgeYears, formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

const COLUMNS = [
  { key: 'child', label: 'Tên bé', headerClassName: 'min-w-field-md' },
  { key: 'age', label: 'Tuổi', headerClassName: 'min-w-col-actions' },
  { key: 'gender', label: 'Giới tính', headerClassName: 'min-w-col-gender' },
  { key: 'parentName', label: 'Phụ huynh phụ trách', headerClassName: 'min-w-field-md' },
  { key: 'status', label: 'Hiển thị ở Khám phá', headerClassName: 'min-w-col-xl' },
  { key: 'createdAt', label: 'Ngày tạo', headerClassName: 'min-w-col-lg' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions-sm' },
];

const GENDER_CHIP_CLASSES = {
  boy: 'bg-secondary-soft text-secondary-dark',
  girl: 'bg-tertiary-soft text-tertiary-dark',
};

export const AdminChildManagementPage = () => {
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
    selectedChildId,
    openChildDetail,
    closeChildDetail,
    openParentAccount,
  } = useAdminChildren();

  const dispatch = useDispatch();
  const { isExporting, handleExport } = useAdminExport('children', async () => {
    const range = filters.ageRange ? AGE_RANGE_OPTIONS.find((opt) => opt.value === filters.ageRange) : null;
    const query = {
      ...withStatusQuery(CHILD_STATUS_CHIPS, { status: filters.status, gender: filters.gender }),
      search: searchInput,
      ...(range ? { minAge: range.minAge, maxAge: range.maxAge } : {}),
    };
    const allChildren = await fetchAllPages((p) => dispatch(fetchAdminChildren(p)).unwrap(), query);
    return { children: allChildren, stats: stats.stats };
  });

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'child':
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary-dark flex items-center justify-center shrink-0">
              <Baby size={ICON_SIZE.SM} />
            </div>
            <p className="min-w-0 font-semibold text-text-primary text-body-md truncate">{row.displayName}</p>
          </div>
        );

      case 'age':
        return (
          <span className="text-body-md font-medium text-text-primary whitespace-nowrap">
            {formatAgeYears(row.age) || 'Chưa rõ'}
          </span>
        );

      case 'gender':
        return (
          <span
            className={cn(
              'inline-flex items-center text-label-sm px-2.5 py-0.5 rounded-full whitespace-nowrap',
              GENDER_CHIP_CLASSES[row.gender] || 'bg-surface-muted text-text-muted'
            )}
          >
            {GENDER_LABELS[row.gender] || '—'}
          </span>
        );

      case 'parentName':
        return row.parentUserId ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openParentAccount(row.parentUserId)}
              className="px-0 py-0 text-body-md font-medium text-text-primary hover:bg-transparent hover:text-primary-dark hover:underline"
              title="Xem tài khoản phụ huynh"
            >
              {row.parentName || '—'}
            </Button>
          </span>
        ) : (
          <span className="text-body-md text-text-muted">—</span>
        );

      case 'status':
        return <StatusChip {...(CHILD_VISIBILITY_CHIPS[row.visibility] || CHILD_VISIBILITY_CHIPS.visible)} />;

      case 'createdAt':
        return (
          <span className="text-label-sm text-text-muted whitespace-nowrap">
            {formatDateTime(row.createdAt)}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openChildDetail(row.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              title="Xem chi tiết hồ sơ"
              aria-label="Xem chi tiết hồ sơ"
            >
              <Eye size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.DEFAULT} />
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
          <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">Quản lý hồ sơ trẻ</h1>
          <p className="text-body-md text-text-muted mt-1">
            Danh sách hồ sơ trẻ em trên toàn hệ thống (chế độ chỉ đọc cho Quản trị viên).
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold bg-surface-muted border border-hairline text-text-muted">
          Kết quả: <span className="text-text-primary">{pagination.total}</span> hồ sơ
        </span>
      </div>

      {/* Platform-wide counts */}
      <AdminStatStrip
        cards={CHILD_STAT_CARDS}
        stats={stats.stats}
        isLoading={stats.isLoading}
        hasError={stats.hasError}
      />

      {/* Toolbar & Filters */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên bé hoặc tên phụ huynh..."
        statusChips={{
          options: CHILD_STATUS_CHIPS,
          selected: filters.status ?? '',
          onChange: (val) => setFilter('status', val),
        }}
        onExport={handleExport}
        isExporting={isExporting}
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
          icon={Users}
          header="Lọc theo giới tính"
          options={GENDER_FILTER_OPTIONS}
          value={filters.gender}
          onChange={(val) => setFilter('gender', val)}
        />
        <AdminFilterDropdown
          icon={Calendar}
          header="Lọc theo độ tuổi"
          options={AGE_RANGE_OPTIONS}
          value={filters.ageRange}
          onChange={(val) => setFilter('ageRange', val)}
        />
      </AdminListToolbar>

      {/* Main Data Table */}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        tableClassName="min-w-table-children"
        onRowClick={(row) => openChildDetail(row.id)}
        renderCell={renderCell}
        emptyTitle={listErrorMessage ? 'Không tải được danh sách' : 'Chưa có hồ sơ trẻ em'}
        emptyMessage={listErrorMessage || 'Không tìm thấy hồ sơ trẻ em nào phù hợp với bộ lọc tìm kiếm.'}
      />

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-md text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} hồ sơ)
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            inactiveItemClassName="bg-surface-container-lowest hover:bg-surface-container-low"
          />
        </div>
      )}

      {/* Child Detail Drawer (View-only) */}
      <AdminChildDetailDrawer
        childId={selectedChildId}
        isOpen={Boolean(selectedChildId)}
        onClose={closeChildDetail}
        onViewParent={openParentAccount}
      />
    </div>
  );
};

export default AdminChildManagementPage;
