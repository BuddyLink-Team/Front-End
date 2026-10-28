import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  MapPin,
  Calendar,
  UserX,
  Mail,
  ShieldAlert,
  Baby,
  ArrowLeftRight,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import {
  CHILD_PAIR_SOURCE_LABELS,
  CONNECTION_STATUS_DISPLAY,
  GENDER_LABELS,
  REMOVABLE_CONNECTION_STATUSES,
} from '../constants/admin.constants';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { ICON_SIZE } from '../../../constants/icon.constants';
import { formatAgeYears, formatDateTime } from '../../../utils/formatters';

const SECTION_TITLE =
  'text-label-md font-semibold text-text-muted uppercase tracking-wider';

const DetailSkeleton = () => (
  <div className="space-y-6" data-testid="connection-detail-skeleton">
    <div className="space-y-2 pb-4 border-b border-hairline">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-20 w-full rounded-xl" />
  </div>
);

const ParentCard = ({ parent, roleTitle }) => {
  if (!parent) return null;

  return (
    <div className="p-4 rounded-xl border border-hairline bg-surface-muted/30 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-hairline">
        <span className={SECTION_TITLE}>{roleTitle}</span>
        <StatusChip
          status={parent.isActive ? 'active' : 'locked'}
          label={parent.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        />
      </div>

      <div className="flex items-start gap-3">
        <Avatar src={parent.avatarUrl} name={parent.fullName} size="md" />
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-body-md font-semibold text-text-primary">
              {parent.fullName}
            </span>
            {parent.isVerified && <VerifiedBadge size="sm" />}
          </div>

          {parent.email && (
            <p className="text-label-md text-text-muted flex items-center gap-1 truncate">
              <Mail size={ICON_SIZE.XS} className="shrink-0" />
              {parent.email}
            </p>
          )}

          {(parent.location?.area || parent.location?.city) && (
            <p className="text-label-md text-text-muted flex items-center gap-1">
              <MapPin size={ICON_SIZE.XS} className="shrink-0" />
              {[parent.location?.area, parent.location?.city]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
      </div>

      {parent.bio && (
        <p className="text-label-md text-text-muted italic bg-surface-container-lowest p-2.5 rounded-lg border border-hairline">
          &ldquo;{parent.bio}&rdquo;
        </p>
      )}

      <div className="pt-2">
        {/* Opens this parent's detail on the parents screen (useAdminUsers reads openUserId) */}
        <Link
          to={ADMIN_ROUTES.USERS}
          state={{ openUserId: parent.userId }}
          className="inline-flex items-center gap-1.5 text-label-md font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <ExternalLink size={ICON_SIZE.SM} />
          Xem tài khoản / Khóa tài khoản
        </Link>
      </div>
    </div>
  );
};

// One child of a pair; links to the child profile (useAdminChildren reads openChildId)
const PairChild = ({ child, parentName }) => (
  <Link
    to={ADMIN_ROUTES.CHILDREN}
    state={{ openChildId: child.id }}
    className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 hover:bg-surface-muted transition-colors"
  >
    <span className="block font-semibold text-text-primary truncate">
      {child.displayName || '—'}
      {child.isArchived && (
        <span className="ml-1.5 font-medium text-text-muted">(đã xóa)</span>
      )}
    </span>
    <span className="block text-text-muted truncate">
      {[
        formatAgeYears(child.age),
        GENDER_LABELS[child.gender],
        parentName && `Con của ${parentName}`,
      ]
        .filter(Boolean)
        .join(' • ')}
    </span>
  </Link>
);

export const AdminConnectionDetailModal = ({
  isOpen,
  onClose,
  detailData,
  isLoading,
  onInitiateRemove,
}) => {
  if (!isOpen) return null;

  const statusDisplay = detailData?.status
    ? CONNECTION_STATUS_DISPLAY[detailData.status]
    : null;
  const isRemovable =
    detailData && REMOVABLE_CONNECTION_STATUSES.includes(detailData.status);
  const parentNameById = {
    [detailData?.requester?.id]: detailData?.requester?.fullName,
    [detailData?.recipient?.id]: detailData?.recipient?.fullName,
  };
  const childPairs = detailData?.childPairs || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết mối quan hệ kết nối"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        detailData && (
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2">
              {isRemovable && (
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={<UserX size={ICON_SIZE.SM} />}
                  onClick={() => onInitiateRemove?.(detailData)}
                >
                  Gỡ kết nối
                </Button>
              )}
            </div>
          </div>
        )
      }
    >
      <div className="py-2">
        {isLoading || !detailData ? (
          <DetailSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-body-md font-semibold text-text-primary">
                    Trạng thái:
                  </span>
                  <StatusChip status={detailData.status} {...statusDisplay} />
                </div>
                <p className="text-label-md text-text-muted flex items-center gap-1.5">
                  <Calendar size={ICON_SIZE.SM} className="text-primary" />
                  Yêu cầu gửi lúc: {formatDateTime(detailData.createdAt) || '—'}
                </p>
              </div>
            </div>

            {/* Removal Info Notice */}
            {detailData.status === 'removed' && (
              <div className="p-4 rounded-xl bg-surface-muted border border-hairline space-y-1.5">
                <div className="flex items-center gap-2 text-text-primary font-semibold text-label-md uppercase tracking-wider">
                  <ShieldAlert
                    size={ICON_SIZE.MD}
                    className="text-text-muted"
                  />
                  <span>Thông tin gỡ kết nối</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-label-md">
                  <div>
                    <span className="text-text-muted">Thời gian gỡ: </span>
                    <span className="font-medium text-text-primary">
                      {formatDateTime(detailData.removedAt) || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Xử lý bởi: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.removedByAdmin
                        ? 'Quản trị viên'
                        : 'Phụ huynh'}
                    </span>
                  </div>
                  {detailData.removalReason && (
                    <div className="sm:col-span-2">
                      <span className="text-text-muted">Lý do: </span>
                      <span className="font-medium text-text-primary">
                        {detailData.removalReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Both Parents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ParentCard
                parent={detailData.requester}
                roleTitle="Phụ huynh gửi lời mời"
              />
              <ParentCard
                parent={detailData.recipient}
                roleTitle="Phụ huynh nhận lời mời"
              />
            </div>

            {/* Matched children */}
            <div className="space-y-2">
              <h3 className={`${SECTION_TITLE} flex items-center gap-1.5`}>
                <Baby size={ICON_SIZE.SM} />
                Các bé được ghép đôi ({childPairs.length})
              </h3>
              {!childPairs.length ? (
                <p className="text-label-md text-text-muted italic py-1">
                  Chưa có cặp bé nào được ghép.
                </p>
              ) : (
                <div className="space-y-2">
                  {childPairs.map((pair, idx) => (
                    <div
                      key={pair.children.map((c) => c.id).join('_') || idx}
                      className="p-2 rounded-xl border border-hairline text-label-md space-y-1"
                    >
                      <div className="flex items-center gap-1">
                        <PairChild
                          child={pair.children[0] || {}}
                          parentName={
                            parentNameById[pair.children[0]?.parentId]
                          }
                        />
                        <ArrowLeftRight
                          size={ICON_SIZE.SM}
                          className="text-text-muted shrink-0"
                        />
                        <PairChild
                          child={pair.children[1] || {}}
                          parentName={
                            parentNameById[pair.children[1]?.parentId]
                          }
                        />
                      </div>
                      <p className="px-2.5 text-text-muted">
                        {[
                          CHILD_PAIR_SOURCE_LABELS[pair.source],
                          typeof pair.matchScore === 'number' &&
                            `Độ phù hợp ${pair.matchScore}%`,
                          pair.createdAt &&
                            `Ghép lúc ${formatDateTime(pair.createdAt)}`,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/20 space-y-2 text-label-md">
              <span className={`${SECTION_TITLE} block`}>Mốc thời gian</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-text-muted">
                <div>
                  <span>Tạo yêu cầu: </span>
                  <span className="font-medium text-text-primary block">
                    {formatDateTime(detailData.createdAt) || '—'}
                  </span>
                </div>
                {detailData.connectedAt && (
                  <div>
                    <span>Chấp nhận kết nối: </span>
                    <span className="font-medium text-primary block">
                      {formatDateTime(detailData.connectedAt)}
                    </span>
                  </div>
                )}
                {detailData.declinedAt && (
                  <div>
                    <span>Từ chối yêu cầu: </span>
                    <span className="font-medium text-error block">
                      {formatDateTime(detailData.declinedAt)}
                    </span>
                  </div>
                )}
                {detailData.removedAt && (
                  <div>
                    <span>Đã gỡ kết nối: </span>
                    <span className="font-medium text-text-primary block">
                      {formatDateTime(detailData.removedAt)}
                    </span>
                  </div>
                )}
                <div>
                  <span>Cập nhật gần nhất: </span>
                  <span className="font-medium text-text-primary block">
                    {formatDateTime(detailData.updatedAt) || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdminConnectionDetailModal;
