import React from 'react';
import { MapPin, CalendarDays, Brain, Heart, Clock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { MatchScoreBar } from './MatchScoreBar';
import { DiscoveryActionButtons } from './DiscoveryActionButtons';
const LOCATION_LABELS = {
  park: 'Công viên', kids_cafe: 'Quán cà phê trẻ em', mall: 'Trung tâm thương mại', indoor: 'Trong nhà',
  outdoor: 'Ngoài trời', home: 'Nhà riêng', library: 'Thư viện', museum: 'Bảo tàng',
  sports_center: 'Khu thể thao', pool: 'Hồ bơi',
};
const DAY_LABELS = { weekday: 'Ngày thường', weekend: 'Cuối tuần' };
const TIME_LABELS = { morning: 'Buổi sáng', afternoon: 'Buổi chiều', evening: 'Buổi tối' };

export const DiscoveryCard = ({ profile, onSwipe, index, isTop, onViewDetail }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-4, 4]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const bgColor = useTransform(
    x,
    [-120, -20, 0, 20, 120],
    ['#fde8e8', '#fff5f5', '#ffffff', '#f4fdf5', '#d4f4dd']
  );
  const boxShadow = useTransform(
    x,
    [-150, -30, 0, 30, 150],
    [
      '0 0 40px 8px rgba(239,68,68,0.45), 0 8px 30px rgba(0,0,0,0.10)',
      '0 0 12px 2px rgba(239,68,68,0.15), 0 8px 30px rgba(0,0,0,0.08)',
      '0 8px 30px rgba(0,0,0,0.08)',
      '0 0 12px 2px rgba(123,174,127,0.20), 0 8px 30px rgba(0,0,0,0.08)',
      '0 0 40px 8px rgba(123,174,127,0.55), 0 8px 30px rgba(0,0,0,0.10)',
    ]
  );

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('LIKE');
    else if (info.offset.x < -100) onSwipe('PASS');
  };

  if (!profile) return null;

  const interests = [...(profile.interests || []), ...(profile.favoriteActivities || [])];
  const g = String(profile.gender || '').toLowerCase();
  const isGirl = g === 'girl' || g === 'female';
  const isBoy = g === 'boy' || g === 'male';
  const genderLabel = isBoy ? 'Bé Trai' : isGirl ? 'Bé Gái' : 'Khác';
  const defaultAvatar = isGirl ? '/avatars/default_girl.jpg' : '/avatars/default_boy.jpg';
  const tr = (map, v) => map[v] || v;

  return (
    <motion.div
      style={{
        x, rotate, opacity,
        background: isTop ? bgColor : '#ffffff',
        boxShadow: isTop ? boxShadow : '0 4px 16px rgba(0,0,0,0.06)',
        zIndex: 10 - index,
        left: 0, right: 0, margin: '0 auto',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      animate={{
        scale: isTop ? 1 : Math.max(0.95, 1 - index * 0.025),
        y: isTop ? 0 : index * 10,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`absolute w-full rounded-3xl shadow-lg border border-gray-150 flex flex-col overflow-hidden ${!isTop ? 'pointer-events-none' : ''}`}
    >
      <div className="p-5 flex flex-col gap-5 bg-white">

        {/* ── Header: Avatar + Info ── */}
        <div className="flex gap-4">
          {/* Avatar box */}
          <div className="relative w-[100px] h-[100px] shrink-0 rounded-2xl bg-primary-container overflow-hidden flex items-center justify-center border border-primary">
            <img
              alt={profile.displayName}
              src={profile.avatarUrl || defaultAvatar}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            <span className="absolute bottom-0 left-0 right-0 text-center bg-secondary text-on-secondary text-[10px] font-bold py-0.5">
              {genderLabel}
            </span>
          </div>

          {/* Right info */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className="text-[22px] font-extrabold text-gray-900 leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={onViewDetail}
                title="Xem chi tiết hồ sơ"
              >
                {profile.displayName}
              </h2>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                {profile.age} tuổi
                {profile.schoolLevel ? ` • ${profile.schoolLevel}` : ''}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                <MapPin size={12} strokeWidth={1.5} />
                {profile.distanceKm !== undefined ? `Cách ${profile.distanceKm} km` : 'Gần bạn'}
              </span>
            </div>

            {/* Personality */}
            {profile.personality?.length > 0 && (
              <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                <Brain size={16} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                <span>Tính cách: <strong className="text-on-surface">{profile.personality.join(' • ')}</strong></span>
              </div>
            )}

            {/* Meetup spots */}
            {profile.parent?.preferences?.preferredLocations?.length > 0 && (
              <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                <MapPin size={15} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                <span>Điểm hẹn thích: <strong className="text-on-surface">{profile.parent.preferences.preferredLocations.map((l) => tr(LOCATION_LABELS, l)).join(' • ')}</strong></span>
              </div>
            )}

            {/* MatchScore inline */}
            <MatchScoreBar score={profile.matchScore || 0} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* ── Interests ── */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Heart size={14} strokeWidth={1.5} className="text-primary" />
              Sở thích chung tương thích
            </h3>
            {profile.matchedInterestsCount !== undefined && (
              <span className="px-2.5 py-0.5 bg-primary-container text-on-primary-container text-xs font-medium rounded-full border border-primary">
                {profile.matchedInterestsCount}/{interests.length} sở thích trùng khớp
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((item, idx) => (
              <InterestTag key={idx} label={item} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* ── Parent info ── */}
        <div className="rounded-2xl border border-gray-150 bg-gray-50 p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                alt={profile.parent?.fullName}
                className="w-10 h-10 rounded-full border-2 border-white shadow object-cover shrink-0"
                src={profile.parent?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.parent?.fullName || 'PH')}&background=EAF3EC&color=3d6841`}
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">{profile.parent?.fullName}</span>
                  {profile.parent?.isVerifiedParent && (
                    <VerifiedBadge text="Đã xác thực Phone, Email" size="sm" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Phụ huynh bảo hộ • Tham gia cộng đồng</p>
              </div>
            </div>
            {(profile.parent?.preferences?.preferredPlaydateDays?.length > 0 || profile.parent?.preferences?.preferredTimeSlots?.length > 0) && (
              <div className="flex flex-col gap-1 items-end shrink-0">
                {profile.parent?.preferences?.preferredPlaydateDays?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-xl">
                    <CalendarDays size={13} strokeWidth={1.5} />
                    {profile.parent.preferences.preferredPlaydateDays.map((d) => tr(DAY_LABELS, d)).join(', ')}
                  </div>
                )}
                {profile.parent?.preferences?.preferredTimeSlots?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-white border border-surface-container px-2.5 py-1 rounded-xl">
                    <Clock size={13} strokeWidth={1.5} />
                    {profile.parent.preferences.preferredTimeSlots.map((t) => tr(TIME_LABELS, t)).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {profile.parent?.bio && (
            <p className="text-sm text-gray-600 italic bg-white px-3.5 py-3 rounded-xl border border-gray-100 leading-relaxed">
              "{profile.parent.bio}"
            </p>
          )}
        </div>

        {/* ── Action Buttons ── */}
        {isTop && (
          <DiscoveryActionButtons
            onPass={() => onSwipe('PASS')}
            onLike={() => onSwipe('LIKE')}
          />
        )}
      </div>
    </motion.div>
  );
};
