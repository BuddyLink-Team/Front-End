import { useCallback, useEffect, useMemo, useState } from 'react';
import { gamificationApi } from '../api/gamificationApi';
import { BADGE_FILTER_TYPES } from '../constants/gamification.constants';

export function useGamification() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(BADGE_FILTER_TYPES.ALL);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await gamificationApi.getAchievements();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thành tích.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  useEffect(() => {
    const handleRatingSubmitted = () => {
      void loadAchievements();
    };
    window.addEventListener('playdate-rating-submitted', handleRatingSubmitted);
    return () => window.removeEventListener('playdate-rating-submitted', handleRatingSubmitted);
  }, [loadAchievements]);

  const badges = data?.badges || [];
  const unlockedCount = useMemo(() => badges.filter((b) => b.unlocked).length, [badges]);
  const lockedCount = badges.length - unlockedCount;

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      if (filter === BADGE_FILTER_TYPES.UNLOCKED) return badge.unlocked;
      if (filter === BADGE_FILTER_TYPES.LOCKED) return !badge.unlocked;
      return true;
    });
  }, [badges, filter]);

  return {
    data,
    loading,
    error,
    filter,
    setFilter,
    badges,
    filteredBadges,
    unlockedCount,
    lockedCount,
    reload: loadAchievements,
  };
}
