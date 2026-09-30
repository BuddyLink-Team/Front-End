import React from 'react';
import dayjs from 'dayjs';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { cn } from '../../../utils/cn';

export const MessageItem = ({
  message,
  partnerAvatar,
  partnerName,
  onImageClick,
}) => {
  const isMine = message.isMine;
  const timeFormatted = dayjs(message.createdAt).format('HH:mm');

  return (
    <div
      className={cn(
        'flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%]',
        isMine ? 'self-end justify-end' : 'self-start justify-start'
      )}
    >
      {/* Partner Avatar for incoming messages */}
      {!isMine && (
        <Avatar
          src={message.sender?.avatarUrl || partnerAvatar}
          alt={message.sender?.fullName || partnerName || 'Đối tác'}
          size="sm"
          className="shrink-0 mb-1"
          fallbackText={(message.sender?.fullName || partnerName || 'Đ').slice(0, 1)}
        />
      )}

      {/* Message Bubble & Meta */}
      <div className={cn('flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed break-words',
            isMine
              ? 'chat-bubble-user'
              : 'chat-bubble-partner'
          )}
        >
          {/* Media Image Attachment if present */}
          {message.mediaUrl && (
            <div className="mb-2 overflow-hidden rounded-xl cursor-pointer group">
              <img
                src={message.mediaUrl}
                alt="Hình ảnh đính kèm"
                onClick={() => onImageClick && onImageClick(message.mediaUrl)}
                className="max-h-60 w-auto object-cover rounded-xl transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          )}

          {/* Text Content (if not just default placeholder for image) */}
          {message.content && message.content !== '[Hình ảnh]' && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Timestamp & Read Status */}
        <div className="flex items-center gap-1 text-[11px] text-outline px-1">
          <span>{timeFormatted}</span>
          {isMine && (
            <>
              <span>•</span>
              {message.isRead ? (
                <span className="flex items-center gap-0.5 text-primary font-medium">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã xem</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-outline">
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã gửi</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
