import { Compass, Users, MessageCircle, Calendar, Award } from 'lucide-react';

/**
 * Main navigation links for parents on the top navigation bar.
 * Thứ tự: Khám phá, Kết nối, Tin nhắn, Hẹn chơi, Thành tích
 */
export const NAV_LINKS = [
  { name: 'Khám phá', href: '/discovery', icon: Compass },
  { name: 'Kết nối', href: '/connections', icon: Users },
  { name: 'Tin nhắn', href: '/chat', icon: MessageCircle },
  { name: 'Hẹn chơi', href: '/playdates', icon: Calendar },
  { name: 'Thành tích', href: '/gamification', icon: Award },
];
