import React from 'react';
import dayjs from 'dayjs';
import { Eye, UserX, Mail } from 'lucide-react';
import { useAdminConnections } from '../hooks/useAdminConnections';
import { AdminListToolbar } from '../components/AdminListToolbar';
import { DataTable } from '../../../components/ui/DataTable';
import { Pagination } from '../../../components/navigation/Pagination';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { AdminConnectionDetailModal } from '../components/AdminConnectionDetailModal';
import {
  ADMIN_CONNECTION_STATUS_OPTIONS,
  CONNECTION_STATUS_CONFIG,
} from '../constants/adminConstants';

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
    detailData,
    isDetailLoading,
    isDetailModalOpen,
    openDetail,
    closeDetail,
    removingConnection,
    initiateRemove,
    cancelRemove,
    confirmRemove,
    isActionLoading,
  } = useAdminConnections();

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
            <Avatar src={p?.avatarUrl} name={p?.fullName || 'Requester'} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-text-primary truncate">
                  {p?.fullName || '—'}
                </span>
                {p?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {p?.email && (
                <span className="text-2xs text-text-muted flex items-center gap-0.5 truncate">
                  <Mail className="w-2.5 h-2.5" />
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
            <Avatar src={p?.avatarUrl} name={p?.fullName || 'Recipient'} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-text-primary truncate">
                  {p?.fullName || '—'}
                </span>
                {p?.isVerified && <VerifiedBadge size="sm" />}
              </div>
              {p?.email && (
                <span className="text-2xs text-text-muted flex items-center gap-0.5 truncate">
                  <Mail className="w-2.5 h-2.5" />
                  {p.email}
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'status': {
        const config = CONNECTION_STATUS_CONFIG[row.status];
        return (
          <StatusChip
            status={row.status}
            label={config?.label}
            tone={config?.tone}
          />
        );
      }

      case 'createdAt':
        return (
          <span className="text-xs text-text-muted">
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
        return <span className="text-xs text-text-muted">{label}</span>;
      }

      case 'actions': {
        const isRemovable = ['pending', 'accepted'].includes(row.status);
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
            {isRemovable && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Gỡ kết nối"
                className="text-error hover:bg-error-container/40"
                leftIcon={<UserX className="w-3.5 h-3.5" />}
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Quản lý kết nối (Connections)
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Giám sát các mối liên kết giữa các gia đình và xử lý gỡ kết nối khi có vi phạm hoặc mâu thuẫn.
        </p>
      </div>

      {/* Toolbar: Search & Status Chips */}
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên phụ huynh hoặc tên bé..."
        statusChips={{
          options: ADMIN_CONNECTION_STATUS_OPTIONS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
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
          emptyTitle="Không tìm thấy mối kết nối nào"
          emptyMessage="Thử thay đổi từ khóa tìm kiếm hoặc trạng thái kết nối."
        />

        {/* Pagination & Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-text-muted">
            Hiển thị <span className="font-semibold text-text-primary">{rows.length}</span> trên tổng số{' '}
            <span className="font-semibold text-text-primary">{pagination.total}</span> kết nối
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
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
