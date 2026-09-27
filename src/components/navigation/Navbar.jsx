import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { NAV_LINKS } from '../../constants/navigation.constants';

export const Navbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            B
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Buddy<span className="text-primary">Link</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f0f4f2] p-1 rounded-full border border-hairline">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <Link to="/profile" className="flex items-center gap-2">
            <Avatar size="sm" isOnline={true} alt="Parent User" />
          </Link>
        </div>
      </div>
    </header>
  );
};
