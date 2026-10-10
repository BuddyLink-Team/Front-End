import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievements } from '../redux/gamificationSlice';
import { BADGE_FILTER_TYPES, STREAK_GOAL_WEEKS } from '../constants/gamification.constants';
import { formatDate } from '../../../utils/formatters';

const toPercent = (value, total) => (total > 0 ? Math.round((Math.min(value, total) / total) * 100) : 0);

export function useGamification() {
  const dispatch = useDispatch();
  const { streak, badges, isLoaded, isLoading, error } = useSelector((state) => state.gamification);
  const [filter, setFilter] = useState(BADGE_FILTER_TYPES.ALL);

  const loadAchievements = useCallback(() => dispatch(fetchAchievements()), [dispatch]);

  // Refreshes after a rating are handled globally by useAchievementCelebration
  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  const badgeItems = useMemo(
    () =>
      badges.map((badge) => ({
        ...badge,
        progress: badge.progress ?? (badge.unlocked ? badge.requirementCount : 0),
        progressPercent: badge.unlocked ? 100 : toPercent(badge.progress ?? 0, badge.requirementCount),
        unlockedDateLabel: formatDate(badge.unlockedAt),
      })),
    [badges],
  );

  const streakView = useMemo(() => {
    const currentWeeklyStreak = streak?.currentWeeklyStreak || 0;
    return {
      currentWeeklyStreak,
      longestStreak: Math.max(streak?.longestStreak || 0, currentWeeklyStreak),
      isCurrentWeekCompleted: Boolean(streak?.isCurrentWeekCompleted),
      goalWeeks: STREAK_GOAL_WEEKS,
      // One node per goal week, filled by the current consecutive weeks
      goalNodes: Array.from({ length: STREAK_GOAL_WEEKS }, (_, i) => i < currentWeeklyStreak),
    };
  }, [streak]);

  const unlockedCount = useMemo(() => badgeItems.filter((b) => b.unlocked).length, [badgeItems]);
  const lockedCount = badgeItems.length - unlockedCount;

  const filterOptions = useMemo(
    () => [
      { id: BADGE_FILTER_TYPES.ALL, label: 'Tất cả', count: badgeItems.length },
      { id: BADGE_FILTER_TYPES.UNLOCKED, label: 'Đã mở', count: unlockedCount },
      { id: BADGE_FILTER_TYPES.LOCKED, label: 'Chưa mở', count: lockedCount },
    ],
    [badgeItems.length, unlockedCount, lockedCount],
  );

  const filteredBadges = useMemo(() => {
    return badgeItems.filter((badge) => {
      if (filter === BADGE_FILTER_TYPES.UNLOCKED) return badge.unlocked;
      if (filter === BADGE_FILTER_TYPES.LOCKED) return !badge.unlocked;
      return true;
    });
  }, [badgeItems, filter]);

  // FilterChips toggles a selected chip off (null): fall back to "all"
  const handleFilterChange = useCallback((id) => setFilter(id || BADGE_FILTER_TYPES.ALL), []);

  return {
    isLoaded,
    loading: isLoading,
    error: error ? error.message || 'Không thể tải dữ liệu thành tích.' : '',
    streak: streakView,
    filter,
    filterOptions,
    setFilter: handleFilterChange,
    badges: badgeItems,
    filteredBadges,
    unlockedCount,
    lockedCount,
    reload: loadAchievements,
  };
}
