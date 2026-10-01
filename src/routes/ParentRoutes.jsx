import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';
import ParentProfilePage from '../modules/parent/pages/ParentProfilePage';

import ChildrenManagementPage from '../modules/child/pages/ChildrenManagementPage';
import ChildFormPage from '../modules/child/pages/ChildFormPage';

/**
 * Full route definitions for Parent features.
 */
export const ParentRoutes = () => (
  <Route element={<MainLayout />}>
    {/* Discovery & Peer Matching */}
    <Route
      path="/discovery"
      element={<PlaceholderPage title="Khám phá bạn chơi" description="Gợi ý bạn chơi phù hợp dựa trên độ tuổi, sở thích và vị trí lân cận." />}
    />

    {/* Playdate Management */}
    <Route
      path="/playdates"
      element={<PlaceholderPage title="Danh sách cuộc hẹn chơi" description="Quản lý lịch hẹn Playdate sắp diễn ra, đã hoàn thành hoặc đã hủy." />}
    />
    <Route
      path="/playdates/create"
      element={<PlaceholderPage title="Tạo cuộc hẹn chơi mới" description="Lên lịch Playdate, chọn bé tham gia, hoạt động và địa điểm vui chơi." />}
    />
    <Route
      path="/playdates/:id"
      element={<PlaceholderPage title="Chi tiết cuộc hẹn chơi" description="Xem thông tin chi tiết cuộc hẹn, người tham gia, lịch hẹn và trao đổi nhóm." />}
    />

    {/* Communication */}
    <Route
      path="/chat"
      element={<PlaceholderPage title="Tin nhắn trò chuyện" description="Danh sách trò chuyện trực tiếp 1-1 với phụ huynh đã kết nối." />}
    />
    <Route
      path="/chat/:conversationId"
      element={<PlaceholderPage title="Khung chat trực tiếp" description="Trò chuyện thời gian thực và chia sẻ hình ảnh cùng phụ huynh." />}
    />

    {/* AI Assistant */}
    <Route
      path="/ai-assistant"
      element={<PlaceholderPage title="Trợ lý AI BuddyLink" description="Gợi ý địa điểm vui chơi an toàn, trò chơi gắn kết và lập kế hoạch Playdate thông minh." />}
    />

    {/* Child Profiles */}
    <Route
      path="/children"
      element={<ChildrenManagementPage />}
    />
    <Route
      path="/children/create"
      element={<ChildFormPage />}
    />
    <Route
      path="/children/:id/edit"
      element={<ChildFormPage />}
    />

    {/* Parent Account & Profile */}
    <Route path="/profile" element={<ParentProfilePage />} />
    <Route
      path="/profile/edit"
      element={<Navigate to="/profile" replace />}
    />
    <Route
      path="/profile/verification"
      element={<PlaceholderPage title="Xác minh tài khoản" description="Xác minh email và số điện thoại qua OTP để nhận huy hiệu Verified Badge." />}
    />

    {/* Connections */}
    <Route
      path="/connections"
      element={<PlaceholderPage title="Danh sách bạn bè & kết nối" description="Quản lý danh sách các gia đình đã kết nối và các yêu cầu kết nối đang chờ duyệt." />}
    />

    {/* Notifications */}
    <Route
      path="/notifications"
      element={<PlaceholderPage title="Thông báo hệ thống" description="Xem thông báo lịch hẹn, tin nhắn mới và cập nhật điểm thưởng." />}
    />

    {/* Gamification */}
    <Route
      path="/gamification"
      element={<PlaceholderPage title="Huy hiệu & Chuỗi Streak" description="Theo dõi chuỗi Playdate hàng tuần và bộ sưu tập huy hiệu đạt được." />}
    />

    {/* Premium Subscription */}
    <Route
      path="/subscription"
      element={<PlaceholderPage title="Gói hội viên Premium" description="Xem các gói quyền lợi thành viên và cổng thanh toán PayOS." />}
    />

    {/* Safety & Settings */}
    <Route
      path="/safety"
      element={<PlaceholderPage title="Trung tâm an toàn & Bảo mật" description="Quản lý danh sách chặn, quyền riêng tư hồ sơ và mẹo an toàn khi cho bé chơi." />}
    />
  </Route>
);

export default ParentRoutes;
