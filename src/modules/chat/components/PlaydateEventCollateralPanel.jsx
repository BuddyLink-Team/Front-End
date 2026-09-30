import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Baby,
  FileText,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { StatusChip } from '../../../components/badges/StatusChip';
import { InterestTag } from '../../../components/badges/InterestTag';
import { cn } from '../../../utils/cn';

/**
 * Format child age nicely
 */
const formatChildAge = (dob) => {
  if (!dob) return '';
  const now = dayjs();
  const birth = dayjs(dob);
  const years = now.diff(birth, 'year');
  if (years >= 1) {
    return `${years} tuổi`;
  }
  const months = Math.max(1, now.diff(birth, 'month'));
  return `${months} tháng`;
};

/**
 * Format scheduled date into friendly Vietnamese text
 */
const formatScheduledDateTime = (dateString, timeString) => {
  if (!dateString) return 'Chưa xác định thời gian';
  const d = dayjs(dateString);
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[d.day()];
  const dateFormatted = d.format('DD/MM/YYYY');
  return `${dayName}, ${dateFormatted}${timeString ? ` lúc ${timeString}` : ''}`;
};

export const PlaydateEventCollateralPanel = ({
  playdate,
  onClose,
  className,
}) => {
  const navigate = useNavigate();

  if (!playdate) {
    return (
      <aside
        className={cn(
          'w-full lg:w-[340px] shrink-0 bg-surface-container-lowest border-l border-hairline p-5 flex flex-col items-center justify-center text-center text-on-surface-variant',
          className
        )}
      >
        <Sparkles className="w-8 h-8 text-primary mb-2 opacity-50" />
        <p className="text-sm font-medium">Không tìm thấy thông tin sự kiện</p>
      </aside>
    );
  }

  const {
    id,
    title,
    activity,
    scheduledDate,
    time,
    location = {},
    note,
    status = 'upcoming',
    host,
    hostChild,
    participants = [],
  } = playdate;

  // Filter accepted participants & total children count
  const acceptedParticipants = participants.filter((p) => p.status === 'accepted');
  const allChildren = [
    ...(hostChild ? [{ ...hostChild, isHost: true, parentName: host?.fullName }] : []),
    ...participants
      .filter((p) => p.child)
      .map((p) => ({
        ...p.child,
        isHost: false,
        parentName: p.parent?.fullName || 'Phụ huynh',
        status: p.status,
      })),
  ];

  return (
    <aside
      className={cn(
        'w-full lg:w-[350px] shrink-0 bg-surface-container-lowest border-l border-hairline flex flex-col h-full overflow-hidden select-none',
        className
      )}
    >
      {/* 1. Panel Header */}
      <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-surface-container-lowest z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface tracking-tight">Tóm tắt sự kiện</h3>
            <p className="text-[11px] text-on-surface-variant">Lịch trình & người tham gia</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
            title="Đóng bảng thông tin"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
        {/* Event Main Overview Card */}
        <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-hairline space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-base font-bold text-on-surface leading-snug">
              {title || activity || 'Cuộc hẹn chơi cùng bé'}
            </h4>
            <StatusChip status={status} className="shrink-0" />
          </div>

          {/* Time */}
          <div className="flex items-start gap-2.5 text-xs text-on-surface-variant">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold text-on-surface block">
                {formatScheduledDateTime(scheduledDate, time)}
              </span>
              <span className="text-[11px] text-outline">Thời gian diễn ra</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2.5 text-xs text-on-surface-variant">
            <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-semibold text-on-surface block">
                {location.name || 'Địa điểm công viên'}
              </span>
              {location.address && (
                <span className="text-[11px] text-outline block mt-0.5">
                  {location.address}
                </span>
              )}
            </div>
          </div>

          {/* Host Note if present */}
          {note && (
            <div className="pt-2 border-t border-hairline/60 flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container-lowest/60 p-2.5 rounded-xl">
              <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="italic text-[11px] leading-relaxed line-clamp-3">{note}</p>
            </div>
          )}
        </div>

        {/* 3. Children Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
              <Baby className="w-3.5 h-3.5 text-primary" />
              <span>Bé tham gia ({allChildren.length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {allChildren.length === 0 ? (
              <p className="text-xs text-outline italic">Chưa có thông tin bé tham gia</p>
            ) : (
              allChildren.map((kid, idx) => {
                const ageText = formatChildAge(kid.dateOfBirth);
                const genderIcon = kid.gender === 'boy' ? '👦' : kid.gender === 'girl' ? '👧' : '👶';

                return (
                  <div
                    key={kid.id || idx}
                    className="p-3 rounded-xl bg-surface-container-low/50 border border-hairline hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{genderIcon}</span>
                        <span className="text-xs font-bold text-on-surface">
                          {kid.displayName || 'Bé yêu'}
                        </span>
                        {ageText && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant font-medium">
                            {ageText}
                          </span>
                        )}
                      </div>

                      {kid.isHost ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container shadow-2xs">
                          Bé chủ trì
                        </span>
                      ) : kid.status ? (
                        <StatusChip status={kid.status} className="text-[10px] px-2 py-0" />
                      ) : null}
                    </div>

                    <p className="text-[11px] text-on-surface-variant">
                      Phụ huynh: <span className="font-medium text-on-surface">{kid.parentName}</span>
                    </p>

                    {/* Interests tags */}
                    {kid.interests && kid.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {kid.interests.map((interest, iIdx) => (
                          <InterestTag key={iIdx} label={interest} className="text-[10px] py-0.5 px-2" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Participating Parents Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Phụ huynh ({participants.length + (host ? 1 : 0)})</span>
            </div>
            {acceptedParticipants.length > 0 && (
              <span className="text-[11px] text-primary font-semibold">
                {acceptedParticipants.length + 1} đã xác nhận
              </span>
            )}
          </div>

          <div className="space-y-2">
            {/* Host Parent */}
            {host && (
              <div className="p-3 rounded-xl bg-surface-container-low/50 border border-hairline flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={host.avatarUrl}
                    alt={host.fullName}
                    size="sm"
                    fallbackText={host.fullName?.slice(0, 2).toUpperCase()}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {host.fullName}
                      </span>
                      {host.verification?.isVerifiedParent && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-[11px] text-outline truncate block">
                      {host.location?.area || host.location?.city || 'Khu vực chưa cập nhật'}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white shadow-2xs">
                  Chủ nhà
                </span>
              </div>
            )}

            {/* Other Participating Parents */}
            {participants.map((item, pIdx) => {
              const parent = item.parent;
              if (!parent) return null;

              return (
                <div
                  key={parent.id || pIdx}
                  className="p-3 rounded-xl bg-surface-container-low/50 border border-hairline flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={parent.avatarUrl}
                      alt={parent.fullName}
                      size="sm"
                      fallbackText={parent.fullName?.slice(0, 2).toUpperCase()}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-on-surface truncate">
                          {parent.fullName}
                        </span>
                        {parent.verification?.isVerifiedParent && <VerifiedBadge size="sm" />}
                      </div>
                      <span className="text-[11px] text-outline truncate block">
                        {parent.location?.area || parent.location?.city || 'Khu vực chưa cập nhật'}
                      </span>
                    </div>
                  </div>

                  <StatusChip status={item.status} className="shrink-0 text-[10px] px-2 py-0.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Trust Note */}
        <div className="p-3 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Nhóm trò chuyện được bảo mật. Chỉ phụ huynh có trạng thái <strong className="text-on-surface">Đã tham gia (accepted)</strong> mới có quyền gửi và xem tin nhắn.
          </p>
        </div>
      </div>

      {/* 5. Panel Footer CTA */}
      <div className="p-4 border-t border-hairline bg-surface-container-lowest shrink-0">
        <button
          type="button"
          onClick={() => navigate(`/playdates/${id}`)}
          className="w-full py-2.5 px-4 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold flex items-center justify-center gap-2 transition-all border border-hairline active:scale-[0.98]"
        >
          <span>Xem chi tiết cuộc hẹn</span>
          <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant" />
        </button>
      </div>
    </aside>
  );
};

export default PlaydateEventCollateralPanel;
