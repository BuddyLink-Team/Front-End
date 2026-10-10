// Badge images come from the API (badge.iconUrl, hosted on Cloudinary). Local copy in public/ used when it is
// missing or fails to load (e.g. Cloudinary unreachable)
export const DEFAULT_BADGE_ICON_URL = '/badges/default.svg';

// Pastel accents per badge (card border, unlocked card surface + icon halo), built only from design system
// tokens (tailwind.config.js).
// Keys are the badge codes of BADGE_CODES in Back-End/src/modules/gamification/gamification.constants.js
// (same palettes as the badge images, Back-End/assets/badges)
const PRIMARY_THEME = Object.freeze({
  border: 'border-primary-border',
  surface: 'from-primary-soft',
  halo: 'bg-primary-tint ring-primary-border',
});
const SECONDARY_THEME = Object.freeze({
  border: 'border-secondary-fixed-dim',
  surface: 'from-secondary-fixed/40',
  halo: 'bg-secondary-fixed/50 ring-secondary-fixed-dim',
});
const TERTIARY_THEME = Object.freeze({
  border: 'border-tertiary-border',
  surface: 'from-tertiary-soft',
  halo: 'bg-tertiary-soft ring-tertiary-border',
});

export const BADGE_COLOR_THEMES = Object.freeze({
  first_connection: TERTIARY_THEME,
  first_playdate: PRIMARY_THEME,
  '4_week_streak': TERTIARY_THEME,
  '10_playdates': PRIMARY_THEME,
  social_family: SECONDARY_THEME,
  explorer: SECONDARY_THEME,
  first_host: PRIMARY_THEME,
  generous_host: TERTIARY_THEME,
  '8_week_streak': TERTIARY_THEME,
  '12_week_streak': TERTIARY_THEME,
  '25_playdates': PRIMARY_THEME,
  super_connector: SECONDARY_THEME,
  adventurer: SECONDARY_THEME,
  default: PRIMARY_THEME,
});

export const BADGE_FILTER_TYPES = Object.freeze({
  ALL: 'all',
  UNLOCKED: 'unlocked',
  LOCKED: 'locked',
});

// Weekly streak goal shown on the banner (= requirement of the 4_week_streak badge)
export const STREAK_GOAL_WEEKS = 4;

// First visit on a device: only badges unlocked within these days are celebrated
export const RECENT_UNLOCK_DAYS = 7;
