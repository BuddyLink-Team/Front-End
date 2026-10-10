import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../modules/auth/redux/authSlice';
import gamificationReducer from '../../modules/gamification/redux/gamificationSlice';
import ratingFeedbackReducer from '../../modules/rating-feedback/redux/ratingFeedbackSlice';
import AchievementCelebration from '../../modules/gamification/components/AchievementCelebration';
import { STORAGE_KEYS } from '../../constants/storage.constants';
import { renderWithProviders, screen, fireEvent } from '../utils/testUtils';

const SEEN_KEY = `${STORAGE_KEYS.SEEN_ACHIEVEMENTS}_u1`;
const DAY_MS = 24 * 60 * 60 * 1000;
const TITLE = 'Chúc mừng gia đình bạn!';

const makeStore = (gamification, { isPromptOpen = false } = {}) =>
  configureStore({
    reducer: { auth: authReducer, gamification: gamificationReducer, ratingFeedback: ratingFeedbackReducer },
    preloadedState: {
      auth: { ...authReducer(undefined, { type: 'init' }), isAuthenticated: true, user: { _id: 'u1', role: 'parent' } },
      gamification: { ...gamificationReducer(undefined, { type: 'init' }), isLoaded: true, ...gamification },
      ratingFeedback: { isPromptOpen },
    },
  });

const firstPlaydate = {
  code: 'first_playdate',
  title: 'Playdate đầu tiên',
  description: 'Hoàn thành ít nhất 1 Playdate.',
  unlocked: true,
  unlockedAt: new Date().toISOString(),
};
const explorer = { code: 'explorer', title: 'Nhà khám phá', description: 'Hoàn thành tại 5 địa điểm.', unlocked: false };

describe('AchievementCelebration', () => {
  beforeEach(() => localStorage.clear());

  it('congratulates a recent badge on the first visit, then remembers it', () => {
    const achievements = { streak: { currentWeeklyStreak: 2 }, badges: [firstPlaydate, explorer] };
    const { unmount } = renderWithProviders(<AchievementCelebration />, { store: makeStore(achievements) });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByText('Huy hiệu “Playdate đầu tiên”')).toBeInTheDocument();
    expect(screen.queryByText(/Nhà khám phá/)).not.toBeInTheDocument();
    // The streak that existed before the first visit is not celebrated
    expect(screen.queryByText('Chuỗi 2 tuần liên tiếp')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tuyệt vời' }));
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SEEN_KEY))).toEqual({ badges: ['first_playdate'], streak: 2 });

    unmount();
    renderWithProviders(<AchievementCelebration />, { store: makeStore(achievements) });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('does not congratulate badges unlocked long before the first visit', () => {
    const oldBadge = { ...firstPlaydate, unlockedAt: new Date(Date.now() - 30 * DAY_MS).toISOString() };
    renderWithProviders(<AchievementCelebration />, {
      store: makeStore({ streak: { currentWeeklyStreak: 0 }, badges: [oldBadge] }),
    });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('congratulates a longer streak once something was already seen', () => {
    localStorage.setItem(SEEN_KEY, JSON.stringify({ badges: ['first_playdate'], streak: 1 }));
    renderWithProviders(<AchievementCelebration />, {
      store: makeStore({ streak: { currentWeeklyStreak: 2 }, badges: [firstPlaydate] }),
    });
    expect(screen.getByText('Chuỗi 2 tuần liên tiếp')).toBeInTheDocument();
  });

  it('waits while the rating modal is open', () => {
    renderWithProviders(<AchievementCelebration />, {
      store: makeStore({ streak: { currentWeeklyStreak: 0 }, badges: [firstPlaydate] }, { isPromptOpen: true }),
    });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('stays hidden when nothing new was achieved', () => {
    renderWithProviders(<AchievementCelebration />, {
      store: makeStore({ streak: { currentWeeklyStreak: 0 }, badges: [explorer] }),
    });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });
});
