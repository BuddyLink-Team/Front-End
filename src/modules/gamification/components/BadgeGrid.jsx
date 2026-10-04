import React from 'react';
import BadgeCard from './BadgeCard';
import { BADGE_FILTER_TYPES } from '../constants/gamification.constants';

export function BadgeGrid({
  badges,
  filteredBadges,
  filter,
  setFilter,
  unlockedCount,
  lockedCount,
}) {
  return (
    <div className="space-y-5">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-headline-md font-semibold text-on-surface tracking-tight">
            Huy hiệu Tinh hoa
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Khích lệ thói quen vui chơi tương tác an lành, tôn trọng và giàu cảm xúc.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setFilter(BADGE_FILTER_TYPES.ALL)}
            className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
              filter === BADGE_FILTER_TYPES.ALL
                ? 'bg-surface-container-lowest text-primary-dark shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tất cả ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter(BADGE_FILTER_TYPES.UNLOCKED)}
            className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
              filter === BADGE_FILTER_TYPES.UNLOCKED
                ? 'bg-surface-container-lowest text-primary-dark shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đã mở ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter(BADGE_FILTER_TYPES.LOCKED)}
            className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
              filter === BADGE_FILTER_TYPES.LOCKED
                ? 'bg-surface-container-lowest text-primary-dark shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Chưa mở ({lockedCount})
          </button>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => (
          <BadgeCard key={badge.code} badge={badge} />
        ))}
      </div>
    </div>
  );
}

export default BadgeGrid;
