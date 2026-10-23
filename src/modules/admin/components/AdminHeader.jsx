import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, LogOut } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown';
import logoImg from '../../../assets/images/logo.png';
import { ICON_STROKE } from '../../../constants/icon.constants';

/**
 * Top bar of the admin console (Stitch "Tổng quan Quản trị").
 * Left: console title + live status pill. Right: admin identity with logout menu.
 *
 * @param {Object} props
 * @param {Function} props.onOpenMenu - Opens the sidebar drawer on small screens
 * @param {Function} props.onLogout - Logout handler provided by the layout
 */
export const AdminHeader = ({ onOpenMenu, onLogout }) => {
  const { user } = useSelector((state) => state.auth);

  const displayName = user?.fullName || 'Super Admin';
  const contact = user?.email || user?.phone || '';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-40 bg-surface/90 backdrop-blur-xl shadow-header flex items-center justify-between px-5 lg:px-space-lg">
      <div className="flex items-center gap-space-sm min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở menu quản trị"
          className="lg:hidden p-2 -ml-2 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={ICON_STROKE.DEFAULT} />
        </button>
        <img src={logoImg} alt="BuddyLink" className="h-6 w-auto object-contain sm:hidden" />
        <span className="hidden sm:inline text-label-lg text-on-surface truncate">
          Quản trị viên Hệ thống
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary-on-fixed text-label-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-dark animate-pulse" />
          Hoạt động
        </span>
      </div>

      <Dropdown
        align="right"
        trigger={
          <div className="flex items-center gap-space-xs cursor-pointer rounded-full">
            <Avatar src={user?.avatarUrl} alt={displayName} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-label-md text-on-surface">{displayName}</span>
              <span className="text-label-sm text-on-surface-variant">{contact}</span>
            </div>
          </div>
        }
      >
        <div className="py-1">
          <DropdownItem onClick={onLogout} icon={LogOut} danger>
            Đăng xuất
          </DropdownItem>
        </div>
      </Dropdown>
    </header>
  );
};

export default AdminHeader;
