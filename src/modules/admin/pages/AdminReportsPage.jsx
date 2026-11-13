import React from 'react';
import {
  Calendar,
  Eye,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  User,
} from 'lucide-react';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminFilterDropdown } from '../components/AdminFilterDropdown';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { AdminReportInvestigationDrawer } from '../components/AdminReportInvestigationDrawer';
import {
  ReportOverdueChip,
  ReportSeverityChip,
  ReportStatusChip,
} from '../components/reports/ReportChips';
import { SentinelBatchCommandBar } from '../components/reports/SentinelBatchCommandBar';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Button } from '../../../components/ui/Button';
import { useAdminReports } from '../hooks/useAdminReports';
import {
  REPORT_CATEGORY_OPTIONS,
  REPORT_SEVERITY_OPTIONS,
  REPORT_STAT_CARDS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_TARGET_TYPE_OPTIONS,
  SENTINEL_VERDICT_DISPLAY,
  getReportCategoryLabel,
  getSentinelVerdict,
  isTemporarilyRestricted,
} from '../constants/admin.constants';
import { formatDateTime } from '../../../utils/formatters';
import { ICON_SIZE } from '../../../constants/icon.constants';

// One row is one case: the reports about the same content, decided together
const COLUMNS = [
  { key: 'severity', label: 'Mức độ', headerClassName: 'min-w-col-sm' },
  {
    key: 'content',
    label: 'Nội dung bị báo cáo',
    headerClassName: 'min-w-col-lg',
  },
  {
    key: 'reportedUser',
    label: 'Người bị báo cáo',
    headerClassName: 'min-w-col-lg',
  },
  { key: 'reporters', label: 'Người báo cáo', headerClassName: 'min-w-col-md' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-md' },
  {
    key: 'actions',
    label: 'Thao tác',
    align: 'right',
    headerClassName: 'min-w-col-actions',
  },
];

const TARGET_ICONS = { message: MessageSquare, playdate: Calendar, user: User };

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
    handleUpdateSeverity,
    handleDecide,
    handleReopen,
    handleAssessSentinel,
    handleResolveCluster,
    isBatchScanning,
    handleBatchScanSentinel,
    isExporting,
    handleExport,
  } = useAdminReports();

  const renderCell = (key, _value, row) => {
    switch (key) {
      case 'severity': {
        const verdict = row.sentinelAssessment
          ? SENTINEL_VERDICT_DISPLAY[getSentinelVerdict(row.sentinelAssessment)]
          : null;
        return (
          <div className="flex flex-col items-start gap-1">
            <ReportSeverityChip severity={row.severity} />
            {verdict && (
              <span title={row.sentinelAssessment.summary}>
                <StatusChip tone={verdict.tone} label={verdict.label} />
              </span>
            )}
            {isTemporarilyRestricted(row) && (
              <StatusChip
                tone="danger"
                icon={ShieldAlert}
                label="Đang hạn chế nhắn tin"
              />
            )}
          </div>
        );
      }

      case 'content': {
        const Icon = TARGET_ICONS[row.targetType];
        const label = getReportCategoryLabel(row.category);
        return (
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-body-md font-medium text-text-primary">
              {Icon && (
                <Icon size={ICON_SIZE.XS} className="shrink-0 text-primary" />
              )}
              <span className="truncate max-w-truncate-md" title={label}>
                {label}
              </span>
            </span>
            <span
              className="mt-1 block truncate max-w-truncate-md text-label-sm text-text-muted"
              title={row.reason}
            >
              {REPORT_TARGET_TYPE_LABELS[row.targetType] || '—'}
              {row.reason && row.reason !== row.category ? ` · ${row.reason}` : ''}
            </span>
          </div>
        );
      }

      case 'reportedUser':
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              src={row.reportedUser?.avatarUrl}
              alt={row.reportedUser?.fullName}
              size="sm"
            />
            <span className="block max-w-truncate-sm truncate text-body-md font-semibold text-text-primary">
              {row.reportedUser?.fullName || 'Người dùng'}
            </span>
          </div>
        );

      case 'reporters': {
        const count = row.reporterCount || 1;
        const firstName =
          row.reporterNames?.[0] || row.reporter?.fullName || 'Người dùng';
        return (
          <div className="min-w-0">
            <span className="block max-w-truncate-sm truncate text-body-md font-medium text-text-primary">
              {count > 1 ? `${firstName} và ${count - 1} người khác` : firstName}
            </span>
            <span className="mt-1 block whitespace-nowrap text-label-sm text-text-muted">
              Từ {formatDateTime(row.firstReportedAt || row.createdAt)}
            </span>
          </div>
        );
      }

      case 'status':
        return (
          <div className="flex flex-col items-start gap-1">
            <ReportStatusChip status={row.status} />
            {row.isOverdue && <ReportOverdueChip />}
          </div>
        );

      case 'actions':
        return (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openReportDetail(row.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              title="Xem chi tiết"
              aria-label="Xem chi tiết"
            >
              <Eye size={ICON_SIZE.SM} />
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
        <h2 className="text-headline-md font-semibold text-on-surface">
          Kiểm duyệt An toàn &amp; Báo cáo vi phạm
        </h2>
        <p className="text-body-md text-text-muted mt-1">
          Mỗi dòng là một vụ việc: các báo cáo về cùng một tin nhắn, cuộc hẹn
          hoặc hồ sơ được gộp lại và xử lý bằng một quyết định.
        </p>
      </div>

      <AdminStatStrip
        cards={REPORT_STAT_CARDS}
        stats={stats}
        isLoading={isStatsLoading}
        hasError={hasStatsError}
      />

      <SentinelBatchCommandBar
        rows={rows}
        stats={stats}
        isBatchScanning={isBatchScanning}
        isActionLoading={isActionLoading}
        onBatchScan={handleBatchScanSentinel}
        onOpenReportDetail={openReportDetail}
        onResolveCluster={handleResolveCluster}
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
          onChange: ({ from, to }) =>
            setFilters({
              fromDate: from || undefined,
              toDate: to || undefined,
            }),
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
          emptyTitle={
            listErrorMessage
              ? 'Không tải được danh sách vụ việc'
              : 'Không có vụ việc nào'
          }
          emptyMessage={
            listErrorMessage ||
            'Hiện tại không có vụ việc nào phù hợp với bộ lọc tìm kiếm.'
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
              / <span>{pagination.totalPages}</span> ({pagination.total} vụ việc)
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
        onUpdateSeverity={handleUpdateSeverity}
        onDecide={handleDecide}
        onReopen={handleReopen}
        onAssessSentinel={handleAssessSentinel}
      />
    </div>
  );
};

export default AdminReportsPage;
