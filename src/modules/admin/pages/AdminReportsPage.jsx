import React from 'react';
import {
  Eye,
  Download,
  RotateCcw,
  User,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { AdminReportInvestigationDrawer } from '../components/AdminReportInvestigationDrawer';
import { useAdminReports } from '../hooks/useAdminReports';
import {
  REPORT_STATUS_CHIPS,
  REPORT_STAT_CARDS,
  REPORT_SEVERITY_CONFIG,
  REPORT_SEVERITY_OPTIONS,
  REPORT_CATEGORY_LABELS,
  REPORT_CATEGORY_OPTIONS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_TARGET_TYPE_OPTIONS,
} from '../constants/admin.constants';
import { formatDateTime } from '../../../utils/formatters';
import { ICON_SIZE } from '../../../constants/icon.constants';

// Keep the queue compact; the reporter, assignee and full timeline are in the drawer.
const COLUMNS = [
  { key: 'severity', label: 'Mức độ', headerClassName: 'min-w-col-sm' },
  { key: 'category', label: 'Danh mục', headerClassName: 'min-w-col-md' },
  { key: 'targetType', label: 'Đối tượng', headerClassName: 'min-w-col-xs' },
  {
    key: 'reportedUser',
    label: 'Người bị báo cáo',
    headerClassName: 'min-w-col-lg',
  },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-sm' },
  {
    key: 'actions',
    label: 'Thao tác',
    align: 'right',
    headerClassName: 'min-w-col-actions',
  },
];

export const AdminReportsPage = () => {
  const {
    rows,
    pagination,
    isLoading,
    tableError,
    params,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
    stats,
    isStatsLoading,
    hasActiveFilters,
    resetFilters,
    // Drawer
    selectedReportId,
    drawerReport,
    isDrawerLoading,
    openReportDetail,
    closeReportDetail,
    // Actions
    isActionLoading,
    handleClaim,
    handleTakeover,
    handleUpdateSeverity,
    handleApplyAction,
    handleResolve,
    handleReopen,
    // Export
    isExporting,
    handleExportExcel,
  } = useAdminReports();

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'severity': {
        const config = REPORT_SEVERITY_CONFIG[row.severity] || {
          label: 'Chưa phân loại',
          variant: 'neutral',
        };
        return (
          <div className="flex items-center gap-1.5">
            <StatusChip status={config.variant} label={config.label} />
          </div>
        );
      }

      case 'category':
        return (
          <div className="min-w-0 text-body-md font-medium text-text-primary">
            <span
              className="block truncate max-w-52"
              title={REPORT_CATEGORY_LABELS[row.category] || row.category}
            >
              {REPORT_CATEGORY_LABELS[row.category] || row.category}
            </span>
            <span className="block mt-1 text-label-sm font-normal text-text-muted">
              {formatDateTime(row.createdAt)}
            </span>
          </div>
        );

      case 'targetType':
        return (
          <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
            {row.targetType === 'message' && (
              <MessageSquare size={ICON_SIZE.XS} className="text-primary" />
            )}
            {row.targetType === 'playdate' && (
              <Calendar size={ICON_SIZE.XS} className="text-primary" />
            )}
            {row.targetType === 'user' && (
              <User size={ICON_SIZE.XS} className="text-primary" />
            )}
            <span>
              {REPORT_TARGET_TYPE_LABELS[row.targetType] || row.targetType}
            </span>
          </div>
        );

      case 'reportedUser':
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={row.reportedUser?.avatarUrl}
              alt={row.reportedUser?.fullName}
              size="sm"
            />
            <div className="min-w-0">
              <span className="font-semibold text-text-primary text-body-md truncate block max-w-36">
                {row.reportedUser?.fullName || 'Người dùng'}
              </span>
              {row.reportedUser?.strikeCount > 0 && (
                <span className="text-label-xs px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800">
                  {row.reportedUser.strikeCount} vi phạm
                </span>
              )}
            </div>
          </div>
        );

      case 'status': {
        const labelMap = {
          pending: 'Chờ xử lý',
          reviewing: 'Đang xem xét',
          resolved: 'Đã giải quyết',
          dismissed: 'Bác bỏ',
        };
        return (
          <div className="flex flex-col items-start gap-1">
            <StatusChip
              status={row.status}
              label={labelMap[row.status] || row.status}
            />
            {row.isOverdue && (
              <span className="rounded-full bg-error-soft px-2 py-0.5 text-label-xs font-semibold text-error-dark">
                Quá hạn
              </span>
            )}
          </div>
        );
      }

      case 'actions':
        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => openReportDetail(row.id)}
              className="px-2.5 py-1 text-label-sm"
            >
              <Eye size={ICON_SIZE.XS} className="mr-1" />
              Chi tiết
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-headline-md font-semibold text-on-surface">
          Kiểm duyệt An toàn & Báo cáo vi phạm
        </h2>
        <p className="text-body-md text-text-muted mt-1">
          Tiếp nhận báo cáo vi phạm người dùng, tin nhắn và cuộc hẹn, điều tra
          ngữ cảnh và thi hành chế tài kỷ luật.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <AdminStatStrip
        cards={REPORT_STAT_CARDS}
        stats={stats}
        isLoading={isStatsLoading}
      />

      {/* Toolbar: Search, Status tabs, Severity/Category/Target Filters, Date Range, Excel Export */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên hoặc email người báo cáo / bị báo cáo..."
        statusChips={{
          options: REPORT_STATUS_CHIPS,
          selected: params.status || '',
          onChange: (val) => setFilter('status', val || undefined),
        }}
        dateRange={{
          from: params.fromDate || '',
          to: params.toDate || '',
          onChange: ({ from, to }) =>
            setFilters({
              fromDate: from || undefined,
              toDate: to || undefined,
            }),
        }}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <AdminFilterDropdown
              label="Mức độ"
              value={params.severity || ''}
              options={REPORT_SEVERITY_OPTIONS}
              onChange={(val) => setFilter('severity', val || undefined)}
            />
            <AdminFilterDropdown
              label="Danh mục"
              value={params.category || ''}
              options={REPORT_CATEGORY_OPTIONS}
              onChange={(val) => setFilter('category', val || undefined)}
            />
            <AdminFilterDropdown
              label="Đối tượng"
              value={params.targetType || ''}
              options={REPORT_TARGET_TYPE_OPTIONS}
              onChange={(val) => setFilter('targetType', val || undefined)}
            />

            <label className="flex items-center gap-2 text-label-sm text-text-secondary whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={params.assignedTo === 'me'}
                onChange={(event) =>
                  setFilter(
                    'assignedTo',
                    event.target.checked ? 'me' : undefined,
                  )
                }
                className="rounded border-hairline accent-primary"
              />
              Phụ trách của tôi
            </label>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={resetFilters}
                className="text-text-muted"
              >
                <RotateCcw size={ICON_SIZE.XS} className="mr-1" />
                Đặt lại
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting || isLoading}
            >
              <Download size={ICON_SIZE.XS} className="mr-1.5" />
              {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
            </Button>
          </div>
        }
      />

      {/* Reports Data Table */}
      <div className="space-y-4">
        <DataTable
          columns={COLUMNS}
          rows={rows}
          isLoading={isLoading}
          onRowClick={(row) => openReportDetail(row.id)}
          renderCell={renderCell}
          emptyTitle={
            tableError
              ? 'Không tải được danh sách báo cáo'
              : 'Không có báo cáo vi phạm nào'
          }
          emptyMessage={
            tableError ||
            'Hiện tại không có báo cáo nào phù hợp với bộ lọc tìm kiếm.'
          }
        />

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-body-md text-text-muted">
              Hiển thị trang{' '}
              <span className="font-semibold text-text-primary">
                {pagination.page}
              </span>{' '}
              / <span>{pagination.totalPages}</span> ({pagination.total} báo
              cáo)
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Investigation Drawer */}
      <AdminReportInvestigationDrawer
        open={Boolean(selectedReportId)}
        onClose={closeReportDetail}
        report={drawerReport}
        isLoading={isDrawerLoading}
        isActionLoading={isActionLoading}
        onClaim={handleClaim}
        onTakeover={handleTakeover}
        onUpdateSeverity={handleUpdateSeverity}
        onApplyAction={handleApplyAction}
        onResolve={handleResolve}
        onReopen={handleReopen}
      />
    </div>
  );
};

export default AdminReportsPage;
