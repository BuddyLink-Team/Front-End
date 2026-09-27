import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Sidebar component for Admin Dashboard and Settings navigation.
 * Supports collapsed / expanded state, badges, and responsive views.
 */
export const Sidebar = ({
  links = [],
  collapsed = false,
  onToggle,
  header,
  footer,
  className,
}) => {
  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white border-r border-hairline transition-all duration-300 select-none z-30',
        collapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-hairline">
        {header ? (
          header
        ) : (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
              B
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight text-text-primary whitespace-nowrap">
                Buddy<span className="text-primary">Link</span>
              </span>
            )}
          </div>
        )}

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#f0f4f2] transition-colors shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href || item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-[#f0f4f2]',
                  collapsed && 'justify-center px-0'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              {Icon && <Icon className="w-5 h-5 shrink-0" />}
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area */}
      {footer && (
        <div className="p-3 border-t border-hairline overflow-hidden">
          {footer}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
