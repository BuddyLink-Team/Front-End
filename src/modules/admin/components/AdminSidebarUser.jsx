import React from 'react';
import { useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { cn } from '../../../utils/cn';

/**
 * Signed-in admin shown in the sidebar footer: avatar, name, role and a logout button.
 * Collapsed sidebar: avatar and logout button stacked, name moves to the avatar tooltip.
 *
 * @param {Object} props
 * @param {boolean} props.collapsed - Sidebar collapsed state
 * @param {Function} props.onLogout - Logout handler provided by the layout
 */
export const AdminSidebarUser = ({ collapsed, onLogout }) => {
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.fullName || 'Admin';

  return (
    <div className={cn('flex items-center gap-space-sm', collapsed && 'flex-col gap-space-xs')}>
      <span title={collapsed ? displayName : undefined} className="inline-flex">
        <Avatar src={user?.avatarUrl} alt={displayName} size="sm" />
      </span>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-label-lg text-on-surface truncate">{displayName}</p>
          <p className="text-label-sm text-text-muted truncate">{user?.email || 'Admin'}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onLogout}
        aria-label="Đăng xuất"
        title="Đăng xuất"
        className="p-2 rounded-md text-text-muted hover:bg-error-container hover:text-error transition-colors shrink-0"
      >
        <LogOut className="w-4 h-4 stroke-1.75" />
      </button>
    </div>
  );
};

export default AdminSidebarUser;
