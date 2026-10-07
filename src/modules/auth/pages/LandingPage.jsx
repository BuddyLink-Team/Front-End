import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2,
  ArrowRight,
  Heart,
  Star,
  ChevronDown,
  Award,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/cards/Card';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { InterestTag } from '../../../components/badges/InterestTag';
import { Avatar } from '../../../components/ui/Avatar';
import { Navbar } from '../../../components/navigation/Navbar';
import { Footer } from '../../../components/navigation/Footer';
import authHeroImg from '../../../assets/images/auth-hero.png';

export const LandingPage = () => {
  // State for interactive FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  // Mock community parents & playdate testimonials (trung gian, súc tích)
  const testimonials = [
    {
      name: 'Chị Linh',
      role: 'Phụ huynh đã xác thực',
      content:
        'Nhờ BuddyLink, bé nhà mình có thêm bạn cùng sở thích gần nhà để chơi đùa mỗi dịp cuối tuần.',
      rating: 5,
    },
    {
      name: 'Anh Tuấn',
      role: 'Phụ huynh đã xác thực',
      content:
        'Gợi ý địa điểm chơi rất tiện lợi, giúp phụ huynh an tâm và tiết kiệm thời gian hẹn gặp.',
      rating: 5,
    },
    {
      name: 'Chị Thảo',
      role: 'Phụ huynh đã xác thực',
      content:
        'Quy trình xác thực an toàn, việc kết nối giữa các gia đình văn minh và thuận tiện.',
      rating: 5,
    },
  ];

  // FAQ items
  const faqs = [
    {
      question: 'BuddyLink đảm bảo an toàn cho con tôi như thế nào?',
      answer:
        'BuddyLink áp dụng quy trình xác thực phụ huynh qua OTP. Mọi thông tin nhạy cảm của bé được bảo mật, chỉ phụ huynh đã được chấp nhận kết nối mới có thể tương tác.',
    },
    {
      question: 'Trợ lý AI giúp ích gì cho các buổi Playdate?',
      answer:
        'Trợ lý AI gợi ý hoạt động vui chơi phù hợp lứa tuổi và đề xuất các địa điểm thân thiện, an toàn cho trẻ em gần khu vực bạn sống.',
    },
    {
      question: 'Việc tham gia nền tảng có mất phí không?',
      answer:
        'BuddyLink hoàn toàn miễn phí cho các tính năng cốt lõi: tạo hồ sơ bé, tìm bạn chơi lân cận và kết nối hẹn chơi.',
    },
    {
      question: 'Tôi có thể quản lý nhiều hồ sơ bé cùng một tài khoản không?',
      answer:
        'Có. Một tài khoản phụ huynh có thể tạo và quản lý hồ sơ riêng biệt cho từng bé.',
    },
  ];

  // Sample playmates preview (thông tin trung gian vừa phải, bảo mật và gọn gàng)
  const samplePlaymates = [
    {
      name: 'Bé Bo',
      age: '5 tuổi',
      avatarBg: 'bg-primary/10 text-primary-dark',
      avatarLetter: 'B',
      desc: 'Thích lắp ghép xếp hình, vẽ tranh và hoạt động ngoài trời.',
      interests: ['Lắp ghép', 'Vẽ tranh', 'Vận động'],
    },
    {
      name: 'Bé Miu',
      age: '4 tuổi',
      avatarBg: 'bg-surface-container text-secondary-dark',
      avatarLetter: 'M',
      desc: 'Thích đất nặn tạo hình, âm nhạc và dạo chơi công viên.',
      interests: ['Sáng tạo', 'Âm nhạc', 'Dã ngoại'],
    },
    {
      name: 'Bé Tom',
      age: '6 tuổi',
      avatarBg: 'bg-tertiary/15 text-tertiary-dark',
      avatarLetter: 'T',
      desc: 'Năng động, thích cờ vua, đạp xe và khám phá trò chơi mới.',
      interests: ['Cờ vua', 'Đạp xe', 'Khám phá'],
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-primary/20">
      {/* Universal Top Header */}
      <Navbar />

      <main className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[650px] bg-gradient-to-b from-primary/15/40 via-surface-container-low/20 to-transparent pointer-events-none -z-10" />

          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Heading & Value Proposition */}
              <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                {/* AI Badge pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary-dark text-xs font-semibold border border-primary/25 shadow-xs">
                  <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
                  <span>
                    Nền tảng kết nối bạn chơi cho trẻ ứng dụng AI đầu tiên
                  </span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.15]">
                  Tìm bạn chơi lành mạnh, <br className="hidden sm:inline" />
                  <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                    tổ chức Playdate an toàn
                  </span>{' '}
                  cho con.
                </h1>

                {/* Subheading */}
                <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  BuddyLink kết nối các gia đình lân cận có trẻ cùng độ tuổi,
                  tính cách và sở thích. Với sự đồng hành của trợ lý AI và cơ
                  chế xác thực phụ huynh nghiêm ngặt, mỗi buổi hẹn chơi đều là
                  kỷ niệm vui vẻ và an tâm.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                      className="w-full sm:w-auto rounded-full px-8 py-3.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 text-base inline-flex items-center justify-center"
                    >
                      Bắt đầu kết nối miễn phí
                    </Button>
                  </Link>

                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto rounded-full px-8 py-3.5 text-base border border-primary/20"
                    >
                      Tìm hiểu cách hoạt động
                    </Button>
                  </a>
                </div>

                {/* Trust Signals */}
                <div className="pt-6 border-t border-hairline flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs text-text-muted">
                  <span className="flex items-center gap-2 font-medium text-text-primary">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    Phụ huynh xác thực 100%
                  </span>
                  <span className="flex items-center gap-2 font-medium text-text-primary">
                    <Sparkles className="w-4 h-4 text-tertiary-dark shrink-0" />
                    Gợi ý thông minh với AI
                  </span>
                  <span className="flex items-center gap-2 font-medium text-text-primary">
                    <Heart className="w-4 h-4 text-error shrink-0" />
                    Cộng đồng ba mẹ văn minh
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive Match Preview Card */}
              <div className="lg:col-span-4 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Glow Elements */}
                  <div className="absolute -top-12 -right-12 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Main Preview Card */}
                  <Card className="relative bg-white border border-hairline shadow-[0_20px_50px_rgba(45,55,72,0.08)] rounded-3xl p-6 space-y-5">
                    {/* Header with Child Avatar and Verified Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary-dark font-bold text-2xl flex items-center justify-center border-2 border-white shadow-xs">
                          B
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-text-primary">
                              Bé Bo
                            </h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-secondary-dark font-semibold">
                              5 tuổi
                            </span>
                          </div>
                        </div>
                      </div>

                      <VerifiedBadge size="sm" />
                    </div>

                    {/* Bio Statement */}
                    <div className="p-3.5 rounded-2xl bg-canvas border border-hairline text-xs sm:text-sm text-text-muted leading-relaxed">
                      &ldquo;Thích lắp ghép Lego, vẽ tranh màu nước và vui chơi công
                      viên cuối tuần.&rdquo;
                    </div>

                    {/* Interest Tags */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-text-primary block">
                        Sở thích phù hợp:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <InterestTag label="Lego" />
                        <InterestTag label="Vẽ tranh" />
                        <InterestTag label="Vận động" />
                      </div>
                    </div>

                    {/* Personality Traits */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-text-primary block">
                        Tính cách:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <InterestTag
                          label="Sáng tạo"
                          className="bg-tertiary/15 text-tertiary-dark border-tertiary/40"
                        />
                        <InterestTag
                          label="Hòa đồng"
                          className="bg-tertiary/15 text-tertiary-dark border-tertiary/40"
                        />
                        <InterestTag
                          label="Tò mò"
                          className="bg-tertiary/15 text-tertiary-dark border-tertiary/40"
                        />
                      </div>
                    </div>
                    {/* Action Call to Action */}
                    <div className="pt-2">
                      <Link to="/register" className="block">
                        <Button className="w-full rounded-2xl py-3 shadow-sm text-sm font-semibold">
                          Kết nối & Hẹn chơi ngay
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== HERO PHOTO BANNER ===================== */}
        <section className="py-6">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-hairline bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 space-y-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-tertiary/15 text-tertiary-dark">
                    <Award className="w-3.5 h-3.5" />
                    Không gian gắn kết gia đình
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
                    Nuôi dưỡng tuổi thơ diệu kỳ qua những tình bạn đầu đời
                  </h2>
                  <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                    Trẻ nhỏ học hỏi kỹ năng xã hội, sẻ chia và cảm xúc tốt nhất
                    khi được vui chơi cùng bạn bè đồng trang lứa. BuddyLink ra
                    đời để đồng hành cùng các bậc cha mẹ trong hành trình tìm
                    kiếm những người bạn tuổi thơ chân thành nhất.
                  </p>
                  <div className="pt-3">
                    <Link to="/register">
                      <Button
                        variant="outline"
                        rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                        className="rounded-full px-6 inline-flex items-center"
                      >
                        Khám phá hồ sơ bạn chơi lân cận
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative overflow-hidden">
                  <img
                    src={authHeroImg}
                    alt="Gia đình hạnh phúc cùng BuddyLink"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== VALUE PILLARS / FEATURES ===================== */}
        <section
          id="features"
          className="py-20 bg-white border-y border-hairline"
        >
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Tính năng ưu việt
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Mọi công cụ ba mẹ cần để con có tuổi thơ trọn vẹn
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                BuddyLink giải quyết triệt để nỗi lo thiếu bạn đồng trang lứa và
                sự bối rối khi lên kế hoạch vui chơi an toàn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="rounded-3xl p-8 space-y-5 hover:shadow-elevated transition-all border border-hairline">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary-dark flex items-center justify-center">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Ghép đôi bạn chơi thông minh
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Thuật toán đối sánh độ tuổi, tính cách và sở thích giúp các bé
                  nhanh chóng tìm được người bạn đồng điệu ở gần khu vực gia
                  đình sinh sống.
                </p>
                <div className="pt-2 text-xs font-semibold text-primary inline-flex items-center gap-1.5">
                  <span>Khoảng cách định vị chính xác</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 inline-block" />
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="rounded-3xl p-8 space-y-5 hover:shadow-elevated transition-all border border-hairline">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-secondary-dark flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Trợ lý AI Playdate Assistant
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Gợi ý hoạt động kích thích tư duy sáng tạo, đề xuất địa điểm
                  công viên, quán café trẻ em thân thiện và tự động tạo lịch hẹn
                  chỉ trong vài giây.
                </p>
                <div className="pt-2 text-xs font-semibold text-secondary-dark inline-flex items-center gap-1.5">
                  <span>Cá nhân hóa theo độ tuổi bé</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 inline-block" />
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="rounded-3xl p-8 space-y-5 hover:shadow-elevated transition-all border border-hairline">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/20 text-tertiary-dark flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  An toàn & Bảo mật tuyệt đối
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Cơ chế định danh phụ huynh qua OTP, quy tắc chat bảo mật hai
                  chiều và nút báo cáo hành vi vi phạm bảo vệ không gian trong
                  sạch cho trẻ thơ.
                </p>
                <div className="pt-2 text-xs font-semibold text-tertiary-dark inline-flex items-center gap-1.5">
                  <span>100% Phụ huynh có trách nhiệm</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 inline-block" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ===================== SAMPLE PLAYMATES PREVIEW ===================== */}
        <section className="py-20 bg-canvas">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                  Gặp gỡ bạn mới
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                  Các bé lân cận đang tìm bạn chơi
                </h2>
                <p className="text-sm text-text-muted max-w-xl">
                  Hàng ngàn gia đình đã kết nối thành công qua BuddyLink. Dưới
                  đây là những người bạn đáng yêu đang chờ con làm quen!
                </p>
              </div>

              <Link to="/register">
                <Button
                  variant="outline"
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  className="rounded-full px-6 inline-flex items-center"
                >
                  Xem tất cả bạn chơi
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {samplePlaymates.map((kid, idx) => (
                <Card
                  key={idx}
                  className="rounded-3xl p-6 sm:p-7 space-y-5 hover:shadow-elevated transition-all border border-hairline bg-white flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-14 h-14 rounded-2xl ${kid.avatarBg} font-bold text-xl flex items-center justify-center border-2 border-white shadow-xs`}
                        >
                          {kid.avatarLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-text-primary">
                              {kid.name}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary-dark font-semibold">
                              {kid.age}
                            </span>
                          </div>
                        </div>
                      </div>

                      <VerifiedBadge size="sm" />
                    </div>

                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                      &ldquo;{kid.desc}&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {kid.interests.map((interest, iIdx) => (
                        <InterestTag key={iIdx} label={interest} />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-hairline flex items-center justify-between">
                    <Link to="/register">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full px-4"
                      >
                        Kết nối
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section
          id="how-it-works"
          className="py-20 bg-white border-y border-hairline"
        >
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Quy trình tinh gọn
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                3 bước đơn giản để tạo buổi hẹn chơi hoàn hảo
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Dễ dàng kết nối và tổ chức Playdate cho con chỉ trong ít phút
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-canvas rounded-3xl p-8 border border-hairline text-center space-y-4 hover:bg-white hover:shadow-elevated transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-xl text-text-primary">
                  Tạo hồ sơ cho con
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Cập nhật nhóm tuổi, tính cách (hướng nội, năng động) cùng
                  những sở thích bé yêu như xếp hình, vẽ tranh, đá bóng...
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-canvas rounded-3xl p-8 border border-hairline text-center space-y-4 hover:bg-white hover:shadow-elevated transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-xl text-text-primary">
                  Khám phá & Ghép đôi
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Xem danh sách bạn chơi gần nhà đã xác thực, trao đổi tin nhắn
                  an toàn với phụ huynh và lên ý tưởng gặp gỡ.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-canvas rounded-3xl p-8 border border-hairline text-center space-y-4 hover:bg-white hover:shadow-elevated transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white font-bold flex items-center justify-center mx-auto text-lg shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-xl text-text-primary">
                  Tận hưởng Playdate
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Chọn thời gian, địa điểm lý tưởng được AI kiểm duyệt và tận
                  hưởng buổi gặp gỡ tràn ngập niềm vui của các con.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SAFETY & SECURITY ===================== */}
        <section id="safety" className="py-20 bg-canvas">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-hairline shadow-soft grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-error-container/50 text-error text-xs font-semibold border border-error-container">
                  <ShieldCheck className="w-4 h-4 text-error" />
                  <span>Cam kết an toàn tuyệt đối</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                  Sự an tâm của cha mẹ luôn là nguyên tắc bất biến tại BuddyLink
                </h2>

                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  Chúng tôi hiểu rằng con cái là tài sản quý giá nhất. Vì vậy,
                  mọi tính năng trên nền tảng đều được xây dựng với hàng rào bảo
                  vệ vững chắc:
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-semibold text-text-primary block">
                        Xác thực số điện thoại & Email qua mã OTP bắt buộc
                      </strong>
                      <span className="text-xs text-text-muted">
                        Loại bỏ hoàn toàn các tài khoản ảo và đảm bảo danh tính
                        phụ huynh thật.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-semibold text-text-primary block">
                        Cơ chế kết nối hai chiều (Double Opt-in)
                      </strong>
                      <span className="text-xs text-text-muted">
                        Chỉ khi cả hai bên phụ huynh đồng ý kết bạn, thông tin
                        liên lạc và chức năng nhắn tin mới được mở.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-semibold text-text-primary block">
                        Hệ thống kiểm duyệt & Báo cáo vi phạm tức thì
                      </strong>
                      <span className="text-xs text-text-muted">
                        Hỗ trợ chặn tài khoản, gắn cờ báo cáo vi phạm 24/7 để
                        bảo vệ cộng đồng ba mẹ văn minh.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-canvas rounded-2xl p-6 sm:p-8 border border-hairline text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Tham gia cộng đồng phụ huynh an toàn
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Bảo vệ sự trong sáng của tuổi thơ, mở ra cơ hội kết bạn lành
                  mạnh cho con ngay hôm nay.
                </p>
                <Link to="/register" className="block pt-2">
                  <Button className="w-full rounded-full py-3">
                    Đăng ký tài khoản phụ huynh
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== TESTIMONIALS ===================== */}
        <section
          id="testimonials"
          className="py-20 bg-white border-y border-hairline"
        >
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Cộng đồng phụ huynh
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Hàng ngàn gia đình tin tưởng BuddyLink
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Lắng nghe những chia sẻ chân thành từ các bậc cha mẹ đã tìm thấy
                bạn thân cho con
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((item, idx) => (
                <Card
                  key={idx}
                  className="rounded-3xl p-8 space-y-5 border border-hairline bg-canvas/40 hover:bg-white hover:shadow-elevated transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-tertiary">
                      {[...Array(item.rating)].map((_, rIdx) => (
                        <Star key={rIdx} className="w-4 h-4 fill-tertiary" />
                      ))}
                    </div>

                    <p className="text-sm text-text-muted leading-relaxed italic">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-hairline flex items-center gap-3">
                    <Avatar src={item.avatar} alt={item.name} size="sm" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-text-muted">{item.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FAQ SECTION ===================== */}
        <section id="faq" className="py-20 bg-canvas">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                Giải đáp thắc mắc
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Câu hỏi thường gặp
              </h2>
              <p className="text-sm sm:text-base text-text-muted">
                Tất cả thông tin bạn cần biết về nền tảng BuddyLink
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-hairline overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-text-primary hover:text-primary transition-colors"
                    >
                      <span className="text-base">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-sm text-text-muted leading-relaxed border-t border-hairline/60">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== BOTTOM CTA BANNER ===================== */}
        <section className="py-20 bg-gradient-to-b from-white to-primary/15/40 border-t border-hairline">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center space-y-8">
            <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto shadow-md shadow-primary/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight">
              Sẵn sàng mang đến cho con <br />
              những buổi hẹn chơi đáng nhớ?
            </h2>

            <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
              Gia nhập BuddyLink ngay hôm nay để kết nối với những gia đình văn
              minh cùng khu vực và cùng con kiến tạo tuổi thơ tươi đẹp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
                  className="w-full sm:w-auto rounded-full px-9 py-3.5 shadow-md shadow-primary/20 text-base inline-flex items-center justify-center"
                >
                  Đăng ký tài khoản miễn phí
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-3.5 text-base"
                >
                  Đã có tài khoản? Đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
