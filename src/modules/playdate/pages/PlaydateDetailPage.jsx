import React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Check,
  CheckCircle2,
  Trash2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Baby,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/badges/StatusChip';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { RescheduleModal } from '../components/RescheduleModal';
import { usePlaydateDetail } from '../hooks/usePlaydateDetail';
import { formatDate } from '../../../utils/formatters';

export const PlaydateDetailPage = () => {
  const {
    playdate,
    rescheduleReq,
    isLoading,
    isActionLoading,
    isHost,
    isUpcoming,
    isCancelled,
    isCompleted,
    canReschedule,
    myPendingVote,
    showCancelModal,
    showRescheduleModal,
    setShowCancelModal,
    setShowRescheduleModal,
    handleComplete,
    handleCancel,
    handleRespond,
    handleVoteReschedule,
    handleRescheduleSuccess,
    navigate,
  } = usePlaydateDetail();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-10 bg-surface-subtle rounded-xl w-1/3" />
        <div className="h-64 bg-surface-subtle rounded-2xl" />
        <div className="h-48 bg-surface-subtle rounded-2xl" />
      </div>
    );
  }

  if (!playdate) return null;

  // Calculate accepted participants count
  const acceptedCount = (playdate.participants || []).filter(
    (p) => p.status === 'accepted'
  ).length;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/playdates')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="rounded-xl border border-hairline hover:bg-white"
          >
            Danh sách
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                {playdate.activity}
              </h1>
              {/* Status Badge */}
              <StatusChip status={playdate.displayStatus || playdate.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Mã buổi hẹn: <code className="font-mono text-gray-500">{playdate.id}</code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {playdate.chatConversationId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/chat/${playdate.chatConversationId}`)}
              leftIcon={<MessageCircle className="w-4 h-4 text-primary" />}
              className="rounded-xl border-primary/30 text-primary-dark hover:bg-primary/5"
            >
              Nhóm chat Playdate
            </Button>
          )}

          {canReschedule && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRescheduleModal(true)}
              leftIcon={<RefreshCw className="w-4 h-4 text-tertiary-dark" />}
              className="rounded-xl border-tertiary text-tertiary-dark hover:bg-tertiary-fixed/20"
            >
              Đổi lịch hẹn
            </Button>
          )}

          {isHost && isUpcoming && (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleComplete}
                isLoading={isActionLoading}
                leftIcon={<Check className="w-4 h-4" />}
                className="rounded-xl shadow-2xs"
              >
                Hoàn thành
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="rounded-xl shadow-2xs"
              >
                Hủy hẹn
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Participant RSVP Banner */}
      {!isHost && isUpcoming && playdate.myParticipantStatus === 'pending' && (
        <div className="bg-tertiary-fixed/20 border border-tertiary-fixed/50 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">
                Bạn nhận được lời mời tham gia Playdate này!
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Vui lòng xác nhận để phụ huynh tổ chức chuẩn bị không gian chơi tốt nhất cho các bé.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRespond('declined')}
              disabled={isActionLoading}
              className="rounded-xl border-tertiary text-tertiary-dark hover:bg-tertiary-fixed/30"
            >
              Từ chối
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleRespond('accepted')}
              isLoading={isActionLoading}
              leftIcon={<Check className="w-4 h-4" />}
              className="rounded-xl shadow-2xs"
            >
              Chấp nhận tham gia
            </Button>
          </div>
        </div>
      )}

      {/* Active Reschedule Request Banner */}
      {rescheduleReq && rescheduleReq.status === 'pending' && (
        <div className="bg-tertiary-fixed/20 border border-tertiary-fixed/50 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary text-tertiary-on-container flex items-center justify-center shrink-0 shadow-2xs">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">
                    Đang có đề xuất đổi lịch hẹn mới
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary-dark border border-tertiary-fixed">
                    Chờ đồng thuận
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Đề xuất bởi: <strong>{rescheduleReq.requestedBy?.fullName}</strong>
                  {rescheduleReq.reason && ` • "${rescheduleReq.reason}"`}
                </p>
              </div>
            </div>

            {/* Voting buttons shown only if current user has a pending vote */}
            {myPendingVote && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoteReschedule('declined')}
                  disabled={isActionLoading}
                  className="rounded-xl border-tertiary text-tertiary-dark hover:bg-white"
                >
                  Từ chối lịch mới
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleVoteReschedule('accepted')}
                  isLoading={isActionLoading}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="rounded-xl shadow-2xs"
                >
                  Đồng ý lịch mới
                </Button>
              </div>
            )}
          </div>

          {/* New details preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white/80 rounded-xl border border-hairline text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span>
                Ngày mới: <strong>{formatDate(rescheduleReq.newDate)}</strong> ({rescheduleReq.newStartTime})
              </span>
            </div>
            {rescheduleReq.newLocation?.name && (
              <div className="flex items-center gap-2 text-text-primary truncate">
                <MapPin className="w-4 h-4 text-error shrink-0" />
                <span className="truncate">
                  Địa điểm: <strong>{rescheduleReq.newLocation.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Card: Date, Time & Location */}
      <div className="bg-white border border-hairline rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-hairline pb-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Thời gian & Địa điểm tổ chức
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Card */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Thời gian gặp gỡ
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-base font-semibold text-text-primary">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>{formatDate(playdate.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4 text-secondary-dark" />
                <span>Khung giờ: <strong>{playdate.time}</strong></span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Địa điểm tổ chức
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${playdate.location?.name} ${playdate.location?.address}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-primary-dark inline-flex items-center gap-1 hover:underline"
              >
                Mở Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-base font-semibold text-text-primary truncate">
                <MapPin className="w-4 h-4 text-error shrink-0" />
                <span className="truncate">{playdate.location?.name}</span>
              </div>
              <p className="text-xs text-text-muted pl-6 line-clamp-2">
                {playdate.location?.address}
              </p>
            </div>
          </div>
        </div>

        {/* Host Note */}
        {playdate.note && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-1">
            <span className="text-xs font-semibold text-primary-dark">Ghi chú từ người tổ chức:</span>
            <p className="text-sm text-text-primary leading-relaxed">{playdate.note}</p>
          </div>
        )}

        {/* Cancellation details */}
        {isCancelled && playdate.cancellation && (
          <div className="p-4 rounded-2xl bg-error-container/30 border border-error-container space-y-1 text-error">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-error" />
              Buổi hẹn này đã bị hủy
            </div>
            <p className="text-xs text-error/80">
              Lý do: <em>{playdate.cancellation.reason || 'Hủy bởi người tổ chức'}</em>
            </p>
          </div>
        )}
      </div>

      {/* Participants & RSVP Status Card */}
      <div className="bg-white border border-hairline rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary-dark" />
            <h2 className="text-base font-semibold text-text-primary">
              Danh sách phụ huynh & Trạng thái RSVP
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-subtle border border-hairline text-text-muted">
            {acceptedCount + 1} gia đình tham gia
          </span>
        </div>

        <div className="space-y-4">
          {/* Host Parent Row */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={playdate.hostParent?.avatarUrl}
                alt={playdate.hostParent?.fullName}
                size="lg"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-text-primary">
                    {playdate.hostParent?.fullName}
                  </p>
                  {playdate.hostParent?.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-white">
                    Người tổ chức (Host)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Baby className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Bé tham gia: <strong>{playdate.hostChild?.displayName}</strong>
                    {playdate.hostChild?.interests?.length > 0 &&
                      ` (${playdate.hostChild.interests.slice(0, 2).join(', ')})`}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shrink-0 self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận (Host)
            </span>
          </div>

          {/* Invited Participants List */}
          {playdate.participants?.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">
              Chưa có bạn bè nào được mời vào buổi hẹn này.
            </p>
          ) : (
            playdate.participants?.map((p) => {
              const pid = p.parentId;
              const isAccepted = p.status === 'accepted';
              const isDeclined = p.status === 'declined';

              return (
                <div
                  key={pid}
                  className="p-4 rounded-2xl border border-hairline bg-white hover:bg-surface-subtle/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={p.parent?.avatarUrl}
                      alt={p.parent?.fullName || 'Phụ huynh'}
                      size="md"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text-primary">
                          {p.parent?.fullName || 'Phụ huynh'}
                        </p>
                        {p.parent?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Baby className="w-3.5 h-3.5 text-secondary" />
                        <span>
                          Bé: <strong>{p.child?.displayName || 'Bé'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border shrink-0 self-start sm:self-center ${
                      isAccepted
                        ? 'bg-primary/10 text-primary-dark border-primary/20'
                        : isDeclined
                        ? 'bg-surface-subtle text-text-muted border-hairline'
                        : 'bg-tertiary-fixed/30 text-tertiary-dark border-tertiary-fixed/50'
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã tham gia (Accepted)
                      </>
                    ) : isDeclined ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Đã từ chối (Declined)
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> Đang chờ phản hồi (Pending)
                      </>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        playdate={playdate}
        onSuccess={handleRescheduleSuccess}
      />

      {/* Cancel Playdate Confirm Dialog */}
      <ConfirmDialog
        open={showCancelModal}
        title="Hủy buổi hẹn chơi này?"
        description="Khi hủy hẹn, toàn bộ phụ huynh tham gia sẽ nhận được thông báo và cuộc hẹn sẽ dừng lại. Thao tác này không thể hoàn tác."
        confirmLabel="Xác nhận hủy hẹn"
        cancelLabel="Giữ lại lịch hẹn"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default PlaydateDetailPage;
