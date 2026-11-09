import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { AdminReportsPage } from '../../modules/admin/pages/AdminReportsPage';
import { adminApi } from '../../modules/admin/api/adminApi';

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../../hooks/useToast', () => ({ useToast: () => toastMock }));

// Admin socket: lets a test push a realtime notification
const socketMock = vi.hoisted(() => {
  const handlers = {};
  return {
    handlers,
    on: vi.fn((event, handler) => {
      handlers[event] = handler;
    }),
    off: vi.fn((event) => {
      delete handlers[event];
    }),
  };
});
vi.mock('../../services/adminSocket', () => ({
  default: { connect: () => socketMock },
}));

vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getReports: vi.fn(),
    getReportStats: vi.fn(),
    getReportDetail: vi.fn(),
    reviewReport: vi.fn(),
    updateReportSeverity: vi.fn(),
    applyReportAction: vi.fn(),
    resolveReport: vi.fn(),
    reopenReport: vi.fn(),
  },
}));

const ADMIN = { id: 'a1', fullName: 'admin@buddylink.vn', email: 'admin@buddylink.vn' };
const reporter = { id: 'p1', fullName: 'Mẹ Lan', email: 'lan@example.com', phone: '', avatarUrl: '', totalReportsSubmitted: 2 };
const reportedUser = {
  id: 'p2',
  fullName: 'Bố Hùng',
  email: 'hung@example.com',
  phone: '',
  avatarUrl: '',
  strikeCount: 1,
  isActive: true,
  isBanned: false,
  suspensionUntil: null,
  pastReports: [],
  previousSanctions: [],
};

const listRow = {
  id: 'report-1',
  category: 'child_safety',
  severity: 'critical',
  targetType: 'message',
  status: 'reviewing',
  reporter,
  reportedUser: { ...reportedUser, isLocked: false },
  assignedTo: ADMIN,
  isOverdue: true,
  createdAt: '2026-10-10T03:00:00.000Z',
};

const messageContext = {
  type: 'message',
  reportedMessage: { id: 'm2', content: 'Nhà ở đâu vậy?', isDeleted: false, createdAt: '2026-10-10T02:00:00.000Z', senderName: 'Bố Hùng' },
  surroundingMessages: [
    { id: 'm1', content: 'Chào anh', isDeleted: false, createdAt: '2026-10-10T01:00:00.000Z', senderName: 'Mẹ Lan' },
    { id: 'm2', content: 'Nhà ở đâu vậy?', isDeleted: false, createdAt: '2026-10-10T02:00:00.000Z', senderName: 'Bố Hùng' },
  ],
};

const makeDetail = (overrides = {}) => ({
  ...listRow,
  reason: 'An toàn trẻ em',
  description: 'Hỏi địa chỉ nhà',
  evidenceUrls: ['https://cdn.example.com/1.png'],
  reporter,
  reportedUser,
  targetContext: messageContext,
  relatedOpenReports: [],
  actions: [],
  history: [
    { id: 'h1', eventType: 'claim', fromStatus: 'pending', toStatus: 'reviewing', by: ADMIN, at: '2026-10-10T04:00:00.000Z', note: 'Tiếp nhận xử lý vụ việc' },
  ],
  resolution: null,
  adminNotes: '',
  resolvedBy: null,
  resolvedAt: null,
  ...overrides,
});

const playdateContext = {
  type: 'playdate',
  playdate: {
    id: 'pd1',
    activity: 'Picnic công viên',
    scheduledDate: '2026-11-20T10:00:00.000Z',
    time: '09:00',
    durationMinutes: 120,
    location: { name: 'Công viên APEC', address: 'Đà Nẵng' },
    status: 'upcoming',
    host: { parent: { id: 'p2', fullName: 'Bố Hùng' }, child: { displayName: 'Bé Na' } },
    participants: [
      { parentId: 'p1', childId: 'c1', parent: { id: 'p1', fullName: 'Mẹ Lan' }, child: { displayName: 'Bé Bơ' }, status: 'accepted' },
    ],
  },
};

