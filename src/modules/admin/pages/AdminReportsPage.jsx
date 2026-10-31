import React from 'react';
import { Calendar, Eye, MessageSquare, RotateCcw, User } from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { AdminReportInvestigationDrawer } from '../components/AdminReportInvestigationDrawer';
import { ReportOverdueChip, ReportSeverityChip, ReportStatusChip } from '../components/reports/ReportChips';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { useAdminReports } from '../hooks/useAdminReports';
import {
  REPORT_CATEGORY_OPTIONS,
  REPORT_SEVERITY_OPTIONS,
  REPORT_STAT_CARDS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_TARGET_TYPE_OPTIONS,
  getReportCategoryLabel,
} from '../constants/admin.constants';
import { formatDateTime } from '../../../utils/formatters';
import { ICON_SIZE } from '../../../constants/icon.constants';

const COLUMNS = [
  { key: 'severity', label: 'Mức độ', headerClassName: 'min-w-col-sm' },
  { key: 'category', label: 'Danh mục', headerClassName: 'min-w-col-md' },
  { key: 'targetType', label: 'Đối tượng', headerClassName: 'min-w-col-sm' },
  { key: 'reporter', label: 'Người báo cáo', headerClassName: 'min-w-col-lg' },
  { key: 'reportedUser', label: 'Người bị báo cáo', headerClassName: 'min-w-col-xl' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-md' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions' },
];

const TARGET_ICONS = { message: MessageSquare, playdate: Calendar, user: User };

const Person = ({ person, children }) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <Avatar src={person?.avatarUrl} alt={person?.fullName} size="sm" />
    <div className="min-w-0">
      <span className="font-semibold text-text-primary text-body-md truncate block max-w-truncate-sm">
        {person?.fullName || 'Người dùng'}
      </span>
      {children}
    </div>
  </div>
);

export const AdminReportsPage = () => {
  const {
    rows,
    pagination,
    isLoading,
    listErrorMessage,
    params,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
    stats,
    isStatsLoading,
    hasStatsError,
    statusChips,
    hasActiveFilters,
    resetFilters,
    selectedReportId,
    drawerReport,
    isDrawerLoading,
    openReportDetail,
    closeReportDetail,
    isActionLoading,
    handleClaim,
    handleTakeover,
    handleUpdateSeverity,
    handleApplyAction,
    handleResolve,
    handleReopen,
    isExporting,
    handleExport,
  } = useAdminReports();

  const renderCell = (key, _value, row) => {
    switch (key) {
      case 'severity':
        return <ReportSeverityChip severity={row.severity} />;

      case 'category': {
        const label = getReportCategoryLabel(row.category);
        return (
          <div className="min-w-0">
            <span className="block truncate max-w-truncate-md text-body-md font-medium text-text-primary" title={label}>
              {label}
            </span>
            <span className="block mt-1 text-label-sm text-text-muted whitespace-nowrap">{formatDateTime(row.createdAt)}</span>
          </div>
        );
      }

      case 'targetType': {
        const Icon = TARGET_ICONS[row.targetType];
        return (
          <div className="flex items-center gap-1.5 text-label-md text-text-primary">
            {Icon && <Icon size={ICON_SIZE.XS} className="text-primary" />}
            <span>{REPORT_TARGET_TYPE_LABELS[row.targetType] || row.targetType || '—'}</span>
          </div>
        );
      }

      case 'reporter':
        return <Person person={row.reporter} />;

      case 'reportedUser':
        return (
          <Person person={row.reportedUser}>
            {row.reportedUser?.strikeCount > 0 && (
              <span className="text-label-xs px-1.5 py-0.5 rounded-full font-semibold bg-tertiary-soft text-tertiary-dark">
                {row.reportedUser.strikeCount} lần cảnh cáo
              </span>
            )}
          </Person>
        );

      case 'status':
        return (
          <div className="flex flex-col items-start gap-1">
            <ReportStatusChip status={row.status} />
            {row.isOverdue && <ReportOverdueChip />}
          </div>
        );

      case 'actions':
        return (
          <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Eye size={ICON_SIZE.XS} />}
              onClick={() => openReportDetail(row.id)}
            >
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
      <div>
        <h2 className="text-headline-md font-semibold text-on-surface">Kiểm duyệt An toàn &amp; Báo cáo vi phạm</h2>
        <p className="text-body-md text-text-muted mt-1">
          Tiếp nhận báo cáo vi phạm người dùng, tin nhắn và cuộc hẹn, điều tra ngữ cảnh và thi hành chế tài kỷ luật.
        </p>
      </div>

      <AdminStatStrip
        cards={REPORT_STAT_CARDS}
        stats={stats}
        isLoading={isStatsLoading}
        hasError={hasStatsError}
      />

      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên hoặc email người báo cáo / bị báo cáo..."
        statusChips={{
          options: statusChips,
          selected: params.status || '',
          onChange: (value) => setFilter('status', value || undefined),
        }}
        dateRange={{
          from: params.fromDate || '',
          to: params.toDate || '',
          onChange: ({ from, to }) => setFilters({ fromDate: from || undefined, toDate: to || undefined }),
        }}
        onExport={handleExport}
        isExporting={isExporting}
        filters={
          <>
            <AdminFilterDropdown
              label="Mức độ"
              value={params.severity || ''}
              options={REPORT_SEVERITY_OPTIONS}
              onChange={(value) => setFilter('severity', value || undefined)}
            />
            <AdminFilterDropdown
              label="Danh mục"
              value={params.category || ''}
              options={REPORT_CATEGORY_OPTIONS}
              onChange={(value) => setFilter('category', value || undefined)}
            />
            <AdminFilterDropdown
              label="Đối tượng"
              value={params.targetType || ''}
              options={REPORT_TARGET_TYPE_OPTIONS}
              onChange={(value) => setFilter('targetType', value || undefined)}
            />
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                className="text-text-muted"
                leftIcon={<RotateCcw size={ICON_SIZE.XS} />}
                onClick={resetFilters}
              >
                Đặt lại
              </Button>
            )}
          </>
        }
      />

      <div className="space-y-4">
        <DataTable
          columns={COLUMNS}
          rows={rows}
          isLoading={isLoading}
          onRowClick={(row) => openReportDetail(row.id)}
          renderCell={renderCell}
          tableClassName="min-w-table-reports"
          emptyTitle={listErrorMessage ? 'Không tải được danh sách báo cáo' : 'Không có báo cáo vi phạm nào'}
          emptyMessage={listErrorMessage || 'Hiện tại không có báo cáo nào phù hợp với bộ lọc tìm kiếm.'}
        />

  {     /* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-body-md text-text-muted">
              Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
              <span>{pagination.totalPages}</span> ({pagination.total} báo cáo)
            </p>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              inactiveItemClassName="bg-surface-container-lowest hover:bg-surface-container-low"
            />
          </div>
        )}
      </div>

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
