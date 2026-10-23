import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Sidebar } from '../components/navigation/Sidebar';
import AdminHeader from '../modules/admin/components/AdminHeader';
import { ADMIN_NAV_LINKS } from '../constants/navigation.constants';
import { useAuth } from '../modules/auth/hooks/useAuth';
import logoImg from '../assets/images/logo.png';
import { ICON_STROKE } from '../constants/icon.constants';

// Sidebar styling taken from the Stitch "Tổng quan Quản trị" screen
const SIDEBAR_STYLES = {
  className:
    'fixed inset-y-0 left-0 z-50 w-64 py-space-md bg-surface-container-low border-r-0 shadow-sidebar',
  headerClassName: 'h-auto px-space-md mb-space-lg border-b-0',
  footerClassName: 'px-space-md pt-space-sm pb-0 border-t-0',
  linkClassName:
    'gap-space-sm px-space-md py-2.5 rounded-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface [&_svg]:stroke-1.75',
  activeLinkClassName:
    'bg-primary text-primary-on-container font-semibold shadow-sm hover:bg-primary hover:text-primary-on-container',
};

const SidebarBrand = () => (
  <div className="flex items-center gap-space-xs">
    <img src={logoImg} alt="Logo BuddyLink" className="h-7 w-auto object-contain" />
    <div className="flex flex-col">
      <span className="text-title-md text-on-surface tracking-tight leading-tight">BuddyLink</span>
      <span className="text-label-sm text-on-surface-variant">Admin Console</span>
    </div>
  </div>
);

const SidebarSecurityNote = () => (
  <div className="p-space-sm rounded-md bg-surface-container flex items-center gap-space-xs">
    <Lock className="w-5 h-5 text-primary-dark" strokeWidth={ICON_STROKE.DEFAULT} />
    <span className="text-label-sm text-on-surface-variant">Chế độ bảo mật cao</span>
  </div>
);

/**
 * Layout for every /admin route: fixed sidebar on the left (drawer on < lg),
 * fixed header on top and the page content capped at 1160px.
 */
export const AdminLayout = () => {
  const { handleLogout } = useAuth();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile drawer after navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased selection:bg-primary selection:text-primary-on-container">
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
        header={<SidebarBrand />}
        footer={<SidebarSecurityNote />}
        {...SIDEBAR_STYLES}
        className={`${SIDEBAR_STYLES.className} transition-transform lg:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      />

      <div className="lg:pl-64">
        <AdminHeader onOpenMenu={() => setIsMenuOpen(true)} onLogout={handleLogout} />
        <main className="pt-16 w-full">
          <div className="w-full px-5 lg:px-space-lg py-space-md">
            <div className="max-w-content mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
