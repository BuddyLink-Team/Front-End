import React from 'react';
import { Card } from '../../../components/cards/Card';
import { Sparkles, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const AIAssistantPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">BuddyLink AI Assistant</h1>
        <p className="text-sm text-text-muted">
          Gợi ý địa điểm vui chơi an toàn, hoạt động phát triển kỹ năng phù hợp lứa tuổi cho bé.
        </p>
      </div>

      <Card className="min-h-[350px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="bg-surface-low p-4 rounded-2xl text-sm text-text-primary leading-relaxed">
            Xin chào ba mẹ! Hôm nay ba mẹ muốn tìm địa điểm vui chơi cuối tuần, trò chơi giáo dục hay hoạt động gắn kết cho bé?
          </div>
        </div>

        <div className="pt-4 border-t border-hairline flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              aria-label="Câu hỏi cho trợ lý AI"
              placeholder="Hỏi AI bất kỳ điều gì về hoạt động vui chơi của bé..."
            />
          </div>
          <Button rightIcon={<Send className="w-4 h-4" />}>Gửi</Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantPage;
