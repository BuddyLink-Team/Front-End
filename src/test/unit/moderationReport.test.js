import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { buildModerationReportSheets } from '../../modules/admin/utils/moderationReport';
import { createWorkbookBlob, getExportFileName } from '../../modules/admin/utils/excelExport';
import { adminReportMockService } from '../../modules/admin/mock/adminReportMockService';
import chatReducer, { messageDeleted } from '../../modules/chat/redux/chatSlice';

const ADMIN = { id: 'a1', fullName: 'admin@buddylink.vn', email: 'admin@buddylink.vn' };

// Row as the API sends it (admin.dto.js)
const makeReport = (overrides = {}) => ({
  id: 'r1',
  category: 'child_safety',
  severity: 'critical',
  targetType: 'message',
  status: 'resolved',
  reason: 'An toàn trẻ em',
  description: 'Hỏi địa chỉ nhà',
  evidenceUrls: ['https://cdn.example.com/1.png', 'https://cdn.example.com/2.png'],
  reportedMessageContent: 'Nhà ở đâu vậy?',
  reporter: { id: 'p1', fullName: 'Mẹ Lan', email: 'lan@example.com' },
  reportedUser: { id: 'p2', fullName: 'Bố Hùng', email: 'hung@example.com', strikeCount: 2, isLocked: true },
  assignedTo: ADMIN,
  isOverdue: false,
  resolution: 'action_taken',
  adminNotes: 'Đã khóa tài khoản vi phạm',
  resolvedBy: ADMIN,
  resolvedAt: '2026-10-10T05:00:00.000Z',
  actions: [
    {
      id: 'x1',
      type: 'suspend',
      params: { durationDays: 7 },
      performedBy: ADMIN,
      performedAt: '2026-10-10T04:00:00.000Z',
      note: 'Vi phạm nghiêm trọng',
    },
  ],
  createdAt: '2026-10-10T03:00:00.000Z',
  ...overrides,
});

const sheetsOf = (reports, filter) => {
  const [summary, list, actions, mostReported] = buildModerationReportSheets({ reports, filter });
  return { summary, list, actions, mostReported };
};

const valueOf = (sheet, label) => sheet.rows.find((row) => row.label === label)?.value;

describe('buildModerationReportSheets', () => {
  it('summarizes the exported rows by status, severity and category', () => {
    const { summary } = sheetsOf(
      [
        makeReport(),
        makeReport({
          id: 'r2',
          severity: 'low',
          category: 'spam',
          status: 'pending',
          isOverdue: true,
          resolvedAt: null,
          resolution: null,
        }),
      ],
      { fromDate: '2026-10-01', toDate: '2026-10-31' }
    );

    expect(valueOf(summary, 'Tổng số báo cáo')).toBe(2);
    expect(valueOf(summary, 'Trạng thái: Đã giải quyết')).toBe(1);
    expect(valueOf(summary, 'Trạng thái: Chờ xử lý')).toBe(1);
    expect(valueOf(summary, 'Mức độ: Khẩn cấp')).toBe(1);
    expect(valueOf(summary, 'Mức độ: Thấp')).toBe(1);
    expect(valueOf(summary, 'Danh mục: An toàn trẻ em')).toBe(1);
    expect(valueOf(summary, 'Báo cáo quá hạn')).toBe(1);
    expect(valueOf(summary, 'Thời gian giải quyết trung bình (giờ)')).toBe(2);
    expect(valueOf(summary, 'Khoảng thời gian áp dụng')).toBe('01/10/2026 - 31/10/2026');
  });

  it('lists every column of a report in Vietnamese, with DD/MM/YYYY HH:mm dates', () => {
    const { list } = sheetsOf([makeReport()]);
    const [row] = list.rows;

    expect(row).toEqual(
      expect.objectContaining({
        id: 'r1',
        status: 'Đã giải quyết',
        severity: 'Khẩn cấp',
        category: 'An toàn trẻ em',
        targetType: 'Tin nhắn',
        reporterName: 'Mẹ Lan',
        reporterEmail: 'lan@example.com',
        reportedName: 'Bố Hùng',
        reportedEmail: 'hung@example.com',
        reason: 'An toàn trẻ em',
        description: 'Hỏi địa chỉ nhà',
        assignee: ADMIN.fullName,
        adminNotes: 'Đã khóa tài khoản vi phạm',
        resolvedBy: ADMIN.fullName,
        resolutionHours: 2,
      })
    );
    expect(row.createdAt).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    expect(row.resolvedAt).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });

  it('gives each evidence image its own link and never embeds it', () => {
    const { list } = sheetsOf([makeReport()]);
    const [row] = list.rows;

    expect(row.evidence1).toEqual({ text: 'Bằng chứng 1', hyperlink: 'https://cdn.example.com/1.png' });
    expect(row.evidence2).toEqual({ text: 'Bằng chứng 2', hyperlink: 'https://cdn.example.com/2.png' });
    expect(row.evidence3).toBeUndefined();
  });

  it('writes working hyperlinks into the file', async () => {
    const blob = await createWorkbookBlob(buildModerationReportSheets({ reports: [makeReport()] }));
    const workbook = new ExcelJS.Workbook();
    const buffer = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(blob);
    });
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet('Danh sách báo cáo');
    const headers = sheet.getRow(1).values;
    const cell = sheet.getRow(2).getCell(headers.indexOf('Bằng chứng 1'));
    expect(cell.hyperlink).toBe('https://cdn.example.com/1.png');
    expect(workbook.worksheets).toHaveLength(4);
    expect(headers).toContain('Mã báo cáo');
  });

  it('lists the actions with duration, target and who performed them', () => {
    const { actions } = sheetsOf([makeReport()]);

    expect(actions.rows).toEqual([
      expect.objectContaining({
        reportId: 'r1',
        action: 'Tạm đình chỉ có thời hạn',
        duration: '7 ngày',
        target: 'Tin nhắn: Nhà ở đâu vậy?',
        performedBy: ADMIN.fullName,
        note: 'Vi phạm nghiêm trọng',
      }),
    ]);
  });

  it('shows message text only for a report on a message', () => {
    const { actions } = sheetsOf([
      makeReport({ targetType: 'user', reportedMessageContent: null }),
      makeReport({ id: 'r2', targetType: 'playdate', reportedMessageContent: null }),
    ]);

    expect(actions.rows[0].target).toBe('Tài khoản: Bố Hùng');
    expect(actions.rows[1].target).toBe('Cuộc hẹn');
  });

  it('ranks the most reported users with their email, open reports and account status', () => {
    const other = { id: 'p3', fullName: 'Mẹ An', email: 'an@example.com', strikeCount: 0, isLocked: false };
    const { mostReported } = sheetsOf([
      makeReport({ id: 'r1', reportedUser: other, status: 'pending' }),
      makeReport({ id: 'r2' }),
      makeReport({ id: 'r3', status: 'reviewing' }),
    ]);

    expect(mostReported.rows).toEqual([
      {
        fullName: 'Bố Hùng',
        email: 'hung@example.com',
        totalReports: 2,
        openReports: 1,
        strikeCount: 2,
        accountStatus: 'Đã khóa',
      },
      {
        fullName: 'Mẹ An',
        email: 'an@example.com',
        totalReports: 1,
        openReports: 1,
        strikeCount: 0,
        accountStatus: 'Đang hoạt động',
      },
    ]);
  });

  it('names the file as the ticket asks', () => {
    expect(getExportFileName('bao-cao-vi-pham')).toMatch(/^buddylink-bao-cao-vi-pham-\d{8}-\d{4}\.xlsx$/);
  });
});

