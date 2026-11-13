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
    updateReportSeverity: vi.fn(),
    decideReport: vi.fn(),
    reopenReport: vi.fn(),
  },
}));

const ADMIN = { id: 'a1', fullName: 'admin@buddylink.vn', email: 'admin@buddylink.vn' };
const reporter = { id: 'p1', fullName: 'Mẹ Lan', email: 'lan@example.com', phone: '', avatarUrl: '' };
const secondReporter = { id: 'p3', fullName: 'Mẹ An', email: 'an@example.com', phone: '', avatarUrl: '' };
const reportedUser = {
  id: 'p2',
  fullName: 'Bố Hùng',
  email: 'hung@example.com',
  phone: '',
  avatarUrl: '',
  strikeCount: 4,
  priorViolationCount: 1,
  isActive: true,
  isBanned: false,
  suspensionUntil: null,
  pastReports: [],
  previousSanctions: [],
};

// One row of the queue: a case reported by three parents
const listRow = {
  id: 'report-1',
  category: 'child_safety',
  severity: 'critical',
  targetType: 'message',
  status: 'pending',
  reason: 'Hỏi địa chỉ nhà của bé',
  reporter,
  reportedUser: { ...reportedUser, isLocked: false },
  reportCount: 3,
  reporterCount: 3,
  reporterNames: ['Mẹ Lan', 'Mẹ An', 'Bố Tú'],
  firstReportedAt: '2026-10-10T03:00:00.000Z',
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

const caseReports = [
  {
    id: 'report-1',
    reporter,
    reason: 'Hỏi địa chỉ nhà của bé',
    description: 'Hỏi địa chỉ nhà nhiều lần',
    evidenceUrls: ['https://cdn.example.com/1.png'],
    status: 'pending',
    createdAt: '2026-10-10T03:00:00.000Z',
  },
  {
    id: 'report-2',
    reporter: secondReporter,
    reason: 'Nhắn tin làm phiền',
    description: '',
    evidenceUrls: [],
    status: 'pending',
    createdAt: '2026-10-10T05:00:00.000Z',
  },
];

// Sanction matrix of the case: what the decision dialog preselects without an AI recommendation
const policyGuidance = {
  clause: 'Điều 2.1',
  strikeCount: 2,
  standardActions: [{ type: 'delete_message' }, { type: 'warn' }],
  allowedActionTypes: ['delete_message', 'warn'],
};

const makeDetail = (overrides = {}) => ({
  ...listRow,
  description: 'Hỏi địa chỉ nhà nhiều lần',
  evidenceUrls: ['https://cdn.example.com/1.png'],
  reporter,
  reportedUser,
  caseReports,
  reportCount: 2,
  reporterCount: 2,
  otherOpenCases: [],
  targetContext: messageContext,
  policyGuidance,
  isPolicyEnforced: false,
  actions: [],
  history: [
    { id: 'h1', eventType: 'severity_change', fromStatus: 'pending', toStatus: 'pending', by: ADMIN, at: '2026-10-10T04:00:00.000Z', note: 'Đổi mức độ từ high sang critical' },
  ],
  resolution: null,
  adminNotes: '',
  resolvedBy: null,
  resolvedAt: null,
  ...overrides,
});

const closedDetail = (overrides = {}) =>
  makeDetail({
    status: 'resolved',
    resolution: 'no_action',
    adminNotes: 'Đã nhắc nhở hai bên',
    resolvedBy: ADMIN,
    resolvedAt: '2026-10-11T00:00:00.000Z',
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

const NOTES = 'Đã xác minh nội dung báo cáo.';

const respondDetail = (detail) => adminApi.getReportDetail.mockResolvedValue({ success: true, data: detail });

const renderPage = async () => {
  renderWithProviders(<AdminReportsPage />, { route: '/admin/reports' });
  await screen.findByText('Bố Hùng');
};

const openDrawer = async (detail = makeDetail()) => {
  respondDetail(detail);
  await renderPage();
  fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết' }));
  await screen.findByText('Chi tiết vụ việc');
  return screen.findByText(/^Các báo cáo \(/);
};

const askViolation = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Có vi phạm — xử lý' }));
  return screen.findByRole('dialog', { name: 'Có vi phạm — xử lý vụ việc' });
};

const askDismissal = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Không vi phạm — bác bỏ' }));
  return screen.findByRole('dialog', { name: 'Không vi phạm — bác bỏ vụ việc' });
};

const sanctionOf = (dialog, name) => within(dialog).getByLabelText(name);
const fillNotes = (dialog, value = NOTES) =>
  fireEvent.change(within(dialog).getByLabelText(/Ghi chú xử lý|Lý do bác bỏ/), { target: { value } });
const confirm = (dialog) => fireEvent.click(within(dialog).getByRole('button', { name: /Xác nhận/ }));

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
        pending: 5,
        reviewing: 0,
        resolved: 3,
        dismissed: 1,
        overdue: 4,
        resolvedThisWeek: 1,
        avgResolutionHours: 5.5,
        bySeverity: {},
      },
    });
    ['updateReportSeverity', 'decideReport', 'reopenReport'].forEach((name) =>
      adminApi[name].mockResolvedValue({ success: true, data: {} })
    );
  });

  describe('queue', () => {
    it('shows the stat strip and the status tabs, with no reviewing step', async () => {
      await renderPage();

      expect(await screen.findByText('Quá hạn SLA')).toBeInTheDocument();
      expect(screen.queryByText('Thời gian xử lý trung bình')).not.toBeInTheDocument();
      expect(screen.queryByText('Chờ tiếp nhận')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Đang xem xét/ })).not.toBeInTheDocument();

      const tab = screen.getByRole('button', { name: /Bác bỏ/ });
      expect(within(tab).getByText('1')).toBeInTheDocument();
    });

    it('shows one row per case: what was reported, the reported parent and how many parents reported it', async () => {
      await renderPage();

      expect(screen.getByText('Mẹ Lan và 2 người khác')).toBeInTheDocument();
      expect(screen.getByText(/Hỏi địa chỉ nhà của bé/)).toBeInTheDocument();
      expect(screen.queryByText('Phụ trách')).not.toBeInTheDocument();
      expect(screen.queryByText('admin@buddylink.vn')).not.toBeInTheDocument();
      expect(screen.queryByText(/lần cảnh cáo/)).not.toBeInTheDocument();
      expect(screen.getByText('Khẩn cấp')).toHaveClass('bg-error-soft', 'text-error-dark');
      expect(screen.getByText('Quá hạn')).toBeInTheDocument();
      const statusChip = screen.getAllByText('Chờ xử lý').find((element) => element.className.includes('rounded-full'));
      expect(statusChip).toBeTruthy();
    });

    it('names a single reporter alone', async () => {
      adminApi.getReports.mockResolvedValue({
        success: true,
        data: {
          items: [{ ...listRow, reportCount: 1, reporterCount: 1, reporterNames: ['Mẹ Lan'] }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });

      await renderPage();

      expect(screen.getByText('Mẹ Lan')).toBeInTheDocument();
      expect(screen.queryByText(/người khác/)).not.toBeInTheDocument();
    });

    it('shows what the AI concluded, not a bare confidence score', async () => {
      adminApi.getReports.mockResolvedValue({
        success: true,
        data: {
          items: [{ ...listRow, sentinelAssessment: { verdict: 'no_violation', confidenceScore: 85, summary: 'Hiểu nhầm' } }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });

      await renderPage();

      expect(screen.getByText('AI kết luận: Không vi phạm')).toBeInTheDocument();
      expect(screen.queryByText(/AI: 85%/)).not.toBeInTheDocument();
    });

    it('shows a readable message when the list fails to load instead of crashing', async () => {
      adminApi.getReports.mockRejectedValue({ message: 'boom', error: { code: 'INTERNAL_ERROR' } });

      renderWithProviders(<AdminReportsPage />, { route: '/admin/reports' });

      expect(await screen.findByText('Không tải được danh sách vụ việc')).toBeInTheDocument();
    });

    it('labels a row with no severity, category or target instead of leaving the cells empty', async () => {
      adminApi.getReports.mockResolvedValue({
        success: true,
        data: {
          items: [{ ...listRow, severity: null, category: null, targetType: null, reason: '' }],
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
    it('fetches the case every time it opens', async () => {
      await openDrawer();
      expect(adminApi.getReportDetail).toHaveBeenCalledTimes(1);

      const closeButtons = screen.getAllByRole('button', { name: /Đóng/ });
      fireEvent.click(closeButtons[0]);
      await waitFor(() => expect(screen.queryByText('Chi tiết vụ việc')).not.toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Xem chi tiết' }));
      await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledTimes(2));
    });

    it('reloads the open case, the list and the counts when a new report arrives', async () => {
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
      expect(screen.getByText('Chi tiết vụ việc')).toBeInTheDocument();
    });

    it('shows the evidence first and the AI suggestion after it', async () => {
      await openDrawer();

      const titles = ['Nội dung bị báo cáo', 'Các báo cáo (2)', 'Người bị báo cáo', 'Gợi ý của AI'].map((title) =>
        screen.getByRole('heading', { name: title })
      );
      titles.slice(1).forEach((heading, index) => {
        expect(titles[index].compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      });
    });

    it('summarises the case in its header, with no assignee', async () => {
      await openDrawer();

      expect(screen.getByText(/2 người báo cáo · từ/)).toBeInTheDocument();
      expect(screen.queryByText(/Phụ trách/)).not.toBeInTheDocument();
    });

    describe('footer', () => {
      const footerOf = (name) => screen.getByRole('button', { name }).parentElement;
      const buttonsOf = (footer) => within(footer).getAllByRole('button').map((button) => button.textContent);

      it('holds the two decisions on an open case, with no claim step', async () => {
        await openDrawer();

        expect(buttonsOf(footerOf('Có vi phạm — xử lý'))).toEqual(['Không vi phạm — bác bỏ', 'Có vi phạm — xử lý']);
        expect(screen.queryByRole('button', { name: 'Bắt đầu xử lý' })).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Ghi chú xử lý/)).not.toBeInTheDocument();
      });

      it('holds only reopen on a closed case, which shows its conclusion', async () => {
        await openDrawer(closedDetail());

        expect(buttonsOf(footerOf('Mở lại vụ việc'))).toEqual(['Mở lại vụ việc']);
        expect(screen.getByText('Đã nhắc nhở hai bên')).toBeInTheDocument();
        expect(screen.getByText('Có vi phạm nhưng không kỷ luật')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Thay đổi' })).not.toBeInTheDocument();
      });

      it('closes the drawer from its header', async () => {
        await openDrawer();

        fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));

        await waitFor(() => expect(screen.queryByText('Chi tiết vụ việc')).not.toBeInTheDocument());
      });
    });

    it('does not show the database id of the report', async () => {
      await openDrawer();

      expect(screen.queryByText(/report-1/)).not.toBeInTheDocument();
    });

    it('lists what every parent of the case reported', async () => {
      await openDrawer();

      const section = screen.getByRole('heading', { name: 'Các báo cáo (2)' }).closest('section');
      expect(within(section).getByText('Mẹ Lan')).toBeInTheDocument();
      expect(within(section).getByText('Mẹ An')).toBeInTheDocument();
      expect(within(section).getByText('Hỏi địa chỉ nhà nhiều lần')).toBeInTheDocument();
      expect(within(section).getByText('Nhắn tin làm phiền')).toBeInTheDocument();
    });

    it('opens the evidence of a report in a lightbox with back, next, a position and keyboard control', async () => {
      await openDrawer(
        makeDetail({
          caseReports: [
            { ...caseReports[0], evidenceUrls: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'] },
            caseReports[1],
          ],
        })
      );

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
      expect(screen.getByText('Chi tiết vụ việc')).toBeInTheDocument();
    });

    it('has no back or next with a single evidence image', async () => {
      await openDrawer();

      fireEvent.click(screen.getByRole('button', { name: 'Xem bằng chứng 1' }));

      expect(screen.getByText('1/1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ảnh tiếp theo' })).not.toBeInTheDocument();
    });

    it('shows the account state and the sanctioned violations of the reported parent, not a warning count', async () => {
      await openDrawer(
        makeDetail({ otherOpenCases: [{ id: 'report-7', targetType: 'user', category: 'spam', severity: 'low', reportCount: 1, reporterCount: 1 }] })
      );

      const section = screen.getByRole('heading', { name: 'Người bị báo cáo' }).closest('section');
      expect(within(section).getByText('Hoạt động')).toBeInTheDocument();
      expect(within(section).getByText('Đã vi phạm 1 lần')).toBeInTheDocument();
      expect(within(section).getByText('1 vụ khác đang mở')).toBeInTheDocument();
      expect(screen.queryByText(/lần cảnh cáo/)).not.toBeInTheDocument();
    });

    it('keeps the history of the reported parent folded until asked for', async () => {
      await openDrawer(
        makeDetail({
          reportedUser: {
            ...reportedUser,
            pastReports: [{ id: 'old', category: 'spam', severity: 'low', status: 'resolved', createdAt: '2026-09-01T00:00:00.000Z' }],
            previousSanctions: [{ reportId: 'old', type: 'warn', params: {}, performedAt: '2026-09-02T00:00:00.000Z', note: 'Lần đầu' }],
          },
        })
      );

      expect(screen.queryByText(/Báo cáo: Tin rác/)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Lịch sử báo cáo và chế tài (2)' }));

      expect(screen.getByText(/Báo cáo: Tin rác/)).toBeInTheDocument();
      expect(screen.getByText(/Chế tài: Cảnh cáo tài khoản/)).toBeInTheDocument();
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
    });

    it('keeps the log folded, then shows who did what', async () => {
      await openDrawer();

      expect(screen.queryByText('Đổi mức độ từ high sang critical')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Nhật ký xử lý (1)' }));

      expect(screen.getByText('Đổi mức độ từ high sang critical')).toBeInTheDocument();
      expect(screen.getAllByText('admin@buddylink.vn').length).toBeGreaterThan(0);
    });

    it('changes the severity of an open case', async () => {
      await openDrawer();

      fireEvent.click(screen.getByRole('button', { name: 'Thay đổi' }));
      fireEvent.change(screen.getByLabelText('Mức độ'), { target: { value: 'low' } });
      fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));

      await waitFor(() => expect(adminApi.updateReportSeverity).toHaveBeenCalledWith('report-1', { severity: 'low' }));
    });

    describe('deciding a violation', () => {
      const REPORTER_DEFAULT =
        'Báo cáo của bạn đã được xử lý theo Quy chuẩn Cộng đồng BuddyLink. Cảm ơn bạn đã chung tay bảo vệ an toàn cho các bé.';

      it('preselects the heaviest sanction of the matrix, says what will happen, then closes the case in one step', async () => {
        await openDrawer();
        adminApi.getReports.mockClear();
        adminApi.getReportDetail.mockClear();
        adminApi.getReportStats.mockClear();
        const dialog = await askViolation();

        expect(sanctionOf(dialog, /Cảnh cáo tài khoản/)).toBeChecked();
        expect(sanctionOf(dialog, /Xóa tin nhắn vi phạm/)).not.toBeChecked();
        expect(within(dialog).getByText(/Điều 2.1/)).toBeInTheDocument();
        expect(within(dialog).getByText(/áp dụng cảnh cáo tài khoản, đóng 2 báo cáo/)).toBeInTheDocument();
        expect(adminApi.decideReport).not.toHaveBeenCalled();

        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith('report-1', {
            outcome: 'violation',
            sanctions: [{ type: 'warn' }],
            notes: NOTES,
            reporterNotice: REPORTER_DEFAULT,
          })
        );
        await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('Đã xử lý và đóng vụ việc.'));
        await waitFor(() => expect(adminApi.getReportDetail).toHaveBeenCalledWith('report-1'));
        expect(adminApi.getReports).toHaveBeenCalled();
        expect(adminApi.getReportStats).toHaveBeenCalled();
        // The drawer stays open on the closed case
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Có vi phạm — xử lý vụ việc' })).not.toBeInTheDocument());
        expect(screen.getByText('Chi tiết vụ việc')).toBeInTheDocument();
      });

      it('allows a single form of sanction', async () => {
        await openDrawer();
        const dialog = await askViolation();

        fireEvent.click(sanctionOf(dialog, /Xóa tin nhắn vi phạm/));

        expect(sanctionOf(dialog, /Xóa tin nhắn vi phạm/)).toBeChecked();
        expect(sanctionOf(dialog, /Cảnh cáo tài khoản/)).not.toBeChecked();
        expect(within(dialog).getAllByRole('radio').filter((radio) => radio.checked)).toHaveLength(1);
      });

      it('keeps one height whatever is chosen', async () => {
        await openDrawer();
        const dialog = await askViolation();

        expect(dialog).toHaveClass('h-decision-modal');
        fireEvent.click(sanctionOf(dialog, /Tạm đình chỉ có thời hạn/));
        expect(dialog).toHaveClass('h-decision-modal');
      });

      it('preselects the AI recommendation and fills in the notices and notes it wrote when it found a violation', async () => {
        await openDrawer(
          makeDetail({
            sentinelAssessment: {
              assessedAt: '2026-10-10T03:00:00.000Z',
              confidenceScore: 90,
              verdict: 'violation',
              recommendedSanctions: [{ type: 'suspend', durationDays: 5 }],
              draftNotes: {
                adminNote: 'Bản nháp của AI cho admin',
                reportedUserNotice: 'Tài khoản của bạn bị đình chỉ 5 ngày vì đã hỏi địa chỉ nhà của bé.',
                reporterFeedback: 'Cảm ơn bạn, chúng tôi đã đình chỉ tài khoản vi phạm.',
              },
            },
          })
        );
        const dialog = await askViolation();

        expect(sanctionOf(dialog, /Tạm đình chỉ có thời hạn/)).toBeChecked();
        expect(within(dialog).getByLabelText('Thời hạn đình chỉ')).toHaveValue('5');
        expect(within(dialog).getByLabelText(/Ghi chú xử lý/)).toHaveValue('Bản nháp của AI cho admin');
        expect(within(dialog).getByLabelText('Gửi người bị báo cáo')).toHaveValue(
          'Tài khoản của bạn bị đình chỉ 5 ngày vì đã hỏi địa chỉ nhà của bé.'
        );
        expect(within(dialog).getByLabelText('Gửi người báo cáo')).toHaveValue('Cảm ơn bạn, chúng tôi đã đình chỉ tài khoản vi phạm.');

        fireEvent.change(within(dialog).getByLabelText('Gửi người báo cáo'), { target: { value: 'Cảm ơn bạn đã báo cáo.' } });
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith('report-1', {
            outcome: 'violation',
            sanctions: [{ type: 'suspend', durationDays: 5 }],
            notes: 'Bản nháp của AI cho admin',
            reportedUserNotice: 'Tài khoản của bạn bị đình chỉ 5 ngày vì đã hỏi địa chỉ nhà của bé.',
            reporterNotice: 'Cảm ơn bạn đã báo cáo.',
          })
        );
      });

      it('does not use the AI texts when the decision differs from its conclusion', async () => {
        await openDrawer(
          makeDetail({
            sentinelAssessment: {
              assessedAt: '2026-10-10T03:00:00.000Z',
              confidenceScore: 90,
              verdict: 'no_violation',
              draftNotes: { reportedUserNotice: 'Không có vi phạm', reporterFeedback: 'Báo cáo chưa đủ căn cứ' },
            },
          })
        );
        const dialog = await askViolation();

        expect(within(dialog).getByLabelText('Gửi người bị báo cáo')).toHaveValue('');
        expect(within(dialog).getByLabelText('Gửi người báo cáo')).toHaveValue(REPORTER_DEFAULT);
      });

      it('sends the chosen suspension length', async () => {
        await openDrawer();
        const dialog = await askViolation();

        fireEvent.click(sanctionOf(dialog, /Tạm đình chỉ có thời hạn/));
        fireEvent.change(within(dialog).getByLabelText('Thời hạn đình chỉ'), { target: { value: '30' } });
        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith(
            'report-1',
            expect.objectContaining({ sanctions: [{ type: 'suspend', durationDays: 30 }] })
          )
        );
      });

      it('closes a violation without discipline, with no notice to the reported parent', async () => {
        await openDrawer();
        const dialog = await askViolation();

        fireEvent.click(sanctionOf(dialog, /Không áp dụng hình phạt/));
        expect(within(dialog).getByLabelText('Gửi người bị báo cáo')).toBeDisabled();
        expect(within(dialog).getByText(/không áp dụng hình phạt, đóng 2 báo cáo/)).toBeInTheDocument();
        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith('report-1', {
            outcome: 'violation',
            sanctions: [],
            notes: NOTES,
            reporterNotice: REPORTER_DEFAULT,
          })
        );
      });

      it('needs notes of at least 10 characters', async () => {
        await openDrawer();
        const dialog = await askViolation();

        fillNotes(dialog, 'Ngắn');
        confirm(dialog);

        expect(await within(dialog).findByText('Ghi chú xử lý phải có tối thiểu 10 ký tự.')).toBeInTheDocument();
        expect(adminApi.decideReport).not.toHaveBeenCalled();
      });

      describe('sanctions offered by target', () => {
        it('message: delete message, no cancel playdate', async () => {
          await openDrawer();
          const dialog = await askViolation();

          expect(sanctionOf(dialog, /Xóa tin nhắn vi phạm/)).toBeEnabled();
          expect(within(dialog).queryByLabelText(/Hủy cuộc hẹn/)).not.toBeInTheDocument();
        });

        it('playdate: cancel playdate, no delete message', async () => {
          await openDrawer(makeDetail({ targetType: 'playdate', targetContext: playdateContext }));
          const dialog = await askViolation();

          expect(sanctionOf(dialog, /Hủy cuộc hẹn/)).toBeEnabled();
          expect(within(dialog).queryByLabelText(/Xóa tin nhắn vi phạm/)).not.toBeInTheDocument();
        });

        it('profile: neither of them', async () => {
          await openDrawer(makeDetail({ targetType: 'user', targetContext: { type: 'user', childrenCount: 1 } }));
          const dialog = await askViolation();

          expect(within(dialog).queryByLabelText(/Xóa tin nhắn vi phạm/)).not.toBeInTheDocument();
          expect(within(dialog).queryByLabelText(/Hủy cuộc hẹn/)).not.toBeInTheDocument();
          expect(sanctionOf(dialog, /Cảnh cáo tài khoản/)).toBeEnabled();
        });
      });

      it('locks a sanction that cannot run, with the reason', async () => {
        await openDrawer(
          makeDetail({
            targetContext: { ...messageContext, reportedMessage: { ...messageContext.reportedMessage, isDeleted: true } },
            reportedUser: { ...reportedUser, isActive: false, isBanned: true },
          })
        );
        const dialog = await askViolation();

        expect(sanctionOf(dialog, /Xóa tin nhắn vi phạm/)).toBeDisabled();
        expect(within(dialog).getByText('Tin nhắn đã được xóa')).toBeInTheDocument();
        expect(sanctionOf(dialog, /Tạm đình chỉ có thời hạn/)).toBeDisabled();
        expect(sanctionOf(dialog, /Khóa tài khoản vĩnh viễn/)).toBeDisabled();
        expect(sanctionOf(dialog, /Cảnh cáo tài khoản/)).toBeChecked();
      });

      it('asks for a reason of 20 characters before a sanction outside the matrix', async () => {
        await openDrawer(makeDetail({ isPolicyEnforced: true }));
        const dialog = await askViolation();

        expect(within(dialog).queryByText('Ngoại lệ')).not.toBeInTheDocument();
        fireEvent.click(sanctionOf(dialog, /Khóa tài khoản vĩnh viễn/));

        expect(within(dialog).getByText('Ngoại lệ')).toBeInTheDocument();
        const submit = within(dialog).getByRole('button', { name: 'Xác nhận xử lý' });
        expect(submit).toBeDisabled();

        const reason = 'Tái phạm nhiều lần dù đã được nhắc nhở';
        fireEvent.change(within(dialog).getByLabelText(/Lý do áp dụng ngoại lệ chính sách/), { target: { value: reason } });
        expect(submit).toBeEnabled();
        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith(
            'report-1',
            expect.objectContaining({ sanctions: [{ type: 'ban' }], isPolicyOverride: true, overrideReason: reason })
          )
        );
      });

      it('needs no override while the AI has not assessed the case', async () => {
        await openDrawer();
        const dialog = await askViolation();

        fireEvent.click(sanctionOf(dialog, /Khóa tài khoản vĩnh viễn/));

        expect(within(dialog).queryByText('Ngoại lệ')).not.toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Xác nhận xử lý' })).toBeEnabled();
      });

      it('closes other open cases of the same parent with it when chosen', async () => {
        await openDrawer(
          makeDetail({ otherOpenCases: [{ id: 'report-7', targetType: 'user', category: 'spam', severity: 'low', reportCount: 2, reporterCount: 2 }] })
        );
        const dialog = await askViolation();

        fireEvent.click(within(dialog).getByLabelText(/Tài khoản · Tin rác/));
        expect(within(dialog).getByText(/đóng 4 báo cáo/)).toBeInTheDocument();
        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith(
            'report-1',
            expect.objectContaining({ alsoCloseReportIds: ['report-7'] })
          )
        );
      });

      it('shows the mapped Vietnamese message when the API refuses, and keeps the dialog open', async () => {
        adminApi.decideReport.mockRejectedValue({ message: 'dup', error: { code: 'ACTION_ALREADY_APPLIED' } });
        await openDrawer();
        const dialog = await askViolation();

        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('Chế tài này đã được áp dụng trước đó.'));
        expect(screen.getByRole('dialog', { name: 'Có vi phạm — xử lý vụ việc' })).toBeInTheDocument();
      });
    });

    describe('dismissing a case', () => {
      it('dismisses every report of the case with its reason and the reporters notice', async () => {
        await openDrawer();
        const dialog = await askDismissal();

        expect(within(dialog).getByText(/bác bỏ 2 báo cáo của vụ việc/)).toBeInTheDocument();
        expect(within(dialog).queryByLabelText('Gửi người bị báo cáo')).not.toBeInTheDocument();
        fillNotes(dialog);
        confirm(dialog);

        await waitFor(() =>
          expect(adminApi.decideReport).toHaveBeenCalledWith('report-1', {
            outcome: 'no_violation',
            notes: NOTES,
            reporterNotice: 'Báo cáo của bạn đã được xem xét và lưu hồ sơ theo dõi.',
          })
        );
        await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('Đã bác bỏ vụ việc.'));
      });

      it('puts the AI drafts in the dismissal when the AI found no violation', async () => {
        const sentinelAssessment = {
          assessedAt: '2026-10-10T03:00:00.000Z',
          confidenceScore: 90,
          verdict: 'no_violation',
          draftNotes: { adminNote: 'Báo cáo không hợp lệ, hai bên hiểu nhầm', reporterFeedback: 'Cảm ơn bạn, hai bên chỉ hiểu nhầm.' },
        };
        await openDrawer(makeDetail({ sentinelAssessment }));

        const violationDialog = await askViolation();
        expect(within(violationDialog).getByLabelText(/Ghi chú xử lý/)).toHaveValue('');
        fireEvent.click(within(violationDialog).getByRole('button', { name: 'Hủy' }));

        const dismissDialog = await askDismissal();
        expect(within(dismissDialog).getByLabelText(/Lý do bác bỏ/)).toHaveValue('Báo cáo không hợp lệ, hai bên hiểu nhầm');
        expect(within(dismissDialog).getByLabelText('Gửi người báo cáo')).toHaveValue('Cảm ơn bạn, hai bên chỉ hiểu nhầm.');
      });

      it('cannot dismiss a case that already has a sanction, unless it is only a provisional one', async () => {
        const banned = { id: 'x1', type: 'ban', params: {}, performedBy: ADMIN, performedAt: '2026-10-10T05:00:00.000Z', note: '' };
        await openDrawer(makeDetail({ actions: [banned] }));

        expect(screen.getByRole('button', { name: 'Không vi phạm — bác bỏ' })).toBeDisabled();
      });

      it('does not count a provisional Auto-Shield action as a sanction', async () => {
        const provisional = { id: 'x1', type: 'suspend', isProvisional: true, params: {}, performedBy: null, performedAt: '2026-10-10T05:00:00.000Z', note: '' };
        await openDrawer(makeDetail({ actions: [provisional] }));

        expect(screen.getByRole('button', { name: 'Không vi phạm — bác bỏ' })).toBeEnabled();
      });
    });

    it('says when an admin ended the sanction of a closed case early', async () => {
      const lifted = {
        id: 'h9',
        eventType: 'sanction_lifted',
        fromStatus: 'resolved',
        toStatus: 'resolved',
        by: ADMIN,
        at: '2026-11-13T09:28:00.000Z',
        note: 'Admin mở khóa tài khoản sớm (án đình chỉ đến 20/11/2026) — Lý do: Khiếu nại được chấp nhận',
        metadata: { lockType: 'suspended', reason: 'Khiếu nại được chấp nhận' },
      };
      await openDrawer(closedDetail({ resolution: 'action_taken', history: [lifted] }));

      expect(screen.getByText('Hình phạt đã được dừng sớm')).toBeInTheDocument();
      expect(screen.getByText(/: Khiếu nại được chấp nhận$/)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Nhật ký xử lý (1)' }));
      expect(screen.getByText('Hình phạt chấm dứt sớm')).toBeInTheDocument();
    });

    it('reopens a closed case with a reason', async () => {
      await openDrawer(closedDetail({ status: 'dismissed', resolution: 'dismissed', adminNotes: 'Báo cáo trùng lặp' }));

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
  });
});
