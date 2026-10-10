import React from 'react';
import { MapPin, CalendarDays, Brain, Heart, Clock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Avatar } from '../../../components/ui/Avatar';
import { useDiscoveryCard } from '../hooks/useDiscoveryCard';
import {
  SWIPE_DIRECTIONS,
  SWIPE_FEEDBACK,
} from '../constants/discoveryConstants';
import { MatchScoreBar } from './MatchScoreBar';
import { DiscoveryActionButtons } from './DiscoveryActionButtons';

export const DiscoveryCard = ({
  profile,
  onSwipe,
  index,
  isTop,
  onViewDetail,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-4, 4]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  // Colors stay in Tailwind classes; the drag offset only fades the overlays in and out
  const passTint = useTransform(
    x,
    SWIPE_FEEDBACK.PASS_TINT.INPUT,
    SWIPE_FEEDBACK.PASS_TINT.OUTPUT,
  );
  const likeTint = useTransform(
    x,
    SWIPE_FEEDBACK.LIKE_TINT.INPUT,
    SWIPE_FEEDBACK.LIKE_TINT.OUTPUT,
  );
  const passGlow = useTransform(
    x,
    SWIPE_FEEDBACK.PASS_GLOW.INPUT,
    SWIPE_FEEDBACK.PASS_GLOW.OUTPUT,
  );
  const likeGlow = useTransform(
    x,
    SWIPE_FEEDBACK.LIKE_GLOW.INPUT,
    SWIPE_FEEDBACK.LIKE_GLOW.OUTPUT,
  );

  const { data, handleDragEnd } = useDiscoveryCard(profile, onSwipe);

  if (!data) return null;

  const {
    interests,
    genderLabel,
    avatarSrc,
    distanceLabel,
    preferredLocations,
    preferredPlaydateDays,
    preferredTimeSlots,
  } = data;

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: 10 - index,
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
      // Stacked in a single grid cell (see DiscoveryPage) so the stack takes the height of the tallest card
      className={`relative col-start-1 row-start-1 w-full ${!isTop ? 'pointer-events-none' : ''}`}
    >
      {/* Swipe halo (outside the clipped card so the glow is visible) */}
      {isTop && (
        <>
          <motion.div
            aria-hidden
            style={{ opacity: passGlow }}
            className="absolute inset-0 rounded-2xl shadow-glow shadow-error/25 pointer-events-none"
          />
          <motion.div
            aria-hidden
            style={{ opacity: likeGlow }}
            className="absolute inset-0 rounded-2xl shadow-glow shadow-primary/55 pointer-events-none"
          />
        </>
      )}

      <div
        className={`relative rounded-2xl border border-hairline bg-surface-container-lowest flex flex-col overflow-hidden ${isTop ? 'shadow-lg' : 'shadow-md'}`}
      >
        {/* Swipe tint: pastel error for Pass, matcha for Like */}
        {isTop && (
          <>
            <motion.div
              aria-hidden
              style={{ opacity: passTint }}
              className="absolute inset-0 bg-error-container pointer-events-none"
            />
            <motion.div
              aria-hidden
              style={{ opacity: likeTint }}
              className="absolute inset-0 bg-primary-fixed pointer-events-none"
            />
          </>
        )}

        <div className="relative p-5 flex flex-col gap-5">
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
              <span className="absolute bottom-0 left-0 right-0 text-center bg-secondary text-secondary-on-secondary text-[10px] font-bold py-0.5">
                {genderLabel}
              </span>
            </div>

            {/* Right info */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {/* Name row */}
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-[22px] font-extrabold text-on-surface leading-tight cursor-pointer hover:text-primary transition-colors"
                  onClick={onViewDetail}
                  title="Xem chi tiết hồ sơ"
                >
                  {profile.displayName}
                </h2>
                <span className="px-2.5 py-0.5 bg-surface-container-low text-on-surface-variant text-xs font-medium rounded-full border border-hairline">
                  {profile.age} tuổi
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-surface-container-low text-text-muted text-xs rounded-full border border-hairline">
                  <MapPin size={12} strokeWidth={1.5} />
                  {distanceLabel}
                </span>
              </div>

              {/* Personality */}
              {profile.personality?.length > 0 && (
                <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                  <Brain
                    size={16}
                    strokeWidth={1.5}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span>
                    Tính cách:{' '}
                    <strong className="text-on-surface">
                      {profile.personality.join(' • ')}
                    </strong>
                  </span>
                </div>
              )}

              {/* Meetup spots */}
              {preferredLocations.length > 0 && (
                <div className="flex items-start gap-1.5 text-sm text-on-surface-variant">
                  <MapPin
                    size={15}
                    strokeWidth={1.5}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <span>
                    Điểm hẹn thích:{' '}
                    <strong className="text-on-surface">
                      {preferredLocations.join(' • ')}
                    </strong>
                  </span>
                </div>
              )}

              {/* MatchScore inline */}
              <MatchScoreBar score={profile.matchScore || 0} />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container-low" />

          {/* ── Interests ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                <Heart size={14} strokeWidth={1.5} className="text-primary" />
                Sở thích chung tương thích
              </h3>
              {profile.matchedInterestsCount !== undefined && (
                <span className="px-2.5 py-0.5 bg-primary-container text-primary-on-primary-container text-xs font-medium rounded-full border border-primary">
                  {profile.matchedInterestsCount}/{interests.length} sở thích
                  trùng khớp
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
          <div className="h-px bg-surface-container-low" />

          {/* ── Parent info ── */}
          <div className="rounded-2xl border border-hairline bg-surface-container-low p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={profile.parent?.avatarUrl}
                  alt={profile.parent?.fullName || 'PH'}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-on-surface">
                      {profile.parent?.fullName}
                    </span>
                    {profile.parent?.isVerifiedParent && (
                      <VerifiedBadge
                        text="Đã xác thực Phone, Email"
                        size="sm"
                      />
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Phụ huynh bảo hộ • Tham gia cộng đồng
                  </p>
                </div>
              </div>
              {(preferredPlaydateDays.length > 0 ||
                preferredTimeSlots.length > 0) && (
                <div className="flex flex-col gap-1 items-end shrink-0">
                  {preferredPlaydateDays.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-white border border-hairline px-2.5 py-1 rounded-xl">
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
              <p className="text-sm text-on-surface-variant italic bg-white px-3.5 py-3 rounded-xl border border-hairline leading-relaxed">
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
      </div>
    </motion.div>
  );
};
