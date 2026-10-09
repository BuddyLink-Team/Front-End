import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, CheckCircle2, Hourglass, Sparkles, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusChip } from '../../../components/badges/StatusChip';
import { hasPlaydateStarted } from '../utils/playdateTime';
import { ACTIVITY_CATEGORY_META, getActivityCategory } from '../../../constants/activity.constants';

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Format datetime display matching Stitch layout:
 * "15:30 • Thứ 7, 24/10" or "09:00 • Chủ nhật, 25/10"
 */
const formatPlaydateDateTime = (scheduledDate, time) => {
  if (!scheduledDate) return time || '';
  try {
    const d = new Date(scheduledDate);
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const weekday = weekdays[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const datePart = `${weekday}, ${day}/${month}`;
    return time ? `${time} • ${datePart}` : datePart;
  } catch {
    return `${time || ''} • ${scheduledDate}`;
  }
};

/**
 * Get short name for initial badges (e.g. "Bé Bơ" -> "Bơ", "Bé Min" -> "Min")
 */
const getShortName = (name) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  return words[words.length - 1];
};

export const PlaydateCard = ({
  playdate,
  onComplete,
  onReschedule,
  onCancel,
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
    status,
    displayStatus = status,
    isHost,
    hostParent,
    hostChild,
    participants = [],
    category,
  } = playdate;

  const isCompleted = status === 'completed' || displayStatus === 'completed';
  const isCancelled = status === 'cancelled' || displayStatus === 'cancelled';
  const canManage = Boolean(isHost) && status === 'upcoming';
  // The host can only mark it completed once the start time has passed
  const canComplete = canManage && hasPlaydateStarted(scheduledDate, time);

  // Category tag: the given label (mock data) or deduced from the activity (shared activity catalog)
  const categoryMeta =
    Object.values(ACTIVITY_CATEGORY_META).find((meta) => meta.label === category) ||
    ACTIVITY_CATEGORY_META[getActivityCategory(activity)];
  const resolvedCategory = categoryMeta.label;
  const CategoryIcon = categoryMeta.icon;

  // Days until an upcoming playdate (calendar days in the viewer's time zone)
  const getCountdownLabel = () => {
    if (isCompleted || isCancelled || !scheduledDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(scheduledDate);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Diễn ra hôm nay';
    if (diffDays === 1) return 'Diễn ra ngày mai';
    if (diffDays > 1) return `Còn ${diffDays} ngày`;
    return null;
  };
  const countdownLabel = getCountdownLabel();

  // Participant Kids & Parents
  const hostChildName = hostChild?.displayName || 'Bé';
  const hostChildAge = hostChild?.ageText ? ` (${hostChild.ageText})` : '';
  const firstParticipant = participants[0];
  const guestChildName = firstParticipant?.child?.displayName || 'Bé bạn';
  const guestChildAge = firstParticipant?.child?.ageText ? ` (${firstParticipant.child.ageText})` : '';
  const hostParentName = hostParent?.fullName || 'Phụ huynh';
  const guestParentName = firstParticipant?.parent?.fullName || 'Phụ huynh bạn';

  const hostShort = getShortName(hostChildName) || 'Bơ';
  const guestShort = getShortName(guestChildName) || 'Min';

  const formattedDateTime = formatPlaydateDateTime(scheduledDate, time);

  const scheduled = scheduledDate ? new Date(scheduledDate) : null;
  const dateTile =
    scheduled && !Number.isNaN(scheduled.getTime())
      ? {
          weekday: WEEKDAY_SHORT[scheduled.getDay()],
          day: String(scheduled.getDate()).padStart(2, '0'),
          month: String(scheduled.getMonth() + 1).padStart(2, '0'),
        }
      : null;
  // Tile colour follows the status (Design System tokens)
  const tileClass = isCancelled
    ? 'bg-surface-container-low border-hairline text-text-muted opacity-70'
    : isCompleted
      ? 'bg-surface-container border-secondary-container text-secondary-dark'
      : displayStatus === 'pending'
        ? 'bg-tertiary-soft border-tertiary-border text-tertiary-dark'
        : 'bg-primary-soft border-primary-border text-primary-ink';

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-hairline shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-5 group">
      <div className="flex flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* 1. Calendar tile: weekday, day, month and start time */}
        {dateTile && (
          <div
            className={`w-24 shrink-0 rounded-2xl border flex flex-col items-center justify-center py-3 select-none ${tileClass}`}
            aria-label={formattedDateTime}
          >
            <span className="text-label-sm uppercase tracking-wider">{dateTile.weekday}</span>
            <span className="text-headline-lg leading-none text-text-primary">{dateTile.day}</span>
            <span className="text-label-md">Tháng {dateTile.month}</span>
            {time && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-text-primary">
                <Clock className="w-3 h-3" /> {time}
              </span>
            )}
          </div>
        )}

        {/* 2. Main content */}
        <div className="flex-1 min-w-0 space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <StatusChip status={displayStatus} />

            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-low text-text-muted border border-hairline whitespace-nowrap">
              <CategoryIcon className="w-3.5 h-3.5" /> {resolvedCategory}
            </span>

            {countdownLabel && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-tertiary-soft text-tertiary-dark border border-tertiary-border whitespace-nowrap">
                <Hourglass className="w-3.5 h-3.5" /> {countdownLabel}
              </span>
            )}

            {isHost ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-ink bg-primary-soft border border-primary-border px-2 py-0.5 rounded-full whitespace-nowrap">
                <Sparkles className="w-2.5 h-2.5" /> Bạn là người tổ chức
              </span>
            ) : (
              <span className="text-xs text-text-muted whitespace-nowrap">
                Tổ chức bởi: <strong className="text-text-primary">{hostParentName}</strong>
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-title-md font-semibold text-text-primary tracking-tight line-clamp-1" title={activity}>
            <Link to={`/playdates/${id}`} className="hover:text-primary-dark transition-colors">
              {activity}
            </Link>
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-text-muted">
            <div className="flex items-center gap-1.5 font-medium text-text-primary shrink-0">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{formattedDateTime}</span>
            </div>
            <div
              className="flex items-center gap-1.5 line-clamp-1"
              title={`${location?.name || ''} - ${location?.address || ''}`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <strong className="text-text-primary font-semibold">{location?.name || location?.address}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center shrink-0">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-on-primary font-semibold text-[10px] flex items-center justify-center ring-2 ring-surface-container-lowest shadow-2xs select-none">
                {hostShort.slice(0, 3)}
              </span>
              {firstParticipant && (
                <span className="w-6 h-6 rounded-full bg-secondary text-secondary-on-fixed font-semibold text-[10px] flex items-center justify-center ring-2 ring-surface-container-lowest shadow-2xs -ml-2 select-none">
                  {guestShort.slice(0, 3)}
                </span>
              )}
            </div>
            <span className="font-semibold text-text-primary">
              Cặp bé: {hostChildName}
              {hostChildAge}
              {firstParticipant && ` & ${guestChildName}${guestChildAge}`}
              {participants.length > 1 && ` +${participants.length - 1}`}
            </span>
            <span className="text-text-muted">
              • {hostParentName}
              {firstParticipant && ` & ${guestParentName}`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Actions: reschedule / complete / cancel are host-only (PROJECT_OVERVIEW 6.2) */}
      <div className="shrink-0 flex items-center flex-wrap gap-2 justify-end pt-3 xl:pt-0 border-t xl:border-t-0 border-hairline w-full xl:w-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/playdates/${id}`)}
          className="rounded-full border border-hairline"
        >
          Chi tiết lịch trình
        </Button>

        {canManage && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => (onReschedule ? onReschedule(playdate) : navigate(`/playdates/${id}`))}
            className="rounded-full"
          >
            Đổi lịch hẹn
          </Button>
        )}

        {canComplete && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isCompleting}
            onClick={() => onComplete?.(id)}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="rounded-full"
          >
            Hoàn thành
          </Button>
        )}

        {canManage && (
          <button
            type="button"
            onClick={() => (onCancel ? onCancel(playdate) : navigate(`/playdates/${id}`))}
            className="w-7 h-7 rounded-full border border-hairline text-text-muted hover:text-error hover:border-error hover:bg-error-container flex items-center justify-center transition-colors"
            title="Hủy cuộc hẹn"
            aria-label="Hủy cuộc hẹn"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaydateCard;
