import React from 'react';
import dayjs from 'dayjs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { Button } from '../../../components/ui/Button';
import { LoadingOverlay } from '../../../components/feedback/LoadingOverlay';

export const AdminPlaydateDetailModal = ({
  isOpen,
  onClose,
  detailData,
  isLoading,
  onInitiateCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết cuộc hẹn chơi"
      maxWidth="max-w-2xl"
    >
      <div className="relative min-h-72 p-6 space-y-6">
        <LoadingOverlay show={isLoading} />

        {detailData && (
          <>
            {/* Header / Summary */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-hairline">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    {detailData.activity}
                  </h2>
                  <StatusChip status={detailData.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary stroke-2" />
                    {detailData.scheduledDate
                      ? dayjs(detailData.scheduledDate).format('DD/MM/YYYY')
                      : '—'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary stroke-2" />
                    {detailData.time || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary stroke-2" />
                    {detailData.location?.name || '—'}
                  </span>
                </div>
              </div>

              {detailData.status === 'upcoming' && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                  onClick={() => onInitiateCancel?.(detailData)}
                >
                  Hủy cuộc hẹn
                </Button>
              )}
            </div>

            {/* Cancellation Notice */}
            {detailData.status === 'cancelled' && (
              <div className="p-4 rounded-xl bg-error-container/40 border border-error/20 space-y-2">
                <div className="flex items-center gap-2 text-error font-semibold text-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Thông tin hủy cuộc hẹn</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-text-muted">Người hủy: </span>
                    <span className="font-semibold text-text-primary">
                      {detailData.cancellation?.cancelledByAdmin
                        ? 'Quản trị viên (Admin)'
                        : detailData.host?.parent?.fullName || 'Chủ trì'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Thời gian: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.cancellation?.cancelledAt
                        ? dayjs(detailData.cancellation.cancelledAt).format('HH:mm DD/MM/YYYY')
                        : '—'}
                    </span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-text-muted">Lý do: </span>
                    <span className="font-medium text-text-primary">
                      {detailData.cancellation?.reason || 'Không nêu lý do'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Reschedule Alert */}
            {detailData.pendingReschedule && (
              <div className="p-4 rounded-xl bg-tertiary-soft border border-tertiary-border space-y-2">
                <div className="flex items-center gap-2 text-tertiary-dark font-semibold text-sm">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Có đề xuất dời lịch đang chờ duyệt</span>
                </div>
                <div className="text-xs text-text-primary space-y-1">
                  <p>
                    <span className="text-text-muted">Thời gian mới: </span>
                    <span className="font-semibold">
                      {detailData.pendingReschedule.newDate
                        ? dayjs(detailData.pendingReschedule.newDate).format('DD/MM/YYYY')
                        : ''}{' '}
                      vào lúc {detailData.pendingReschedule.newStartTime || detailData.pendingReschedule.newTime || ''}
                    </span>
                  </p>
                  {detailData.pendingReschedule.reason && (
                    <p>
                      <span className="text-text-muted">Lý do dời: </span>
                      {detailData.pendingReschedule.reason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Host Parent & Child */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Gia đình chủ trì (Host)
              </h3>
              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={detailData.host?.parent?.avatarUrl}
                    name={detailData.host?.parent?.fullName || 'Host'}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary">
                        {detailData.host?.parent?.fullName || '—'}
                      </span>
                      {detailData.host?.parent?.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-xs text-text-muted">
                      Bé đi cùng: <span className="font-medium text-text-primary">{detailData.host?.child?.displayName || '—'}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-soft text-primary-ink">
                  Chủ trì
                </span>
              </div>
            </div>

            {/* Location & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/30 space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Địa điểm tổ chức
                </span>
                <p className="text-sm font-medium text-text-primary">
                  {detailData.location?.name || '—'}
                </p>
                <p className="text-xs text-text-muted">
                  {detailData.location?.address || '—'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-hairline bg-surface-muted/30 space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Ghi chú cho buổi hẹn
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {detailData.note || <span className="text-text-muted italic">Không có ghi chú</span>}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Danh sách khách mời ({detailData.participants?.length || 0})
                </h3>
              </div>

              {(!detailData.participants || detailData.participants.length === 0) ? (
                <p className="text-xs text-text-muted italic py-2">Chưa có khách mời nào tham gia.</p>
              ) : (
                <div className="space-y-2">
                  {detailData.participants.map((p, idx) => (
                    <div
                      key={p.parentId || idx}
                      className="p-3 rounded-xl border border-hairline flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={p.parent?.avatarUrl}
                          name={p.parent?.fullName || 'Participant'}
                          size="sm"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-text-primary">
                              {p.parent?.fullName || '—'}
                            </span>
                            {p.parent?.isVerified && <VerifiedBadge size="sm" />}
                          </div>
                          <span className="text-text-muted">
                            Bé: {p.child?.displayName || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-text-muted hidden sm:inline">
                          {p.respondedAt
                            ? dayjs(p.respondedAt).format('DD/MM HH:mm')
                            : 'Chưa phản hồi'}
                        </span>
                        <StatusChip status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed timestamp */}
            {detailData.completedAt && (
              <div className="text-xs text-text-muted pt-2 border-t border-hairline">
                Hoàn thành lúc: {dayjs(detailData.completedAt).format('HH:mm DD/MM/YYYY')}
              </div>
            )}
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

export default AdminPlaydateDetailModal;
