import {
  Handshake,
  CalendarCheck,
  Flame,
  Trophy,
  Users,
  Compass,
  Award,
} from 'lucide-react';

export const BADGE_ICONS = Object.freeze({
  first_connection: Handshake,
  first_playdate: CalendarCheck,
  '4_week_streak': Flame,
  '10_playdates': Trophy,
  social_family: Users,
  explorer: Compass,
  default: Award,
});

export const BADGE_COLOR_THEMES = Object.freeze({
  first_connection: {
    bg: 'bg-tertiary-fixed',
    text: 'text-on-tertiary-fixed',
    ring: 'ring-tertiary-fixed/40',
    border: 'border-tertiary/30',
    glow: 'shadow-[0_0_15px_rgba(246,209,134,0.35)]',
    accentText: 'text-tertiary-dark',
  },
  first_playdate: {
    bg: 'bg-primary-fixed',
    text: 'text-on-primary-fixed',
    ring: 'ring-primary-fixed/40',
    border: 'border-primary/30',
    glow: 'shadow-[0_0_15px_rgba(123,174,127,0.35)]',
    accentText: 'text-primary-dark',
  },
  '4_week_streak': {
    bg: 'bg-tertiary-fixed',
    text: 'text-on-tertiary-fixed',
    ring: 'ring-tertiary-fixed/40',
    border: 'border-tertiary/30',
    glow: 'shadow-[0_0_15px_rgba(246,209,134,0.35)]',
    accentText: 'text-tertiary-dark',
  },
  '10_playdates': {
    bg: 'bg-primary-fixed',
    text: 'text-on-primary-fixed',
    ring: 'ring-primary-fixed/40',
    border: 'border-primary/30',
    glow: 'shadow-[0_0_15px_rgba(123,174,127,0.35)]',
    accentText: 'text-primary-dark',
  },
  social_family: {
    bg: 'bg-secondary-fixed',
    text: 'text-on-secondary-fixed',
    ring: 'ring-secondary-fixed/40',
    border: 'border-secondary/30',
    glow: 'shadow-[0_0_15px_rgba(146,197,222,0.35)]',
    accentText: 'text-secondary-dark',
  },
  explorer: {
    bg: 'bg-secondary-fixed',
    text: 'text-on-secondary-fixed',
    ring: 'ring-secondary-fixed/40',
    border: 'border-secondary/30',
    glow: 'shadow-[0_0_15px_rgba(146,197,222,0.35)]',
    accentText: 'text-secondary-dark',
  },
});

export const WEEK_DAYS = Object.freeze([
  { label: 'T2', name: 'Thứ Hai' },
  { label: 'T3', name: 'Thứ Ba' },
  { label: 'T4', name: 'Thứ Tư' },
  { label: 'T5', name: 'Thứ Năm' },
  { label: 'T6', name: 'Thứ Sáu' },
  { label: 'T7', name: 'Thứ Bảy' },
  { label: 'CN', name: 'Chủ Nhật' },
]);

export const BADGE_FILTER_TYPES = Object.freeze({
  ALL: 'all',
  UNLOCKED: 'unlocked',
  LOCKED: 'locked',
});
