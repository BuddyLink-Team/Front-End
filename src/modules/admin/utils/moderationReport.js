import { formatDate, formatDateTime } from '../../../utils/formatters';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_SEVERITY_CONFIG,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_ACTION_LABELS,
  REPORT_RESOLUTION_LABELS,
} from '../constants/admin.constants';

export const REPORT_PAGE_LIMIT = 100;
// Safety cap to avoid memory exhaustion while preventing silent truncation
const REPORT_MAX_PAGES = 500;

/**
 * Fetch all pages for moderation export
 * @param {(params: Object) => Promise<{ items: Array, pagination: { totalPages: number } }>} fetchPage
 * @param {Object} [params]
 */
export const fetchAllReportPages = async (fetchPage, params = {}) => {
  const rows = [];
  for (let page = 1; page <= REPORT_MAX_PAGES; page += 1) {
    const { items = [], pagination } = await fetchPage({ ...params, page, limit: REPORT_PAGE_LIMIT });
    rows.push(...items);
    if (!pagination || page >= pagination.totalPages) break;
  }
  return rows;
};

const statusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'reviewing':
      return 'Đang xem xét';
    case 'resolved':
      return 'Đã giải quyết';
    case 'dismissed':
      return 'Bác bỏ';
    default:
      return status || '';
  }
};

/**
 * Build 4 sheets for the moderation export
 * @param {{ stats: Object, reports: Array, filter?: Object, exportedAt?: Date }} data
 */
