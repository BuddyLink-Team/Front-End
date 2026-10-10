import { describe, it, expect } from 'vitest';
import gamificationReducer, {
  fetchAchievements,
  resetGamificationState,
} from '../../modules/gamification/redux/gamificationSlice';

const action = (thunk, status, payload) => ({ type: thunk[status].type, payload });

const achievements = {
  streak: { currentWeeklyStreak: 2, longestStreak: 4 },
  badges: [
    { code: 'first_playdate', unlocked: true, unlockedAt: '2026-10-01T00:00:00.000Z' },
    { code: 'explorer', unlocked: false, unlockedAt: null },
  ],
};

describe('gamificationSlice', () => {
  const initial = gamificationReducer(undefined, { type: 'init' });

  it('stores streak and badges once loaded', () => {
    const loading = gamificationReducer(initial, action(fetchAchievements, 'pending'));
    expect(loading.isLoading).toBe(true);

    const loaded = gamificationReducer(loading, action(fetchAchievements, 'fulfilled', achievements));
    expect(loaded.isLoading).toBe(false);
    expect(loaded.isLoaded).toBe(true);
    expect(loaded.streak).toEqual(achievements.streak);
    expect(loaded.badges).toHaveLength(2);
  });

  it('keeps the API error and stops loading on failure', () => {
    const failed = gamificationReducer(
      initial,
      action(fetchAchievements, 'rejected', { message: 'Không tìm thấy hồ sơ phụ huynh.' }),
    );
    expect(failed.isLoading).toBe(false);
    expect(failed.error.message).toBe('Không tìm thấy hồ sơ phụ huynh.');
  });

  it('resets on logout', () => {
    const loaded = gamificationReducer(initial, action(fetchAchievements, 'fulfilled', achievements));
    expect(gamificationReducer(loaded, resetGamificationState())).toEqual(initial);
  });
});
