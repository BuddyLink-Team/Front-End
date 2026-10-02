import React from 'react';
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Flame,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, Avatar, VerifiedBadge } from '../../../components';
import { useProfileAvatar } from '../hooks/useParentTabHooks';

export const ProfileHeaderCard = ({
  profile,
  childrenCount = 0,
  onAvatarUpload,
  isUploadingAvatar,
  onOpenChangePassword,
}) => {
  const { fileInputRef, handleFileChange, triggerUpload } = useProfileAvatar({
    onAvatarUpload,
  });

  const isVerified =
    profile?.verification?.isVerifiedParent ||
    (profile?.verification?.isPhoneVerified &&
      profile?.verification?.isEmailVerified);

  const weeklyStreak = profile?.streak?.currentWeeklyStreak || 0;

  return (
    <Card className="p-6 rounded-3xl border border-hairline bg-white shadow-sm relative overflow-hidden text-center">
      {/* Decorative Matcha Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-32 sm:h-36 bg-gradient-to-r from-primary-fixed/50 via-surface-container-low to-secondary-fixed/40" />

      <div className="relative pt-12 sm:pt-14 flex flex-col items-center gap-4">
        {/* Avatar with Camera Overlay */}
        <div className="relative group shrink-0">
          <Avatar
            src={profile?.avatarUrl}
            alt={profile?.fullName || 'Phụ huynh'}
            size="2xl"
            className="object-cover w-24 h-24 sm:w-28 sm:h-28"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            title="Thay đổi ảnh đại diện"
          >
            {isUploadingAvatar ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Identity & Badges */}
        <div className="space-y-2 w-full">
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg sm:text-xl font-bold text-on-surface truncate max-w-full">
              {profile?.fullName || 'Quý phụ huynh'}
            </h1>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>

          <p className="text-xs text-text-muted line-clamp-3 px-2">
            {profile?.bio ||
              'Chưa có thông tin giới thiệu bản thân. Hãy cập nhật để các gia đình hiểu hơn về bạn!'}
          </p>

          {/* Quick info metadata pills */}
          <div className="flex flex-col gap-2 pt-2 text-xs text-text-muted">
            {profile?.location?.address && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-hairline text-left">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{profile.location.address}</span>
              </div>
            )}

            {profile?.email && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-hairline truncate">
                <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}

            {profile?.phone && (
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-hairline">
                <Phone className="w-3.5 h-3.5 text-tertiary shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats & Streak Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full pt-2">
          {/* Weekly Streak Box */}
          <div className="p-3 rounded-2xl bg-amber-500/30 border border-amber-500/20 text-amber-700 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              Streak tuần
            </span>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold">{weeklyStreak} tuần</span>
            </div>
          </div>

          {/* Children count pill */}
          <div className="p-3 rounded-2xl bg-primary/30 border border-primary/20 text-primary flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark">
              Hồ sơ bé
            </span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold">{childrenCount} bé</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeaderCard;
