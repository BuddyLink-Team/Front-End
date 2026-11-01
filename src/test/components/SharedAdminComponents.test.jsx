import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { StatusChip } from '../../components/badges/StatusChip';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { Modal } from '../../components/feedback/Modal';
import { TypingIndicator } from '../../components/feedback/TypingIndicator';
import { DataTable } from '../../components/ui/DataTable';
import { DateRangeFilter } from '../../components/search/DateRangeFilter';
import { ChatBubble } from '../../components/chat/ChatBubble';

describe('StatusChip', () => {
  it('keeps the existing colors of playdate and connection statuses', () => {
    render(
      <>
        <StatusChip status="pending" />
        <StatusChip status="upcoming" />
        <StatusChip status="cancelled" />
      </>,
    );
    expect(screen.getByText('Chờ phản hồi').className).toContain('bg-tertiary-soft');
    // Unmapped statuses keep falling back to the pending colors
    expect(screen.getByText('Sắp diễn ra').className).toContain('bg-tertiary-soft');
    expect(screen.getByText('Đã hủy').className).toContain('bg-hairline');
  });

  it('labels and colors the new admin statuses', () => {
    render(
      <>
        <StatusChip status="active" />
        <StatusChip status="failed" />
        <StatusChip status="expired" />
      </>,
    );
    expect(screen.getByText('Đang hoạt động').className).toContain('bg-primary-soft');
    expect(screen.getByText('Thất bại').className).toContain('bg-error-container');
    expect(screen.getByText('Đã hết hạn').className).toContain('bg-hairline');
  });

  it('lets tone override the color picked from the status', () => {
    render(<StatusChip status="pending" tone="danger" label="Quá hạn" />);
    const chip = screen.getByText('Quá hạn');
    expect(chip.className).toContain('bg-error-container');
    expect(chip.className).not.toContain('bg-tertiary-soft');
  });
});

describe('ConfirmDialog', () => {
  it('confirms without arguments when there is no reason field', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onConfirm={onConfirm} onCancel={vi.fn()} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledWith();
  });

  it('requires a reason before confirming and passes it trimmed', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Hủy cuộc hẹn"
        reason={{ required: true, label: 'Lý do hủy' }}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    const confirmButton = screen.getByRole('button', { name: 'Xác nhận' });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Lý do hủy *'), { target: { value: '   ' } });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Lý do hủy *'), { target: { value: '  Vi phạm an toàn  ' } });
    expect(confirmButton).not.toBeDisabled();
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith('Vi phạm an toàn');
  });

  it('allows confirming with an empty optional reason', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open reason={{}} onConfirm={onConfirm} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledWith('');
  });
});

describe('Modal placement="right"', () => {
  it('renders a full-height drawer aligned to the right that closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Chi tiết phụ huynh" placement="right" maxWidth="max-w-md">
        <p>Nội dung</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('h-full');
    expect(dialog.className).toContain('animate-slide-in-right');
    expect(dialog.className).toContain('max-w-md');
    expect(dialog.className).not.toContain('max-h-modal');
    expect(dialog.parentElement.className).toContain('justify-end');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('DataTable server-side sort', () => {
  const columns = [{ key: 'name', label: 'Tên', sortable: true }];
  const rows = [{ id: 1, name: 'Bình' }, { id: 2, name: 'An' }];

  it('keeps the server order and emits the next sort instead of sorting the page', () => {
    const onSortChange = vi.fn();
    const { rerender } = render(<DataTable columns={columns} rows={rows} onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText('Tên'));
    expect(onSortChange).toHaveBeenCalledWith({ sortKey: 'name', sortDir: 'asc' });
    // Rows are not reordered locally
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['Bình', 'An']);

    rerender(<DataTable columns={columns} rows={rows} sortKey="name" sortDir="asc" onSortChange={onSortChange} />);
    fireEvent.click(screen.getByText('Tên'));
    expect(onSortChange).toHaveBeenLastCalledWith({ sortKey: 'name', sortDir: 'desc' });
  });

  it('still sorts client-side without onSortChange', () => {
    render(<DataTable columns={columns} rows={rows} />);
    fireEvent.click(screen.getByText('Tên'));
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['An', 'Bình']);
  });
});

describe('DataTable loading', () => {
  const columns = [{ key: 'name', label: 'Tên' }];

  it('keeps a minimum height on the first load, before any row arrives', () => {
    const { container } = render(<DataTable columns={columns} rows={[]} isLoading />);
    expect(container.firstChild).toHaveClass('min-h-table-loading');
  });

  it('drops the minimum height once rows are shown, even while reloading', () => {
    const { container } = render(<DataTable columns={columns} rows={[{ id: 1, name: 'An' }]} isLoading />);
    expect(container.firstChild).not.toHaveClass('min-h-table-loading');
  });
});

describe('DateRangeFilter', () => {
  it('emits the preset range as YYYY-MM-DD', () => {
    const onChange = vi.fn();
    render(<DateRangeFilter onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '7 ngày' }));

    const today = dayjs();
    expect(onChange).toHaveBeenCalledWith({
      from: today.subtract(6, 'day').format('YYYY-MM-DD'),
      to: today.format('YYYY-MM-DD'),
    });
  });

  it('shows the date inputs for a custom range and clears it', () => {
    const onChange = vi.fn();
    render(<DateRangeFilter from="2026-01-05" to="2026-02-10" onChange={onChange} />);

    expect(screen.getByLabelText('Từ ngày')).toHaveValue('2026-01-05');
    fireEvent.change(screen.getByLabelText('Đến ngày'), { target: { value: '2026-03-01' } });
    expect(onChange).toHaveBeenLastCalledWith({ from: '2026-01-05', to: '2026-03-01' });

    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại' }));
    expect(onChange).toHaveBeenLastCalledWith({ from: '', to: '' });
  });
});

describe('Chat building blocks', () => {
  it('ChatBubble shows the avatar and attachments of incoming messages only', () => {
    const { rerender } = render(
      <ChatBubble avatar={<span>avatar</span>} attachments={<div>Thẻ địa điểm</div>} meta="10:30">
        Xin chào
      </ChatBubble>,
    );
    expect(screen.getByText('avatar')).toBeInTheDocument();
    expect(screen.getByText('Thẻ địa điểm')).toBeInTheDocument();
    expect(screen.getByText('Xin chào').className).toContain('chat-bubble-partner');

    rerender(
      <ChatBubble isOutgoing avatar={<span>avatar</span>}>
        Xin chào
      </ChatBubble>,
    );
    expect(screen.queryByText('avatar')).not.toBeInTheDocument();
    expect(screen.getByText('Xin chào').className).toContain('chat-bubble-user');
  });

  it('TypingIndicator announces who is typing', () => {
    render(<TypingIndicator label="Lan đang soạn" />);
    expect(screen.getByRole('status', { name: 'Lan đang soạn' })).toBeInTheDocument();
  });
});
