import React from 'react';
import { Card } from '../../../components/cards/Card';
import { StatusChip } from '../../../components/badges/StatusChip';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const PlaydateListPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Lịch hẹn chơi</h1>
        <p className="text-sm text-text-muted mt-1">Quản lý các buổi hẹn giao lưu và chơi cùng bé</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hoverable className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Buổi chơi Lego & Công viên</h3>
            <StatusChip status="confirmed" />
          </div>
          <div className="space-y-1.5 text-xs text-text-muted">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Thứ Bảy, 15:00 - 17:00
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Công viên Cầu Ánh Sao, Quận 7
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlaydateListPage;
