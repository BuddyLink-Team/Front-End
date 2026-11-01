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
 * Admin console paths (admin portal build), shared by the sidebar and in-app navigation.
 */
export const ADMIN_ROUTES = Object.freeze({
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  CHILDREN: '/admin/children',
  CONNECTIONS: '/admin/connections',
  PLAYDATES: '/admin/playdates',
  SUBSCRIPTIONS: '/admin/subscriptions',
  REPORTS: '/admin/reports',
});

/**
 * Sidebar links for the admin console (AdminLayout).
 * The first 5 items follow the Stitch "Tổng quan Quản trị" screen order;
 * the rest cover the remaining admin routes in AdminRoutes.jsx.
 * `name` is also the section label in AdminHeader, so keep it in line with each page's title.
 */
export const ADMIN_NAV_LINKS = [
  { name: 'Tổng quan', href: ADMIN_ROUTES.DASHBOARD, icon: BarChart3 },
  { name: 'Phụ huynh', href: ADMIN_ROUTES.USERS, icon: Users },
  { name: 'Hồ sơ trẻ', href: ADMIN_ROUTES.CHILDREN, icon: Baby },
  { name: 'Kết nối', href: ADMIN_ROUTES.CONNECTIONS, icon: Link2 },
  { name: 'Cuộc hẹn chơi', href: ADMIN_ROUTES.PLAYDATES, icon: PartyPopper },
  { name: 'Doanh thu', href: ADMIN_ROUTES.SUBSCRIPTIONS, icon: Wallet },
  { name: 'Báo cáo vi phạm', href: ADMIN_ROUTES.REPORTS, icon: ShieldCheck },
];
