import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';

import { AdminConnectionManagementPage } from '../modules/admin/pages/AdminConnectionManagementPage';
import { AdminPlaydateManagementPage } from '../modules/admin/pages/AdminPlaydateManagementPage';

// Title on the admin type scale (semi-bold), matching the AdminHeader section label
const AdminPlaceholder = (props) => (
  <PlaceholderPage titleClassName="text-headline-md font-semibold text-on-surface" {...props} />
);

/**
 * Full route definitions for Admin features, in the same order as ADMIN_NAV_LINKS.
 */
export const AdminRoutes = () => (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />

    {/* Admin Dashboard */}
    <Route
      path="dashboard"
      element={<AdminPlaceholder title="Tổng quan hệ thống" description="Tổng quan phân tích số liệu hệ thống, thành viên và doanh thu." />}
    />

    {/* User & Children Management */}
    <Route
      path="users"
      element={<AdminPlaceholder title="Quản lý phụ huynh" description="Danh sách tài khoản phụ huynh, trạng thái xác thực và lịch sử hoạt động." />}
    />
    <Route
      path="children"
      element={<AdminPlaceholder title="Quản lý hồ sơ trẻ" description="Danh sách hồ sơ trẻ em trên toàn hệ thống." />}
    />

    {/* Connection & Playdate Management */}
    <Route path="connections" element={<AdminConnectionManagementPage />} />
    <Route path="playdates" element={<AdminPlaydateManagementPage />} />

    {/* Revenue: subscription plans, Premium payments and conversion (backend subscription module) */}
    <Route
      path="subscriptions"
      element={<AdminPlaceholder title="Quản lý doanh thu" description="Gói Premium, lịch sử thanh toán, doanh thu theo tháng và tỷ lệ chuyển đổi." />}
    />

    {/* Safety & Moderation */}
    <Route
      path="reports"
      element={<AdminPlaceholder title="Kiểm duyệt báo cáo vi phạm" description="Danh sách báo cáo tài khoản hoặc tin nhắn nghi vấn, xử lý khóa người dùng." />}
    />
  </Route>
);

export default AdminRoutes;
