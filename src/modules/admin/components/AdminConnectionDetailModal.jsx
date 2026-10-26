import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ExternalLink,
  MapPin,
  Calendar,
  AlertTriangle,
  UserX,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { LoadingOverlay } from '../../../components/feedback/LoadingOverlay';
import { CONNECTION_STATUS_CONFIG } from '../constants/adminConstants';

export const AdminConnectionDetailModal = ({
  isOpen,
  onClose,
  detailData,
  isLoading,
  onInitiateRemove,
}) => {
  if (!isOpen) return null;

  const statusConfig = detailData?.status
    ? CONNECTION_STATUS_CONFIG[detailData.status]
    : null;

  const renderParentCard = (parent, roleTitle) => {
    if (!parent) return null;

    const userSearchQuery = parent.email || parent.fullName;

    return (
      <div className="p-4 rounded-xl border border-hairline bg-surface-muted/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {roleTitle}
          </span>
          <StatusChip
            status={parent.isActive ? 'active' : 'locked'}
            label={parent.isActive ? 'Đang hoạt động' : 'Đã khóa'}
          />
        </div>

        <div className="flex items-start gap-3">
          <Avatar src={parent.avatarUrl} name={parent.fullName} size="md" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-text-primary">
                {parent.fullName}
              </span>
              {parent.isVerified && <VerifiedBadge size="sm" />}
            </div>

            {parent.email && (
              <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                {parent.email}
              </p>
            )}

            {(parent.location?.area || parent.location?.city) && (
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {[parent.location?.area, parent.location?.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        {parent.bio && (
          <p className="text-xs text-text-muted italic bg-white/60 p-2.5 rounded-lg border border-hairline">
            "{parent.bio}"
          </p>
        )}

        <div className="pt-2">
          <Link
            to={`/admin/users?search=${encodeURIComponent(userSearchQuery)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem tài khoản / Khóa tài khoản
          </Link>
        </div>
      </div>
    );
  };

  const isRemovable = detailData && ['pending', 'accepted'].includes(detailData.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết mối quan hệ kết nối"
      maxWidth="max-w-2xl"
    >
      <div className="relative min-h-72 p-6 space-y-6">
        <LoadingOverlay show={isLoading} />

        {detailData && (
          <>
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-text-primary">Trạng thái:</span>
                  <StatusChip
                    status={detailData.status}
                    label={statusConfig?.label}
                    tone={statusConfig?.tone}
                  />
                </div>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary stroke-2" />
                  Yêu cầu gửi ngày:{' '}
                  {detailData.createdAt ? dayjs(detailData.createdAt).format('HH:mm DD/MM/YYYY') : '—'}
                </p>
              </div>

              {isRemovable && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  leftIcon={<UserX className="w-3.5 h-3.5" />}
                  onClick={() => onInitiateRemove?.(detailData)}
                >
                  Gỡ kết nối
                </Button>
              )}
            </div>

            {/* Removal Info Notice */}
            {detailData.status === 'removed' && (
              <div className="p-4 rounded-xl bg-surface-muted border border-hairline space-y-1.5">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-text-muted" />
                  <span>Thông tin gỡ kết nối</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-muted">Thời gian gỡ: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.removedAt ? dayjs(detailData.removedAt).format('HH:mm DD/MM/YYYY') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Xử lý bởi: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.removedByAdmin ? 'Quản trị viên (Admin)' : 'Phụ huynh'}
                    </span>
                  </div>
                  {detailData.removalReason && (
                    <div className="sm:col-span-2">
                      <span className="text-text-muted">Lý do: </span>
                      <span className="font-medium text-text-primary">{detailData.removalReason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Both Parents Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderParentCard(detailData.requester, 'Phụ huynh gửi lời mời')}
              {renderParentCard(detailData.recipient, 'Phụ huynh nhận lời mời')}
            </div>

            {/* Timestamps */}
            <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/20 space-y-2 text-xs">
              <span className="font-semibold text-text-muted uppercase tracking-wider block">
                Mốc thời gian
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-text-muted">
                <div>
                  <span>Tạo yêu cầu: </span>
                  <span className="font-medium text-text-primary block">
                    {detailData.createdAt ? dayjs(detailData.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                  </span>
                </div>
                {detailData.connectedAt && (
                  <div>
                    <span>Chấp nhận kết nối: </span>
                    <span className="font-medium text-primary block">
                      {dayjs(detailData.connectedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
                {detailData.declinedAt && (
                  <div>
                    <span>Từ chối yêu cầu: </span>
                    <span className="font-medium text-error block">
                      {dayjs(detailData.declinedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
                {detailData.removedAt && (
                  <div>
                    <span>Đã gỡ kết nối: </span>
                    <span className="font-medium text-text-primary block">
                      {dayjs(detailData.removedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-4 bg-surface-muted/50 border-t border-hairline flex justify-end">
        <Button type="button" variant="ghost" size="md" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default AdminConnectionDetailModal;
