import dayjs from 'dayjs';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import {
  SUBSCRIPTION_PLAN_NAMES,
} from '../constants/admin.constants';

export const REPORT_PAGE_LIMIT = 100;
const REPORT_MAX_PAGES = 100;
export const MONEY_FORMAT = '#,##0 "₫"';
export const PERCENT_FORMAT = '0.0"%"';

/**
 * Fetch all pages of a paginated API endpoint up to safety limit
 * @param {(params: Object) => Promise<{ items?: Array, users?: Array, children?: Array, playdates?: Array, connections?: Array, subscriptions?: Array, transactions?: Array, pagination?: { totalPages: number } }>} fetchPage
 * @param {Object} [params]
 * @returns {Promise<Array>}
 */
export const fetchAllPages = async (fetchPage, params = {}) => {
  const rows = [];
  for (let page = 1; page <= REPORT_MAX_PAGES; page += 1) {
    const res = await fetchPage({ ...params, page, limit: REPORT_PAGE_LIMIT });
    const items =
      res?.items ||
      res?.users ||
      res?.children ||
      res?.playdates ||
      res?.connections ||
      res?.subscriptions ||
      res?.transactions ||
      [];
    rows.push(...items);
    if (!res?.pagination || page >= res.pagination.totalPages) break;
  }
  return rows;
};

/**
 * Dynamically import exceljs and create an .xlsx file Blob from sheets config
 * @param {Array<{ name: string, columns: Array<{ header: string, key: string, width?: number, numFmt?: string }>, rows: Array<Object> }>} sheets
 * @returns {Promise<Blob>}
 */