const respondDetail = (detail) => adminApi.getReportDetail.mockResolvedValue({ success: true, data: detail });

const renderPage = async () => {
  renderWithProviders(<AdminReportsPage />, { route: '/admin/reports' });
  await screen.findByText('Bố Hùng');
};

const openDrawer = async (detail = makeDetail()) => {
  respondDetail(detail);
  await renderPage();
  fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết' }));
  await screen.findByText('Chi tiết báo cáo vi phạm');
  return screen.findByText('Nội dung báo cáo');
};

const confirmDialog = () => screen.findByRole('button', { name: 'Xác nhận thi hành' });

describe('AdminReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getReports.mockResolvedValue({
      success: true,
      data: { items: [listRow], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    });
    adminApi.getReportStats.mockResolvedValue({
      success: true,
      data: {
        total: 9,
        pending: 3,
        reviewing: 2,
        resolved: 3,
        dismissed: 1,
        overdue: 4,
        resolvedThisWeek: 1,
        avgResolutionHours: 5.5,
        bySeverity: {},
      },
    });
    ['reviewReport', 'updateReportSeverity', 'applyReportAction', 'resolveReport', 'reopenReport'].forEach((name) =>
      adminApi[name].mockResolvedValue({ success: true, data: {} })
    );
  });

  describe('queue', () => {
    it('shows the stat strip, without the average resolution time, and the counts on the status tabs', async () => {
      await renderPage();

      expect(await screen.findByText('Quá hạn SLA')).toBeInTheDocument();
      expect(screen.queryByText('Thời gian xử lý trung bình')).not.toBeInTheDocument();

      const tab = screen.getByRole('button', { name: /Bác bỏ/ });
      expect(within(tab).getByText('1')).toBeInTheDocument();
    });

    it('shows reporter, reported user, severity and the overdue tag, with no assignee column', async () => {
      await renderPage();

      expect(screen.getByText('Mẹ Lan')).toBeInTheDocument();
      expect(screen.queryByText('Phụ trách')).not.toBeInTheDocument();
      expect(screen.queryByText('Thời gian tạo')).not.toBeInTheDocument();
      expect(screen.queryByText('admin@buddylink.vn')).not.toBeInTheDocument();
      expect(screen.getByText('Khẩn cấp')).toHaveClass('bg-error-soft', 'text-error-dark');
      expect(screen.getByText('Quá hạn')).toBeInTheDocument();
      const statusChip = screen.getAllByText('Đang xem xét').find((element) => element.className.includes('rounded-full'));
      expect(statusChip).toHaveClass('bg-surface-container');
    });

    it('shows a readable message when the list fails to load instead of crashing', async () => {
      adminApi.getReports.mockRejectedValue({ message: 'boom', error: { code: 'INTERNAL_ERROR' } });

      renderWithProviders(<AdminReportsPage />, { route: '/admin/reports' });

      expect(await screen.findByText('Không tải được danh sách báo cáo')).toBeInTheDocument();
    });

    it('labels a row with no severity, category or target instead of leaving the cells empty', async () => {
      adminApi.getReports.mockResolvedValue({
        success: true,
        data: {
          items: [{ ...listRow, severity: null, category: null, targetType: null }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });

      await renderPage();

      expect(screen.getAllByText('Chưa phân loại')).toHaveLength(2);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('offers the three filters, no assignee filter, and the same export button as the other admin lists', async () => {
      await renderPage();

      [/Tất cả mức độ/, /Tất cả danh mục/, /Tất cả đối tượng/].forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /phụ trách/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Xuất Excel' })).toHaveAttribute('title', 'Xuất dữ liệu ra file Excel');
    });
  });

  describe('investigation drawer', () => {
    it('fetches the report every time it opens', async () => {
      await openDrawer();
      expect(adminApi.getReportDetail).toHaveBeenCalledTimes(1);

      const closeButtons = screen.getAllByRole('button', { name: /Đóng/ });
      fireEvent.click(closeButtons[0]);
      await waitFor(() => expect(screen.queryByText('Chi tiết báo cáo vi phạm')).not.toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết' }));
      await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledTimes(2));
    });

    it('reloads the open report, the list and the counts when a new report arrives', async () => {
      await openDrawer();
      const listCalls = adminApi.getReports.mock.calls.length;
      const statsCalls = adminApi.getReportStats.mock.calls.length;
      expect(adminApi.getReportDetail).toHaveBeenCalledTimes(1);

      // Other notifications change nothing here
      socketMock.handlers['admin:notification:new']({ entityType: 'Payment' });
      socketMock.handlers['admin:notification:new']({ entityType: 'Report', entityId: 'report-9' });

      await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledTimes(2));
      expect(adminApi.getReportDetail).toHaveBeenLastCalledWith('report-1');
      expect(adminApi.getReports.mock.calls.length).toBe(listCalls + 1);
      expect(adminApi.getReportStats.mock.calls.length).toBe(statsCalls + 1);
      // The drawer keeps its content while it reloads
      expect(screen.getByText('Chi tiết báo cáo vi phạm')).toBeInTheDocument();
    });

    describe('footer', () => {
      const footerOf = (name) => screen.getByRole('button', { name }).parentElement;
      const buttonsOf = (footer) => within(footer).getAllByRole('button').map((button) => button.textContent);

      it('holds dismiss and start on a pending report', async () => {
        await openDrawer(makeDetail({ status: 'pending', history: [] }));

        expect(buttonsOf(footerOf('Bắt đầu xử lý'))).toEqual(['Bác bỏ báo cáo', 'Bắt đầu xử lý']);
      });

      it('holds dismiss and conclude on a reviewing report, with no notes in the body', async () => {
        await openDrawer();

        expect(buttonsOf(footerOf('Kết luận & đóng báo cáo'))).toEqual(['Bác bỏ báo cáo', 'Kết luận & đóng báo cáo']);
        expect(screen.queryByLabelText(/Ghi chú xử lý/)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Tiếp quản vụ việc' })).not.toBeInTheDocument();
      });

      it('holds only reopen on a closed report', async () => {
        await openDrawer(
          makeDetail({ status: 'resolved', resolution: 'no_action', adminNotes: 'Không vi phạm rõ ràng', resolvedBy: ADMIN, resolvedAt: '2026-10-11T00:00:00.000Z' })
        );

        expect(buttonsOf(footerOf('Mở lại vụ việc'))).toEqual(['Mở lại vụ việc']);
      });

      it('closes the drawer from its header', async () => {
        await openDrawer();

        fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

        await waitFor(() => expect(screen.queryByText('Chi tiết báo cáo vi phạm')).not.toBeInTheDocument());
      });
    });

    it('does not show the database id of the report', async () => {
      await openDrawer();

      expect(screen.queryByText('#report-1')).not.toBeInTheDocument();
    });

    it('opens the evidence in a lightbox with back, next, a position and keyboard control', async () => {
      await openDrawer(makeDetail({ evidenceUrls: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'] }));

      fireEvent.click(screen.getByRole('button', { name: 'Xem bằng chứng 2' }));

      expect(screen.getByText('2/2')).toBeInTheDocument();
      expect(screen.getByAltText('Ảnh 2/2')).toHaveAttribute('src', 'https://cdn.example.com/2.png');

      fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }));
      expect(screen.getByText('1/2')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Ảnh trước' }));
      expect(screen.getByText('2/2')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByText('1/2')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('1/2')).not.toBeInTheDocument();
      expect(screen.getByText('Chi tiết báo cáo vi phạm')).toBeInTheDocument();
    });

    it('has no back or next with a single evidence image', async () => {
      await openDrawer();

      fireEvent.click(screen.getByRole('button', { name: 'Xem bằng chứng 1' }));

      expect(screen.getByText('1/1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ảnh tiếp theo' })).not.toBeInTheDocument();
    });

    it('keeps the account status of the reported user in the card', async () => {
      await openDrawer();

      const accountChip = screen.getByText('Hoạt động');
      expect(within(accountChip.parentElement).getByText('1 lần cảnh cáo')).toBeInTheDocument();
      expect(within(accountChip.parentElement).queryByText('Bố Hùng')).not.toBeInTheDocument();
    });

    it('shows the reported message highlighted among the chat excerpt', async () => {
      await openDrawer();

      const reported = screen.getByTestId('reported-message');
      expect(within(reported).getByText('Nhà ở đâu vậy?')).toBeInTheDocument();
      expect(reported).toHaveClass('bg-error-soft');
      expect(screen.getByText('Chào anh')).toBeInTheDocument();
    });

    it('shows a playdate card with its host and participants', async () => {
      await openDrawer(makeDetail({ targetType: 'playdate', targetContext: playdateContext }));

      expect(screen.getByText('Picnic công viên')).toBeInTheDocument();
      expect(screen.getByText(/Công viên APEC/)).toBeInTheDocument();
      expect(screen.getByText(/Bé Na/)).toBeInTheDocument();
      expect(screen.getByText(/Bé Bơ/)).toBeInTheDocument();
    });

    it('says when the reported target no longer exists', async () => {
      await openDrawer(makeDetail({ targetContext: null }));

      expect(screen.getByText('Đối tượng bị báo cáo không còn tồn tại.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Xóa tin nhắn' })).toBeDisabled();
    });

    it('shows the timeline of past reports and sanctions of the reported user', async () => {
      await openDrawer(
        makeDetail({
          reportedUser: {
            ...reportedUser,
            pastReports: [{ id: 'old', category: 'spam', severity: 'low', status: 'resolved', createdAt: '2026-09-01T00:00:00.000Z' }],
            previousSanctions: [{ reportId: 'old', type: 'warn', params: {}, performedAt: '2026-09-02T00:00:00.000Z', note: 'Lần đầu' }],
          },
        })
      );

      expect(screen.getByText(/Báo cáo: Tin rác/)).toBeInTheDocument();
      expect(screen.getByText(/Chế tài: Cảnh cáo tài khoản/)).toBeInTheDocument();
    });

    it('shows who did what in the log', async () => {
      await openDrawer();

      expect(screen.getByText('Tiếp nhận xử lý vụ việc')).toBeInTheDocument();
      expect(screen.getAllByText('admin@buddylink.vn').length).toBeGreaterThan(1);
    });

    describe('action buttons by target type', () => {
      it('message report: delete message, no cancel playdate', async () => {
        await openDrawer();
        expect(screen.getByRole('button', { name: 'Xóa tin nhắn' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'Hủy cuộc hẹn' })).not.toBeInTheDocument();
      });

      it('playdate report: cancel playdate, no delete message', async () => {
        await openDrawer(makeDetail({ targetType: 'playdate', targetContext: playdateContext }));
        expect(screen.getByRole('button', { name: 'Hủy cuộc hẹn' })).toBeEnabled();
        expect(screen.queryByRole('button', { name: 'Xóa tin nhắn' })).not.toBeInTheDocument();
      });

      it('user report: neither of them', async () => {
        await openDrawer(makeDetail({ targetType: 'user', targetContext: { type: 'user', childrenCount: 1 } }));
        expect(screen.queryByRole('button', { name: 'Xóa tin nhắn' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Hủy cuộc hẹn' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cảnh cáo' })).toBeEnabled();
      });
    });

    describe('invalid states', () => {
      it('disables deleting a message that is already deleted', async () => {
        await openDrawer(
          makeDetail({
            targetContext: { ...messageContext, reportedMessage: { ...messageContext.reportedMessage, isDeleted: true } },
          })
        );
        expect(screen.getByRole('button', { name: 'Xóa tin nhắn' })).toBeDisabled();
      });

      it('disables suspending a locked account and banning a banned one', async () => {
        await openDrawer(makeDetail({ reportedUser: { ...reportedUser, isActive: false, isBanned: true } }));
        expect(screen.getByRole('button', { name: 'Tạm đình chỉ' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Đã khóa vĩnh viễn' })).toBeDisabled();
      });

      it('a pending report can be started or dismissed, not sanctioned or resolved', async () => {
        await openDrawer(makeDetail({ status: 'pending', history: [] }));

        expect(screen.getByRole('button', { name: 'Bắt đầu xử lý' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Bác bỏ báo cáo' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cảnh cáo' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Kết luận & đóng báo cáo' })).not.toBeInTheDocument();
      });

      it('a closed report is read-only until reopened', async () => {
        await openDrawer(
          makeDetail({ status: 'resolved', resolution: 'no_action', adminNotes: 'Không vi phạm rõ ràng', resolvedBy: ADMIN, resolvedAt: '2026-10-11T00:00:00.000Z' })
        );

        expect(screen.queryByRole('button', { name: 'Cảnh cáo' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Bác bỏ báo cáo' })).not.toBeInTheDocument();
        expect(screen.getByText('Không vi phạm rõ ràng')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mở lại vụ việc' })).toBeInTheDocument();
      });
    });

    describe('sanction confirm flow', () => {
      it('says what will happen, then applies it, shows a toast and refreshes', async () => {
        await openDrawer();
        adminApi.getReports.mockClear();
        adminApi.getReportDetail.mockClear();
        adminApi.getReportStats.mockClear();

        fireEvent.click(screen.getByRole('button', { name: 'Xóa tin nhắn' }));

        expect(await screen.findByText('Xác nhận xóa tin nhắn vi phạm')).toBeInTheDocument();
        expect(adminApi.applyReportAction).not.toHaveBeenCalled();

        fireEvent.click(await confirmDialog());

        await waitFor(() =>
          expect(adminApi.applyReportAction).toHaveBeenCalledWith(
            'report-1',
            expect.objectContaining({ type: 'delete_message', durationDays: null })
          )
        );
        await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('Đã thi hành chế tài.'));
        await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledWith('report-1'));
        expect(adminApi.getReports).toHaveBeenCalled();
        expect(adminApi.getReportStats).toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByText('Xác nhận xóa tin nhắn vi phạm')).not.toBeInTheDocument());
      });

      it('sends the chosen suspension length', async () => {
        await openDrawer();

        fireEvent.change(screen.getByLabelText('Thời hạn đình chỉ'), { target: { value: '30' } });
        fireEvent.click(screen.getByRole('button', { name: 'Tạm đình chỉ' }));
        expect(await screen.findByText('Xác nhận tạm đình chỉ tài khoản 30 ngày')).toBeInTheDocument();

        fireEvent.click(await confirmDialog());

        await waitFor(() =>
          expect(adminApi.applyReportAction).toHaveBeenCalledWith(
            'report-1',
            expect.objectContaining({ type: 'suspend', durationDays: 30 })
          )
        );
      });

      it('shows the mapped Vietnamese message when the API refuses', async () => {
        adminApi.applyReportAction.mockRejectedValue({ message: 'dup', error: { code: 'ACTION_ALREADY_APPLIED' } });
        await openDrawer();

        fireEvent.click(screen.getByRole('button', { name: 'Cảnh cáo' }));
        fireEvent.click(await confirmDialog());

        await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('Chế tài này đã được áp dụng trước đó.'));
      });
    });

    describe('closing a report', () => {
      const NOTES = 'Đã xác minh nội dung báo cáo.';
      const banned = {
        id: 'x1',
        type: 'ban',
        params: {},
        performedBy: ADMIN,
        performedAt: '2026-10-10T05:00:00.000Z',
        note: '',
      };
      const relatedOpenReports = [
        { id: 'report-2', category: 'spam', severity: 'low', createdAt: '2026-10-01T00:00:00.000Z', reporterName: 'Mẹ An' },
      ];
      const askConclusion = async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Kết luận & đóng báo cáo' }));
        return screen.findByRole('dialog', { name: 'Kết luận và đóng báo cáo' });
      };

      it('needs notes of at least 10 characters', async () => {
        await openDrawer();
        const dialog = await askConclusion();

        fireEvent.change(within(dialog).getByLabelText(/Ghi chú xử lý/), { target: { value: 'Ngắn' } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng báo cáo' }));

        expect(await within(dialog).findByText('Ghi chú xử lý phải có tối thiểu 10 ký tự.')).toBeInTheDocument();
        expect(adminApi.resolveReport).not.toHaveBeenCalled();
      });

      it('resolves without action when nothing was applied: the sanctioned outcome is locked', async () => {
        await openDrawer();
        const dialog = await askConclusion();

        expect(within(dialog).getByRole('radio', { name: /đã xử lý bằng chế tài/ })).toBeDisabled();
        expect(within(dialog).getByRole('radio', { name: /không kỷ luật/ })).toHaveAttribute('aria-checked', 'true');

        fireEvent.change(within(dialog).getByLabelText(/Ghi chú xử lý/), { target: { value: NOTES } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng báo cáo' }));

        await waitFor(() =>
          expect(adminApi.resolveReport).toHaveBeenCalledWith('report-1', {
            status: 'resolved',
            resolution: 'no_action',
            adminNotes: NOTES,
          })
        );
      });

      it('prefills the notes with the AI draft', async () => {
        await openDrawer(
          makeDetail({ sentinelAssessment: { assessedAt: '2026-10-10T03:00:00.000Z', confidenceScore: 90, verdict: 'violation', draftNotes: { adminNote: 'Bản nháp của AI cho admin' } } })
        );
        const dialog = await askConclusion();

        expect(within(dialog).getByLabelText(/Ghi chú xử lý/)).toHaveValue('Bản nháp của AI cho admin');
      });

      it('dismisses a pending report with its reason', async () => {
        await openDrawer(makeDetail({ status: 'pending', history: [] }));

        fireEvent.click(screen.getByRole('button', { name: 'Bác bỏ báo cáo' }));
        const dialog = await screen.findByRole('dialog', { name: 'Bác bỏ báo cáo' });
        fireEvent.change(within(dialog).getByLabelText(/Lý do bác bỏ/), { target: { value: NOTES } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận bác bỏ' }));

        await waitFor(() =>
          expect(adminApi.resolveReport).toHaveBeenCalledWith('report-1', {
            status: 'dismissed',
            resolution: 'dismissed',
            adminNotes: NOTES,
          })
        );
      });

      it('keeps the drawer open and refreshes it after closing', async () => {
        await openDrawer();
        adminApi.getReportDetail.mockClear();
        const dialog = await askConclusion();

        fireEvent.change(within(dialog).getByLabelText(/Ghi chú xử lý/), { target: { value: NOTES } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng báo cáo' }));

        await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledWith('report-1'));
        expect(screen.getByText('Chi tiết báo cáo vi phạm')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Kết luận và đóng báo cáo' })).not.toBeInTheDocument());
      });

      it('closes related reports with a resolution that has a suspension or a ban', async () => {
        await openDrawer(makeDetail({ relatedOpenReports, actions: [banned] }));
        const dialog = await askConclusion();

        expect(within(dialog).getByRole('radio', { name: /đã xử lý bằng chế tài/ })).toHaveAttribute('aria-checked', 'true');
        fireEvent.click(within(dialog).getByLabelText(/Tin rác/));
        fireEvent.change(within(dialog).getByLabelText(/Ghi chú xử lý/), { target: { value: NOTES } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng báo cáo' }));

        await waitFor(() =>
          expect(adminApi.resolveReport).toHaveBeenCalledWith('report-1', {
            status: 'resolved',
            resolution: 'action_taken',
            adminNotes: NOTES,
            applyToRelatedReportIds: ['report-2'],
          })
        );
      });

      it('locks the outcome to the sanctions: no "no sanction" once one was applied, and no dismissal', async () => {
        await openDrawer(makeDetail({ actions: [banned] }));

        expect(screen.getByRole('button', { name: 'Bác bỏ báo cáo' })).toBeDisabled();
        const dialog = await askConclusion();
        expect(within(dialog).getByRole('radio', { name: /không kỷ luật/ })).toBeDisabled();
        expect(within(dialog).getByRole('radio', { name: /đã xử lý bằng chế tài/ })).toHaveAttribute('aria-checked', 'true');
        expect(within(dialog).getByText(/không thể kết luận là không kỷ luật/)).toBeInTheDocument();
      });

      it('does not count a provisional Auto-Shield action as a sanction', async () => {
        await openDrawer(makeDetail({ actions: [{ ...banned, type: 'suspend', isProvisional: true }] }));

        expect(screen.getByRole('button', { name: 'Bác bỏ báo cáo' })).toBeEnabled();
        const dialog = await askConclusion();
        expect(within(dialog).getByRole('radio', { name: /đã xử lý bằng chế tài/ })).toBeDisabled();
        expect(within(dialog).getByRole('radio', { name: /không kỷ luật/ })).toHaveAttribute('aria-checked', 'true');
      });

      it('puts the AI draft in the dismissal when the AI found no violation', async () => {
        const sentinelAssessment = {
          assessedAt: '2026-10-10T03:00:00.000Z',
          confidenceScore: 90,
          verdict: 'no_violation',
          draftNotes: { adminNote: 'Báo cáo không hợp lệ, hai bên hiểu nhầm' },
        };
        await openDrawer(makeDetail({ sentinelAssessment }));

        const resolveDialog = await askConclusion();
        expect(within(resolveDialog).getByLabelText(/Ghi chú xử lý/)).toHaveValue('');
        fireEvent.click(within(resolveDialog).getByRole('button', { name: 'Hủy' }));

        fireEvent.click(screen.getByRole('button', { name: 'Bác bỏ báo cáo' }));
        const dismissDialog = await screen.findByRole('dialog', { name: 'Bác bỏ báo cáo' });
        expect(within(dismissDialog).getByLabelText(/Lý do bác bỏ/)).toHaveValue('Báo cáo không hợp lệ, hai bên hiểu nhầm');
      });

      it('disables the related reports before any account sanction', async () => {
        await openDrawer(makeDetail({ relatedOpenReports }));
        const dialog = await askConclusion();

        expect(within(dialog).getByLabelText(/Tin rác/)).toBeDisabled();
      });

      it('lists the related reports in the body without choosing them there', async () => {
        await openDrawer(makeDetail({ relatedOpenReports, actions: [banned] }));

        expect(screen.getByText('Báo cáo mở liên quan (1)')).toBeInTheDocument();
        expect(screen.queryByLabelText(/Tin rác/)).not.toBeInTheDocument();
      });
    });

    it('reopens a closed report with a reason', async () => {
      await openDrawer(
        makeDetail({ status: 'dismissed', resolution: 'dismissed', adminNotes: 'Báo cáo trùng lặp', resolvedBy: ADMIN, resolvedAt: '2026-10-11T00:00:00.000Z' })
      );

      fireEvent.click(screen.getByRole('button', { name: 'Mở lại vụ việc' }));
      const reason = await screen.findByLabelText(/Lý do mở lại/);

      fireEvent.change(reason, { target: { value: 'Ngắn' } });
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mở lại' }));
      expect(await screen.findByText('Lý do mở lại phải có tối thiểu 10 ký tự.')).toBeInTheDocument();
      expect(adminApi.reopenReport).not.toHaveBeenCalled();

      fireEvent.change(reason, { target: { value: 'Có bằng chứng mới từ người báo cáo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận mở lại' }));

      await waitFor(() =>
        expect(adminApi.reopenReport).toHaveBeenCalledWith('report-1', { note: 'Có bằng chứng mới từ người báo cáo' })
      );
    });

    it('starts the review of a pending report', async () => {
      await openDrawer(makeDetail({ status: 'pending', history: [] }));

      fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu xử lý' }));

      await waitFor(() => expect(adminApi.reviewReport).toHaveBeenCalledWith('report-1', { action: 'claim' }));
      await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('Đã tiếp nhận xử lý báo cáo.'));
    });

    it('changes the severity while reviewing', async () => {
      await openDrawer();

      fireEvent.click(screen.getByRole('button', { name: 'Thay đổi' }));
      fireEvent.change(screen.getByLabelText('Mức độ nghiêm trọng'), { target: { value: 'low' } });
      fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));

      await waitFor(() => expect(adminApi.updateReportSeverity).toHaveBeenCalledWith('report-1', { severity: 'low' }));
    });
  });
});
