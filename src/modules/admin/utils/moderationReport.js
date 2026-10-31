import dayjs from 'dayjs';
import { formatDateTime } from '../../../utils/formatters';
import {
  REPORT_ACTION_LABELS,
  REPORT_CATEGORY_LABELS,
  REPORT_EVIDENCE_MAX_LINKS,
  REPORT_RESOLUTION_LABELS,
  REPORT_SEVERITY_CONFIG,
  REPORT_STATUS_DISPLAY,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_UNCLASSIFIED_LABEL,
  getReportCategoryLabel,
} from '../constants/admin.constants';

const HOUR_MS = 60 * 60 * 1000;
const OPEN_STATUSES = ['pending', 'reviewing'];

const statusLabel = (status) => REPORT_STATUS_DISPLAY[status]?.label || status || '';
const severityLabel = (severity) => REPORT_SEVERITY_CONFIG[severity]?.label || severity || REPORT_UNCLASSIFIED_LABEL;
const categoryLabel = getReportCategoryLabel;

const countBy = (items, getKey) =>
  items.reduce((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

const toCountRows = (prefix, labels, counts) =>
  Object.entries(labels).map(([value, label]) => ({ label: `${prefix}: ${label}`, value: counts[value] || 0 }));

const resolutionHours = (report) =>
  report.resolvedAt ? Number(((new Date(report.resolvedAt) - new Date(report.createdAt)) / HOUR_MS).toFixed(1)) : null;

const toPeriod = ({ fromDate, toDate }) => {
  if (!fromDate && !toDate) return 'Toàn bộ thời gian';
  const format = (date) => dayjs(date).format('DD/MM/YYYY');
  return `${fromDate ? format(fromDate) : 'Từ đầu'} - ${toDate ? format(toDate) : 'Hiện tại'}`;
};

const buildSummarySheet = (reports, filter, exportedAt) => {
  const hours = reports.map(resolutionHours).filter((value) => value !== null);
  const averageHours = hours.length > 0 ? hours.reduce((sum, value) => sum + value, 0) / hours.length : 0;

  return {
    name: 'Tổng quan',
    columns: [
      { header: 'Chỉ số', key: 'label', width: 40 },
      { header: 'Giá trị', key: 'value', width: 24 },
    ],
    rows: [
      { label: 'Thời gian xuất', value: formatDateTime(exportedAt) },
      { label: 'Khoảng thời gian áp dụng', value: toPeriod(filter) },
      { label: 'Tổng số báo cáo', value: reports.length },
      ...toCountRows(
        'Trạng thái',
        Object.fromEntries(Object.entries(REPORT_STATUS_DISPLAY).map(([status, display]) => [status, display.label])),
        countBy(reports, (report) => report.status)
      ),
      ...toCountRows(
        'Mức độ',
        Object.fromEntries(Object.entries(REPORT_SEVERITY_CONFIG).map(([severity, config]) => [severity, config.label])),
        countBy(reports, (report) => report.severity)
      ),
      ...toCountRows('Danh mục', REPORT_CATEGORY_LABELS, countBy(reports, (report) => report.category)),
      { label: 'Báo cáo quá hạn', value: reports.filter((report) => report.isOverdue).length },
      { label: 'Thời gian giải quyết trung bình (giờ)', value: Number(averageHours.toFixed(1)) },
    ],
  };
};

// One clickable cell per image: a cell of an .xlsx file holds a single link
const EVIDENCE_KEYS = Array.from({ length: REPORT_EVIDENCE_MAX_LINKS }, (_, index) => `evidence${index + 1}`);

const toEvidenceCells = (urls = []) =>
  Object.fromEntries(
    urls
      .slice(0, EVIDENCE_KEYS.length)
      .map((url, index) => [EVIDENCE_KEYS[index], { text: `Bằng chứng ${index + 1}`, hyperlink: url }])
  );

const buildReportsSheet = (reports) => ({
  name: 'Danh sách báo cáo',
  columns: [
    { header: 'Mã báo cáo', key: 'id', width: 26 },
    { header: 'Thời gian tạo', key: 'createdAt', width: 18 },
    { header: 'Trạng thái', key: 'status', width: 16 },
    { header: 'Mức độ', key: 'severity', width: 14 },
    { header: 'Danh mục', key: 'category', width: 24 },
    { header: 'Loại đối tượng', key: 'targetType', width: 16 },
    { header: 'Người báo cáo', key: 'reporterName', width: 26 },
    { header: 'Email người báo cáo', key: 'reporterEmail', width: 30 },
    { header: 'Người bị báo cáo', key: 'reportedName', width: 26 },
    { header: 'Email người bị báo cáo', key: 'reportedEmail', width: 30 },
    { header: 'Lý do', key: 'reason', width: 32 },
    { header: 'Mô tả', key: 'description', width: 40 },
    { header: 'Người phụ trách', key: 'assignee', width: 28 },
    { header: 'Kết luận', key: 'resolution', width: 28 },
    { header: 'Ghi chú Admin', key: 'adminNotes', width: 40 },
    { header: 'Người xử lý', key: 'resolvedBy', width: 28 },
    { header: 'Thời điểm xử lý', key: 'resolvedAt', width: 18 },
    { header: 'Thời gian xử lý (giờ)', key: 'resolutionHours', width: 20 },
    ...EVIDENCE_KEYS.map((key, index) => ({ header: `Bằng chứng ${index + 1}`, key, width: 16 })),
  ],
  rows: reports.map((report) => ({
    id: report.id,
    createdAt: formatDateTime(report.createdAt),
    status: statusLabel(report.status),
    severity: severityLabel(report.severity),
    category: categoryLabel(report.category),
    targetType: REPORT_TARGET_TYPE_LABELS[report.targetType] || report.targetType,
    reporterName: report.reporter?.fullName || '',
    reporterEmail: report.reporter?.email || '',
    reportedName: report.reportedUser?.fullName || '',
    reportedEmail: report.reportedUser?.email || '',
    reason: report.reason || '',
    description: report.description || '',
    assignee: report.assignedTo?.fullName || 'Chưa phân công',
    resolution: REPORT_RESOLUTION_LABELS[report.resolution] || '',
    adminNotes: report.adminNotes || '',
    resolvedBy: report.resolvedBy?.fullName || '',
    resolvedAt: formatDateTime(report.resolvedAt),
    resolutionHours: resolutionHours(report) ?? '',
    ...toEvidenceCells(report.evidenceUrls),
  })),
});

// Message text only for a report on a message, and only the reported message
const toActionTarget = (report) => {
  const label = REPORT_TARGET_TYPE_LABELS[report.targetType] || report.targetType;
  if (report.targetType === 'message') return `${label}: ${report.reportedMessageContent || '(không còn tồn tại)'}`;
  if (report.targetType === 'user') return `${label}: ${report.reportedUser?.fullName || ''}`;
  return label;
};

const buildActionsSheet = (reports) => ({
  name: 'Nhật ký chế tài',
  columns: [
    { header: 'Mã báo cáo', key: 'reportId', width: 26 },
    { header: 'Chế tài', key: 'action', width: 28 },
    { header: 'Thời hạn', key: 'duration', width: 12 },
    { header: 'Đối tượng', key: 'target', width: 40 },
    { header: 'Người thực hiện', key: 'performedBy', width: 28 },
    { header: 'Thời điểm', key: 'performedAt', width: 18 },
    { header: 'Ghi chú', key: 'note', width: 36 },
  ],
  rows: reports.flatMap((report) =>
    (report.actions || []).map((action) => ({
      reportId: report.id,
      action: REPORT_ACTION_LABELS[action.type] || action.type,
      duration: action.params?.durationDays ? `${action.params.durationDays} ngày` : '',
      target: toActionTarget(report),
      performedBy: action.performedBy?.fullName || '',
      performedAt: formatDateTime(action.performedAt),
      note: action.note || '',
    }))
  ),
});

// Among the exported reports, so the counts follow the current filters
const buildMostReportedSheet = (reports) => {
  const users = new Map();
  reports.forEach((report) => {
    const reported = report.reportedUser;
    if (!reported?.id) return;
    const entry = users.get(reported.id) || { ...reported, totalReports: 0, openReports: 0 };
    entry.totalReports += 1;
    if (OPEN_STATUSES.includes(report.status)) entry.openReports += 1;
    users.set(reported.id, entry);
  });

  return {
    name: 'Bị báo cáo nhiều nhất',
    columns: [
      { header: 'Người dùng', key: 'fullName', width: 28 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tổng số báo cáo', key: 'totalReports', width: 18 },
      { header: 'Báo cáo đang mở', key: 'openReports', width: 18 },
      { header: 'Số lần cảnh cáo', key: 'strikeCount', width: 18 },
      { header: 'Trạng thái tài khoản', key: 'accountStatus', width: 22 },
    ],
    rows: [...users.values()]
      .sort((a, b) => b.totalReports - a.totalReports)
      .map((user) => ({
        fullName: user.fullName || '',
        email: user.email || '',
        totalReports: user.totalReports,
        openReports: user.openReports,
        strikeCount: user.strikeCount || 0,
        accountStatus: user.isLocked ? 'Đã khóa' : 'Đang hoạt động',
      })),
  };
};

/**
 * The 4 sheets of the moderation export
 * @param {{ reports: Array<Object>, filter?: { fromDate?: string, toDate?: string }, exportedAt?: Date }} data
 */
export const buildModerationReportSheets = ({ reports = [], filter = {}, exportedAt = new Date() }) => [
  buildSummarySheet(reports, filter, exportedAt),
  buildReportsSheet(reports),
  buildActionsSheet(reports),
  buildMostReportedSheet(reports),
];
