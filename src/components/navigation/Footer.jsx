import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-hairline transition-colors">
      {/* Main Footer Directory */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={logoImg}
                alt="BuddyLink"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-text-muted max-w-sm leading-relaxed">
              Nền tảng tiên phong kết nối bạn chơi lành mạnh và tổ chức Playdate an toàn cho trẻ. Đồng hành cùng hàng ngàn phụ huynh kiến tạo tuổi thơ trọn vẹn và an tâm.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary-ink border border-primary-border">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                100% Phụ huynh xác thực
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-secondary-dark border border-surface-container-high">
                <Sparkles className="w-3.5 h-3.5 text-secondary-dark" />
                AI Assistant
              </span>
            </div>
          </div>

          {/* Column 1: Khám phá */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Tính năng nổi bật
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Cách hoạt động
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:text-primary transition-colors">
                  Tiêu chuẩn an toàn
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-primary transition-colors">
                  Cộng đồng ba mẹ
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Liên kết nhanh */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Nền tảng
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Đăng nhập phụ huynh
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Đăng ký tài khoản mới
                </Link>
              </li>
              <li>
                <Link to="/discovery" className="hover:text-primary transition-colors">
                  Tìm kiếm bạn chơi
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-primary transition-colors">
                  Trợ lý gợi ý Playdate
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ & Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Hỗ trợ 24/7
            </h4>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <span>support@buddylink.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <span>1900 6868 (Hotline)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span>Khu Công Nghệ Cao, TP. Thủ Đức, TP. HCM</span>
              </li>
              <li className="pt-2">
                <a
                  href="#safety-guidelines"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Quy tắc văn hóa ứng xử Playdate
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="mt-12 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} BuddyLink Playmate Platform. Phát triển với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>dành cho trẻ em Việt Nam.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </a>
            <a href="#privacy" className="hover:text-primary transition-colors">
              Chính sách bảo mật trẻ em
            </a>
            <a href="#safety-pledge" className="hover:text-primary transition-colors">
              Cam kết an toàn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
