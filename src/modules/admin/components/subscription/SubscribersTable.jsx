import React from 'react';
import { Eye, Crown } from 'lucide-react';
import { AdminListToolbar } from '../AdminListToolbar';
import { AdminFilterDropdown } from '../AdminFilterDropdown';
import { DataTable } from '../../../../components/ui/DataTable';
import { Pagination } from '../../../../components/navigation/Pagination';
import { StatusChip } from '../../../../components/badges/StatusChip';
import { Avatar } from '../../../../components/ui/Avatar';
import { Modal } from '../../../../components/feedback/Modal';
import { Button } from '../../../../components/ui/Button';
import { useAdminSubscriptions } from '../../hooks/useAdminSubscriptions';
import {
  SUBSCRIPTION_PLAN_FILTER_OPTIONS,
  SUBSCRIPTION_PLAN_NAMES,
  SUBSCRIPTION_STATUS_CHIPS,
  SUBSCRIPTION_STATUS_DISPLAY,
} from '../../constants/admin.constants';
import { formatDate, formatDateTime } from '../../../../utils/formatters';
import { cn } from '../../../../utils/cn';
import { ICON_SIZE } from '../../../../constants/icon.constants';

const COLUMNS = [
  { key: 'parent', label: 'Phụ huynh', headerClassName: 'min-w-col-2xl' },
  { key: 'planCode', label: 'Gói dịch vụ', headerClassName: 'min-w-col-plan' },
  { key: 'startDate', label: 'Ngày bắt đầu', headerClassName: 'min-w-col-md' },
  { key: 'endDate', label: 'Ngày hết hạn', headerClassName: 'min-w-col-md' },
  { key: 'status', label: 'Trạng thái', headerClassName: 'min-w-col-md' },
  { key: 'actions', label: 'Thao tác', align: 'right', headerClassName: 'min-w-col-actions' },
];

const SubscriptionStatusChip = ({ status }) => {
  const chip = SUBSCRIPTION_STATUS_DISPLAY[status];
  return <StatusChip status={chip?.status || status} label={chip?.label} />;
};

/**
 * Subscribers tab: subscription of every parent, filtered by plan and status.
 */
export const SubscribersTable = () => {
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
    selectedSubscription,
    openDetail,
    closeDetail,
  } = useAdminSubscriptions();

  const renderCell = (key, _val, row) => {
    switch (key) {
      case 'parent':
        return (
          <div className="flex items-center gap-3">
            <Avatar src={row.parent?.avatarUrl} alt={row.parent?.fullName} size="md" />
            <div className="min-w-0 text-body-md">
              <p className="font-semibold text-text-primary truncate">{row.parent?.fullName || '—'}</p>
              <p className="text-label-md text-text-muted truncate">{row.parent?.email || '—'}</p>
            </div>
          </div>
        );

      case 'planCode':
        return (
          <span className="text-body-md text-text-primary whitespace-nowrap">
            {SUBSCRIPTION_PLAN_NAMES[row.planCode] || row.planCode}
          </span>
        );

      case 'startDate':
        return <span className="text-body-md text-text-muted whitespace-nowrap">{formatDate(row.startDate)}</span>;

      case 'endDate': {
        if (!row.endDate) return <span className="text-body-md text-text-muted">Không thời hạn</span>;
        const isPast = new Date(row.endDate) < new Date();
        return (
          <span className={cn('text-body-md whitespace-nowrap', isPast ? 'text-error' : 'text-text-primary')}>
            {formatDate(row.endDate)}
          </span>
        );
      }

      case 'status':
        return <SubscriptionStatusChip status={row.status} />;

      case 'actions':
        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetail(row);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-low transition-colors"
              aria-label="Xem chi tiết thuê bao"
            >
              <Eye size={ICON_SIZE.MD} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <AdminListToolbar
        searchValue={searchInput}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên hoặc email phụ huynh..."
        statusChips={{
          options: SUBSCRIPTION_STATUS_CHIPS,
          selected: filters.status || '',
          onChange: (val) => setFilter('status', val || undefined),
        }}
      >
        <AdminFilterDropdown
          icon={Crown}
          header="Gói dịch vụ"
          options={SUBSCRIPTION_PLAN_FILTER_OPTIONS}
          value={filters.planCode}
          onChange={(val) => setFilter('planCode', val || undefined)}
        />
      </AdminListToolbar>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        onRowClick={openDetail}
        renderCell={renderCell}
        emptyTitle={listErrorMessage ? 'Không tải được danh sách' : 'Chưa có thuê bao'}
        emptyMessage={listErrorMessage || 'Không tìm thấy thuê bao nào phù hợp với bộ lọc.'}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-body-md text-text-muted">
            Hiển thị trang <span className="font-semibold text-text-primary">{pagination.page}</span> /{' '}
            <span>{pagination.totalPages}</span> ({pagination.total} thuê bao)
          </p>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedSubscription)}
        onClose={closeDetail}
        title="Chi tiết thuê bao"
        maxWidth="max-w-md"
        footer={
          <Button type="button" variant="secondary" onClick={closeDetail}>
            Đóng
          </Button>
        }
      >
        {selectedSubscription && (
          <div className="space-y-4 text-body-md">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-low">
              <Avatar
                src={selectedSubscription.parent?.avatarUrl}
                alt={selectedSubscription.parent?.fullName}
                size="md"
              />
              <div className="min-w-0">
                <p className="font-semibold text-text-primary truncate">{selectedSubscription.parent?.fullName}</p>
                <p className="text-label-md text-text-muted truncate">{selectedSubscription.parent?.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-label-md text-text-muted">Gói hiện tại</dt>
                <dd className="font-semibold text-text-primary">
                  {SUBSCRIPTION_PLAN_NAMES[selectedSubscription.planCode] || selectedSubscription.planCode}
                </dd>
              </div>
              <div>
                <dt className="text-label-md text-text-muted">Trạng thái</dt>
                <dd>
                  <SubscriptionStatusChip status={selectedSubscription.status} />
                </dd>
              </div>
              <div>
                <dt className="text-label-md text-text-muted">Ngày bắt đầu</dt>
                <dd className="text-text-primary">{formatDateTime(selectedSubscription.startDate)}</dd>
              </div>
              <div>
                <dt className="text-label-md text-text-muted">Ngày hết hạn</dt>
                <dd className="text-text-primary">
                  {selectedSubscription.endDate ? formatDateTime(selectedSubscription.endDate) : 'Không thời hạn'}
                </dd>
              </div>
              <div>
                <dt className="text-label-md text-text-muted">Số tháng đã mua</dt>
                <dd className="text-text-primary">{selectedSubscription.purchasedMonths || 0}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscribersTable;
