import React from 'react';
import dayjs from 'dayjs';
import { Eye, UserX, Mail } from 'lucide-react';
import { useAdminConnections } from '../hooks/useAdminConnections';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { AdminStatStrip } from '../components/AdminStatStrip';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { AdminConnectionDetailModal } from '../components/AdminConnectionDetailModal';
import {
  CONNECTION_STATUS_CHIPS,
  CONNECTION_STAT_CARDS,
  CONNECTION_STATUS_DISPLAY,
  REMOVABLE_CONNECTION_STATUSES,
} from '../constants/admin.constants';
import { useDispatch } from 'react-redux';
import { useAdminExport } from '../hooks/useAdminExport';
import { fetchAllPages } from '../utils/excelExport';
import { fetchAdminConnections } from '../redux/adminSlice';
import { ICON_SIZE } from '../../../constants/icon.constants';

export const AdminConnectionManagementPage = () => {
  const {
    rows,
    pagination,
    isLoading,
    filters,
    searchInput,
    setSearch,
    setFilter,
    setPage,
    stats,
    listErrorMessage,
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    actionTarget: removingConnection,
    openAction: initiateRemove,
    closeAction: cancelRemove,
    confirmAction: confirmRemove,
    isActionLoading,
  } = useAdminConnections();

  const dispatch = useDispatch();
  const { isExporting, handleExport } = useAdminExport('connections', async () => {
    const allConnections = await fetchAllPages(
      (params) => dispatch(fetchAdminConnections(params)).unwrap(),
      {
        search: searchInput,
        status: filters.status || undefined,
      }
    );
    return { connections: allConnections, stats: stats.stats };
  });

  const columns = [
    { key: 'requester', label: 'Phụ huynh gửi yêu cầu' },
    { key: 'recipient', label: 'Phụ huynh nhận yêu cầu' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'createdAt', label: 'Ngày gửi' },
    { key: 'resolvedAt', label: 'Mốc thời gian xử lý' },
    { key: 'actions', label: 'Thao tác' },
  ];

  const renderCell = (key, value, row) => {
    switch (key) {
      case 'requester': {
        const p = row.requester;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={p?.avatarUrl}
              name={p?.fullName || 'Requester'}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-label-md text-text-primary truncate">
                  {p?.fullName || '—'}
                </span>
                {p?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {p?.email && (
                <span className="text-label-sm text-text-muted flex items-center gap-0.5 truncate">
                  <Mail size={ICON_SIZE.XS} />
                  {p.email}
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'recipient': {
        const p = row.recipient;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={p?.avatarUrl}
              name={p?.fullName || 'Recipient'}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-label-md text-text-primary truncate">
                  {p?.fullName || '—'}
                </span>
                {p?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {p?.email && (
                <span className="text-label-sm text-text-muted flex items-center gap-0.5 truncate">
                  <Mail size={ICON_SIZE.XS} />
                  {p.email}
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'status': {
        return (
          <StatusChip
            status={row.status}
            {...CONNECTION_STATUS_DISPLAY[row.status]}
          />
        );
      }

      case 'createdAt':
        return (
          <span className="text-label-md text-text-muted">
            {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY') : '—'}
          </span>
        );

      case 'resolvedAt': {
        let label = '—';
        if (row.status === 'accepted' && row.connectedAt) {
          label = `Kết nối: ${dayjs(row.connectedAt).format('DD/MM/YYYY')}`;
        } else if (row.status === 'declined' && row.declinedAt) {
          label = `Từ chối: ${dayjs(row.declinedAt).format('DD/MM/YYYY')}`;
        } else if (row.status === 'removed' && row.removedAt) {
          label = `Đã gỡ: ${dayjs(row.removedAt).format('DD/MM/YYYY')}`;
        }
        return <span className="text-label-md text-text-muted">{label}</span>;
      }

      case 'actions': {
        const isRemovable = REMOVABLE_CONNECTION_STATUSES.includes(row.status);
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
            {isRemovable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Gỡ kết nối"
                className="text-error hover:bg-error-container/40"
                leftIcon={<UserX size={ICON_SIZE.SM} />}
                onClick={() => initiateRemove(row)}
              >
                Gỡ
              </Button>
            )}
          </div>
        );
      }

      default:
        return String(value ?? '—');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-md font-semibold tracking-tight text-text-primary">
          Quản lý kết nối
        </h1>
        <p className="text-body-md text-text-muted mt-1">
          Giám sát các mối liên kết giữa các gia đình và xử lý gỡ kết nối khi có
          vi phạm hoặc mâu thuẫn.
        </p>
      </div>

      {/* Platform-wide counts */}
      <AdminStatStrip
        cards={CONNECTION_STAT_CARDS}
        stats={stats.stats}
        isLoading={stats.isLoading}
        hasError={stats.hasError}
      />

      {/* Toolbar: Search & Status Chips */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên phụ huynh hoặc tên bé..."
        statusChips={{
          options: CONNECTION_STATUS_CHIPS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
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
              : 'Không tìm thấy mối kết nối nào'
          }
          emptyMessage={
            listErrorMessage ||
            'Thử thay đổi từ khóa tìm kiếm hoặc trạng thái kết nối.'
          }
        />

        {/* Pagination & Summary */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-body-md text-text-muted">
              Hiển thị trang{' '}
              <span className="font-semibold text-text-primary">
                {pagination.page}
              </span>{' '}
              / <span>{pagination.totalPages}</span> ({pagination.total} kết
              nối)
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
      <AdminConnectionDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetail}
        detailData={detailData}
        isLoading={isDetailLoading}
        onInitiateRemove={(conn) => {
          closeDetail();
          initiateRemove(conn);
        }}
      />

      {/* Confirm Soft-Remove Dialog */}
      <ConfirmDialog
        open={Boolean(removingConnection)}
        title="Gỡ mối quan hệ kết nối này?"
        description="Thao tác này của quản trị viên sẽ chuyển trạng thái mối quan hệ giữa hai gia đình sang 'Đã gỡ' (soft-remove). Hồ sơ và lịch sử tương tác vẫn được lưu trữ trên hệ thống."
        confirmLabel="Xác nhận gỡ"
        cancelLabel="Quay lại"
        variant="danger"
        reason={{
          required: false,
          label: 'Lý do gỡ kết nối (tùy chọn)',
          placeholder: 'Nhập lý do gỡ kết nối nếu có...',
        }}
        isLoading={isActionLoading}
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
};

export default AdminConnectionManagementPage;
