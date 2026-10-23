import {
  UserPlus,
  UserCheck,
  Calendar,
  Clock,
  Award,
  Flame,
  Bell,
  Sparkles,
} from 'lucide-react';

export const NOTIFICATION_TYPES = Object.freeze({
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  PLAYDATE_INVITE: 'playdate_invite',
  PLAYDATE_REMINDER: 'playdate_reminder',
  BADGE_UNLOCKED: 'badge_unlocked',
  STREAK_REMINDER: 'streak_reminder',
  SYSTEM: 'system',
});

export const NOTIFICATION_SOCKET_EVENTS = Object.freeze({
  NEW_NOTIFICATION: 'notification:new',
  UNREAD_COUNT: 'notification:unread_count',
  READ: 'notification:read',
  READ_ALL: 'notification:read_all',
});

export const NOTIFICATION_TABS = Object.freeze({
  ALL: 'all',
  CONNECTION: 'connection',
  PLAYDATE: 'playdate',
  BADGE: 'badge',
  SYSTEM: 'system',
});

export const TAB_DEFINITIONS = [
  {
    id: NOTIFICATION_TABS.ALL,
    label: 'Tất cả',
    types: null,
  },
  {
    id: NOTIFICATION_TABS.CONNECTION,
    label: 'Kết nối',
    types: [
      NOTIFICATION_TYPES.CONNECTION_REQUEST,
      NOTIFICATION_TYPES.CONNECTION_ACCEPTED,
    ],
  },
  {
    id: NOTIFICATION_TABS.PLAYDATE,
    label: 'Lời mời Playdate',
    types: [
      NOTIFICATION_TYPES.PLAYDATE_INVITE,
      NOTIFICATION_TYPES.PLAYDATE_REMINDER,
    ],
  },
  {
    id: NOTIFICATION_TABS.BADGE,
    label: 'Huy hiệu & Thành tích',
    types: [
      NOTIFICATION_TYPES.BADGE_UNLOCKED,
      NOTIFICATION_TYPES.STREAK_REMINDER,
    ],
  },
  {
    id: NOTIFICATION_TABS.SYSTEM,
    label: 'Hệ thống',
    types: [
      NOTIFICATION_TYPES.SYSTEM,
    ],
  },
];

export const NOTIFICATION_META = {
  [NOTIFICATION_TYPES.CONNECTION_REQUEST]: {
    icon: UserPlus,
    bgClass: 'bg-secondary-container/40 text-secondary-dark border-secondary/30',
    badgeClass: 'bg-secondary-container/40 text-secondary-dark border-secondary/30',
    badgeText: 'Kết nối',
    actionLabel: 'Xem lời mời',
    getActionPath: () => '/connections',
  },
  [NOTIFICATION_TYPES.CONNECTION_ACCEPTED]: {
    icon: UserCheck,
    bgClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeText: 'Bạn mới',
    actionLabel: 'Gửi tin nhắn',
    getActionPath: () => '/chat',
  },
  [NOTIFICATION_TYPES.PLAYDATE_INVITE]: {
    icon: Calendar,
    bgClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeText: 'Buổi hẹn chơi',
    actionLabel: 'Xem chi tiết buổi hẹn',
    getActionPath: (data) => (data?.playdateId ? `/playdates/${data.playdateId}` : '/playdates'),
  },
  [NOTIFICATION_TYPES.PLAYDATE_REMINDER]: {
    icon: Clock,
    bgClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeText: 'Sắp diễn ra',
    actionLabel: 'Xem lịch hẹn',
    getActionPath: (data) => (data?.playdateId ? `/playdates/${data.playdateId}` : '/playdates'),
  },
  [NOTIFICATION_TYPES.BADGE_UNLOCKED]: {
    icon: Award,
    bgClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeText: 'Thành tích',
    actionLabel: 'Xem kho huy hiệu',
    getActionPath: () => '/gamification',
  },
  [NOTIFICATION_TYPES.STREAK_REMINDER]: {
    icon: Flame,
    bgClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeClass: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border',
    badgeText: 'Chuỗi ngày',
    actionLabel: 'Xem chuỗi',
    getActionPath: () => '/gamification',
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    icon: Bell,
    bgClass: 'bg-surface-muted text-text-primary border-hairline',
    badgeClass: 'bg-surface-muted text-text-muted border-hairline',
    badgeText: 'Hệ thống',
    actionLabel: 'Chi tiết',
    getActionPath: () => '/notifications',
  },
};

export const getNotificationMeta = (type) => {
  return (
    NOTIFICATION_META[type] || {
      icon: Sparkles,
      bgClass: 'bg-surface-muted text-text-muted border-hairline',
      badgeClass: 'bg-surface-muted text-text-muted border-hairline',
      badgeText: 'Tin mới',
      actionLabel: 'Xem chi tiết',
      getActionPath: () => '/notifications',
    }
  );
};
