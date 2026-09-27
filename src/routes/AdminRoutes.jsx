import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';

/**
 * Full route definitions for Admin features.
 */
export const AdminRoutes = () => (
  <Route path="/admin" element={<MainLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />

    {/* Admin Dashboard */}
    <Route
      path="dashboard"
      element={<PlaceholderPage title="Bảng điều khiển Admin" description="Tổng quan phân tích số liệu hệ thống, thành viên và doanh thu." />}
    />

    {/* User & Children Management */}
    <Route
      path="users"
      element={<PlaceholderPage title="Quản lý phụ huynh" description="Danh sách tài khoản phụ huynh, trạng thái xác thực và lịch sử hoạt động." />}
    />
    <Route
      path="children"
      element={<PlaceholderPage title="Quản lý hồ sơ trẻ" description="Danh sách hồ sơ trẻ em trên toàn hệ thống." />}
    />

    {/* Connection & Playdate Management */}
    <Route
      path="connections"
      element={<PlaceholderPage title="Quản lý kết nối" description="Giám sát các mối liên kết giữa các gia đình và xử lý gỡ kết nối vi phạm." />}
    />
    <Route
      path="playdates"
      element={<PlaceholderPage title="Quản lý cuộc hẹn chơi" description="Theo dõi toàn bộ Playdate trên hệ thống và xử lý hủy khi có sự cố." />}
    />

    {/* Safety & Moderation */}
    <Route
      path="reports"
      element={<PlaceholderPage title="Kiểm duyệt báo cáo vi phạm" description="Danh sách báo cáo tài khoản hoặc tin nhắn nghi vấn, xử lý khóa người dùng." />}
    />

    {/* Subscription Management */}
    <Route
      path="subscriptions"
      element={<PlaceholderPage title="Quản lý gói hội viên" description="Cấu hình gói Premium, biểu phí, lịch sử giao dịch và phân tích chuyển đổi." />}
    />

    {/* Badges & Rewards */}
    <Route
      path="badges"
      element={<PlaceholderPage title="Quản lý huy hiệu & phần thưởng" description="Cấu hình điều kiện mở khóa huy hiệu và điểm thưởng cộng đồng." />}
    />

    {/* Analytics */}
    <Route
      path="analytics"
      element={<PlaceholderPage title="Báo cáo thống kê chuyên sâu" description="Thống kê tăng trưởng người dùng, tỷ lệ ghép đôi thành công và mật độ khu vực." />}
    />
  </Route>
);

export default AdminRoutes;
