import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Baby, Users, ChevronDown, RotateCcw, Calendar } from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Button } from '../../../components/ui/Button';
import { Dropdown, DropdownItem, DropdownHeader } from '../../../components/ui/Dropdown';
import { StatusChip } from '../../../components/badges/StatusChip';
import { AdminChildDetailDrawer } from '../components/AdminChildDetailDrawer';
import { useServerTable } from '../../../hooks/useServerTable';
import { adminApi } from '../api/adminApi';
import {
  CHILD_STATUS_CHIPS,
  GENDER_FILTER_OPTIONS,
  AGE_RANGE_OPTIONS,
} from '../constants/admin.constants';
import { formatDateTime } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

const COLUMNS = [
  { key: 'child', label: 'Tên bé', headerClassName: 'min-w-field-md' },
  { key: 'age', label: 'Tuổi', headerClassName: 'min-w-col-actions' },
  { key: 'gender', label: 'Giới tính', headerClassName: 'min-w-col-gender' },
  { key: 'parentName', label: 'Phụ huynh phụ trách', headerClassName: 'min-w-field-md' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-lg' },
  { key: 'createdAt', label: 'Ngày tạo', headerClassName: 'min-w-col-lg' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions-sm' },
];

export const AdminChildManagementPage = () => {
  const navigate = useNavigate();

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
  } = useServerTable({
    fetcher: adminApi.getChildren,
    defaultParams: { limit: 10, isArchived: 'false', gender: '', ageRange: '' },
  });

  const [selectedChildId, setSelectedChildId] = useState(null);

  const hasActiveFilters = Boolean(
    searchInput || (filters.isArchived && filters.isArchived !== 'false') || filters.gender || filters.ageRange
  );

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ isArchived: 'false', gender: '', ageRange: '', minAge: undefined, maxAge: undefined });
  };

  const handleAgeRangeChange = (value) => {
    const selected = AGE_RANGE_OPTIONS.find((opt) => opt.value === value);
    if (!selected || !value) {
      setFilters({ ageRange: '', minAge: undefined, maxAge: undefined });
    } else {
      setFilters({
        ageRange: value,
        minAge: selected.minAge,
        maxAge: selected.maxAge,
      });
    }
  };

  const currentGenderLabel =
    GENDER_FILTER_OPTIONS.find((opt) => opt.value === (filters.gender || ''))?.label || 'Tất cả giới tính';

  const currentAgeLabel =
    AGE_RANGE_OPTIONS.find((opt) => opt.value === (filters.ageRange || ''))?.label || 'Mọi độ tuổi';

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'child':
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary-dark flex items-center justify-center font-bold text-label-md shrink-0">
              <Baby size={ICON_SIZE.SM} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary text-body-md truncate">
                {row.displayName}
              </p>
              <span className="text-label-xs text-text-muted font-mono">{row.id}</span>
            </div>
          </div>
        );

      case 'age':
        return (
          <span className="text-body-sm font-medium text-text-primary whitespace-nowrap">
            {row.age ? `${row.age} tuổi` : 'Chưa rõ'}
          </span>
        );

      case 'gender': {
        const isBoy = row.gender === 'boy';
        const isGirl = row.gender === 'girl';
        return (
          <span
            className={`inline-flex items-center text-label-sm font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${
              isBoy
                ? 'bg-secondary-soft text-secondary-dark'
                : isGirl
                ? 'bg-rose-50 text-rose-700'
                : 'bg-surface-muted text-text-muted'
            }`}
          >
            {isBoy ? 'Bé trai' : isGirl ? 'Bé gái' : 'Khác'}
          </span>
        );
      }

      case 'parentName':
        return (
          <div>
            <p className="text-body-sm font-medium text-text-primary">{row.parentName || '—'}</p>
            {row.parentId && (
              <span className="text-label-xs text-text-muted font-mono">ID: {row.parentId}</span>
            )}
          </div>
        );

      case 'status':
        return row.isArchived ? (
          <StatusChip status="archived" label="Đã xóa bởi phụ huynh" />
        ) : (
          <StatusChip status="active" label="Đang hiển thị" />
        );

      case 'createdAt':
        return (
          <span className="text-body-sm text-text-muted whitespace-nowrap font-mono text-label-sm">
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
              onClick={() => setSelectedChildId(row.id)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
              title="Xem chi tiết hồ sơ"
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
          <h1 className="text-headline-md font-bold tracking-tight text-text-primary">
            Quản lý hồ sơ trẻ
          </h1>
          <p className="text-body-sm text-text-muted mt-1">
            Danh sách hồ sơ trẻ em trên toàn hệ thống (chế độ chỉ đọc cho Quản trị viên).
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold bg-surface-muted border border-hairline text-text-muted">
            Tổng cộng: <span className="text-text-primary font-bold">{pagination.total}</span> hồ sơ
          </span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên bé hoặc tên phụ huynh..."
        statusChips={{
          options: CHILD_STATUS_CHIPS,
          selected: filters.isArchived ?? 'false',
          onChange: (val) => setFilter('isArchived', val),
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
        {/* Custom Gender Dropdown */}
        <Dropdown
          align="left"
          trigger={
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 shadow-2xs whitespace-nowrap cursor-pointer select-none',
                filters.gender
                  ? 'bg-primary-soft text-primary-dark border-primary-border font-semibold shadow-xs'
                  : 'bg-white text-text-primary border-hairline hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              <Users size={ICON_SIZE.SM} className={filters.gender ? 'text-primary' : 'text-text-muted'} />
              <span>{currentGenderLabel}</span>
              <ChevronDown size={ICON_SIZE.XS} className="text-text-muted opacity-70 ml-0.5" />
            </button>
          }
        >
          <DropdownHeader>Lọc theo giới tính</DropdownHeader>
          {GENDER_FILTER_OPTIONS.map((opt) => (
            <DropdownItem
              key={opt.value}
              onClick={() => setFilter('gender', opt.value)}
              className={filters.gender === opt.value || (!filters.gender && !opt.value) ? 'text-primary font-semibold bg-primary-soft/40' : ''}
            >
              {opt.label}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Custom Age Range Dropdown */}
        <Dropdown
          align="left"
          trigger={
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 shadow-2xs whitespace-nowrap cursor-pointer select-none',
                filters.ageRange
                  ? 'bg-primary-soft text-primary-dark border-primary-border font-semibold shadow-xs'
                  : 'bg-white text-text-primary border-hairline hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              <Calendar size={ICON_SIZE.SM} className={filters.ageRange ? 'text-primary' : 'text-text-muted'} />
              <span>{currentAgeLabel}</span>
              <ChevronDown size={ICON_SIZE.XS} className="text-text-muted opacity-70 ml-0.5" />
            </button>
          }
        >
          <DropdownHeader>Lọc theo độ tuổi</DropdownHeader>
          {AGE_RANGE_OPTIONS.map((opt) => (
            <DropdownItem
              key={opt.value}
              onClick={() => handleAgeRangeChange(opt.value)}
              className={filters.ageRange === opt.value || (!filters.ageRange && !opt.value) ? 'text-primary font-semibold bg-primary-soft/40' : ''}
            >
              {opt.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </AdminListToolbar>

      {/* Main Data Table */}
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        tableClassName="min-w-table-children"
        onRowClick={(row) => setSelectedChildId(row.id)}
        renderCell={renderCell}
        emptyTitle="Chưa có hồ sơ trẻ em"
        emptyMessage="Không tìm thấy hồ sơ trẻ em nào phù hợp với bộ lọc tìm kiếm."
      />

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-sm text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} hồ sơ)
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Child Detail Drawer (View-only) */}
      <AdminChildDetailDrawer
        childId={selectedChildId}
        isOpen={Boolean(selectedChildId)}
        onClose={() => setSelectedChildId(null)}
        onViewParent={(parent) => {
          setSelectedChildId(null);
          navigate(`/admin/users?search=${encodeURIComponent(parent.email || parent.fullName)}`);
        }}
      />
    </div>
  );
};

export default AdminChildManagementPage;
