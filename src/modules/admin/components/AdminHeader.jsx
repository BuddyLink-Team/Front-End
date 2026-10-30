import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ADMIN_NAV_LINKS, ADMIN_ROUTES } from '../../../constants/navigation.constants';
import { ADMIN_NOTIFICATION_BOARD_HASH } from '../constants/dashboard.constants';
import { cn } from '../../../utils/cn';

const TOGGLE_BUTTON_CLASS =
  'p-2 -ml-2 rounded-md text-on-surface-variant hover:bg-surface-muted hover:text-on-surface transition-colors';

const MAX_BADGE_COUNT = 99;

/**
 * Top bar of the admin console.
 * Sidebar toggle (collapse on lg+, drawer below lg) + current section title + notification bell.
 * The signed-in admin and logout live in the sidebar footer (AdminSidebarUser).
 *
 * @param {Object} props
 * @param {boolean} props.isSidebarCollapsed - Desktop sidebar state, shifts the header and picks the icon
 * @param {Function} props.onToggleSidebar - Collapses / expands the sidebar on lg+
 * @param {Function} props.onOpenMenu - Opens the sidebar drawer on small screens
 */
export const AdminHeader = ({ isSidebarCollapsed, onToggleSidebar, onOpenMenu }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const unreadTotal = useSelector((state) => state.admin.notifications.unreadCount.total);

  const pageTitle = ADMIN_NAV_LINKS.find(({ href }) => pathname.startsWith(href))?.name || 'Quản trị';
  const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 h-16 z-30 bg-white border-b border-hairline flex items-center justify-between gap-space-sm px-5 lg:px-space-lg transition-all duration-300',
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64',
      )}
    >
      <div className="flex items-center gap-space-sm min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở menu quản trị"
          className={cn(TOGGLE_BUTTON_CLASS, 'lg:hidden')}
        >
          <Menu className="w-5 h-5 stroke-1.75" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          title={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className={cn(TOGGLE_BUTTON_CLASS, 'hidden lg:inline-flex')}
        >
          <ToggleIcon className="w-5 h-5 stroke-1.75" />
        </button>
        {/* Section label only: each page renders its own <h1> */}
        <span className="text-title-md text-on-surface truncate">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-space-sm">
        {/* Same bell as the parent app (NotificationDropdown) */}
        <Button
          variant="ghost"
          onClick={() => navigate(`${ADMIN_ROUTES.DASHBOARD}${ADMIN_NOTIFICATION_BOARD_HASH}`)}
          aria-label={`Thông báo hệ thống (${unreadTotal} chưa đọc)`}
          title="Thông báo hệ thống"
          className="relative p-1 rounded-md active:scale-100 text-on-surface-variant hover:bg-surface-muted hover:text-on-surface focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell className="w-6 h-6 stroke-1.75" />
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 ring-2 ring-white min-w-5 h-5 px-1 rounded-full bg-error text-white text-label-xs font-semibold flex items-center justify-center">
              {unreadTotal > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadTotal}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
