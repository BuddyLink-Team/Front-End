import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LoadingOverlay } from '../components/feedback/LoadingOverlay';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ParentRoutes } from './ParentRoutes';
import { AdminRoutes } from './AdminRoutes';
import { USER_ROLES, getRoleHomePath } from '../constants/role.constants';
import { MainLayout } from '../layouts/MainLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';
import LandingPage from '../modules/auth/pages/LandingPage';
import AuthScreen from '../modules/auth/pages/AuthScreen';
import ForgotPasswordScreen from '../modules/auth/pages/ForgotPasswordScreen';
import VerifyOtpScreen from '../modules/auth/pages/VerifyOtpScreen';
import OnboardingChildPage from '../modules/child/pages/OnboardingChildPage';

/**
 * Root route handler:
 * - Unauthenticated guest: Show LandingPage
 * - Authenticated user: Redirect to their role home page (/discovery or /admin/dashboard)
 */
const RootHandler = () => {
  const { isAuthenticated, user, parent } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === USER_ROLES.PARENT) {
    const isPhoneVerified = !!parent?.verification?.isPhoneVerified;
    const isEmailVerified = !!parent?.verification?.isEmailVerified;
    const isVerified = isPhoneVerified && (isEmailVerified || !!user?.googleId);

    if (!isVerified) {
      return <Navigate to="/verify-otp" replace />;
    }
  }

  return <Navigate to={getRoleHomePath(user?.role)} replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <LoadingOverlay show fullPage message="Đang tải giao diện..." />
      }
    >
      <Routes>
        {/* Root Route: Landing Page for guests, role-based redirect for logged in users */}
        <Route path="/" element={<RootHandler />} />

        {/* Public Routes (Wrapped in MainLayout for Header & Footer) */}
        <Route element={<PublicRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/register" element={<AuthScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route
              path="/reset-password"
              element={
                <PlaceholderPage
                  title="Đặt lại mật khẩu"
                  description="Cập nhật mật khẩu mới cho tài khoản."
                />
              }
            />
          </Route>
        </Route>

        {/* OTP Verification Route (Accessible by logged in parents as well) */}
        <Route>
          <Route path="/verify-otp" element={<VerifyOtpScreen />} />
          <Route path="/onboarding-child" element={<OnboardingChildPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Parent Role Routes */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.PARENT]} />}>
            <Route element={<MainLayout />}>
              {/* Discovery & Peer Matching */}
              <Route
                path="/discovery"
                element={
                  <PlaceholderPage
                    title="Khám phá bạn chơi"
                    description="Gợi ý bạn chơi phù hợp dựa trên độ tuổi, sở thích và vị trí lân cận."
                  />
                }
              />
              <Route
                path="/playdates"
                element={
                  <PlaceholderPage
                    title="Danh sách cuộc hẹn chơi"
                    description="Quản lý lịch hẹn Playdate sắp diễn ra, đã hoàn thành hoặc đã hủy."
                  />
                }
              />
              <Route
                path="/playdates/create"
                element={
                  <PlaceholderPage
                    title="Tạo cuộc hẹn chơi mới"
                    description="Lên lịch Playdate, chọn bé tham gia, hoạt động và địa điểm vui chơi."
                  />
                }
              />
              <Route
                path="/playdates/:id"
                element={
                  <PlaceholderPage
                    title="Chi tiết cuộc hẹn chơi"
                    description="Xem thông tin chi tiết cuộc hẹn, người tham gia, lịch hẹn và trao đổi nhóm."
                  />
                }
              />
              <Route
                path="/chat"
                element={
                  <PlaceholderPage
                    title="Tin nhắn trò chuyện"
                    description="Danh sách trò chuyện trực tiếp 1-1 với phụ huynh đã kết nối."
                  />
                }
              />
              <Route
                path="/chat/:conversationId"
                element={
                  <PlaceholderPage
                    title="Khung chat trực tiếp"
                    description="Trò chuyện thời gian thực và chia sẻ hình ảnh cùng phụ huynh."
                  />
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <PlaceholderPage
                    title="Trợ lý AI BuddyLink"
                    description="Gợi ý địa điểm vui chơi an toàn, trò chơi gắn kết và lập kế hoạch Playdate thông minh."
                  />
                }
              />
              <Route
                path="/children"
                element={
                  <PlaceholderPage
                    title="Hồ sơ các bé"
                    description="Quản lý thông tin, độ tuổi, nhóm tính cách và sở thích của con."
                  />
                }
              />
              <Route
                path="/children/create"
                element={
                  <PlaceholderPage
                    title="Thêm hồ sơ bé"
                    description="Tạo hồ sơ bé mới với sở thích, ảnh và đặc điểm phát triển."
                  />
                }
              />
              <Route
                path="/children/:id/edit"
                element={
                  <PlaceholderPage
                    title="Chỉnh sửa hồ sơ bé"
                    description="Cập nhật thông tin chi tiết và quyền riêng tư cho bé."
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <PlaceholderPage
                    title="Hồ sơ phụ huynh"
                    description="Xem và chỉnh sửa thông tin cá nhân, định vị khu vực và huy hiệu xác thực."
                  />
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <PlaceholderPage
                    title="Chỉnh sửa thông tin"
                    description="Cập nhật thông tin tài khoản phụ huynh."
                  />
                }
              />
              <Route
                path="/profile/verification"
                element={
                  <PlaceholderPage
                    title="Xác minh tài khoản"
                    description="Xác minh email và số điện thoại qua OTP để nhận huy hiệu Verified Badge."
                  />
                }
              />
              <Route
                path="/connections"
                element={
                  <PlaceholderPage
                    title="Danh sách bạn bè & kết nối"
                    description="Quản lý danh sách các gia đình đã kết nối và các yêu cầu kết nối đang chờ duyệt."
                  />
                }
              />
              <Route
                path="/notifications"
                element={
                  <PlaceholderPage
                    title="Thông báo hệ thống"
                    description="Xem thông báo lịch hẹn, tin nhắn mới và cập nhật điểm thưởng."
                  />
                }
              />
              <Route
                path="/gamification"
                element={
                  <PlaceholderPage
                    title="Huy hiệu & Chuỗi Streak"
                    description="Theo dõi chuỗi Playdate hàng tuần và bộ sưu tập huy hiệu đạt được."
                  />
                }
              />
              <Route
                path="/subscription"
                element={
                  <PlaceholderPage
                    title="Gói hội viên Premium"
                    description="Xem các gói quyền lợi thành viên và cổng thanh toán PayOS."
                  />
                }
              />
              <Route
                path="/safety"
                element={
                  <PlaceholderPage
                    title="Trung tâm an toàn & Bảo mật"
                    description="Quản lý danh sách chặn, quyền riêng tư hồ sơ và mẹo an toàn khi cho bé chơi."
                  />
                }
              />
            </Route>
          </Route>

          {/* Admin Role Routes */}
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
            <Route path="/admin" element={<MainLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <PlaceholderPage
                    title="Bảng điều khiển Admin"
                    description="Tổng quan phân tích số liệu hệ thống, thành viên và doanh thu."
                  />
                }
              />
              <Route
                path="users"
                element={
                  <PlaceholderPage
                    title="Quản lý phụ huynh"
                    description="Danh sách tài khoản phụ huynh, trạng thái xác thực và lịch sử hoạt động."
                  />
                }
              />
              <Route
                path="children"
                element={
                  <PlaceholderPage
                    title="Quản lý hồ sơ trẻ"
                    description="Danh sách hồ sơ trẻ em trên toàn hệ thống."
                  />
                }
              />
              <Route
                path="connections"
                element={
                  <PlaceholderPage
                    title="Quản lý kết nối"
                    description="Giám sát các mối liên kết giữa các gia đình và xử lý gỡ kết nối vi phạm."
                  />
                }
              />
              <Route
                path="playdates"
                element={
                  <PlaceholderPage
                    title="Quản lý cuộc hẹn chơi"
                    description="Theo dõi toàn bộ Playdate trên hệ thống và xử lý hủy khi có sự cố."
                  />
                }
              />
              <Route
                path="reports"
                element={
                  <PlaceholderPage
                    title="Kiểm duyệt báo cáo vi phạm"
                    description="Danh sách báo cáo tài khoản hoặc tin nhắn nghi vấn, xử lý khóa người dùng."
                  />
                }
              />
              <Route
                path="subscriptions"
                element={
                  <PlaceholderPage
                    title="Quản lý gói hội viên"
                    description="Cấu hình gói Premium, biểu phí, lịch sử giao dịch và phân tích chuyển đổi."
                  />
                }
              />
              <Route
                path="badges"
                element={
                  <PlaceholderPage
                    title="Quản lý huy hiệu & phần thưởng"
                    description="Cấu hình điều kiện mở khóa huy hiệu và điểm thưởng cộng đồng."
                  />
                }
              />
              <Route
                path="analytics"
                element={
                  <PlaceholderPage
                    title="Báo cáo thống kê chuyên sâu"
                    description="Thống kê tăng trưởng người dùng, tỷ lệ ghép đôi thành công và mật độ khu vực."
                  />
                }
              />
            </Route>
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
