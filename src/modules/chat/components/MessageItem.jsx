import React from 'react';
import dayjs from 'dayjs';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { cn } from '../../../utils/cn';
import { MESSAGE_STATUS } from '../constants/chatConstants.js';

export const MessageItem = ({
  message,
  partnerAvatar,
  partnerName,
  currentParentId,
  onImageClick,
  onRetry,
}) => {
  const senderId =
    message.senderId?._id ||
    message.senderId?.id ||
    message.senderId ||
    message.sender?.id ||
    message.sender?._id;

  const isMine =
    currentParentId && senderId
      ? String(senderId) === String(currentParentId)
      : Boolean(message.isMine);
  const timeFormatted = dayjs(message.createdAt).format('HH:mm');
  const isSending = message.status === MESSAGE_STATUS.SENDING;
  const isFailed = message.status === MESSAGE_STATUS.FAILED;

  return (
    <div
      className={cn(
        // w-fit + auto margin: the message list is a block container, so self-* alone has no effect
        'flex w-fit items-end gap-2.5 max-w-[85%] sm:max-w-[75%]',
        isMine ? 'ml-auto self-end justify-end' : 'mr-auto self-start justify-start'
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
              : 'chat-bubble-partner',
            isSending && 'opacity-70',
            isFailed && 'ring-1 ring-error/40'
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
              {isSending ? (
                <span className="flex items-center gap-0.5 text-outline">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Đang gửi</span>
                </span>
              ) : isFailed ? (
                <span className="flex items-center gap-1 text-error font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Gửi lỗi</span>
                  {onRetry && (
                    <button
                      type="button"
                      onClick={() => onRetry(message.tempId)}
                      className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:opacity-80"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Gửi lại
                    </button>
                  )}
                </span>
              ) : message.isRead ? (
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
