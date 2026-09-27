import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Calendar,
  Compass,
  CheckCircle2,
  ArrowRight,
  Heart,
  Star,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/cards/Card';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-primary/20">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-xs">
              B
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-primary">
              Buddy<span className="text-primary">Link</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <a href="#features" className="hover:text-primary transition-colors">
              Tính năng
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              Cách hoạt động
            </a>
            <a href="#safety" className="hover:text-primary transition-colors">
              An toàn & Bảo mật
            </a>
            <a href="#testimonials" className="hover:text-primary transition-colors">
              Cộng đồng phụ huynh
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="rounded-full px-5">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf3ec] text-[#3d6841] text-xs font-semibold border border-[#d2e7d7]">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Nền tảng kết nối bạn chơi cho trẻ ứng dụng AI đầu tiên</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.15]">
                Tìm bạn chơi lành mạnh, <br className="hidden sm:inline" />
                <span className="text-primary">tổ chức Playdate an toàn</span> cho con.
              </h1>

              <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                BuddyLink kết nối các gia đình lân cận có trẻ cùng độ tuổi, tính cách và sở thích. Với sự đồng hành của trợ lý AI và cơ chế xác thực phụ huynh nghiêm ngặt, mỗi buổi hẹn chơi đều là kỷ niệm vui vẻ và an tâm.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-full px-8 shadow-md">
                    Tham gia miễn phí
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full px-7">
                    Tìm hiểu cách hoạt động
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-hairline flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Phụ huynh xác thực 100%
                </span>
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Sparkles className="w-4 h-4 text-tertiary-dark" /> Gợi ý thông minh với AI
                </span>
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Heart className="w-4 h-4 text-red-500" /> Cộng đồng ba mẹ văn minh
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

                {/* Match Mockup Card */}
                <Card className="relative bg-white border border-hairline shadow-[0_20px_50px_rgba(45,55,72,0.08)] rounded-3xl p-6 sm:p-7 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#ebf4ee] text-primary-dark font-bold text-xl flex items-center justify-center border-2 border-white shadow-xs">
                        B
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-text-primary">Bé Bo</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary-dark font-semibold">
                            5 tuổi
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          Cách bạn 1.2 km • Thảo Điền, Q.2
                        </p>
                      </div>
                    </div>
                    <VerifiedBadge size="sm" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-canvas border border-hairline text-xs text-text-muted leading-relaxed">
                    "Bé rất thích khám phá khoa học, lắp ráp Lego và vẽ tranh ngoài trời. Gia đình mong muốn tìm bạn cùng chơi cuối tuần!"
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-text-primary block">
                      Sở thích chung của bé:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <InterestTag label="Lego City" />
                      <InterestTag label="Vẽ màu nước" />
                      <InterestTag label="Công viên cây xanh" />
                      <InterestTag label="Đọc sách tranh" />
                    </div>
                  </div>

                  {/* AI Recommendation highlight */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2.5 text-xs text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Độ tương thích sở thích: <strong>96%</strong> (gợi ý bởi AI Assistant)
                    </span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Link to="/register" className="flex-1">
                      <Button className="w-full rounded-xl">Kết nối & Hẹn chơi</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section id="features" className="py-20 bg-white border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              Mọi thứ ba mẹ cần để trẻ có tuổi thơ ngập tràn tiếng cười
            </h2>
            <p className="text-sm sm:text-base text-text-muted">
              BuddyLink giải quyết hoàn toàn nỗi lo thiếu bạn đồng trang lứa và sự bối rối khi tìm kiếm sân chơi an toàn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="rounded-3xl p-8 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-dark flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Ghép đôi bạn chơi thông minh</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Hệ thống đề xuất bạn chơi dựa trên độ tuổi, tính cách và sở thích tương đồng gần khu vực sinh sống của gia đình.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="rounded-3xl p-8 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary-dark flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Trợ lý AI Playdate Assistant</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                AI tư vấn hoạt động kích thích tư duy, gợi ý công viên, quán café trẻ em an toàn và lên lịch hẹn chỉ trong vài thao tác.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="rounded-3xl p-8 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">An toàn & Bảo mật tối đa</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Xác thực danh tính phụ huynh hai lớp (Email & Số điện thoại OTP), chỉ phụ huynh được kết nối mới có thể trò chuyện.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              3 bước đơn giản để bắt đầu
            </h2>
            <p className="text-sm sm:text-base text-text-muted">
              Dễ dàng tạo buổi hẹn vui chơi bổ ích cho con ngay trong tuần này
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-7 border border-hairline text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <h3 className="font-bold text-lg text-text-primary">Tạo hồ sơ cho bé</h3>
              <p className="text-sm text-text-muted">
                Điền độ tuổi, tính cách và những sở thích bé yêu thích như xếp hình, vẽ tranh, đá bóng...
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-hairline text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <h3 className="font-bold text-lg text-text-primary">Khám phá & Kết nối</h3>
              <p className="text-sm text-text-muted">
                Tìm kiếm các gia đình phù hợp gần nhà, xem hồ sơ đã xác thực và gửi lời mời kết bạn.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-hairline text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <h3 className="font-bold text-lg text-text-primary">Lên lịch Playdate</h3>
              <p className="text-sm text-text-muted">
                Chọn ngày giờ, địa điểm an toàn được AI gợi ý và tận hưởng buổi gặp gỡ trọn vẹn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 bg-white border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-low rounded-3xl p-8 sm:p-12 border border-hairline grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Tiêu chuẩn an toàn
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Sự an tâm của ba mẹ luôn là ưu tiên số một
              </h2>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Tại BuddyLink, chúng tôi xây dựng một môi trường kết nối văn minh, minh bạch và an toàn tuyệt đối cho các con.
              </p>
              <ul className="space-y-3 text-sm text-text-primary">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Xác thực số điện thoại và email qua mã OTP bắt buộc.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Chỉ phụ huynh đã chấp nhận kết nối mới có quyền nhắn tin trao đổi.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>Cơ chế báo cáo và chặn tức thì đối với các hành vi không phù hợp.</span>
                </li>
              </ul>
            </div>

            <div className="text-center lg:text-right">
              <Link to="/register">
                <Button size="lg" className="rounded-full px-8 shadow-sm">
                  Đăng ký tài khoản phụ huynh
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="mt-auto bg-white border-t border-hairline py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Buddy<span className="text-primary">Link</span>
            </span>
          </div>

          <div className="text-xs text-text-muted text-center">
            &copy; {new Date().getFullYear()} BuddyLink Playmate Platform. Nền tảng tìm bạn chơi và lên lịch Playdate thông minh.
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
            <Link to="/login" className="hover:text-primary">
              Đăng nhập
            </Link>
            <Link to="/register" className="hover:text-primary">
              Đăng ký
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
