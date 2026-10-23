import {
  Compass,
  Users,
  MessageCircle,
  Calendar,
  Award,
  BarChart3,
  Baby,
  Link2,
  PartyPopper,
  ShieldCheck,
  Wallet,
  LineChart,
} from 'lucide-react';

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

/**
 * Sidebar links for the admin console (AdminLayout).
 * The first 5 items follow the Stitch "Tổng quan Quản trị" screen order;
 * the rest cover the remaining admin routes in AdminRoutes.jsx.
 */
export const ADMIN_NAV_LINKS = [
  { name: 'Tổng quan', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Người dùng', href: '/admin/users', icon: Users },
  { name: 'Cuộc hẹn', href: '/admin/playdates', icon: PartyPopper },
  { name: 'An toàn & Vi phạm', href: '/admin/reports', icon: ShieldCheck },
  { name: 'Doanh thu', href: '/admin/subscriptions', icon: Wallet },
  { name: 'Kết nối', href: '/admin/connections', icon: Link2 },
];
