import React from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const DiscoveryActionButtons = ({ onPass, onLike }) => {
  return (
    <div className="flex gap-3 pt-1">
      <Button
        variant="ghost"
        size="lg"
        onClick={onPass}
        leftIcon={<X size={18} strokeWidth={1.75} />}
        className="flex-1 border border-hairline"
      >
        Bỏ qua
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={onLike}
        leftIcon={<Send size={18} strokeWidth={1.75} />}
        className="flex-1"
      >
        Gửi kết nối
      </Button>
    </div>
  );
};
