import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Bell,
  Menu,
  X,
  ArrowRight,
  User,
  Settings,
  Baby,
  Crown,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { logout } from '../../modules/auth/redux/authSlice';
import { clearParentState } from '../../modules/parent/redux/parentSlice';
import socketService from '../../services/socket';
import { NAV_LINKS } from '../../constants/navigation.constants';
import logoImg from '../../assets/images/logo.png';

/**
 * @param {Object} props
 * @param {Function} [props.onLogout] - Logout handler provided by the layout (revokes the session
 *   on the server). Falls back to clearing the local session only when not provided.
 */
export const Navbar = ({ onLogout } = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    socketService.disconnect();
    dispatch(logout());
    dispatch(clearParentState());
    navigate('/');
  };

  // Landing page anchors only apply on root path '/'
  const isLandingPage = location.pathname === '/';

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const displayName = parent?.fullName || user?.fullName || 'Phụ huynh BuddyLink';
  const avatarUrl = parent?.avatarUrl || user?.avatarUrl || '';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-hairline transition-all">
      {/* md+: 3-column grid with equal side columns so the center nav sits at the true center */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5 group md:col-start-1 md:justify-self-start"
        >
          <img
            src={logoImg}
            alt="BuddyLink Logo"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center Navigation Links - Conditional based on Auth & Route */}
        {isAuthenticated ? (
          <nav className="hidden md:flex md:col-start-2 items-center gap-1.5 bg-surface-muted p-1.5 rounded-full border border-hairline">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        ) : isLandingPage ? (
          <nav className="hidden md:flex md:col-start-2 items-center gap-8 text-sm font-medium text-text-muted">
            <a
              href="#features"
              className="hover:text-primary transition-colors py-1"
            >
              Tính năng
            </a>
            <a
              href="#how-it-works"
              className="hover:text-primary transition-colors py-1"
            >
              Cách hoạt động
            </a>
            <a
              href="#safety"
              className="hover:text-primary transition-colors py-1"
            >
              An toàn & Bảo mật
            </a>
            <a
              href="#testimonials"
              className="hover:text-primary transition-colors py-1"
            >
              Cộng đồng phụ huynh
            </a>
            <a
              href="#faq"
              className="hover:text-primary transition-colors py-1"
            >
              Hỏi đáp
            </a>
          </nav>
        ) : null}

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 md:col-start-3 md:justify-self-end">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="relative p-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <Dropdown
                align="right"
                trigger={
                  <div className="flex items-center gap-2 group cursor-pointer rounded-full outline-none focus:outline-none">
                    <Avatar
                      src={avatarUrl}
                      size="md"
                      isOnline={true}
                      alt={displayName}
                      className="transition-transform group-hover:scale-105"
                    />
                  </div>
                }
              >
                {/* User info overview header */}
                <div className="px-3.5 py-3 border-b border-hairline bg-surface-container-lowest/50 rounded-t-xl">
                  <p className="text-xs font-bold text-on-surface truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {user?.email || user?.phone || ''}
                  </p>
                </div>

                <div className="py-1">
                  <DropdownItem as={Link} to="/profile" icon={User}>
                    Hồ sơ cá nhân
                  </DropdownItem>
                  <DropdownItem as={Link} to="/children" icon={Baby}>
                    Quản lý hồ sơ bé
                  </DropdownItem>
                  <DropdownItem as={Link} to="/subscription" icon={Crown}>
                    Gói hội viên & Hạn mức
                  </DropdownItem>
                  <DropdownItem as={Link} to="/settings" icon={Settings}>
                    Cài đặt tài khoản
                  </DropdownItem>
                </div>

                <DropdownDivider />

                <div className="py-1">
                  <DropdownItem onClick={handleLogout} icon={LogOut} danger>
                    Đăng xuất
                  </DropdownItem>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-text-primary"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-5 shadow-xs"
                >
                  Bắt đầu ngay
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-hairline px-6 py-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <nav className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-primary hover:bg-canvas'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-3 mt-2 border-t border-hairline flex flex-col gap-1">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-canvas"
                >
                  <User className="w-4 h-4 text-text-muted" />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link
                  to="/children"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-canvas"
                >
                  <Baby className="w-4 h-4 text-text-muted" />
                  <span>Quản lý hồ sơ bé</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-canvas"
                >
                  <Settings className="w-4 h-4 text-text-muted" />
                  <span>Cài đặt tài khoản</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-error hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </nav>
          ) : (
            <>
              {isLandingPage && (
                <nav className="flex flex-col space-y-3 text-sm font-medium text-text-primary">
                  <a
                    href="#features"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
                  >
                    Tính năng
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
                  >
                    Cách hoạt động
                  </a>
                  <a
                    href="#safety"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
                  >
                    An toàn & Bảo mật
                  </a>
                  <a
                    href="#testimonials"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
                  >
                    Cộng đồng phụ huynh
                  </a>
                  <a
                    href="#faq"
                    onClick={closeMobileMenu}
                    className="px-3 py-2 rounded-lg hover:bg-canvas transition-colors"
                  >
                    Câu hỏi thường gặp
                  </a>
                </nav>
              )}

              <div className="pt-4 border-t border-hairline flex flex-col gap-3">
                <Link to="/login" onClick={closeMobileMenu} className="w-full">
                  <Button variant="outline" className="w-full rounded-xl">
                    Đăng nhập
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                    className="w-full rounded-xl inline-flex items-center justify-center"
                  >
                    Bắt đầu ngay
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
