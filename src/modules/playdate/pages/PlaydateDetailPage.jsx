import React from 'react';
import {
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
  StickyNote,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { StatusChip } from '../../../components/badges/StatusChip';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { FormPageHeader } from '../../../components/form/FormPageHeader';
import { FormSection } from '../../../components/form/FormSection';
import { RescheduleModal } from '../components/RescheduleModal';
import { PlaydateSummaryRow } from '../components/PlaydateSummaryRow';
import { usePlaydateDetail } from '../hooks/usePlaydateDetail';
import { formatDate } from '../../../utils/formatters';

export const PlaydateDetailPage = () => {
  const {
    playdate,
    rescheduleReq,
    resolvedReschedule,
    canOpenGroupChat,
    isLoading,
    isActionLoading,
    isHost,
    isUpcoming,
    isCancelled,
    canReschedule,
    canComplete,
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
      <div className="w-full max-w-6xl mx-auto py-6 space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container-low rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-surface-container-low rounded-2xl" />
          <div className="lg:col-span-4 h-72 bg-surface-container-low rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!playdate) return null;

  // Calculate accepted participants count
  const acceptedCount = (playdate.participants || []).filter(
    (p) => p.status === 'accepted'
  ).length;

  const canCancel = isHost && isUpcoming;
  const hasActions = canOpenGroupChat || canReschedule || canComplete || canCancel;

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 space-y-6">
      <FormPageHeader
        title={playdate.activity}
        badge={<StatusChip status={playdate.displayStatus || playdate.status} />}
        description={`Tổ chức bởi ${playdate.hostParent?.fullName || 'phụ huynh'} cùng bé ${playdate.hostChild?.displayName || ''}`}
        onBack={() => navigate('/playdates')}
        backLabel="Về danh sách cuộc hẹn"
      />

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
                <p className="text-xs text-text-muted mt-0.5">
                  Đã đồng ý:{' '}
                  <strong>
                    {(rescheduleReq.responses || []).filter((r) => r.status === 'accepted').length}/
                    {(rescheduleReq.responses || []).length}
                  </strong>{' '}
                  phụ huynh đã tham gia
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
                  className="rounded-xl border-tertiary text-tertiary-dark hover:bg-surface-container-lowest"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-container-lowest/80 rounded-xl border border-hairline text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span>
                Ngày mới: <strong>{formatDate(rescheduleReq.newDate)}</strong> ({rescheduleReq.newStartTime})
              </span>
            </div>
            {rescheduleReq.newLocation?.name && (
              <div className="flex items-center gap-2 text-text-primary truncate">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">
                  Địa điểm: <strong>{rescheduleReq.newLocation.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outcome of the latest reschedule request */}
      {!rescheduleReq && resolvedReschedule && (
        <div
          className={`rounded-2xl p-4 border text-xs flex items-start gap-3 ${
            resolvedReschedule.status === 'accepted'
              ? 'bg-primary-soft border-primary-border text-primary-ink'
              : 'bg-surface-container-low border-hairline text-on-surface-variant'
          }`}
        >
          <RefreshCw className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {resolvedReschedule.status === 'accepted'
              ? `Lịch hẹn đã được đổi sang ${formatDate(resolvedReschedule.newDate)} (${resolvedReschedule.newStartTime}) sau khi mọi người đồng ý.`
              : `Đề xuất đổi sang ${formatDate(resolvedReschedule.newDate)} (${resolvedReschedule.newStartTime}) đã bị từ chối, buổi hẹn giữ lịch cũ.`}
          </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main content */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-hairline rounded-2xl p-5 sm:p-8 shadow-2xs">
          {/* Date & time */}
          <FormSection title="Thời gian" icon={CalendarIcon}>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline space-y-1">
              <div className="flex items-center gap-2 text-base font-semibold text-text-primary">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>{formatDate(playdate.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4 text-secondary-dark" />
                <span>Giờ hẹn: <strong>{playdate.time}</strong></span>
              </div>
            </div>
          </FormSection>

          {/* Place */}
          <FormSection title="Địa điểm" icon={MapPin}>
            <div className="p-4 rounded-2xl bg-surface-container-low border border-hairline flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary-dark flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-text-primary truncate">{playdate.location?.name}</p>
                <p className="text-xs text-text-muted line-clamp-2">{playdate.location?.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${playdate.location?.name} ${playdate.location?.address}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-primary-dark inline-flex items-center gap-1 hover:underline pt-1"
                >
                  Mở Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </FormSection>

          {/* Host Note */}
          {playdate.note && (
            <FormSection title="Ghi chú" description="Lời nhắn từ người tổ chức." icon={StickyNote}>
              <p className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-text-primary leading-relaxed">
                {playdate.note}
              </p>
            </FormSection>
          )}

          {/* Participants & RSVP status */}
          <FormSection
            title="Người tham gia"
            description="Phụ huynh được mời và trạng thái phản hồi."
            icon={Users}
            aside={<span className="font-semibold text-primary-dark">{acceptedCount + 1} gia đình tham gia</span>}
          >
            {/* Host Parent Row */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={playdate.hostParent?.avatarUrl}
                  alt={playdate.hostParent?.fullName}
                  size="md"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {playdate.hostParent?.fullName}
                    </p>
                    {playdate.hostParent?.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Baby className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      Bé: <strong>{playdate.hostChild?.displayName}</strong>
                      {playdate.hostChild?.interests?.length > 0 &&
                        ` (${playdate.hostChild.interests.slice(0, 2).join(', ')})`}
                    </span>
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-on-primary bg-primary px-3 py-1 rounded-full shrink-0 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5" /> Người tổ chức
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
                    className="p-4 rounded-2xl border border-hairline bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={p.parent?.avatarUrl}
                        alt={p.parent?.fullName || 'Phụ huynh'}
                        size="md"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-text-primary truncate">
                            {p.parent?.fullName || 'Phụ huynh'}
                          </p>
                          {p.parent?.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <Baby className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">
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
                          ? 'bg-surface-container-low text-text-muted border-hairline'
                          : 'bg-tertiary-fixed/30 text-tertiary-dark border-tertiary-fixed/50'
                      }`}
                    >
                      {isAccepted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã tham gia
                        </>
                      ) : isDeclined ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Đã từ chối
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Chờ phản hồi
                        </>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </FormSection>
        </div>

        {/* Summary & actions: on top of the content on mobile, sticky on the right on desktop */}
        <aside className={`order-first lg:order-none lg:col-span-4 lg:sticky lg:top-6 ${hasActions ? '' : 'hidden lg:block'}`}>
          <div className="bg-surface-container-lowest border border-hairline rounded-2xl p-5 lg:p-6 shadow-2xs space-y-5">
            <div className="hidden lg:block space-y-5">
              <p className="text-sm font-semibold text-text-primary">Tóm tắt buổi hẹn</p>
              <div className="space-y-3.5">
                <PlaydateSummaryRow icon={Baby} label="Bé chủ trì" value={playdate.hostChild?.displayName} />
                <PlaydateSummaryRow
                  icon={CalendarIcon}
                  label="Thời gian"
                  value={[formatDate(playdate.scheduledDate), playdate.time].filter(Boolean).join(' · ')}
                />
                <PlaydateSummaryRow icon={MapPin} label="Địa điểm" value={playdate.location?.name} />
                <PlaydateSummaryRow
                  icon={Users}
                  label="Người tham gia"
                  value={`${acceptedCount + 1} gia đình · ${playdate.participants?.length || 0} lời mời`}
                />
              </div>
            </div>

            {hasActions ? (
              <div className="lg:pt-5 lg:border-t lg:border-hairline space-y-2.5">
                {canComplete && (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleComplete}
                    isLoading={isActionLoading}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="w-full rounded-xl shadow-2xs"
                  >
                    Hoàn thành buổi hẹn
                  </Button>
                )}

                {canOpenGroupChat && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => navigate(`/chat/${playdate.chatConversationId}`)}
                    leftIcon={<MessageCircle className="w-4 h-4 text-primary" />}
                    className="w-full rounded-xl border-primary/30 text-primary-dark hover:bg-primary/5"
                  >
                    Nhóm chat Playdate
                  </Button>
                )}

                {canReschedule && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowRescheduleModal(true)}
                    leftIcon={<RefreshCw className="w-4 h-4 text-tertiary-dark" />}
                    className="w-full rounded-xl border-tertiary text-tertiary-dark hover:bg-tertiary-fixed/20"
                  >
                    Đổi lịch hẹn
                  </Button>
                )}

                {canCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setShowCancelModal(true)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    className="w-full rounded-xl text-error hover:bg-error/10"
                  >
                    Hủy hẹn
                  </Button>
                )}
              </div>
            ) : (
              <p className="lg:pt-5 lg:border-t lg:border-hairline text-xs text-text-muted">
                Không có thao tác nào cho buổi hẹn này.
              </p>
            )}
          </div>
        </aside>
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
