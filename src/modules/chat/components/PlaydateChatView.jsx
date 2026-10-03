import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Send,
  Image as ImageIcon,
  Smile,
  Calendar,
  MoreVertical,
  ArrowLeft,
  X,
  Lock,
  Flag,
  Users,
  PanelRight,
  PanelRightClose,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast.js';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown';
import { MessageItem } from './MessageItem.jsx';
import { EmojiPopover } from './EmojiPopover.jsx';
import { PlaydateEventCollateralPanel } from './PlaydateEventCollateralPanel.jsx';
import { CHAT_FILE_INPUT_ACCEPT } from '../constants/chatConstants.js';
import { cn } from '../../../utils/cn';

/**
 * Format date group label for messages separator
 */
const formatMessageDateGroup = (dateString) => {
  if (!dateString) return 'Hôm nay';
  const date = dayjs(dateString);
  const now = dayjs();
  if (date.isSame(now, 'day')) return 'Hôm nay';
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Hôm qua';
  return date.format('DD/MM/YYYY');
};

export const PlaydateChatView = ({
  conversation,
  messages = [],
  isLoadingMessages = false,
  isSending = false,
  isPartnerTyping = false,
  hasMoreMessages = false,
  isLoadingOlder = false,
  onLoadOlderMessages,
  selectedImageFile,
  imagePreviewUrl,
  onSelectImage,
  onClearImage,
  onSendMessage,
  onSendTyping,
  onBack,
  className,
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState(null);
  const [isCollateralOpen, setIsCollateralOpen] = useState(true);
  const [showMobileCollateral, setShowMobileCollateral] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  const stopTypingTimeoutRef = useRef(null);

  const playdate = conversation?.playdate;
  const groupTitle = playdate?.title || playdate?.activity || 'Nhóm Hẹn Chơi';
  const participantsCount = (conversation?.participants?.length || 0);

  // Auto scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    scrollToBottom(messages.length <= 10 ? 'auto' : 'smooth');
  }, [messages.length, isPartnerTyping]);

  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
    };
  }, []);

  // Handle typing & text change (throttled)
  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (!onSendTyping) return;

    if (!val.trim()) {
      if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
      lastTypingEmitRef.current = 0;
      onSendTyping(false);
      return;
    }

    const now = Date.now();
    if (now - lastTypingEmitRef.current > 2000) {
      lastTypingEmitRef.current = now;
      onSendTyping(true);
    }

    if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = setTimeout(() => {
      onSendTyping(false);
    }, 2500);
  };

  // Submit message
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImageFile) || isSending) return;

    onSendMessage(inputText);
    setInputText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Insert emoji
  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleConfirmReport = () => {
    setShowReportDialog(false);
    toast.success('Báo cáo nhóm đã được gửi tới Quản trị viên để kiểm duyệt an toàn.');
  };

  // Format short schedule snippet for header
  const scheduleSnippet = playdate?.scheduledDate
    ? `${dayjs(playdate.scheduledDate).format('DD/MM')}${playdate.time ? ` • ${playdate.time}` : ''}`
    : 'Chưa xếp lịch';

  return (
    <section
      className={cn(
        'flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-hairline flex h-full overflow-hidden relative',
        className
      )}
    >
      {/* ============================================================== */}
      {/* Left/Center Pane: Main Chat Area                               */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* 1. Group Header */}
        <div className="px-5 py-3 bg-surface-container-lowest flex items-center justify-between border-b border-hairline z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
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

            {/* Group Playdate Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface-container-lowest" />
            </div>

            {/* Group Title & Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-on-surface leading-tight truncate">
                  {groupTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container/60 text-secondary shrink-0 hidden sm:inline">
                  Playdate Nhóm
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant truncate">
                <span className="flex items-center gap-1 font-medium text-primary shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{scheduleSnippet}</span>
                </span>
                <span>•</span>
                {playdate?.location?.name && (
                  <>
                    <span className="flex items-center gap-1 truncate text-outline">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-[180px]">
                        {playdate.location.name}
                      </span>
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="shrink-0">{participantsCount} thành viên</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct Playdate Link */}
            {playdate?.id && (
              <button
                type="button"
                onClick={() => navigate(`/playdates/${playdate.id}`)}
                className="hidden sm:flex px-3 py-1.5 rounded-full bg-primary-container/20 text-on-primary-container hover:bg-primary-container/35 text-xs font-semibold items-center gap-1.5 transition-all active:scale-95"
                title="Xem chi tiết sự kiện Playdate"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>Chi tiết hẹn</span>
              </button>
            )}

            {/* Desktop Collateral Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollateralOpen((prev) => !prev)}
              className={cn(
                'hidden lg:flex w-8 h-8 rounded-full items-center justify-center transition-colors',
                isCollateralOpen
                  ? 'bg-primary-container/30 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )}
              title={isCollateralOpen ? 'Thu gọn bảng sự kiện' : 'Mở bảng tóm tắt sự kiện'}
            >
              {isCollateralOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRight className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Collateral Panel Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileCollateral(true)}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
              title="Xem thông tin sự kiện"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* Menu More / Report */}
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
                icon={Flag}
                danger
                onClick={() => setShowReportDialog(true)}
              >
                Báo cáo nhóm chat
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* 2. Messages Stream */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 chat-stream-canvas scroll-smooth">
          {/* Playdate Scheduled Event Banner inside chat stream */}
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-hairline shadow-xs flex items-center justify-between gap-3 mx-auto max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-container/25 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-on-surface leading-tight">
                  {groupTitle}
                </p>
                <p className="text-[11px] text-outline mt-0.5">
                  Lịch hẹn: {scheduleSnippet} • {playdate?.location?.name || 'Chưa định địa điểm'}
                </p>
              </div>
            </div>
            {playdate?.id && (
              <button
                type="button"
                onClick={() => navigate(`/playdates/${playdate.id}`)}
                className="text-xs text-primary font-bold hover:underline shrink-0 px-2 py-1"
              >
                Xem lịch &rarr;
              </button>
            )}
          </div>

          {/* Load older messages button */}
          {hasMoreMessages && (
            <div className="flex justify-center my-2">
              <button
                type="button"
                onClick={onLoadOlderMessages}
                disabled={isLoadingOlder}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-primary hover:bg-primary-container/20 border border-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                {isLoadingOlder ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải tin nhắn cũ...</span>
                  </>
                ) : (
                  <span>Tải tin nhắn cũ hơn</span>
                )}
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-on-surface-variant text-xs">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Đang tải tin nhắn nhóm...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-sm">
              <p className="font-medium text-on-surface">Chưa có tin nhắn nào trong nhóm</p>
              <p className="text-xs text-outline mt-1">
                Hãy là người đầu tiên trao đổi chuẩn bị cho buổi hẹn chơi cùng các con!
              </p>
            </div>
          ) : (
            messages.map((message, idx) => {
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const currentDate = dayjs(message.createdAt).format('YYYY-MM-DD');
              const prevDate = prevMsg ? dayjs(prevMsg.createdAt).format('YYYY-MM-DD') : null;
              const showDateDivider = !prevDate || currentDate !== prevDate;

              return (
                <React.Fragment key={message.id || idx}>
                  {showDateDivider && (
                    <div className="flex justify-center my-2">
                      <span className="px-3.5 py-1 rounded-full bg-surface-container-high/60 text-on-surface-variant text-xs font-medium">
                        {formatMessageDateGroup(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageItem
                    message={message}
                    partnerAvatar={message.sender?.avatarUrl}
                    partnerName={message.sender?.fullName || 'Thành viên'}
                    showSenderName={true}
                    onImageClick={(url) => setLightboxImageUrl(url)}
                  />
                </React.Fragment>
              );
            })
          )}

          {/* Realtime Typing Indicator */}
          {isPartnerTyping && (
            <div className="flex items-center gap-2 self-start animate-fade-in pl-1">
              <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-xs font-bold">
                💬
              </div>
              <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm chat-typing-bubble flex items-center gap-1.5">
                <span className="text-xs text-on-surface-variant">Có thành viên đang soạn tin</span>
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
        <div className="p-3.5 bg-surface-container-lowest border-t border-hairline relative shrink-0">
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
              accept={CHAT_FILE_INPUT_ACCEPT}
              className="hidden"
            />

            {/* Add Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shrink-0"
              title="Đính kèm ảnh"
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
              placeholder="Nhắn tin với nhóm các phụ huynh..."
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
              title="Gửi tin nhắn nhóm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Helper Note */}
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1 text-primary">
              <Lock className="w-3.5 h-3.5" />
              <span>Chỉ phụ huynh đã tham gia (accepted) mới được xem và gửi tin</span>
            </span>
            <span className="hidden sm:inline text-outline">Nhấn Enter để gửi</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Right Collateral Pane: Desktop Side Panel                      */}
      {/* ============================================================== */}
      {isCollateralOpen && (
        <div className="hidden lg:flex h-full">
          <PlaydateEventCollateralPanel
            playdate={playdate}
            onClose={() => setIsCollateralOpen(false)}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* Mobile / Tablet Collateral Drawer Overlay                      */}
      {/* ============================================================== */}
      {showMobileCollateral && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileCollateral(false)}
          />
          <div className="relative w-full max-w-sm h-full bg-surface-container-lowest shadow-2xl z-10 animate-slide-in-right">
            <PlaydateEventCollateralPanel
              playdate={playdate}
              onClose={() => setShowMobileCollateral(false)}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Fullsize Image Lightbox Modal                                  */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* Report Group Modal                                             */}
      {/* ============================================================== */}
      <ConfirmDialog
        open={showReportDialog}
        title="Báo cáo nhóm chat này?"
        description="Bạn có nhận thấy tin nhắn phản cảm, vi phạm an toàn trẻ nhỏ hoặc nội dung không lành mạnh trong nhóm này? Quản trị viên BuddyLink sẽ kiểm tra ngay lập tức."
        confirmLabel="Gửi báo cáo"
        cancelLabel="Hủy"
        variant="warning"
        onConfirm={handleConfirmReport}
        onCancel={() => setShowReportDialog(false)}
      />
    </section>
  );
};

export default PlaydateChatView;
