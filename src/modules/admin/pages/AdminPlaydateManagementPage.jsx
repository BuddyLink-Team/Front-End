import React from 'react';
import dayjs from 'dayjs';
import { Eye, AlertTriangle, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAdminPlaydates } from '../hooks/useAdminPlaydates';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { AdminPlaydateDetailModal } from '../components/AdminPlaydateDetailModal';
import { ADMIN_PLAYDATE_STATUS_OPTIONS } from '../constants/adminConstants';

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
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    cancellingPlaydate,
    initiateCancel,
    cancelCancel,
    confirmCancel,
    isActionLoading,
  } = useAdminPlaydates();

  const columns = [
    { key: 'activity', label: 'Hoạt động & Thời gian' },
    { key: 'location', label: 'Địa điểm' },
    { key: 'host', label: 'Chủ trì (Host)' },
    { key: 'participants', label: 'Tham gia' },
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
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary stroke-2" />
                {row.scheduledDate ? dayjs(row.scheduledDate).format('DD/MM/YYYY') : '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary stroke-2" />
                {row.time || '—'}
              </span>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="max-w-48 truncate text-xs text-text-primary" title={row.locationName || row.location?.name}>
            <span className="inline-flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-text-muted shrink-0" />
              {row.locationName || row.location?.name || '—'}
            </span>
          </div>
        );

      case 'host': {
        const hostParent = row.host?.parent;
        const hostChild = row.host?.child;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar src={hostParent?.avatarUrl} name={hostParent?.fullName || 'Host'} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-text-primary truncate">
                  {hostParent?.fullName || '—'}
                </span>
                {hostParent?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <span className="text-2xs text-text-muted block">
                Bé: {hostChild?.displayName || '—'}
              </span>
            </div>
          </div>
        );
      }

      case 'participants': {
        const count = row.numberOfParticipants ?? row.participantCount ?? 0;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-text-primary px-2 py-0.5 rounded-full bg-surface-muted border border-hairline">
            <Users className="w-3 h-3 text-text-muted" />
            {count} người
          </span>
        );
      }

      case 'status':
        return <StatusChip status={row.status} />;

      case 'createdAt':
        return (
          <span className="text-xs text-text-muted">
            {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY') : '—'}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Xem chi tiết"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              onClick={() => openDetail(row)}
            >
              Xem
            </Button>
            {row.status === 'upcoming' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Hủy cuộc hẹn"
                className="text-error hover:bg-error-container/40"
                leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Quản lý cuộc hẹn chơi (Playdates)
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Giám sát toàn bộ các buổi hẹn chơi trên hệ thống, xử lý giải quyết tranh chấp hoặc can thiệp hủy bỏ khi có sự cố.
        </p>
      </div>

      {/* Toolbar: Search, Status Chips & Date Range Filter */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo hoạt động, địa điểm hoặc chủ trì..."
        statusChips={{
          options: ADMIN_PLAYDATE_STATUS_OPTIONS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
        }}
        dateRange={{
          from: filters.fromDate || '',
          to: filters.toDate || '',
          onChange: ({ from, to }) =>
            setFilters({ fromDate: from || undefined, toDate: to || undefined }),
        }}
      />

      {/* Data Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          onRowClick={(row) => openDetail(row)}
          renderCell={renderCell}
          emptyTitle="Không tìm thấy cuộc hẹn chơi nào"
          emptyMessage="Thử thay đổi bộ lọc tìm kiếm hoặc khoảng thời gian."
        />

        {/* Pagination & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-text-muted">
            Hiển thị <span className="font-semibold text-text-primary">{rows.length}</span> trên tổng số{' '}
            <span className="font-semibold text-text-primary">{pagination.total}</span> cuộc hẹn
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
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
          placeholder: 'Nhập lý do hủy bắt buộc (ví dụ: Vi phạm quy tắc an toàn, tranh chấp giữa các bên)...',
        }}
        isLoading={isActionLoading}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />
    </div>
  );
};

export default AdminPlaydateManagementPage;
