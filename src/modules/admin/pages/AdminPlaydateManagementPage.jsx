import React from 'react';
import dayjs from 'dayjs';
import {
  Eye,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { useAdminPlaydates } from '../hooks/useAdminPlaydates';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { AdminPlaydateDetailModal } from '../components/AdminPlaydateDetailModal';
import {
  PLAYDATE_STATUS_CHIPS,
  PLAYDATE_STAT_CARDS,
  CANCELLABLE_PLAYDATE_STATUSES,
} from '../constants/admin.constants';
import { ICON_SIZE } from '../../../constants/icon.constants';

export const AdminPlaydateManagementPage = () => {
  const {
    rows,
    pagination,
    isLoading,
    filters,
    searchInput,
    setSearch,
    setFilter,
    setFilters,
    setPage,
    stats,
    listErrorMessage,
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    actionTarget: cancellingPlaydate,
    openAction: initiateCancel,
    closeAction: cancelCancel,
    confirmAction: confirmCancel,
    isActionLoading,
    isExporting,
    handleExport,
  } = useAdminPlaydates();

  const columns = [
    { key: 'activity', label: 'Hoạt động & Thời gian' },
    { key: 'location', label: 'Địa điểm' },
    { key: 'host', label: 'Chủ trì (Host)' },
    { key: 'participants', label: 'Tham gia', headerClassName: 'min-w-col-sm' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'createdAt', label: 'Ngày tạo' },
    { key: 'actions', label: 'Thao tác' },
  ];

  const renderCell = (key, value, row) => {
    switch (key) {
      case 'activity':
        return (
          <div className="space-y-1">
            <span className="font-semibold text-text-primary block line-clamp-1">
              {row.activity}
            </span>
            <div className="flex items-center gap-3 text-label-md text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Calendar size={ICON_SIZE.XS} className="text-primary" />
                {row.scheduledDate
                  ? dayjs(row.scheduledDate).format('DD/MM/YYYY')
                  : '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={ICON_SIZE.XS} className="text-primary" />
                {row.time || '—'}
              </span>
            </div>
          </div>
        );

      case 'location':
        return (
          <div
            className="max-w-48 truncate text-label-md text-text-primary"
            title={row.locationName || row.location?.name}
          >
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin
                size={ICON_SIZE.XS}
                className="text-text-muted shrink-0"
              />
              {row.locationName || row.location?.name || '—'}
            </span>
          </div>
        );

      case 'host': {
        const hostParent = row.host?.parent;
        const hostChild = row.host?.child;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={hostParent?.avatarUrl}
              name={hostParent?.fullName || 'Host'}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-label-md text-text-primary truncate">
                  {hostParent?.fullName || '—'}
                </span>
                {hostParent?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <span className="text-label-sm text-text-muted block">
                Bé: {hostChild?.displayName || '—'}
              </span>
            </div>
          </div>
        );
      }

      case 'participants': {
        const count = row.numberOfParticipants ?? 0;
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-label-md font-medium text-text-primary px-2 py-0.5 rounded-full bg-surface-muted border border-hairline">
            <Users size={ICON_SIZE.XS} className="text-text-muted shrink-0" />
            {count} người
          </span>
        );
      }

      case 'status':
        return <StatusChip status={row.status} />;

      case 'createdAt':
        return (
          <span className="text-label-md text-text-muted">
            {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY') : '—'}
          </span>
        );

      case 'actions':
        return (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Xem chi tiết"
              leftIcon={<Eye size={ICON_SIZE.SM} />}
              onClick={() => openDetail(row)}
            >
              Xem
            </Button>
            {CANCELLABLE_PLAYDATE_STATUSES.includes(row.status) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Hủy cuộc hẹn"
                className="text-error hover:bg-error-container/40"
                leftIcon={<AlertTriangle size={ICON_SIZE.SM} />}
                onClick={() => initiateCancel(row)}
              >
                Hủy
              </Button>
            )}
          </div>
        );

      default:
        return String(value ?? '—');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">
          Quản lý cuộc hẹn chơi
        </h1>
        <p className="text-body-md text-text-muted mt-1">
          Giám sát toàn bộ các buổi hẹn chơi trên hệ thống, xử lý giải quyết
          tranh chấp hoặc can thiệp hủy bỏ khi có sự cố.
        </p>
      </div>

      {/* Platform-wide counts */}
      <AdminStatStrip
        cards={PLAYDATE_STAT_CARDS}
        stats={stats.stats}
        isLoading={stats.isLoading}
        hasError={stats.hasError}
      />

      {/* Toolbar: Search, Status Chips & Date Range Filter */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo hoạt động, địa điểm hoặc chủ trì..."
        statusChips={{
          options: PLAYDATE_STATUS_CHIPS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
        }}
        dateRange={{
          from: filters.fromDate || '',
          to: filters.toDate || '',
          onChange: ({ from, to }) =>
            setFilters({
              fromDate: from || undefined,
              toDate: to || undefined,
            }),
        }}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Data Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          onRowClick={(row) => openDetail(row)}
          renderCell={renderCell}
          emptyTitle={
            listErrorMessage
              ? 'Không tải được danh sách'
              : 'Không tìm thấy cuộc hẹn chơi nào'
          }
          emptyMessage={
            listErrorMessage ||
            'Thử thay đổi bộ lọc tìm kiếm hoặc khoảng thời gian.'
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
              / <span>{pagination.totalPages}</span> ({pagination.total} cuộc
              hẹn)
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

      {/* Detail Modal */}
      <AdminPlaydateDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetail}
        detailData={detailData}
        isLoading={isDetailLoading}
        onInitiateCancel={(pd) => {
          closeDetail();
          initiateCancel(pd);
        }}
      />

      {/* Confirm Force-Cancel Dialog */}
      <ConfirmDialog
        open={Boolean(cancellingPlaydate)}
        title="Buộc hủy cuộc hẹn chơi này?"
        description="Thao tác này của quản trị viên sẽ hủy bỏ cuộc hẹn chơi ngay lập tức, chuyển trạng thái sang đã hủy và hủy mọi yêu cầu đổi lịch đang chờ xử lý."
        confirmLabel="Xác nhận hủy"
        cancelLabel="Quay lại"
        variant="danger"
        reason={{
          required: true,
          label: 'Lý do hủy cuộc hẹn',
          placeholder:
            'Nhập lý do hủy bắt buộc (ví dụ: Vi phạm quy tắc an toàn, tranh chấp giữa các bên)...',
        }}
        isLoading={isActionLoading}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </div>
  );
};

export default AdminPlaydateManagementPage;
