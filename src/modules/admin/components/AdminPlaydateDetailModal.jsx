import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import {
  CANCELLABLE_PLAYDATE_STATUSES,
  GENDER_LABELS,
  PARTICIPANT_STATUS_DISPLAY,
} from '../constants/admin.constants';
import { ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { ICON_SIZE } from '../../../constants/icon.constants';
import {
  formatChildAge,
  formatDate,
  formatDateTime,
  formatTimeRange,
} from '../../../utils/formatters';

const SECTION_TITLE =
  'text-label-md font-semibold text-text-muted uppercase tracking-wider';

// "Bé Bơ • 4 tuổi • Bé trai"
const describeChild = (child) =>
  [
    child?.displayName,
    formatChildAge(child?.dateOfBirth),
    GENDER_LABELS[child?.gender],
  ]
    .filter(Boolean)
    .join(' • ') || '—';

// Who cancelled: an admin, the host, or the system (cancelledBy is null when the midnight job closes it)
const describeCanceller = (playdate) => {
  if (playdate.cancellation?.cancelledByAdmin) return 'Quản trị viên';
  if (!playdate.cancellation?.cancelledBy)
    return 'Hệ thống tự hủy (không ai tham gia)';
  return playdate.host?.parent?.fullName || 'Chủ trì';
};

// The reschedule request only carries parent ids: names come from the host and the participants
const findParentName = (playdate, parentId) => {
  if (!parentId) return '';
  if (playdate.host?.parent?.id === parentId)
    return playdate.host.parent.fullName;
  return (
    playdate.participants?.find((p) => p.parentId === parentId)?.parent
      ?.fullName || ''
  );
};

// Opens the parent's detail on the parents screen (useAdminUsers reads openUserId)
const AccountLink = ({ userId }) =>
  userId ? (
    <Link
      to={ADMIN_ROUTES.USERS}
      state={{ openUserId: userId }}
      className="inline-flex items-center gap-1 text-label-md font-semibold text-primary hover:text-primary-dark transition-colors"
    >
      <ExternalLink size={ICON_SIZE.XS} />
      Xem tài khoản
    </Link>
  ) : null;

const DetailSkeleton = () => (
  <div className="space-y-6" data-testid="playdate-detail-skeleton">
    <div className="space-y-2 pb-4 border-b border-hairline">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <Skeleton className="h-20 w-full rounded-2xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  </div>
);

export const AdminPlaydateDetailModal = ({
  isOpen,
  onClose,
  detailData,
  isLoading,
  onInitiateCancel,
}) => {
  if (!isOpen) return null;

  const reschedule = detailData?.pendingReschedule;
  const rescheduleVotes = reschedule?.responses || [];
  const acceptedVotes = rescheduleVotes.filter(
    (r) => r.status === 'accepted',
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết cuộc hẹn chơi"
      placement="right"
      maxWidth="max-w-xl"
      footer={
        detailData && (
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2">
              {CANCELLABLE_PLAYDATE_STATUSES.includes(detailData.status) && (
                <Button
                  type="button"
                  variant="danger"
                  leftIcon={<AlertTriangle size={ICON_SIZE.SM} />}
                  onClick={() => onInitiateCancel?.(detailData)}
                >
                  Hủy cuộc hẹn
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-hairline">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-title-md font-semibold text-text-primary tracking-tight">
                    {detailData.activity}
                  </h2>
                  <StatusChip status={detailData.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-label-md text-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={ICON_SIZE.SM} className="text-primary" />
                    {formatDate(detailData.scheduledDate) || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={ICON_SIZE.SM} className="text-primary" />
                    {formatTimeRange(
                      detailData.time,
                      detailData.durationMinutes,
                    ) || '—'}
                    {detailData.durationMinutes
                      ? ` (${detailData.durationMinutes} phút)`
                      : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={ICON_SIZE.SM} className="text-primary" />
                    {detailData.location?.name || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            {detailData.status === 'cancelled' && (
              <div className="p-4 rounded-xl bg-error-container/40 border border-error/20 space-y-2">
                <div className="flex items-center gap-2 text-error font-semibold text-body-md">
                  <ShieldAlert size={ICON_SIZE.MD} className="shrink-0" />
                  <span>Thông tin hủy cuộc hẹn</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-label-md">
                  <div>
                    <span className="text-text-muted">Người hủy: </span>
                    <span className="font-semibold text-text-primary">
                      {describeCanceller(detailData)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Thời gian: </span>
                    <span className="font-medium text-text-primary">
                      {formatDateTime(detailData.cancellation?.cancelledAt) ||
                        '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-text-muted">Lý do: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.cancellation?.reason || 'Không nêu lý do'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Reschedule */}
            {reschedule && (
              <div className="p-4 rounded-xl bg-tertiary-soft border border-tertiary-border space-y-2">
                <div className="flex items-center gap-2 text-tertiary-dark font-semibold text-body-md">
                  <Info size={ICON_SIZE.MD} className="shrink-0" />
                  <span>Có đề xuất dời lịch đang chờ duyệt</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-label-md text-text-primary">
                  <p>
                    <span className="text-text-muted">Người đề xuất: </span>
                    <span className="font-semibold">
                      {reschedule.requestedBy?.fullName ||
                        findParentName(
                          detailData,
                          reschedule.requestedBy?.id,
                        ) ||
                        '—'}
                    </span>
                  </p>
                  <p>
                    <span className="text-text-muted">Thời gian mới: </span>
                    <span className="font-semibold">
                      {formatDate(reschedule.newDate)}{' '}
                      {formatTimeRange(
                        reschedule.newStartTime,
                        detailData.durationMinutes,
                      )}
                    </span>
                  </p>
                  {rescheduleVotes.length > 0 && (
                    <p>
                      <span className="text-text-muted">Đã đồng ý: </span>
                      <span className="font-semibold">
                        {acceptedVotes}/{rescheduleVotes.length} gia đình
                      </span>
                    </p>
                  )}
                  {reschedule.reason && (
                    <p className="sm:col-span-2">
                      <span className="text-text-muted">Lý do dời: </span>
                      {reschedule.reason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Host Parent & Child */}
            <div className="space-y-2">
              <h3 className={SECTION_TITLE}>Gia đình chủ trì (Host)</h3>
              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={detailData.host?.parent?.avatarUrl}
                    name={detailData.host?.parent?.fullName || 'Host'}
                    size="md"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-body-md font-semibold text-text-primary truncate">
                        {detailData.host?.parent?.fullName || '—'}
                      </span>
                      {detailData.host?.parent?.isVerified && (
                        <VerifiedBadge size="sm" />
                      )}
                    </div>
                    <p className="text-label-md text-text-muted">
                      Bé đi cùng:{' '}
                      <span className="font-medium text-text-primary">
                        {describeChild(detailData.host?.child)}
                      </span>
                    </p>
                    {(detailData.host?.parent?.location?.area ||
                      detailData.host?.parent?.location?.city) && (
                      <p className="text-label-md text-text-muted flex items-center gap-1">
                        <MapPin size={ICON_SIZE.XS} className="shrink-0" />
                        {[
                          detailData.host.parent.location.area,
                          detailData.host.parent.location.city,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-label-md font-medium px-2.5 py-1 rounded-full bg-primary-soft text-primary-ink">
                    Chủ trì
                  </span>
                  <AccountLink userId={detailData.host?.parent?.userId} />
                </div>
              </div>
            </div>

            {/* Location & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/30 space-y-1">
                <span className={SECTION_TITLE}>Địa điểm tổ chức</span>
                <p className="text-body-md font-medium text-text-primary">
                  {detailData.location?.name || '—'}
                </p>
                <p className="text-label-md text-text-muted">
                  {detailData.location?.address || '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/30 space-y-1">
                <span className={SECTION_TITLE}>Ghi chú cho buổi hẹn</span>
                <p className="text-label-md text-text-primary leading-relaxed">
                  {detailData.note || (
                    <span className="text-text-muted italic">
                      Không có ghi chú
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <h3 className={`${SECTION_TITLE} flex items-center gap-1.5`}>
                <Users size={ICON_SIZE.SM} />
                Danh sách khách mời ({detailData.participants?.length || 0})
              </h3>

              {!detailData.participants?.length ? (
                <p className="text-label-md text-text-muted italic py-2">
                  Chưa có khách mời nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailData.participants.map((p, idx) => (
                    <div
                      key={p.parentId || idx}
                      className="p-3 rounded-xl border border-hairline flex items-center justify-between gap-3 text-label-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={p.parent?.avatarUrl}
                          name={p.parent?.fullName || 'Participant'}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-text-primary truncate">
                              {p.parent?.fullName || '—'}
                            </span>
                            {p.parent?.isVerified && (
                              <VerifiedBadge size="sm" />
                            )}
                          </div>
                          <span className="text-text-muted block">
                            Bé: {describeChild(p.child)}
                          </span>
                          <span className="text-text-muted block">
                            Mời lúc {formatDateTime(p.invitedAt) || '—'} •{' '}
                            {p.respondedAt
                              ? `Phản hồi lúc ${formatDateTime(p.respondedAt)}`
                              : 'Chưa phản hồi'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusChip
                          status={p.status}
                          {...PARTICIPANT_STATUS_DISPLAY[p.status]}
                        />
                        <AccountLink userId={p.parent?.userId} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-hairline grid grid-cols-1 sm:grid-cols-3 gap-2 text-label-md text-text-muted">
              <span>
                Tạo lúc:{' '}
                <span className="font-medium text-text-primary">
                  {formatDateTime(detailData.createdAt) || '—'}
                </span>
              </span>
              <span>
                Cập nhật:{' '}
                <span className="font-medium text-text-primary">
                  {formatDateTime(detailData.updatedAt) || '—'}
                </span>
              </span>
              {detailData.completedAt && (
                <span>
                  Hoàn thành:{' '}
                  <span className="font-medium text-text-primary">
                    {formatDateTime(detailData.completedAt)}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdminPlaydateDetailModal;
