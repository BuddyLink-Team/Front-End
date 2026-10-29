import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen, Bell } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '../../../constants/navigation.constants';
import { useAdminNotificationSocket } from '../hooks/useAdminNotificationSocket';
import { cn } from '../../../utils/cn';

const TOGGLE_BUTTON_CLASS =
  'p-2 -ml-2 rounded-md text-on-surface-variant hover:bg-surface-muted hover:text-on-surface transition-colors';

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
  const { unreadCount } = useAdminNotificationSocket({ autoFetch: false });

  const pageTitle = ADMIN_NAV_LINKS.find(({ href }) => pathname.startsWith(href))?.name || 'Quản trị';
  const ToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  const handleBellClick = () => {
    if (pathname === '/admin/dashboard') {
      const el = document.getElementById('admin-notification-board');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/admin/dashboard#admin-notification-board');
    }
  };

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
        <button
          type="button"
          onClick={handleBellClick}
          className="relative p-2 rounded-md text-on-surface-variant hover:bg-surface-muted hover:text-on-surface transition-colors"
          aria-label={`Thông báo hệ thống (${unreadCount?.total || 0} chưa đọc)`}
          title="Thông báo hệ thống"
        >
          <Bell className="w-5 h-5 stroke-1.75" />
          {Boolean(unreadCount?.total && unreadCount.total > 0) && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-badge h-badge px-1 text-label-xs font-bold text-white bg-error rounded-full ring-2 ring-white animate-pulse">
              {unreadCount.total > 99 ? '99+' : unreadCount.total}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
