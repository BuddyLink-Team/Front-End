import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '../../modules/chat/components/ConversationList';
import { MessageItem } from '../../modules/chat/components/MessageItem';
import { EmptyChatState } from '../../modules/chat/components/EmptyChatState';
import { EmojiPopover } from '../../modules/chat/components/EmojiPopover';

describe('Chat UI Components (TASK-FE-10)', () => {
  const mockConversations = [
    {
      id: 'conv-1',
      type: 'direct',
      partner: {
        id: 'p-1',
        fullName: 'Mẹ Lan Anh',
        avatarUrl: '',
      },
      lastMessage: {
        content: 'Hẹn chiều thứ Bảy nhé!',
        type: 'text',
        sentAt: new Date().toISOString(),
      },
      unreadCount: 3,
    },
  ];

  it('1. ConversationList: should render title and conversations', () => {
    const handleSelect = vi.fn();
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId="conv-1"
        onSelectConversation={handleSelect}
        selectedTab="all"
        onTabChange={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        totalUnreadCount={3}
      />
    );

    expect(screen.getByText('Tin nhắn')).toBeInTheDocument();
    expect(screen.getByText('3 chờ đọc')).toBeInTheDocument();
    expect(screen.getByText('Mẹ Lan Anh')).toBeInTheDocument();
    expect(screen.getByText('Hẹn chiều thứ Bảy nhé!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Mẹ Lan Anh'));
    expect(handleSelect).toHaveBeenCalledWith('conv-1');
  });

  it('2. MessageItem: should render outgoing and incoming messages', () => {
    const outgoingMsg = {
      id: 'msg-1',
      content: 'Chào chị Lan Anh!',
      isMine: true,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    const { rerender } = render(
      <MessageItem
        message={outgoingMsg}
        partnerName="Mẹ Lan Anh"
      />
    );

    expect(screen.getByText('Chào chị Lan Anh!')).toBeInTheDocument();
    expect(screen.getByText('Đã xem')).toBeInTheDocument();

    const incomingMsg = {
      id: 'msg-2',
      content: 'Chào mẹ Nhã Uyên nha!',
      isMine: false,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    rerender(
      <MessageItem
        message={incomingMsg}
        partnerName="Mẹ Lan Anh"
      />
    );

    expect(screen.getByText('Chào mẹ Nhã Uyên nha!')).toBeInTheDocument();
  });

  it('3. EmptyChatState: should render placeholder text and security banner', () => {
    render(<EmptyChatState />);
    expect(screen.getByText('Chọn cuộc trò chuyện để bắt đầu')).toBeInTheDocument();
  });

  it('4. EmojiPopover: should trigger onSelectEmoji when clicked', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <EmojiPopover
        isOpen={true}
        onClose={handleClose}
        onSelectEmoji={handleSelect}
      />
    );

    const emojiBtn = screen.getByText('😊');
    fireEvent.click(emojiBtn);

    expect(handleSelect).toHaveBeenCalledWith('😊');
    expect(handleClose).toHaveBeenCalled();
  });
});
