import React from 'react';
import { Card } from '../../../components/cards/Card';

export const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Bảng điều khiển Quản trị viên
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Tổng quan số liệu người dùng, hoạt động Playdate và hệ thống kiểm duyệt BuddyLink
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-xs font-semibold text-text-muted uppercase">Tổng phụ huynh</p>
          <p className="text-2xl font-bold text-text-primary mt-1">1,248</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold text-text-muted uppercase">Playdate đã tổ chức</p>
          <p className="text-2xl font-bold text-primary mt-1">3,450</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold text-text-muted uppercase">Báo cáo cần xử lý</p>
          <p className="text-2xl font-bold text-red-500 mt-1">4</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
