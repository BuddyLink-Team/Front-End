import React from 'react';
import { MapPin, CalendarDays, Brain, Heart, Clock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Avatar } from '../../../components/ui/Avatar';
import { useDiscoveryCard } from '../hooks/useDiscoveryCard';
import { SWIPE_DIRECTIONS } from '../constants/discoveryConstants';
import { MatchScoreBar } from './MatchScoreBar';
import { DiscoveryActionButtons } from './DiscoveryActionButtons';

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

  const { data, handleDragEnd } = useDiscoveryCard(profile, onSwipe);

  if (!data) return null;

  const { interests, genderLabel, avatarSrc, distanceLabel, preferredLocations, preferredPlaydateDays, preferredTimeSlots } = data;

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
              src={avatarSrc}
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
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                <MapPin size={12} strokeWidth={1.5} />
                {distanceLabel}
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
            {preferredLocations.length > 0 && (
              <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                <MapPin size={15} strokeWidth={1.5} className="text-primary mt-0.5 shrink-0" />
                <span>Điểm hẹn thích: <strong className="text-on-surface">{preferredLocations.join(' • ')}</strong></span>
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
            {interests.map((item) => (
              <InterestTag key={item} label={item} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* ── Parent info ── */}
        <div className="rounded-2xl border border-gray-150 bg-gray-50 p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                src={profile.parent?.avatarUrl}
                alt={profile.parent?.fullName || 'PH'}
                size="md"
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
            {(preferredPlaydateDays.length > 0 || preferredTimeSlots.length > 0) && (
              <div className="flex flex-col gap-1 items-end shrink-0">
                {preferredPlaydateDays.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-xl">
                    <CalendarDays size={13} strokeWidth={1.5} />
                    {preferredPlaydateDays.join(', ')}
                  </div>
                )}
                {preferredTimeSlots.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-white border border-surface-container px-2.5 py-1 rounded-xl">
                    <Clock size={13} strokeWidth={1.5} />
                    {preferredTimeSlots.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {profile.parent?.bio && (
            <p className="text-sm text-gray-600 italic bg-white px-3.5 py-3 rounded-xl border border-gray-100 leading-relaxed">
              &quot;{profile.parent.bio}&quot;
            </p>
          )}
        </div>

        {/* ── Action Buttons ── */}
        {isTop && (
          <DiscoveryActionButtons
            onPass={() => onSwipe(SWIPE_DIRECTIONS.PASS)}
            onLike={() => onSwipe(SWIPE_DIRECTIONS.LIKE)}
          />
        )}
      </div>
    </motion.div>
  );
};
