import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '../../modules/chat/components/ConversationList';
import { MessageItem } from '../../modules/chat/components/MessageItem';
import { EmptyChatState } from '../../modules/chat/components/EmptyChatState';
import { EmojiPopover } from '../../modules/chat/components/EmojiPopover';
import { DirectChatView } from '../../modules/chat/components/DirectChatView';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (fn) => fn({ auth: { parent: { _id: 'my-parent-id' } }, safety: { isSubmitting: false } }),
  useDispatch: () => vi.fn(),
}));

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

  it('5. MessageItem: should correctly determine isMine using currentParentId even if message.isMine was incorrect', () => {
    // Partner's message that erroneously arrived with isMine: true from broadcast
    const partnerMessage = {
      id: 'msg-err-1',
      content: 'Tin nhắn từ đối phương',
      senderId: 'partner-id-123',
      isMine: true, // Error from broadcast
      createdAt: new Date().toISOString(),
    };

    const { rerender } = render(
      <MessageItem
        message={partnerMessage}
        currentParentId="my-id-456"
        partnerName="Mẹ Lan Anh"
      />
    );

    // Should render as partner message (with partner avatar and without "Đã gửi" / "Đã xem" tick)
    expect(screen.getByText('Tin nhắn từ đối phương')).toBeInTheDocument();
    expect(screen.queryByText('Đã gửi')).not.toBeInTheDocument();

    // Now my own message
    const myMessage = {
      id: 'msg-mine-1',
      content: 'Tin nhắn từ chính tôi',
      senderId: 'my-id-456',
      isMine: false,
      createdAt: new Date().toISOString(),
    };

    rerender(
      <MessageItem
        message={myMessage}
        currentParentId="my-id-456"
        partnerName="Mẹ Lan Anh"
      />
    );

    expect(screen.getByText('Tin nhắn từ chính tôi')).toBeInTheDocument();
    expect(screen.getByText('Đã gửi')).toBeInTheDocument();
  });

  it('5b. MessageItem: should show sending/failed delivery states and retry a failed message', () => {
    const handleRetry = vi.fn();
    const baseMessage = {
      id: 'tmp-1',
      tempId: 'tmp-1',
      content: 'Tin đang gửi',
      senderId: 'my-id-456',
      createdAt: new Date().toISOString(),
    };

    const { rerender } = render(
      <MessageItem
        message={{ ...baseMessage, status: 'sending' }}
        currentParentId="my-id-456"
        onRetry={handleRetry}
      />
    );
    expect(screen.getByText('Đang gửi')).toBeInTheDocument();
    expect(screen.queryByText('Gửi lại')).not.toBeInTheDocument();

    rerender(
      <MessageItem
        message={{ ...baseMessage, status: 'failed' }}
        currentParentId="my-id-456"
        onRetry={handleRetry}
      />
    );
    expect(screen.getByText('Gửi lỗi')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Gửi lại'));
    expect(handleRetry).toHaveBeenCalledWith('tmp-1');
  });

  it('6. DirectChatView: should render pagination button when hasMoreMessages is true', () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    const handleLoadOlder = vi.fn();

    const mockConv = {
      id: 'conv-1',
      partner: {
        id: 'p-1',
        fullName: 'Mẹ Lan Anh',
        location: { area: 'Quận Cầu Giấy, Hà Nội' },
        isOnline: false,
      },
    };

    render(
      <DirectChatView
        conversation={mockConv}
        messages={[
          {
            id: 'msg-old-1',
            content: 'Tin nhắn hôm qua',
            createdAt: '2026-10-02T10:00:00.000Z',
            senderId: 'p-1',
          },
        ]}
        hasMoreMessages={true}
        onLoadOlderMessages={handleLoadOlder}
      />
    );

    const loadMoreBtn = screen.getByText('Tải tin nhắn cũ hơn');
    expect(loadMoreBtn).toBeInTheDocument();
    fireEvent.click(loadMoreBtn);
    expect(handleLoadOlder).toHaveBeenCalled();

    // Verify location is accurately displayed and not hardcoded to TP. Hồ Chí Minh
    expect(screen.getByText('Quận Cầu Giấy, Hà Nội')).toBeInTheDocument();
    expect(screen.queryByText('TP. Hồ Chí Minh')).not.toBeInTheDocument();
  });

  it('7. DirectChatView: displays blocked banner and unblock button when isBlockedByMe is true', () => {
    const mockConv = {
      id: 'conv-blocked-me',
      partner: {
        id: 'p-blocked-1',
        fullName: 'Mẹ Thu Hà',
      },
      isBlockedByMe: true,
    };

    render(
      <DirectChatView
        conversation={mockConv}
        messages={[]}
      />
    );

    // Message input composer should not be shown
    expect(screen.queryByPlaceholderText(/Nhắn tin cùng Mẹ Thu Hà.../i)).not.toBeInTheDocument();

    // Blocked notification banner & button
    expect(screen.getByText('Bạn đã chặn người này. Vui lòng mở chặn để trò chuyện tiếp')).toBeInTheDocument();
    const unblockBtn = screen.getByRole('button', { name: /Bỏ chặn/i });
    expect(unblockBtn).toBeInTheDocument();

    // Clicking unblock opens confirmation dialog
    fireEvent.click(unblockBtn);
    expect(screen.getByText('Bỏ chặn Mẹ Thu Hà?')).toBeInTheDocument();
  });

  it('8. DirectChatView: displays blocked notice when isBlockedByPartner is true', () => {
    const mockConv = {
      id: 'conv-blocked-partner',
      partner: {
        id: 'p-blocked-2',
        fullName: 'Bố Minh Trí',
      },
      isBlockedByPartner: true,
    };

    render(
      <DirectChatView
        conversation={mockConv}
        messages={[]}
      />
    );

    expect(screen.queryByPlaceholderText(/Nhắn tin cùng Bố Minh Trí.../i)).not.toBeInTheDocument();
    expect(screen.getByText('Bạn đã bị người này chặn và không thể trò chuyện')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bỏ chặn/i })).not.toBeInTheDocument();
  });

  it('9. MessageItem: calls onReportMessage when clicking Báo cáo on partner message', () => {
    const handleReport = vi.fn();
    const incomingMsg = {
      id: 'msg-rep-1',
      content: 'Nội dung phản cảm',
      senderId: 'partner-123',
      isMine: false,
      createdAt: new Date().toISOString(),
    };

    render(
      <MessageItem
        message={incomingMsg}
        partnerName="Phụ huynh khác"
        currentParentId="my-parent-id"
        onReportMessage={handleReport}
      />
    );

    const reportBtn = screen.getByRole('button', { name: /Báo cáo/i });
    expect(reportBtn).toBeInTheDocument();
    fireEvent.click(reportBtn);

    expect(handleReport).toHaveBeenCalledWith(incomingMsg);
  });
});

