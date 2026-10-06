import { useCallback, useMemo } from 'react';
import { CHILD_GENDERS } from '../../child/constants/childConstants';
import {
  DEFAULT_CHILD_AVATARS,
  GENDER_LABELS,
  SWIPE_DIRECTIONS,
  SWIPE_THRESHOLD_PX,
} from '../constants/discoveryConstants';

/**
 * Merge interests and favorite activities, removing case-insensitive duplicates
 * (same rule the backend uses for matchedInterestsCount).
 */
const mergeUniqueTags = (...lists) => {
  const seen = new Set();
  return lists.flat().filter((tag) => {
    const key = String(tag).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Display data and drag handling for a discovery card.
 * @param {Object} profile - Discovery profile from the API
 * @param {(direction: string) => void} onSwipe
 */
export const useDiscoveryCard = (profile, onSwipe) => {
  const data = useMemo(() => {
    if (!profile) return null;
    const preferences = profile.parent?.preferences || {};

    return {
      interests: mergeUniqueTags(profile.interests || [], profile.favoriteActivities || []),
      genderLabel: GENDER_LABELS[profile.gender] || GENDER_LABELS[CHILD_GENDERS.OTHER],
      avatarSrc: DEFAULT_CHILD_AVATARS[profile.gender] || DEFAULT_CHILD_AVATARS.DEFAULT,
      distanceLabel: profile.distanceKm !== undefined ? `Cách ${profile.distanceKm} km` : 'Gần bạn',
      preferredLocations: preferences.preferredLocations || [],
      preferredPlaydateDays: preferences.preferredPlaydateDays || [],
      preferredTimeSlots: preferences.preferredTimeSlots || [],
    };
  }, [profile]);

  const handleDragEnd = useCallback(
    (_, info) => {
      if (info.offset.x > SWIPE_THRESHOLD_PX) onSwipe(SWIPE_DIRECTIONS.LIKE);
      else if (info.offset.x < -SWIPE_THRESHOLD_PX) onSwipe(SWIPE_DIRECTIONS.PASS);
    },
    [onSwipe],
  );

  return { data, handleDragEnd };
};

export default useDiscoveryCard;
