import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlaydateEventCollateralPanel } from '../../modules/chat/components/PlaydateEventCollateralPanel';
import { PlaydateChatView } from '../../modules/chat/components/PlaydateChatView';

describe('Playdate Group Chat & Collateral Panel (TASK-FE-11)', () => {
  const mockPlaydate = {
    id: 'playdate-101',
    title: 'Buổi vẽ tranh sáng tạo & thả diều',
    activity: 'Vẽ tranh ngoài trời',
    scheduledDate: '2026-10-15T08:30:00.000Z',
    time: '15:30',
    location: {
      name: 'Công viên Gia Định',
      address: 'Hoàng Minh Giám, Phường 9, Phú Nhuận',
    },
    note: 'Các bố mẹ mang thêm nón và nước lọc cho bé nhé.',
    status: 'upcoming',
    host: {
      id: 'parent-host',
      fullName: 'Mẹ Hoàng Yến',
      avatarUrl: '',
      verification: { isVerifiedParent: true },
      location: { area: 'Phú Nhuận' },
    },
    hostChild: {
      id: 'child-host',
      displayName: 'Bé Bắp',
      dateOfBirth: '2021-05-10',
      gender: 'boy',
      interests: ['Vẽ tranh', 'Lắp ráp'],
    },
    participants: [
      {
        parent: {
          id: 'parent-part-1',
          fullName: 'Bố Minh Trí',
          avatarUrl: '',
          verification: { isVerifiedParent: true },
          location: { area: 'Gò Vấp' },
        },
        child: {
          id: 'child-part-1',
          displayName: 'Bé Sóc',
          dateOfBirth: '2021-08-20',
          gender: 'girl',
          interests: ['Ca hát', 'Thả diều'],
        },
        status: 'accepted',
      },
    ],
  };

  const mockConversation = {
    id: 'conv-playdate-101',
    type: 'playdate',
    playdate: mockPlaydate,
    participants: [
      { id: 'parent-host', fullName: 'Mẹ Hoàng Yến' },
      { id: 'parent-part-1', fullName: 'Bố Minh Trí' },
    ],
  };

  const mockMessages = [
    {
      id: 'msg-p1',
      conversationId: 'conv-playdate-101',
      senderId: 'parent-host',
      sender: { fullName: 'Mẹ Hoàng Yến', avatarUrl: '' },
      content: 'Chào các bố mẹ, hẹn gặp chiều thứ Bảy nhé!',
      isMine: false,
      createdAt: '2026-10-14T09:00:00.000Z',
    },
    {
      id: 'msg-p2',
      conversationId: 'conv-playdate-101',
      senderId: 'parent-part-1',
      sender: { fullName: 'Bố Minh Trí', avatarUrl: '' },
      content: 'Dạ bé Sóc rất mong chờ được gặp bé Bắp!',
      isMine: true,
      createdAt: '2026-10-14T09:05:00.000Z',
    },
  ];

  it('1. PlaydateEventCollateralPanel: renders event summary, schedule, location, children, and parents', () => {
    const handleClose = vi.fn();

    render(
      <MemoryRouter>
        <PlaydateEventCollateralPanel
          playdate={mockPlaydate}
          onClose={handleClose}
        />
      </MemoryRouter>
    );

    // Header & Event title
    expect(screen.getByText('Tóm tắt sự kiện')).toBeInTheDocument();
    expect(screen.getByText('Buổi vẽ tranh sáng tạo & thả diều')).toBeInTheDocument();

    // Location
    expect(screen.getByText('Công viên Gia Định')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Minh Giám, Phường 9, Phú Nhuận')).toBeInTheDocument();

    // Note
    expect(screen.getByText('Các bố mẹ mang thêm nón và nước lọc cho bé nhé.')).toBeInTheDocument();

    // Children details
    expect(screen.getByText('Bé Bắp')).toBeInTheDocument();
    expect(screen.getByText('Bé chủ trì')).toBeInTheDocument();
    expect(screen.getByText('Bé Sóc')).toBeInTheDocument();

    // Parents details
    expect(screen.getAllByText('Mẹ Hoàng Yến').length).toBeGreaterThan(0);
    expect(screen.getByText('Chủ nhà')).toBeInTheDocument();
    expect(screen.getAllByText('Bố Minh Trí').length).toBeGreaterThan(0);

    // Action button
    expect(screen.getByText('Xem chi tiết cuộc hẹn')).toBeInTheDocument();

    // Close button triggers callback
    const closeBtn = screen.getByTitle('Đóng bảng thông tin');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('2. PlaydateChatView: renders chat header with group details and messages', () => {
    const handleSendMessage = vi.fn();

    render(
      <MemoryRouter>
        <PlaydateChatView
          conversation={mockConversation}
          messages={mockMessages}
          isLoadingMessages={false}
          isSending={false}
          onSendMessage={handleSendMessage}
        />
      </MemoryRouter>
    );

    // Group title in header
    expect(screen.getByRole('heading', { level: 3, name: /Buổi vẽ tranh sáng tạo & thả diều/i })).toBeInTheDocument();
    expect(screen.getByText('Playdate Nhóm')).toBeInTheDocument();

    // Incoming & Outgoing messages
    expect(screen.getByText('Chào các bố mẹ, hẹn gặp chiều thứ Bảy nhé!')).toBeInTheDocument();
    expect(screen.getByText('Dạ bé Sóc rất mong chờ được gặp bé Bắp!')).toBeInTheDocument();

    // Sender name displayed for group messages
    expect(screen.getAllByText('Mẹ Hoàng Yến').length).toBeGreaterThan(0);

    // Collateral Panel rendered inside PlaydateChatView
    expect(screen.getByText('Tóm tắt sự kiện')).toBeInTheDocument();
    expect(screen.getAllByText('Công viên Gia Định').length).toBeGreaterThan(0);
  });

  it('3. PlaydateChatView: sends message when form is submitted', () => {
    const handleSendMessage = vi.fn();

    render(
      <MemoryRouter>
        <PlaydateChatView
          conversation={mockConversation}
          messages={mockMessages}
          isLoadingMessages={false}
          isSending={false}
          onSendMessage={handleSendMessage}
        />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Nhắn tin với nhóm các phụ huynh...');
    fireEvent.change(input, { target: { value: 'Bé nhà mình cũng rất háo hức!' } });

    const sendBtn = screen.getByTitle('Gửi tin nhắn nhóm');
    fireEvent.click(sendBtn);

    expect(handleSendMessage).toHaveBeenCalledWith('Bé nhà mình cũng rất háo hức!');
  });
});
