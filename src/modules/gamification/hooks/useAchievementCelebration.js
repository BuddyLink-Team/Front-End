import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievements } from '../redux/gamificationSlice';
import { RECENT_UNLOCK_DAYS } from '../constants/gamification.constants';
import { STORAGE_KEYS } from '../../../constants/storage.constants';
import { USER_ROLES } from '../../../constants/role.constants';
import { APP_EVENTS } from '../../../constants/event.constants';

const DAY_MS = 24 * 60 * 60 * 1000;

// Per-device memory of what was already celebrated; storage may be unavailable (private mode).
// Returns null when nothing was stored yet for this user on this device.
const readSeen = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (!value) return null;
    return { badges: Array.isArray(value.badges) ? value.badges : [], streak: Number(value.streak) || 0 };
  } catch {
    return null;
  }
};
const writeSeen = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore: the celebration may show again on this device
  }
};

/**
 * First visit on this device: badges unlocked long ago and the current streak count as already
 * seen, so existing families are not congratulated for old achievements.
 */
const buildInitialSeen = (badges, streak, now = Date.now()) => ({
  badges: badges
    .filter((b) => b.unlocked && (!b.unlockedAt || now - new Date(b.unlockedAt).getTime() > RECENT_UNLOCK_DAYS * DAY_MS))
    .map((b) => b.code),
  streak: streak?.currentWeeklyStreak || 0,
});

/**
 * Celebrate newly unlocked badges and a longer weekly streak (popup after a playdate rating).
 * Mounted once in the parent layout; waits while the rating modal or the paywall is open.
 */
export function useAchievementCelebration() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { streak, badges, isLoaded } = useSelector((state) => state.gamification);
  const isRatingPromptOpen = useSelector((state) => state.ratingFeedback?.isPromptOpen);
  const isPaywallOpen = useSelector((state) => state.subscription?.isPaywallOpen);
  const userId = user?._id || user?.id;
  const enabled = isAuthenticated && user?.role === USER_ROLES.PARENT && Boolean(userId);
  const storageKey = `${STORAGE_KEYS.SEEN_ACHIEVEMENTS}_${userId}`;
  const [dismissedKey, setDismissedKey] = useState(null);

  // A rating usually follows a completed playdate: refresh achievements
  useEffect(() => {
    if (!enabled) return undefined;
    const handleRatingSubmitted = () => {
      void dispatch(fetchAchievements());
    };
    window.addEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, handleRatingSubmitted);
    return () => window.removeEventListener(APP_EVENTS.PLAYDATE_RATING_SUBMITTED, handleRatingSubmitted);
  }, [enabled, dispatch]);

  // Keep the stored memory consistent with the latest achievements
  useEffect(() => {
    if (!enabled || !isLoaded) return;
    const seen = readSeen(storageKey);
    if (!seen) {
      writeSeen(storageKey, buildInitialSeen(badges, streak));
      return;
    }
    // After a missed week the streak restarts: lower the remembered value so it can be celebrated again
    const currentWeeklyStreak = streak?.currentWeeklyStreak || 0;
    if (currentWeeklyStreak < seen.streak) writeSeen(storageKey, { ...seen, streak: currentWeeklyStreak });
  }, [enabled, isLoaded, storageKey, badges, streak]);

  const celebration = useMemo(() => {
    if (!enabled || !isLoaded) return null;
    const seen = readSeen(storageKey) || buildInitialSeen(badges, streak);
    const newBadges = badges.filter((badge) => badge.unlocked && !seen.badges.includes(badge.code));
    const currentWeeklyStreak = streak?.currentWeeklyStreak || 0;
    const streakWeeks = currentWeeklyStreak > seen.streak ? currentWeeklyStreak : 0;
    if (!newBadges.length && !streakWeeks) return null;
    return {
      key: `${newBadges.map((b) => b.code).join(',')}|${streakWeeks}`,
      badges: newBadges,
      streakWeeks,
    };
  }, [enabled, isLoaded, storageKey, badges, streak]);

  const close = useCallback(() => {
    if (!celebration) return;
    const seen = readSeen(storageKey) || buildInitialSeen(badges, streak);
    writeSeen(storageKey, {
      badges: [...new Set([...seen.badges, ...badges.filter((b) => b.unlocked).map((b) => b.code)])],
      // Remember the current value so a reset streak can be celebrated again when it grows
      streak: streak?.currentWeeklyStreak || 0,
    });
    setDismissedKey(celebration.key);
  }, [celebration, storageKey, badges, streak]);

  const isOpen =
    Boolean(celebration) && celebration.key !== dismissedKey && !isRatingPromptOpen && !isPaywallOpen;

  return { isOpen, celebration, close };
}
