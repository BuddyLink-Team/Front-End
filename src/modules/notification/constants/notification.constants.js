import React from 'react';
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
    label: 'Lời mời kết nối',
    icon: UserPlus,
    bgClass: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'Kết nối',
    actionLabel: 'Xem lời mời',
    getActionPath: () => '/connections',
  },
  [NOTIFICATION_TYPES.CONNECTION_ACCEPTED]: {
    label: 'Đã kết nối',
    icon: UserCheck,
    bgClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'Bạn mới',
    actionLabel: 'Gửi tin nhắn',
    getActionPath: () => '/chat',
  },
  [NOTIFICATION_TYPES.PLAYDATE_INVITE]: {
    label: 'Lời mời Playdate',
    icon: Calendar,
    bgClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeClass: 'bg-primary-soft text-primary-dark border-primary-border',
    badgeText: 'Buổi hẹn chơi',
    actionLabel: 'Xem chi tiết buổi hẹn',
    getActionPath: (data) => (data?.playdateId ? `/playdates/${data.playdateId}` : '/playdates'),
  },
  [NOTIFICATION_TYPES.PLAYDATE_REMINDER]: {
    label: 'Nhắc hẹn Playdate',
    icon: Clock,
    bgClass: 'bg-amber-50 text-amber-600 border-amber-100',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'Sắp diễn ra',
    actionLabel: 'Xem lịch hẹn',
    getActionPath: (data) => (data?.playdateId ? `/playdates/${data.playdateId}` : '/playdates'),
  },
  [NOTIFICATION_TYPES.BADGE_UNLOCKED]: {
    label: 'Huy hiệu mới',
    icon: Award,
    bgClass: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
    badgeText: 'Thành tích',
    actionLabel: 'Xem kho huy hiệu',
    getActionPath: () => '/gamification',
  },
  [NOTIFICATION_TYPES.STREAK_REMINDER]: {
    label: 'Giữ chuỗi ngày',
    icon: Flame,
    bgClass: 'bg-orange-50 text-orange-600 border-orange-100',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'Chuỗi ngày',
    actionLabel: 'Xem chuỗi',
    getActionPath: () => '/gamification',
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    label: 'Hệ thống',
    icon: Bell,
    bgClass: 'bg-gray-100 text-gray-700 border-gray-200',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    badgeText: 'Hệ thống',
    actionLabel: 'Chi tiết',
    getActionPath: () => '/notifications',
  },
};

export const getNotificationMeta = (type) => {
  return (
    NOTIFICATION_META[type] || {
      label: 'Thông báo',
      icon: Sparkles,
      bgClass: 'bg-gray-50 text-gray-600 border-gray-100',
      badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
      badgeText: 'Tin mới',
      actionLabel: 'Xem chi tiết',
      getActionPath: () => '/notifications',
    }
  );
};
