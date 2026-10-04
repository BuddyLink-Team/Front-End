import React from 'react';
import { X, MapPin, CalendarDays, Clock, ShieldCheck, Mail, Phone, Send, ThumbsDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useChildProfile } from '../hooks/useChildProfile';
import { useSwipe } from '../hooks/useSwipe';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/feedback/Skeleton';

const LOCATION_LABELS = {
  park: 'Công viên',
  kids_cafe: 'Quán cà phê trẻ em',
  mall: 'Trung tâm thương mại',
  indoor: 'Trong nhà',
  outdoor: 'Ngoài trời',
  home: 'Nhà riêng',
  library: 'Thư viện',
  museum: 'Bảo tàng',
  sports_center: 'Khu thể thao',
  pool: 'Hồ bơi',
};

const DAY_LABELS = {
  weekday: 'Ngày thường',
  weekend: 'Cuối tuần',
};

const TIME_LABELS = {
  morning: 'Buổi sáng',
  afternoon: 'Buổi chiều',
  evening: 'Buổi tối',
};

/**
 * ChildProfileDetailModal
 * Displays the full public profile of a child before sending a connection request.
 * Fetches data via useChildProfile hook when childId is provided.
 *
 * @param {string|null} childId - ID of the child to view
 * @param {function} onClose - Callback to close the modal
 * @param {function} onSwipeDone - Callback after a swipe action (LIKE/PASS)
 */
const ChildProfileDetailModal = ({ childId, onClose, onSwipeDone }) => {
  const isOpen = !!childId;
  const { profile, isLoading } = useChildProfile(childId);
  const { handleSwipe, isLoading: isSwiping } = useSwipe();

  const genderLabel = profile?.gender === 'boy' ? 'Bé Trai' : profile?.gender === 'girl' ? 'Bé Gái' : 'Khác';
  const defaultAvatar = profile?.gender === 'girl' ? '/avatars/default_girl.jpg' : '/avatars/default_boy.jpg';

  const handleSendConnection = async () => {
    if (!profile?.childId) return;
    await handleSwipe(profile.childId, true, onSwipeDone);
    onClose();
  };

  const handlePass = () => {
    if (profile?.childId && onSwipeDone) {
      handleSwipe(profile.childId, false, onSwipeDone);
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/30 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_16px_40px_-8px_rgba(45,55,72,0.12)] border border-hairline z-10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col max-h-[92vh]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-surface-container-high" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pt-4 pb-2">
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
          ) : profile ? (
            <div className="flex flex-col gap-5 py-1">

              {/* ── Hero: Avatar + Name ── */}
              <div className="flex gap-4">
                <div className="relative w-24 h-24 shrink-0 rounded-2xl bg-primary-container overflow-hidden border border-hairline">
                  <img
                    src={profile.avatarUrl || defaultAvatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-center bg-primary text-on-primary text-[10px] font-bold py-0.5">
                    {genderLabel}
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
                    {profile.schoolLevel && (
                      <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant text-xs font-medium rounded-full border border-hairline">
                        {profile.schoolLevel}
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
              {(profile.interests?.length > 0 || profile.favoriteActivities?.length > 0) && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Sở thích & Hoạt động
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...(profile.interests || []), ...(profile.favoriteActivities || [])].map((item, idx) => (
                      <InterestTag key={idx} label={item} />
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
                    <img
                      alt={profile.parent?.fullName}
                      className="w-10 h-10 rounded-full border-2 border-white shadow object-cover shrink-0"
                      src={
                        profile.parent?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.parent?.fullName || 'PH')}&background=EAF3EC&color=3d6841`
                      }
                    />
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
                      "{profile.parent.bio}"
                    </p>
                  )}

                  {/* Preferences */}
                  <div className="flex flex-col gap-1.5">
                    {profile.parent?.preferences?.preferredLocations?.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <MapPin size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Địa điểm thích:{' '}
                          <strong className="text-on-surface">
                            {profile.parent.preferences.preferredLocations.map((l) => LOCATION_LABELS[l] || l).join(' • ')}
                          </strong>
                        </span>
                      </div>
                    )}
                    {profile.parent?.preferences?.preferredPlaydateDays?.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <CalendarDays size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Ngày rảnh:{' '}
                          <strong className="text-on-surface">
                            {profile.parent.preferences.preferredPlaydateDays.map((d) => DAY_LABELS[d] || d).join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                    {profile.parent?.preferences?.preferredTimeSlots?.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                        <Clock size={14} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                        <span>
                          Khung giờ:{' '}
                          <strong className="text-on-surface">
                            {profile.parent.preferences.preferredTimeSlots.map((t) => TIME_LABELS[t] || t).join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <ShieldCheck size={40} strokeWidth={1} className="mb-3 opacity-40" />
              <p className="text-sm">Không tìm thấy thông tin hồ sơ</p>
            </div>
          )}
        </div>

        {/* ── CTA Footer (sticky) ── */}
        {!isLoading && profile && (
          <div className="px-5 py-4 border-t border-hairline bg-white rounded-b-3xl flex gap-3">
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
    </div>,
    document.body
  );
};

export default ChildProfileDetailModal;
