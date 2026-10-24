import React from 'react';
import PropTypes from 'prop-types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  RefreshCw,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Baby,
  MailOpen,
  Crown,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { formatDate, getLocalDateString } from '../../../utils/formatters';
import { formatPlaydateTimeRange } from '../utils/playdateTime';
import { useScheduleCheck } from '../hooks/useScheduleCheck';
import { DEFAULT_PLAYDATE_DURATION } from '../constants/playdateConstants';

const RSVP_BADGES = {
  host: { label: 'Người tổ chức', icon: Crown, className: 'bg-primary text-primary-on-primary border-primary' },
  accepted: { label: 'Đã tham gia', icon: CheckCircle2, className: 'bg-primary/10 text-primary-dark border-primary/20' },
  declined: { label: 'Đã từ chối', icon: XCircle, className: 'bg-surface-container-low text-text-muted border-hairline' },
  pending: { label: 'Chờ phản hồi', icon: Clock, className: 'bg-tertiary-fixed/30 text-tertiary-dark border-tertiary-fixed/50' },
};

/**
 * One family of the playdate: parent, child and their answer
 */
export const ParticipantCard = ({ parent, childName, status }) => {
  const badge = RSVP_BADGES[status] || RSVP_BADGES.pending;
  const BadgeIcon = badge.icon;
  return (
    <div
      className={`p-3 rounded-2xl border flex items-center gap-3 min-w-0 ${
        status === 'host' ? 'border-primary/20 bg-primary/5' : 'border-hairline bg-surface-container-lowest'
      }`}
    >
      <Avatar src={parent?.avatarUrl} alt={parent?.fullName || 'Phụ huynh'} size="md" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-text-primary">
          <span className="truncate">{parent?.fullName || 'Phụ huynh'}</span>
          {parent?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
        </p>
        <p className="flex items-center gap-1 text-xs text-text-muted">
          <Baby className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{childName || 'Bé'}</span>
        </p>
        <span className={`inline-flex items-center gap-1 text-label-sm font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}>
          <BadgeIcon className="w-3 h-3" /> {badge.label}
        </span>
      </div>
    </div>
  );
};

ParticipantCard.propTypes = {
  parent: PropTypes.shape({ fullName: PropTypes.string, avatarUrl: PropTypes.string, isVerified: PropTypes.bool }),
  childName: PropTypes.string,
  status: PropTypes.string.isRequired,
};

const BANNER_CLASS = 'bg-tertiary-fixed/20 border border-tertiary-fixed/50 rounded-2xl p-5 shadow-2xs';

// "Bé Na đã có hẹn khác 09:00–11:00, …": why the own child cannot accept that time
const ConflictNote = ({ conflicts }) =>
  conflicts.length > 0 ? (
    <p className="flex items-center gap-1.5 text-xs text-error">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      {conflicts.map((c) => `${c.childName} đã có hẹn khác ${c.start}–${c.end}`).join(', ')}, trùng giờ này.
    </p>
  ) : null;

ConflictNote.propTypes = { conflicts: PropTypes.arrayOf(PropTypes.object).isRequired };
const scheduleText = (request) =>
  `${formatDate(request.newDate)} (${formatPlaydateTimeRange({ time: request.newStartTime, endTime: request.newEndTime })})`;

/**
 * What the viewer has to know or answer above the playdate: invitation to answer, pending reschedule
 * (with the vote), outcome of the last reschedule, cancellation
 */
export const PlaydateBanners = ({
  playdate,
  isInvitationPending,
  rescheduleReq,
  resolvedReschedule,
  myPendingVote,
  isCancelled,
  isActionLoading,
  onRespond,
  onVote,
}) => {
  const duration = playdate.durationMinutes ?? DEFAULT_PLAYDATE_DURATION;
  // The own child must be free to accept the invitation (this playdate itself does not count)
  const invitationCheck = useScheduleCheck({
    childId: isInvitationPending ? playdate.myChildId : null,
    date: getLocalDateString(playdate.scheduledDate),
    time: playdate.time,
    durationMinutes: duration,
    excludePlaydateId: playdate.id,
  });
  // …and free at the proposed new time to agree to it
  const voteCheck = useScheduleCheck({
    childId: myPendingVote ? playdate.myChildId : null,
    date: rescheduleReq?.newDate ? getLocalDateString(rescheduleReq.newDate) : null,
    time: rescheduleReq?.newStartTime,
    durationMinutes: rescheduleReq?.newDurationMinutes ?? duration,
    excludePlaydateId: playdate.id,
  });
  const cannotAccept = invitationCheck.ownConflicts.length > 0;
  const cannotAgree = voteCheck.ownConflicts.length > 0;

  return (
  <>
    {isInvitationPending && (
      <div className={`${BANNER_CLASS} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center shrink-0">
            <MailOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Bạn nhận được lời mời tham gia Playdate này!</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Vui lòng xác nhận để phụ huynh tổ chức chuẩn bị không gian chơi tốt nhất cho các bé.
            </p>
            <ConflictNote conflicts={invitationCheck.ownConflicts} />
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRespond('declined')}
            disabled={isActionLoading}
            className="rounded-xl border-tertiary text-tertiary-dark hover:bg-tertiary-fixed/30"
          >
            Từ chối
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onRespond('accepted')}
            isLoading={isActionLoading}
            disabled={cannotAccept}
            leftIcon={<Check className="w-4 h-4" />}
            className="rounded-xl shadow-2xs"
          >
            Chấp nhận tham gia
          </Button>
        </div>
      </div>
    )}

    {rescheduleReq?.status === 'pending' && (
      <div className={`${BANNER_CLASS} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary text-tertiary-on-container flex items-center justify-center shrink-0 shadow-2xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-text-primary">Đang có đề xuất đổi lịch hẹn mới</h4>
                <span className="text-label-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary-dark border border-tertiary-fixed">
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
              {myPendingVote && <ConflictNote conflicts={voteCheck.ownConflicts} />}
            </div>
          </div>

          {/* Only a parent who still has to vote can answer */}
          {myPendingVote && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onVote('declined')}
                disabled={isActionLoading}
                className="rounded-xl border-tertiary text-tertiary-dark hover:bg-surface-container-lowest"
              >
                Từ chối lịch mới
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onVote('accepted')}
                isLoading={isActionLoading}
                disabled={cannotAgree}
                leftIcon={<Check className="w-4 h-4" />}
                className="rounded-xl shadow-2xs"
              >
                Đồng ý lịch mới
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-container-lowest/80 rounded-xl border border-hairline text-xs">
          <div className="flex items-center gap-2 text-text-primary">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
            <span>
              Ngày mới: <strong>{scheduleText(rescheduleReq)}</strong>
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
            ? `Lịch hẹn đã được đổi sang ${scheduleText(resolvedReschedule)} sau khi mọi người đồng ý.`
            : `Đề xuất đổi sang ${scheduleText(resolvedReschedule)} đã bị từ chối, buổi hẹn giữ lịch cũ.`}
        </span>
      </div>
    )}

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
  </>
  );
};

PlaydateBanners.propTypes = {
  playdate: PropTypes.object.isRequired,
  isInvitationPending: PropTypes.bool,
  rescheduleReq: PropTypes.object,
  resolvedReschedule: PropTypes.object,
  myPendingVote: PropTypes.bool,
  isCancelled: PropTypes.bool,
  isActionLoading: PropTypes.bool,
  onRespond: PropTypes.func.isRequired,
  onVote: PropTypes.func.isRequired,
};