describe('adminReportMockService', () => {
  beforeEach(() => {
    adminReportMockService.resetFactoryData();
  });

  it('sorts the queue by severity, then oldest first', async () => {
    const { data } = await adminReportMockService.getReports({ status: 'pending' });
    expect(data.items.map((item) => item.severity)).toEqual(['critical', 'high', 'low']);
  });

  it('follows the same workflow rules as the API', async () => {
    await expect(adminReportMockService.applyReportAction('report-mock-1', { type: 'warn' })).rejects.toMatchObject({
      response: { data: { error: { code: 'INVALID_STATUS_TRANSITION' } } },
    });

    await adminReportMockService.reviewReport('report-mock-1', { action: 'claim' });
    const { data } = await adminReportMockService.applyReportAction('report-mock-1', { type: 'delete_message' });
    expect(data.targetContext.reportedMessage.isDeleted).toBe(true);

    await expect(
      adminReportMockService.applyReportAction('report-mock-1', { type: 'delete_message' })
    ).rejects.toMatchObject({ response: { data: { error: { code: 'ACTION_ALREADY_APPLIED' } } } });

    await adminReportMockService.resolveReport('report-mock-1', {
      status: 'resolved',
      resolution: 'action_taken',
      adminNotes: 'Đã gỡ tin nhắn vi phạm',
    });
    await expect(
      adminReportMockService.resolveReport('report-mock-1', {
        status: 'dismissed',
        resolution: 'dismissed',
        adminNotes: 'Đã gỡ tin nhắn vi phạm',
      })
    ).rejects.toMatchObject({ response: { data: { error: { code: 'REPORT_ALREADY_CLOSED' } } } });
  });
});

describe('chatSlice messageDeleted', () => {
  const content = 'Tin nhắn này đã bị Quản trị viên gỡ do vi phạm quy tắc cộng đồng.';

  it('replaces the message and the preview that shows it', () => {
    const state = chatReducer(
      {
        ...chatReducer(undefined, { type: 'init' }),
        messages: [
          { id: 'm1', content: 'Vi phạm', mediaUrl: 'https://cdn/a.png' },
          { id: 'm2', content: 'Bình thường' },
        ],
        conversations: [{ id: 'c1', lastMessage: { messageId: 'm1', content: 'Vi phạm', type: 'image' } }],
      },
      messageDeleted({ messageId: 'm1', conversationId: 'c1', content })
    );

    expect(state.messages[0]).toEqual({ id: 'm1', content, mediaUrl: null, isDeleted: true });
    expect(state.messages[1].content).toBe('Bình thường');
    expect(state.conversations[0].lastMessage).toEqual({ messageId: 'm1', content, type: 'text' });
  });

  it('keeps a preview that shows another message', () => {
    const state = chatReducer(
      {
        ...chatReducer(undefined, { type: 'init' }),
        messages: [],
        conversations: [{ id: 'c1', lastMessage: { messageId: 'm9', content: 'Mới hơn', type: 'text' } }],
      },
      messageDeleted({ messageId: 'm1', conversationId: 'c1', content })
    );

    expect(state.conversations[0].lastMessage.content).toBe('Mới hơn');
  });
});