export const createWorkbookBlob = async (sheets) => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuddyLink Admin';

  sheets.forEach(({ name, columns, rows }) => {
    // Worksheet name cannot exceed 31 chars
    const safeName = name.slice(0, 31);
    const sheet = workbook.addWorksheet(safeName, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map(({ header, key, width = 20, numFmt }) => ({
      header,
      key,
      width,
      style: numFmt ? { numFmt } : {},
    }));

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate 800
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    rows.forEach(({ numFmt, isTotal, ...values }) => {
      const row = sheet.addRow(values);
      if (numFmt && values.value !== undefined) {
        row.getCell('value').numFmt = numFmt;
      }
      if (isTotal) {
        row.font = { bold: true };
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }, // Slate 100
        };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Trigger client-side file download
 * @param {Blob} blob
 * @param {string} fileName
 */
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getExportFileName = (section) =>
  `buddylink-${section}-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`;

const planName = (planCode, fallback) => SUBSCRIPTION_PLAN_NAMES[planCode] || fallback || planCode || 'Gói Miễn phí';
// -------------------------------------------------------------
// Sheet Builders
// -------------------------------------------------------------

/**
 * Build Excel sheets for Dashboard
 */
export const buildDashboardReportSheets = ({ analytics = {}, exportedAt = new Date() }) => {
  const { summary = {}, charts = {}, filter = {} } = analytics || {};
  const period = `${formatDate(filter.fromDate)} - ${formatDate(filter.toDate)}`;

  const formatKpiChange = (kpi) => {
    if (!kpi) return '';
    if (kpi.changePercent === null || kpi.changePercent === undefined) return '—';
    return `${kpi.changePercent > 0 ? '+' : ''}${kpi.changePercent}%`;
  };

  return [
    {
      name: 'Tổng quan KPIs',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 34 },
        { header: 'Kỳ này', key: 'value', width: 22 },
        { header: 'Kỳ trước', key: 'previousValue', width: 22 },
        { header: 'Tăng trưởng (%)', key: 'change', width: 20 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Khoảng thời gian chọn', value: period },
        { label: 'Tổng phụ huynh', value: summary.parents?.total || 0, previousValue: summary.parents?.previous || 0, change: formatKpiChange(summary.parents) },
        { label: 'Phụ huynh mới', value: summary.parents?.current || 0, previousValue: summary.parents?.previous || 0, change: formatKpiChange(summary.parents) },
        { label: 'Người dùng hoạt động', value: summary.activeUsers?.current || 0, previousValue: summary.activeUsers?.previous || 0, change: formatKpiChange(summary.activeUsers) },
        { label: 'Tổng hồ sơ trẻ', value: summary.children?.total || 0, previousValue: summary.children?.previous || 0, change: formatKpiChange(summary.children) },
        { label: 'Buổi hẹn chơi (Playdates)', value: summary.playdates?.total || 0, previousValue: summary.playdates?.previous || 0, change: formatKpiChange(summary.playdates) },
        { label: 'Kết nối thành công', value: summary.connections?.accepted || 0, previousValue: summary.connections?.previousAccepted || 0, change: formatKpiChange(summary.connections) },
        { label: 'Thuê bao Premium hiệu lực', value: summary.subscriptions?.active || 0, previousValue: summary.subscriptions?.previous || 0, change: formatKpiChange(summary.subscriptions) },
        { label: 'Doanh thu', value: summary.revenue?.current || 0, previousValue: summary.revenue?.previous || 0, change: formatKpiChange(summary.revenue), numFmt: MONEY_FORMAT },
        { label: 'Lượt tương tác AI Assistant', value: summary.aiUsage?.currentRequests || 0, previousValue: summary.aiUsage?.previousRequests || 0, change: formatKpiChange(summary.aiUsage) },
      ],
    },
    {
      name: 'Tăng trưởng & Doanh thu',
      columns: [
        { header: 'Kỳ / Thời gian', key: 'period', width: 18 },
        { header: 'Phụ huynh mới', key: 'newParents', width: 18 },
        { header: 'Người dùng hoạt động', key: 'activeUsers', width: 22 },
        { header: 'Doanh thu', key: 'revenue', width: 20, numFmt: MONEY_FORMAT },
      ],
      rows: (charts.userGrowth || []).map((growthRow, idx) => {
        const revRow = charts.revenue?.[idx];
        return {
          period: growthRow.date,
          newParents: growthRow.newParents || 0,
          activeUsers: growthRow.activeUsers || 0,
          revenue: revRow?.revenue || 0,
        };
      }),
    },
    {
      name: 'Phễu chuyển đổi',
      columns: [
        { header: 'Bước trong phễu', key: 'label', width: 30 },
        { header: 'Số lượng phụ huynh', key: 'count', width: 24 },
        { header: 'Tỷ lệ rời bỏ (%)', key: 'dropRate', width: 20 },
      ],
      rows: (charts.conversionFunnel || []).map((step) => ({
        label: step.step,
        count: step.count,
        dropRate: step.dropRate !== null ? `${step.dropRate}%` : '—',
      })),
    },
    {
      name: 'Top phụ huynh dùng AI',
      columns: [
        { header: 'Họ và tên', key: 'fullName', width: 26 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Số lượt yêu cầu', key: 'requestCount', width: 18 },
        { header: 'Tokens tiêu thụ', key: 'tokens', width: 18 },
      ],
      rows: (charts.aiUsage?.topUsers || []).map((p) => ({
        fullName: p.name || 'N/A',
        email: p.email || 'N/A',
        requestCount: p.requests || 0,
        tokens: p.tokens || 0,
      })),
    },
    {
      name: 'Độ tuổi trẻ em',
      columns: [
        { header: 'Nhóm tuổi', key: 'group', width: 22 },
        { header: 'Số lượng bé', key: 'count', width: 18 },
      ],
      rows: (charts.childAgeGroups || []).map((g) => ({
        group: g.group,
        count: g.count,
      })),
    },
  ];
};

/**
 * Build Excel sheets for Users Page
 */
export const buildUsersReportSheets = ({ users = [], stats = {}, exportedAt = new Date() }) => {
  return [
    {
      name: 'Tổng quan',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 32 },
        { header: 'Số lượng', key: 'value', width: 20 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Tổng số tài khoản phụ huynh', value: stats.total || users.length },
        { label: 'Tài khoản đang hoạt động', value: stats.active || 0 },
        { label: 'Tài khoản đang bị khóa', value: stats.locked || 0 },
        { label: 'Tài khoản Premium', value: stats.premium || 0 },
      ],
    },
    {
      name: 'Danh sách phụ huynh',
      columns: [
        { header: 'Họ và tên', key: 'fullName', width: 26 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Số điện thoại', key: 'phone', width: 18 },
        { header: 'Trạng thái', key: 'status', width: 16 },
        { header: 'Xác minh', key: 'isVerified', width: 16 },
        { header: 'Gói thành viên', key: 'plan', width: 22 },
        { header: 'Số lượng trẻ', key: 'childrenCount', width: 14 },
        { header: 'Ngày đăng ký', key: 'createdAt', width: 20 },
      ],
      rows: users.map((u) => ({
        fullName: u.profile?.fullName || u.fullName || 'N/A',
        email: u.email || 'N/A',
        phone: u.phone || 'Chưa cập nhật',
        status: u.isActive ? 'Hoạt động' : 'Đã khóa',
        isVerified: u.profile?.verification?.isVerifiedParent ? 'Đã xác minh' : 'Chưa xác minh',
        plan: planName(u.subscription?.planCode),
        childrenCount: u.activeChildrenCount || 0,
        createdAt: formatDateTime(u.createdAt),
      })),
    },
  ];
};

/**
 * Build Excel sheets for Children Page
 */
export const buildChildrenReportSheets = ({ children = [], stats = {}, exportedAt = new Date() }) => {
  const genderMap = { boy: 'Bé trai', girl: 'Bé gái', other: 'Khác' };

  return [
    {
      name: 'Tổng quan',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 32 },
        { header: 'Số lượng', key: 'value', width: 20 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Tổng số hồ sơ trẻ', value: stats.total || children.length },
        { label: 'Hồ sơ đang hoạt động', value: stats.active || 0 },
        { label: 'Hồ sơ đã lưu trữ', value: stats.archived || 0 },
        { label: 'Hồ sơ bị khóa do gói', value: stats.planLocked || 0 },
      ],
    },
    {
      name: 'Danh sách hồ sơ trẻ',
      columns: [
        { header: 'Tên bé', key: 'displayName', width: 22 },
        { header: 'Phụ huynh', key: 'parentName', width: 24 },
        { header: 'Giới tính', key: 'gender', width: 14 },
        { header: 'Ngày sinh', key: 'dateOfBirth', width: 16 },
        { header: 'Sở thích', key: 'interests', width: 30 },
        { header: 'Hoạt động yêu thích', key: 'favoriteActivities', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 16 },
        { header: 'Khóa do gói', key: 'isPlanLocked', width: 16 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      ],
      rows: children.map((c) => ({
        displayName: c.displayName || 'N/A',
        parentName: c.parent?.fullName || 'N/A',
        gender: genderMap[c.gender] || c.gender || 'N/A',
        dateOfBirth: c.dateOfBirth ? formatDate(c.dateOfBirth) : 'N/A',
        interests: Array.isArray(c.interests) ? c.interests.join(', ') : '',
        favoriteActivities: Array.isArray(c.favoriteActivities) ? c.favoriteActivities.join(', ') : '',
        status: c.isArchived ? 'Đã lưu trữ' : 'Đang hoạt động',
        isPlanLocked: c.isPlanLocked ? 'Bị khóa' : 'Mở',
        createdAt: formatDateTime(c.createdAt),
      })),
    },
  ];
};

/**
 * Build Excel sheets for Playdates Page
 */
export const buildPlaydatesReportSheets = ({ playdates = [], stats = {}, exportedAt = new Date() }) => {
  const statusMap = {
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };

  return [
    {
      name: 'Tổng quan',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 32 },
        { header: 'Số lượng', key: 'value', width: 20 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Tổng số buổi hẹn', value: stats.total || playdates.length },
        { label: 'Sắp diễn ra', value: stats.upcoming || 0 },
        { label: 'Đã hoàn thành', value: stats.completed || 0 },
        { label: 'Đã hủy', value: stats.cancelled || 0 },
      ],
    },
    {
      name: 'Danh sách buổi hẹn chơi',
      columns: [
        { header: 'Hoạt động', key: 'activity', width: 30 },
        { header: 'Người tổ chức (Host)', key: 'hostName', width: 24 },
        { header: 'Bé chủ trì', key: 'hostChild', width: 20 },
        { header: 'Địa điểm', key: 'location', width: 32 },
        { header: 'Thời gian bắt đầu', key: 'scheduledDate', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 18 },
        { header: 'Số người tham gia', key: 'participantsCount', width: 18 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      ],
      rows: playdates.map((p) => ({
        activity: p.activity || p.title || 'N/A',
        hostName: p.hostParent?.fullName || 'N/A',
        hostChild: p.hostChild?.displayName || 'N/A',
        location: p.location?.name || p.location?.address || 'N/A',
        scheduledDate: p.scheduledDate ? `${formatDate(p.scheduledDate)} ${p.startTime || ''}`.trim() : 'N/A',
        status: statusMap[p.status] || p.status || 'N/A',
        participantsCount: Array.isArray(p.participants) ? p.participants.length : 0,
        createdAt: formatDateTime(p.createdAt),
      })),
    },
  ];
};

/**
 * Build Excel sheets for Connections Page
 */
export const buildConnectionsReportSheets = ({ connections = [], stats = {}, exportedAt = new Date() }) => {
  const statusMap = {
    pending: 'Chờ phản hồi',
    accepted: 'Đã kết nối',
    declined: 'Đã từ chối',
    removed: 'Đã hủy kết nối',
  };

  return [
    {
      name: 'Tổng quan',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 32 },
        { header: 'Số lượng', key: 'value', width: 20 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Tổng số yêu cầu kết nối', value: stats.total || connections.length },
        { label: 'Đã kết nối thành công', value: stats.accepted || 0 },
        { label: 'Đang chờ xử lý', value: stats.pending || 0 },
        { label: 'Đã từ chối', value: stats.declined || 0 },
        { label: 'Đã hủy kết nối', value: stats.removed || 0 },
      ],
    },
    {
      name: 'Danh sách kết nối',
      columns: [
        { header: 'Người gửi', key: 'requesterName', width: 24 },
        { header: 'Người nhận', key: 'recipientName', width: 24 },
        { header: 'Trạng thái', key: 'status', width: 18 },
        { header: 'Ngày gửi yêu cầu', key: 'createdAt', width: 20 },
        { header: 'Ngày kết nối', key: 'connectedAt', width: 20 },
      ],
      rows: connections.map((c) => ({
        requesterName: c.requester?.fullName || 'N/A',
        recipientName: c.recipient?.fullName || 'N/A',
        status: statusMap[c.status] || c.status || 'N/A',
        createdAt: formatDateTime(c.createdAt),
        connectedAt: c.connectedAt ? formatDateTime(c.connectedAt) : '—',
      })),
    },
  ];
};
