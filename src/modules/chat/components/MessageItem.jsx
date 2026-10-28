import React from 'react';
import dayjs from 'dayjs';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw, Flag } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { ChatBubble } from '../../../components/chat/ChatBubble';
import { MESSAGE_STATUS } from '../constants/chat.constants.js';

export const MessageItem = ({
  message,
  partnerAvatar,
  partnerName,
  currentParentId,
  onImageClick,
  onRetry,
  onReportMessage,
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
    <ChatBubble
      isOutgoing={isMine}
      isPending={isSending}
      hasError={isFailed}
      avatar={
        <Avatar
          src={message.sender?.avatarUrl || partnerAvatar}
          alt={message.sender?.fullName || partnerName || 'Đối tác'}
          size="sm"
        />
      }
      meta={
        <>
          <span>{timeFormatted}</span>
          {isMine ? (
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
          ) : (
            onReportMessage && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onReportMessage(message)}
                  title="Báo cáo tin nhắn này"
                  className="inline-flex items-center gap-0.5 text-outline hover:text-error transition-colors"
                >
                  <Flag className="w-3 h-3" />
                  <span>Báo cáo</span>
                </button>
              </>
            )
          )}
        </>
      }
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
    </ChatBubble>
  );
};

export default MessageItem;
