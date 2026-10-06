import React from 'react';
import { MapPin, CalendarDays, Clock, ShieldCheck, Mail, Phone, Send, ThumbsDown } from 'lucide-react';
import { useChildProfile } from '../hooks/useChildProfile';
import { SWIPE_DIRECTIONS } from '../constants/discoveryConstants';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { Modal } from '../../../components/feedback/Modal';
import { EmptyState } from '../../../components/cards/EmptyState';

/**
 * ChildProfileDetailModal
 * Displays the full public profile of a child before sending a connection request.
 * Fetches data via useChildProfile hook when childId is provided.
 *
 * @param {string|null} childId - ID of the child to view
 * @param {function} onClose - Callback to close the modal
 * @param {(direction: string) => Promise<boolean>} onSwipe - Like / Pass this child
 * @param {boolean} isSwiping - A swipe request is in flight
 */
const ChildProfileDetailModal = ({ childId, onClose, onSwipe, isSwiping }) => {
  const isOpen = !!childId;
  const { profile, view, isLoading } = useChildProfile(childId);

  // Like = send connection request; keep the modal open on failure so the parent can retry
  const handleSendConnection = async () => {
    if (!profile?.childId) return;
    const isRecorded = await onSwipe(SWIPE_DIRECTIONS.LIKE);
    if (isRecorded) onClose();
  };

  const handlePass = () => {
    if (profile?.childId) onSwipe(SWIPE_DIRECTIONS.PASS);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ sơ của bé" maxWidth="max-w-md">
      <div className="flex flex-col max-h-[75vh]">
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pb-2">
          {isLoading ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                  <Skeleton className="h-4 w-1/3 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
              </div>
            </div>
          ) : profile && view ? (
            <div className="flex flex-col gap-5 py-1">

              {/* ── Hero: Avatar + Name ── */}
              <div className="flex gap-4">
                <div className="relative w-24 h-24 shrink-0 rounded-2xl bg-primary-container overflow-hidden border border-hairline">
                  <img
                    src={view.avatarSrc}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-center bg-primary text-primary-on-primary text-[10px] font-bold py-0.5">
                    {view.genderLabel}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 min-w-0 flex-1 pt-1">
                  <h2 className="text-xl font-bold text-on-surface leading-tight">{profile.displayName}</h2>

                  <div className="flex flex-wrap gap-1.5">
                    {profile.age !== null && (
                      <span className="px-2.5 py-0.5 bg-surface-container text-on-surface text-xs font-medium rounded-full border border-hairline">
                        {profile.age} tuổi
                      </span>
                    )}
                  </div>

                  {profile.personality?.length > 0 && (
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      Tính cách: <strong className="text-on-surface">{profile.personality.join(' · ')}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Interests ── */}
              {view.interests.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Sở thích & Hoạt động
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {view.interests.map((item, idx) => (
                      <InterestTag key={`${item}-${idx}`} label={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-surface-container" />

              {/* ── Parent / Family Info ── */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Thông tin gia đình
                </h3>

                <div className="rounded-2xl border border-hairline bg-surface-container-lowest p-4 flex flex-col gap-3">
                  {/* Parent header */}
                  <div className="flex items-center gap-3">
                    <Avatar src={profile.parent?.avatarUrl} alt={profile.parent?.fullName || 'PH'} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-on-surface">{profile.parent?.fullName}</span>
                        {profile.parent?.isVerifiedParent && (
                          <VerifiedBadge text="Đã xác thực" size="sm" />
                        )}
                      </div>
                      {/* Verification icons */}
                      <div className="flex gap-2 mt-1">
                        {profile.parent?.isEmailVerified && (
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                            <Mail size={11} strokeWidth={1.5} className="text-primary" />
                            Email
                          </span>
                        )}
                        {profile.parent?.isPhoneVerified && (
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                            <Phone size={11} strokeWidth={1.5} className="text-primary" />
                            SĐT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.parent?.bio && (
                    <p className="text-sm text-on-surface-variant italic bg-surface-container px-3.5 py-3 rounded-xl leading-relaxed">
                      &quot;{profile.parent.bio}&quot;
                    </p>
                  )}

                  {/* Preferences */}
                  <div className="flex flex-col gap-1.5">
                    {view.preferredLocations.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <MapPin size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Địa điểm thích:{' '}
                          <strong className="text-on-surface">
                            {view.preferredLocations.join(' • ')}
                          </strong>
                        </span>
                      </div>
                    )}
                    {view.preferredPlaydateDays.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <CalendarDays size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Ngày rảnh:{' '}
                          <strong className="text-on-surface">
                            {view.preferredPlaydateDays.join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                    {view.preferredTimeSlots.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <Clock size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Khung giờ:{' '}
                          <strong className="text-on-surface">
                            {view.preferredTimeSlots.join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<ShieldCheck size={24} strokeWidth={1.5} />}
              title="Không tìm thấy thông tin hồ sơ"
              className="border-0"
            />
          )}
        </div>

        {/* ── CTA Footer (sticky) ── */}
        {!isLoading && profile && (
          <div className="pt-4 border-t border-hairline bg-white flex gap-3">
            <Button
              variant="ghost"
              onClick={handlePass}
              leftIcon={<ThumbsDown size={16} strokeWidth={1.75} />}
              className="flex-1"
            >
              Bỏ qua
            </Button>
            <Button
              variant="primary"
              onClick={handleSendConnection}
              isLoading={isSwiping}
              leftIcon={<Send size={16} strokeWidth={1.75} />}
              className="flex-1"
            >
              Gửi lời mời kết nối
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChildProfileDetailModal;
