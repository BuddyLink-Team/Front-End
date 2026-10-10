import React from 'react';
import { cn } from '../../../utils/cn';
import { DEFAULT_BADGE_ICON_URL } from '../constants/gamification.constants';

/**
 * Badge image from the API (badge.iconUrl). A missing or broken image falls back to the default badge.
 *
 * @param {{ iconUrl?: string, title: string }} badge
 * @param {boolean} [locked=false] - Greyed out while the badge is not unlocked
 * @param {string} [className] - Size of the image (e.g. 'w-14 h-14')
 */
export function BadgeIcon({ badge, locked = false, className }) {
  const handleError = (event) => {
    // Swap once: a broken default must not loop
    if (event.currentTarget.dataset.fallback) return;
    event.currentTarget.dataset.fallback = 'true';
    event.currentTarget.src = DEFAULT_BADGE_ICON_URL;
  };

  return (
    <img
      src={badge.iconUrl || DEFAULT_BADGE_ICON_URL}
      alt={`Huy hiệu ${badge.title}`}
      onError={handleError}
      draggable={false}
      className={cn('shrink-0 select-none', locked && 'grayscale opacity-50', className)}
    />
  );
}

export default BadgeIcon;
