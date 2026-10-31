import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import AdminHeader from '../modules/admin/components/AdminHeader';
import AdminSidebarUser from '../modules/admin/components/AdminSidebarUser';
import { useAdminNotificationSocket } from '../modules/admin/hooks/useAdminNotificationSocket';
import { ADMIN_NAV_LINKS } from '../constants/navigation.constants';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { useSidebar } from '../hooks/useSidebar';
import { cn } from '../utils/cn';
import logoImg from '../assets/images/logo.png';

// White sidebar with a soft matcha highlight on the active link
const SIDEBAR_STYLES = {
  headerClassName: 'px-space-md',
  footerClassName: 'px-space-sm py-space-sm',
  linkClassName: 'text-on-surface-variant [&_svg]:stroke-1.75',
  activeLinkClassName: 'bg-primary-soft text-primary-ink font-semibold shadow-none hover:bg-primary-soft',
};

/**
 * Layout for every /admin route: fixed sidebar on the left (drawer below lg),
 * fixed header on top and the page content capped at 1160px.
 */
export const AdminLayout = () => {
  const { handleLogout } = useAuth();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Desktop collapse (persisted); the mobile drawer always opens expanded
  const { collapsed, toggle } = useSidebar();
  const isCollapsed = collapsed && !isMenuOpen;
  useAdminNotificationSocket();

  // Close the mobile drawer after navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      {/* Backdrop for the mobile drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-text-primary/25 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        links={ADMIN_NAV_LINKS}
        collapsed={isCollapsed}
        // Collapsed: the Sidebar's default "B" mark replaces the full wordmark logo
        header={isCollapsed ? undefined : <img src={logoImg} alt="Logo BuddyLink" className="h-8 w-auto object-contain" />}
        footer={<AdminSidebarUser collapsed={isCollapsed} onLogout={handleLogout} />}
        {...SIDEBAR_STYLES}
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:translate-x-0',
          isMenuOpen ? 'translate-x-0 shadow-sidebar' : '-translate-x-full',
        )}
      />

      <div className={cn('transition-all duration-300', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <AdminHeader
          isSidebarCollapsed={collapsed}
          onToggleSidebar={toggle}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
        <main className="pt-16">
          <div className="max-w-content mx-auto px-5 lg:px-space-lg py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