export const buildModerationReportSheets = ({ stats = {}, reports = [], filter = {}, exportedAt = new Date() }) => {
  const period =
    filter.fromDate || filter.toDate
      ? `${filter.fromDate ? formatDate(filter.fromDate) : 'Từ đầu'} - ${
          filter.toDate ? formatDate(filter.toDate) : 'Hiện tại'
        }`
      : 'Toàn bộ thời gian';

  // Sheet 1: Summary
  const summarySheet = {
    name: 'Tổng quan',
    columns: [
      { header: 'Chỉ số', key: 'label', width: 36 },
      { header: 'Giá trị', key: 'value', width: 24 },
    ],
    rows: [
      { label: 'Thời gian xuất', value: formatDateTime(exportedAt) },
      { label: 'Khoảng thời gian áp dụng', value: period },
      { label: 'Tổng số báo cáo lọc được', value: reports.length },
      { label: 'Chờ tiếp nhận (Pending)', value: stats.pending || 0 },
      { label: 'Đang xem xét (Reviewing)', value: stats.reviewing || 0 },
      { label: 'Đã giải quyết tuần này', value: stats.resolvedThisWeek || 0 },
      { label: 'Bác bỏ (Dismissed)', value: stats.dismissed || 0 },
      { label: 'Báo cáo quá hạn SLA', value: stats.overdue || 0 },
      { label: 'Báo cáo khẩn cấp chờ duyệt', value: stats.criticalPending || 0 },
      { label: 'Thời gian giải quyết bình quân (Giờ)', value: stats.avgResolutionHours || 0 },
    ],
  };

  // Sheet 2: Reports List
  const reportsSheet = {
    name: 'Danh sách báo cáo',
    columns: [
      { header: 'Mã báo cáo', key: 'id', width: 26 },
      { header: 'Thời gian tạo', key: 'createdAt', width: 18 },
      { header: 'Trạng thái', key: 'status', width: 16 },
      { header: 'Mức độ', key: 'severity', width: 16 },
      { header: 'Danh mục', key: 'category', width: 24 },
      { header: 'Loại đối tượng', key: 'targetType', width: 16 },
      { header: 'Người báo cáo', key: 'reporterName', width: 26 },
      { header: 'Người bị báo cáo', key: 'reportedUserName', width: 26 },
      { header: 'Lý do vi phạm', key: 'reason', width: 32 },
      { header: 'Người phụ trách', key: 'assignee', width: 24 },
      { header: 'Kết luận', key: 'resolution', width: 24 },
      { header: 'Ghi chú Admin', key: 'adminNotes', width: 36 },
      { header: 'Quá hạn SLA', key: 'isOverdue', width: 14 },
    ],
    rows: reports.map((r) => ({
      id: r.id || r._id,
      createdAt: formatDateTime(r.createdAt),
      status: statusLabel(r.status),
      severity: REPORT_SEVERITY_CONFIG[r.severity]?.label || r.severity,
      category: REPORT_CATEGORY_LABELS[r.category] || r.category,
      targetType: REPORT_TARGET_TYPE_LABELS[r.targetType] || r.targetType,
      reporterName: r.reporter?.fullName || '',
      reportedUserName: r.reportedUser?.fullName || '',
      reason: r.reason || '',
      assignee: r.assignedTo?.fullName || (r.assignedTo ? 'Đã gán' : 'Chưa phân công'),
      resolution: REPORT_RESOLUTION_LABELS[r.resolution] || r.resolution || 'Chưa đóng',
      adminNotes: r.adminNotes || '',
      isOverdue: r.isOverdue ? 'Quá hạn' : 'Đúng hạn',
    })),
  };

  // Sheet 3: Actions
  const actionRows = [];
  reports.forEach((r) => {
    (r.actions || []).forEach((act) => {
      actionRows.push({
        reportId: r.id || r._id,
        actionType: REPORT_ACTION_LABELS[act.type] || act.type,
        performedBy: act.performedBy?.fullName || act.performedBy?.email || 'Admin',
        performedAt: formatDateTime(act.performedAt),
        durationDays: act.params?.durationDays ? `${act.params.durationDays} ngày` : '—',
        note: act.note || act.params?.reason || '',
      });
    });
  });

  const actionsSheet = {
    name: 'Nhật ký chế tài',
    columns: [
      { header: 'Mã báo cáo', key: 'reportId', width: 26 },
      { header: 'Loại chế tài', key: 'actionType', width: 24 },
      { header: 'Người thực thi', key: 'performedBy', width: 22 },
      { header: 'Thời điểm', key: 'performedAt', width: 18 },
      { header: 'Thời hạn', key: 'durationDays', width: 14 },
      { header: 'Ghi chú', key: 'note', width: 36 },
    ],
    rows: actionRows,
  };

  // Sheet 4: Most reported users (aggregated)
  const userStatsMap = new Map();
  reports.forEach((r) => {
    const userId = r.reportedUser?.id;
    if (!userId) return;
    const existing = userStatsMap.get(userId) || {
      fullName: r.reportedUser?.fullName || 'Người dùng BuddyLink',
      totalReports: 0,
      openReports: 0,
      strikeCount: r.reportedUser?.strikeCount || 0,
      isLocked: r.reportedUser?.isLocked,
    };
    existing.totalReports += 1;
    if (['pending', 'reviewing'].includes(r.status)) {
      existing.openReports += 1;
    }
    userStatsMap.set(userId, existing);
  });

  const mostReportedUsers = [...userStatsMap.values()].sort((a, b) => b.totalReports - a.totalReports);

  const mostReportedSheet = {
    name: 'Phụ huynh bị báo cáo nhiều',
    columns: [
      { header: 'Họ tên phụ huynh', key: 'fullName', width: 28 },
      { header: 'Tổng số báo cáo', key: 'totalReports', width: 18 },
      { header: 'Báo cáo đang mở', key: 'openReports', width: 18 },
      { header: 'Số lần bị cảnh cáo', key: 'strikeCount', width: 18 },
      { header: 'Trạng thái tài khoản', key: 'status', width: 22 },
    ],
    rows: mostReportedUsers.map((u) => ({
      fullName: u.fullName,
      totalReports: u.totalReports,
      openReports: u.openReports,
      strikeCount: u.strikeCount,
      status: u.isLocked ? 'Đã bị khóa' : 'Đang hoạt động',
    })),
  };

  return [summarySheet, reportsSheet, actionsSheet, mostReportedSheet];
};

/**
 * .xlsx file of moderation sheets
 * @param {Array} sheets
 * @returns {Promise<Blob>}
 */
export const createModerationWorkbookBlob = async (sheets) => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuddyLink Admin';

  sheets.forEach(({ name, columns, rows }) => {
    const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
    sheet.getRow(1).font = { bold: true };
    rows.forEach((rowValues) => {
      sheet.addRow(rowValues);
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

export const downloadReportBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

