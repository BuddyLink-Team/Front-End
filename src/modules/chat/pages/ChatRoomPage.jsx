import React from 'react';
import { Card } from '../../../components/cards/Card';
import { Avatar } from '../../../components/ui/Avatar';

export const ChatRoomPage = () => {
  return (
    <div className="h-[calc(100vh-10rem)] grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="h-full flex flex-col p-4">
        <h2 className="font-semibold text-text-primary mb-3">Tin nhắn</h2>
        <div className="space-y-2 overflow-y-auto">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-low hover:bg-surface cursor-pointer transition-colors">
            <Avatar size="sm" isOnline={true} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Mẹ Lan Anh</p>
              <p className="text-xs text-text-muted truncate">Hẹn gặp bạn Bo vào thứ 7 nhé!</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="hidden md:flex md:col-span-2 h-full flex-col justify-center items-center text-center p-8">
        <p className="text-text-muted text-sm">Chọn một đoạn hội thoại để bắt đầu trò chuyện</p>
      </Card>
    </div>
  );
};

export default ChatRoomPage;
