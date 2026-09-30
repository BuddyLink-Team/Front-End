import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Send,
  Image as ImageIcon,
  Smile,
  CalendarPlus,
  MoreVertical,
  ArrowLeft,
  X,
  Lock,
  Flag,
  UserX,
  Phone,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Avatar } from '../../../components/ui/Avatar';
import { VerifiedBadge } from '../../../components/badges/VerifiedBadge';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown';
import { MessageItem } from './MessageItem.jsx';
import { EmojiPopover } from './EmojiPopover.jsx';
import { cn } from '../../../utils/cn';

export const DirectChatView = ({
  conversation,
  messages = [],
  isLoadingMessages = false,
  isSending = false,
  isPartnerTyping = false,
  selectedImageFile,
  imagePreviewUrl,
  onSelectImage,
  onClearImage,
  onSendMessage,
  onSendTyping,
  onBack,
  className,
}) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState(null);

  // Safety confirmation dialogs
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const partner = conversation?.partner;
  const partnerName = partner?.fullName || 'Phụ huynh BuddyLink';
  const partnerAvatar = partner?.avatarUrl;
  const isVerified = Boolean(partner?.verification?.isVerifiedParent);
  const partnerLocation = partner?.location?.area || partner?.location?.city || 'TP. Hồ Chí Minh';

  // Auto scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(messages.length <= 10 ? 'auto' : 'smooth');
  }, [messages.length, isPartnerTyping]);

  // Handle Text Input Changes & Typing debouncing
  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (onSendTyping) {
      onSendTyping(val.length > 0);
    }
  };

  // Submit Message
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImageFile) || isSending) return;

    onSendMessage(inputText);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Insert emoji into input
  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Block user action
  const handleConfirmBlock = () => {
    setShowBlockDialog(false);
    toast.success(`Đã chặn người dùng ${partnerName}`);
    if (onBack) onBack();
  };

  // Report user action
  const handleConfirmReport = () => {
    setShowReportDialog(false);
    toast.success('Báo cáo đã được gửi tới Quản trị viên BuddyLink để xem xét.');
  };

  return (
    <section
      className={cn(
        'flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-hairline flex flex-col h-full overflow-hidden relative',
        className
      )}
    >
      {/* 1. Header Chat */}
      <div className="px-5 py-3.5 bg-surface-container-lowest flex items-center justify-between border-b border-hairline z-10">
        <div className="flex items-center gap-3">
          {/* Back button for mobile view */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-low transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Partner Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={partnerAvatar}
              alt={partnerName}
              size="md"
              isOnline={true}
              fallbackText={partnerName.slice(0, 2).toUpperCase()}
            />
          </div>

          {/* Partner Details */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-on-surface leading-tight">
                {partnerName}
              </h3>
              {isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-primary font-medium">Đang hoạt động</span>
              <span>•</span>
              <span className="truncate max-w-[180px] sm:max-w-[240px]">{partnerLocation}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Gọi thoại an tâm */}
          <button
            type="button"
            onClick={() => toast('Tính năng gọi thoại an tâm đang được thử nghiệm bảo mật.', { icon: '📞' })}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all"
            title="Gọi thoại an tâm"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Lên lịch hẹn chơi */}
          <button
            type="button"
            onClick={() => navigate('/playdates/create')}
            className="px-3 py-1.5 rounded-full bg-primary-container/20 text-on-primary-container hover:bg-primary-container/35 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            title="Lên lịch hẹn chơi cho các bé"
          >
            <CalendarPlus className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Hẹn chơi</span>
          </button>

          {/* Menu Báo cáo / Chặn */}
          <Dropdown
            trigger={
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            placement="bottom-end"
          >
            <DropdownItem
              icon={<Flag className="w-4 h-4 text-error" />}
              onClick={() => setShowReportDialog(true)}
              className="text-error"
            >
              Báo cáo vi phạm
            </DropdownItem>
            <DropdownItem
              icon={<UserX className="w-4 h-4 text-error" />}
              onClick={() => setShowBlockDialog(true)}
              className="text-error"
            >
              Chặn người dùng
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 chat-stream-canvas scroll-smooth">
        {/* Date Marker */}
        <div className="flex justify-center my-2">
          <span className="px-3.5 py-1 rounded-full bg-surface-container-high/60 text-on-surface-variant text-xs font-medium">
            Hôm nay, ngày {dayjs().format('DD/MM/YYYY')}
          </span>
        </div>

        {/* Loading state */}
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-on-surface-variant text-xs">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải tin nhắn...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant text-sm">
            <p className="font-medium text-on-surface">Chưa có tin nhắn nào</p>
            <p className="text-xs text-outline mt-1">Gửi lời chào để bắt đầu cuộc trò chuyện thân mật!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              partnerAvatar={partnerAvatar}
              partnerName={partnerName}
              onImageClick={(url) => setLightboxImageUrl(url)}
            />
          ))
        )}

        {/* Realtime Typing Indicator */}
        {isPartnerTyping && (
          <div className="flex items-center gap-2 self-start animate-fade-in pl-1">
            <Avatar src={partnerAvatar} alt={partnerName} size="sm" fallbackText="P" />
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm chat-typing-bubble flex items-center gap-1.5">
              <span className="text-xs text-on-surface-variant">{partnerName} đang soạn</span>
              <span className="flex items-center gap-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary chat-dot-bounce chat-dot-bounce-3" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Input Composer */}
      <div className="p-3.5 bg-surface-container-lowest border-t border-hairline relative">
        {/* Emoji Popover */}
        <EmojiPopover
          isOpen={isEmojiOpen}
          onClose={() => setIsEmojiOpen(false)}
          onSelectEmoji={handleInsertEmoji}
        />

        {/* Image Attachment Preview */}
        {imagePreviewUrl && (
          <div className="mb-2 relative inline-block animate-pop-in">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl chat-image-preview-card"
            />
            <button
              type="button"
              onClick={onClearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-on-surface text-white flex items-center justify-center shadow-xs hover:bg-error transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl bg-surface-container-low p-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onSelectImage(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shrink-0"
            title="Đính kèm ảnh bé chơi"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setIsEmojiOpen((prev) => !prev)}
            className="p-2 rounded-full text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors shrink-0"
            title="Chọn biểu cảm icon"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Elastic Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Nhắn tin cùng ${partnerName}...`}
            className="flex-1 bg-transparent border-none text-on-surface placeholder:text-outline text-sm py-2 px-1 focus:outline-none resize-none max-h-24 scrollbar-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImageFile) || isSending}
            className={cn(
              'p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 shadow-xs active:scale-95',
              (inputText.trim() || selectedImageFile) && !isSending
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-surface-container text-outline cursor-not-allowed'
            )}
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Security & Helper Note */}
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1 text-primary">
            <Lock className="w-3.5 h-3.5" />
            <span>Tin nhắn được bảo vệ quyền riêng tư gia đình</span>
          </span>
          <span className="hidden sm:inline text-outline">Nhấn Enter để gửi, Shift+Enter xuống dòng</span>
        </div>
      </div>

      {/* 4. Lightbox Modal for Full Image View */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 chat-lightbox-overlay flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImageUrl}
              alt="Full size"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxImageUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-on-surface flex items-center justify-center shadow-lg hover:bg-surface-container-low"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Block User Confirm Dialog */}
      <ConfirmDialog
        open={showBlockDialog}
        title={`Chặn ${partnerName}?`}
        description="Người này sẽ không thể gửi tin nhắn hoặc mời bạn tham gia Playdate nữa. Bạn có thể mở chặn trong Cài đặt riêng tư sau này."
        confirmLabel="Chặn người dùng"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirmBlock}
        onCancel={() => setShowBlockDialog(false)}
      />

      {/* 6. Report User Confirm Dialog */}
      <ConfirmDialog
        open={showReportDialog}
        title={`Báo cáo ${partnerName}?`}
        description="Bạn có nhận thấy hành vi không phù hợp hoặc vi phạm an toàn trẻ em từ tài khoản này? Quản trị viên sẽ kiểm tra lại nội dung."
        confirmLabel="Gửi báo cáo"
        cancelLabel="Hủy"
        variant="warning"
        onConfirm={handleConfirmReport}
        onCancel={() => setShowReportDialog(false)}
      />
    </section>
  );
};

export default DirectChatView;
