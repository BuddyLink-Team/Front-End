import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../../components/cards/Card';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';

/**
 * Format date in friendly Vietnamese format
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa xác định';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const PlaydateCard = ({
  playdate,
  onComplete,
  isCompleting = false,
}) => {
  const navigate = useNavigate();

  if (!playdate) return null;

  const {
    id,
    activity,
    scheduledDate,
    time,
    location,
    note,
    status,
    displayStatus = status,
    isHost,
    hostParent,
    hostChild,
    participants = [],
    completedAt,
    chatConversationId,
  } = playdate;

  const isCompleted = status === 'completed' || displayStatus === 'completed';
  const isCancelled = status === 'cancelled' || displayStatus === 'cancelled';
  const canComplete = isHost && !isCompleted && !isCancelled;

  // Total participating children: host child + accepted participant children
  const joinedParticipants = participants.filter((p) => p.status === 'accepted');
  const pendingParticipants = participants.filter((p) => p.status === 'pending');

  return (
    <Card
      hoverable
      padding="none"
      className="flex flex-col justify-between overflow-hidden border border-hairline hover:border-primary/40 bg-white transition-all duration-200 group"
    >
      {/* Top Banner Accent */}
      <div
        className={`h-1.5 w-full ${
          isCompleted
            ? 'bg-secondary'
            : isCancelled
            ? 'bg-outline-variant'
            : displayStatus === 'pending'
            ? 'bg-tertiary'
            : 'bg-primary'
        }`}
      />

      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Header: Title and Status Chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3
              onClick={() => navigate(`/playdates/${id}`)}
              className="text-base md:text-lg font-semibold text-text-primary tracking-tight truncate group-hover:text-primary transition-colors cursor-pointer"
              title={activity}
            >
              {activity}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {isHost ? (
                <span className="inline-flex items-center gap-1 font-medium text-primary-dark bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  <Sparkles className="w-3 h-3" /> Bạn là người tổ chức
                </span>
              ) : (
                <span className="text-text-muted">
                  Tổ chức bởi: <span className="font-semibold text-text-primary">{hostParent?.fullName || 'Phụ huynh'}</span>
                </span>
              )}
            </div>
          </div>

          <StatusChip status={displayStatus} className="shrink-0" />
        </div>

        {/* Schedule & Location */}
        <div className="space-y-2 text-xs md:text-sm text-text-secondary bg-surface-container-low/50 p-3.5 rounded-xl border border-hairline/80">
          <div className="flex items-center gap-2 text-text-primary font-medium">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{formatDate(scheduledDate)}</span>
            <span className="text-hairline">•</span>
            <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="text-text-muted">{time}</span>
          </div>

          <div className="flex items-start gap-2 text-text-muted">
            <MapPin className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <span className="line-clamp-1" title={`${location?.name || ''} - ${location?.address || ''}`}>
              <strong className="text-text-primary font-medium">{location?.name}</strong>
              {location?.address ? ` • ${location.address}` : ''}
            </span>
          </div>
        </div>

        {/* Participating Kids & Families */}
        <div className="flex items-center justify-between pt-1 border-t border-hairline/60 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden items-center">
              <Avatar
                src={hostParent?.avatarUrl}
                alt={hostParent?.fullName || 'Host'}
                size="sm"
                className="ring-2 ring-white"
              />
              {participants.slice(0, 3).map((p, idx) => (
                <Avatar
                  key={idx}
                  src={p.parent?.avatarUrl}
                  alt={p.parent?.fullName || 'Participant'}
                  size="sm"
                  className="ring-2 ring-white"
                />
              ))}
            </div>

            <span className="text-text-muted font-medium">
              {1 + joinedParticipants.length} gia đình
              {pendingParticipants.length > 0 && ` (${pendingParticipants.length} chờ duyệt)`}
            </span>
          </div>

          {hostChild?.displayName && (
            <span className="text-xs text-text-muted bg-white px-2 py-1 rounded-full border border-hairline">
              Bé: <strong className="text-text-primary font-semibold">{hostChild.displayName}</strong>
            </span>
          )}
        </div>

        {/* Note if available */}
        {note && (
          <p className="text-xs text-text-muted italic line-clamp-1 bg-tertiary-fixed/20 px-3 py-1.5 rounded-lg border border-tertiary-fixed/40">
            &ldquo;{note}&rdquo;
          </p>
        )}

        {/* Completed notification banner if completed */}
        {isCompleted && completedAt && (
          <div className="flex items-center gap-1.5 text-xs text-secondary-dark bg-secondary-container/30 px-3 py-1.5 rounded-lg border border-secondary-container">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Buổi hẹn đã hoàn thành tốt đẹp!</span>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="p-4 bg-surface-container-low/30 border-t border-hairline flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {chatConversationId ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/chat/${chatConversationId}`)}
              leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
              className="text-text-muted hover:text-primary"
            >
              Trò chuyện
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/playdates/${id}`)}
              className="text-text-muted hover:text-text-primary"
            >
              Chi tiết
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canComplete && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isCompleting}
              onClick={() => onComplete?.(id)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="shadow-xs hover:shadow"
            >
              Hoàn thành
            </Button>
          )}

          {!canComplete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/playdates/${id}`)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Xem
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlaydateCard;
