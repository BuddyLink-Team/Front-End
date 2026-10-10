import React from 'react';
import dayjs from 'dayjs';
import { ShieldCheck, Calendar, Users, MessageSquare } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { SearchBar } from '../../../components/search/SearchBar';
import { FilterChips } from '../../../components/search/FilterChips';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { CHAT_TABS, CONVERSATION_TYPES } from '../constants/chatConstants.js';
import { cn } from '../../../utils/cn';

/**
 * Format timestamp nicely into relative or short time
 */
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = dayjs(dateString);
  const now = dayjs();

  if (date.isSame(now, 'day')) {
    return date.format('HH:mm');
  }
  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Hôm qua';
  }
  if (date.isSame(now, 'year')) {
    return date.format('DD/MM');
  }
  return date.format('DD/MM/YYYY');
};

export const ConversationList = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  selectedTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  totalUnreadCount = 0,
  isLoading = false,
  className,
}) => {
  return (
    <aside
      className={cn(
        'w-full lg:w-[350px] shrink-0 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-hairline flex flex-col h-full',
        className
      )}
    >
      {/* 1. Header: Title & Unread Badge */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Tin nhắn</h2>
          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold animate-pulse">
              {totalUnreadCount} chờ đọc
            </span>
          )}
        </div>
      </div>

      {/* 2. Search Input */}
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        placeholder="Tìm phụ huynh hoặc tên bé..."
        className="mb-3"
      />

      {/* 3. Category Filter Tabs */}
      <FilterChips
        options={CHAT_TABS}
        selected={selectedTab}
        onChange={(tabId) => tabId && onTabChange(tabId)}
        className="pb-3"
      />

      {/* 4. Conversations List Stream */}
      <div className="flex-1 overflow-y-auto overscroll-contain space-y-1.5 pr-0.5">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center text-on-surface-variant">
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mb-2 text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-on-surface">Không tìm thấy cuộc trò chuyện</p>
            <p className="text-xs text-outline mt-1 max-w-[200px]">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu kết nối với phụ huynh để trò chuyện'}
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            const partner = conv.partner;
            const isGroup = conv.type === CONVERSATION_TYPES.PLAYDATE;
            const title = isGroup
              ? conv.playdate?.title || 'Nhóm Hẹn Chơi'
              : partner?.fullName || 'Phụ huynh BuddyLink';
            const avatarUrl = isGroup ? null : partner?.avatarUrl;
            const hasUnread = (conv.unreadCount || 0) > 0;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'relative p-3 rounded-xl cursor-pointer transition-all border border-transparent select-none',
                  isSelected
                    ? 'chat-conversation-item-active shadow-xs'
                    : 'hover:bg-surface-container-low'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {isGroup ? (
                      <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                        <Users className="w-5 h-5 text-secondary" />
                      </div>
                    ) : (
                      <Avatar
                        src={avatarUrl}
                        alt={title}
                        size="md"
                        isOnline={true}
                        fallbackText={title.slice(0, 2).toUpperCase()}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={cn(
                          'text-sm truncate',
                          hasUnread ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'
                        )}
                      >
                        {title}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium shrink-0">
                        {formatTime(conv.lastMessage?.sentAt || conv.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'text-xs truncate',
                          hasUnread ? 'font-semibold text-on-surface' : 'text-on-surface-variant'
                        )}
                      >
                        {conv.lastMessage?.type === 'image'
                          ? '📷 [Hình ảnh]'
                          : conv.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>

                      {hasUnread && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Sub-tag badge (e.g. Playdate indicator) */}
                    {conv.playdate && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-secondary bg-secondary-container/40 px-2 py-0.5 rounded-full">
                          <Calendar className="w-3 h-3" />
                          <span>Hẹn chơi {dayjs(conv.playdate.scheduledDate).format('DD/MM')}{conv.playdate.time ? ` • ${conv.playdate.time}` : ''}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Bottom Community Trust Banner */}
      <div className="mt-3 p-3 rounded-xl bg-surface-container-low flex items-center gap-3 border border-hairline/60">
        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0 text-primary">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-on-surface truncate">Cộng đồng xác thực</p>
          <p className="text-[11px] text-on-surface-variant truncate">
            Phụ huynh được xác thực căn cước an toàn
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ConversationList;
