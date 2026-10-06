import React from 'react';
import { MessageSquare, Heart, Shield, Sparkles } from 'lucide-react';

export const EmptyChatState = () => {
  return (
    <section className="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-hairline flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
          <MessageSquare className="w-10 h-10" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-secondary-container text-secondary flex items-center justify-center shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center shadow-xs">
          <Heart className="w-4 h-4 text-tertiary" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-on-surface mb-1.5">
        Chọn cuộc trò chuyện để bắt đầu
      </h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">
        Kết nối với các phụ huynh lân cận, lên lịch hẹn chơi vui vẻ và xây dựng tình bạn ấm áp cho các bé.
      </p>

      <div className="flex items-center gap-2 text-xs text-outline bg-surface-container-low px-4 py-2 rounded-full border border-hairline/60">
        <Shield className="w-3.5 h-3.5 text-primary" />
        <span>Toàn bộ tin nhắn được bảo mật và mã hóa riêng tư gia đình</span>
      </div>
    </section>
  );
};

export default EmptyChatState;
