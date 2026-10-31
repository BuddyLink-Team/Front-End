import dayjs from 'dayjs';
import { formatDateTime } from '../../../utils/formatters';
import { SUBSCRIPTION_PLAN_NAMES } from '../constants/admin.constants';
import {
  CONNECTION_STATUS_ROWS,
  DASHBOARD_KPI_CARDS,
  PLAYDATE_STATUS_SEGMENTS,
  SUBSCRIPTION_PLAN_SEGMENTS,
} from '../constants/dashboard.constants';

export const REPORT_PAGE_LIMIT = 100;
// Safety cap of pages read for one list (REPORT_PAGE_LIMIT rows each)
const REPORT_MAX_PAGES = 100;
export const MONEY_FORMAT = '#,##0 "₫"';
export const PERCENT_FORMAT = '0.0"%"';

const HEADER_TEXT_COLOR = 'FFFFFFFF';
const HEADER_FILL_COLOR = 'FF1E293B';
const TOTAL_FILL_COLOR = 'FFF1F5F9';

// Columns a row-level numFmt applies to
const MONEY_ROW_COLUMNS = ['value', 'previousValue'];

const isEmptyParam = (value) => value === undefined || value === null || value === '';

/**
 * Every row of a paged admin list. Empty filters are left out, as on the list itself:
 * the API validates a query value even when it is empty.
 * @param {(params: Object) => Promise<{ items: Array, pagination: { totalPages: number } }>} fetchPage
 * @param {Object} [params]
 */
export const fetchAllPages = async (fetchPage, params = {}) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => !isEmptyParam(value)));
  const rows = [];
  for (let page = 1; page <= REPORT_MAX_PAGES; page += 1) {
    const { items = [], pagination } = await fetchPage({ ...query, page, limit: REPORT_PAGE_LIMIT });
    rows.push(...items);
    if (!pagination || page >= pagination.totalPages) break;
  }
  return rows;
};

/**
 * .xlsx file of the given sheets. exceljs is imported on demand: it stays out of the main bundle.
 * @param {Array<{ name: string, columns: Array<{ header: string, key: string, width?: number, numFmt?: string }>, rows: Array<Object> }>} sheets
 * @returns {Promise<Blob>}
 */
export const createWorkbookBlob = async (sheets) => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BuddyLink Admin';

  sheets.forEach(({ name, columns, rows }) => {
    // Worksheet name cannot exceed 31 chars
    const sheet = workbook.addWorksheet(name.slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map(({ header, key, width = 20, numFmt }) => ({
      header,
      key,
      width,
      style: numFmt ? { numFmt } : {},
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: HEADER_TEXT_COLOR } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    rows.forEach(({ numFmt, isTotal, ...values }) => {
      const row = sheet.addRow(values);
      if (numFmt) {
        MONEY_ROW_COLUMNS.filter((key) => values[key] !== undefined).forEach((key) => {
          row.getCell(key).numFmt = numFmt;
        });
      }
      if (isTotal) {
        row.font = { bold: true };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_FILL_COLOR } };
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

export const getExportFileName = (page) => `buddylink-${page}-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`;

const planName = (planCode) => SUBSCRIPTION_PLAN_NAMES[planCode] || planCode || 'Gói Miễn phí';

const statsSheet = (rows, exportedAt) => ({
  name: 'Thống kê',
  columns: [
    { header: 'Chỉ số', key: 'label', width: 32 },
    { header: 'Số lượng', key: 'value', width: 20 },
  ],
  rows: [{ label: 'Thời gian xuất file', value: formatDateTime(exportedAt) }, ...rows],
});

/**
 * Sheets of the dashboard, from the /admin/analytics response
 */
export const buildDashboardReportSheets = ({ analytics, exportedAt = new Date() }) => {
  const { overview, userGrowth, revenue, conversion, playdates, subscriptions, aiUsage, filter } = analytics;

  const formatChange = ({ changePercent }) => {
    if (changePercent === null) return '—';
    return `${changePercent > 0 ? '+' : ''}${changePercent}%`;
  };

  return [
    {
      name: 'Tổng quan KPI',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 34 },
        { header: 'Kỳ này', key: 'value', width: 22 },
        { header: 'Kỳ trước', key: 'previousValue', width: 22 },
        { header: 'Thay đổi', key: 'change', width: 14 },
      ],
      rows: [
        { label: 'Thời gian xuất file', value: formatDateTime(exportedAt) },
        { label: 'Từ', value: formatDateTime(filter.fromDate) },
        { label: 'Đến', value: formatDateTime(filter.toDate) },
        ...DASHBOARD_KPI_CARDS.map(({ key, label, format }) => ({
          label,
          value: overview[key].value,
          previousValue: overview[key].previousValue,
          change: formatChange(overview[key]),
          ...(format ? { numFmt: MONEY_FORMAT } : {}),
        })),
      ],
    },
    {
      name: 'Tăng trưởng người dùng',
      columns: [
        { header: 'Kỳ', key: 'label', width: 18 },
        { header: 'Phụ huynh mới', key: 'newParents', width: 18 },
      ],
      rows: userGrowth.timeline.map(({ label, count }) => ({ label, newParents: count })),
    },
    {
      name: 'Doanh thu',
      columns: [
        { header: 'Kỳ', key: 'label', width: 18 },
        { header: 'Doanh thu', key: 'revenue', width: 20, numFmt: MONEY_FORMAT },
        { header: 'Số giao dịch', key: 'transactionCount', width: 16 },
      ],
      rows: revenue.timeline.map(({ label, revenue: amount, transactionCount }) => ({
        label,
        revenue: amount,
        transactionCount,
      })),
    },
    {
      name: 'Phễu chuyển đổi',
      columns: [
        { header: 'Bước', key: 'label', width: 30 },
        { header: 'Số phụ huynh', key: 'value', width: 18 },
      ],
      rows: [
        ...conversion.funnel.map(({ label, count }) => ({ label, value: count })),
        { label: 'Tỷ lệ chuyển đổi', value: `${conversion.conversionRate}%` },
        { label: 'Tỷ lệ rời bỏ', value: `${conversion.churnRate}%` },
      ],
    },
    {
      name: 'Hẹn chơi',
      columns: [
        { header: 'Trạng thái / Kỳ', key: 'label', width: 24 },
        { header: 'Số buổi', key: 'value', width: 14 },
      ],
      rows: [
        ...PLAYDATE_STATUS_SEGMENTS.map(({ key, label }) => ({ label, value: playdates.byStatus[key] })),
        ...playdates.timeline.map(({ label, count }) => ({ label, value: count })),
      ],
    },
    {
      name: 'Thuê bao',
      columns: [
        { header: 'Gói', key: 'label', width: 24 },
        { header: 'Số tài khoản', key: 'value', width: 16 },
      ],
      rows: SUBSCRIPTION_PLAN_SEGMENTS.map(({ key, label }) => ({ label, value: subscriptions.byPlan[key] })),
    },
    {
      name: 'Sử dụng AI',
      columns: [
        { header: 'Kỳ / Phụ huynh', key: 'label', width: 28 },
        { header: 'Lượt hỏi', key: 'value', width: 14 },
        { header: 'Email', key: 'email', width: 32 },
      ],
      rows: [
        ...aiUsage.timeline.map(({ label, count }) => ({ label, value: count })),
        ...aiUsage.topParents.map(({ fullName, requestCount, email }) => ({
          label: fullName,
          value: requestCount,
          email: email || '',
        })),
      ],
    },
  ];
};

/**
 * Sheets of the parents page, from AdminUserListItemDTO rows
 */
export const buildUsersReportSheets = ({ users, stats, exportedAt = new Date() }) => [
  statsSheet(
    [
      { label: 'Tổng số tài khoản phụ huynh', value: stats?.total },
      { label: 'Đang hoạt động', value: stats?.active },
      { label: 'Đã khóa', value: stats?.locked },
      { label: 'Premium đang hiệu lực', value: stats?.premium },
    ],
    exportedAt
  ),
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
    rows: users.map((user) => ({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.isActive ? 'Hoạt động' : 'Đã khóa',
      isVerified: user.isVerifiedParent ? 'Đã xác minh' : 'Chưa xác minh',
      plan: planName(user.currentPlan?.planCode),
      childrenCount: user.childrenCount,
      createdAt: formatDateTime(user.createdAt),
    })),
  },
];

/**
 * Sheets of the child profiles page, from AdminChildListItemDTO rows
 */
export const buildChildrenReportSheets = ({ children, stats, exportedAt = new Date() }) => {
  const genderLabels = { boy: 'Bé trai', girl: 'Bé gái' };

  return [
    statsSheet(
      [
        { label: 'Tổng số hồ sơ trẻ', value: stats?.total },
        { label: 'Chưa xóa', value: stats?.active },
        { label: 'Đã xóa', value: stats?.archived },
        { label: 'Khóa do gói Free', value: stats?.planLocked },
      ],
      exportedAt
    ),
    {
      name: 'Danh sách hồ sơ trẻ',
      columns: [
        { header: 'Tên bé', key: 'displayName', width: 22 },
        { header: 'Phụ huynh', key: 'parentName', width: 24 },
        { header: 'Giới tính', key: 'gender', width: 14 },
        { header: 'Tuổi', key: 'age', width: 10 },
        { header: 'Trạng thái', key: 'status', width: 16 },
        { header: 'Khóa do gói', key: 'isPlanLocked', width: 16 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      ],
      rows: children.map((child) => ({
        displayName: child.displayName,
        parentName: child.parentName,
        gender: genderLabels[child.gender] || child.gender,
        age: child.age,
        status: child.isArchived ? 'Đã xóa' : 'Chưa xóa',
        isPlanLocked: child.visibility === 'plan_locked' ? 'Bị khóa' : 'Không',
        createdAt: formatDateTime(child.createdAt),
      })),
    },
  ];
};

/**
 * Sheets of the playdates page, from AdminPlaydateDTO rows
 */
export const buildPlaydatesReportSheets = ({ playdates, stats, exportedAt = new Date() }) => {
  const statusLabels = Object.fromEntries(PLAYDATE_STATUS_SEGMENTS.map(({ key, label }) => [key, label]));

  return [
    statsSheet(
      [
        { label: 'Tổng số buổi hẹn', value: stats?.total },
        ...PLAYDATE_STATUS_SEGMENTS.map(({ key, label }) => ({ label, value: stats?.[key] })),
      ],
      exportedAt
    ),
    {
      name: 'Danh sách buổi hẹn',
      columns: [
        { header: 'Hoạt động', key: 'activity', width: 30 },
        { header: 'Người tổ chức', key: 'hostName', width: 24 },
        { header: 'Bé chủ trì', key: 'hostChild', width: 20 },
        { header: 'Địa điểm', key: 'location', width: 32 },
        { header: 'Thời gian bắt đầu', key: 'scheduledDate', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 18 },
        { header: 'Số người tham gia', key: 'participantsCount', width: 18 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      ],
      rows: playdates.map((playdate) => ({
        activity: playdate.activity,
        hostName: playdate.host?.parent?.fullName || '',
        hostChild: playdate.host?.child?.displayName || '',
        location: playdate.locationName,
        scheduledDate: `${dayjs(playdate.scheduledDate).format('DD/MM/YYYY')} ${playdate.time}`.trim(),
        status: statusLabels[playdate.status] || playdate.status,
        participantsCount: playdate.numberOfParticipants,
        createdAt: formatDateTime(playdate.createdAt),
      })),
    },
  ];
};

/**
 * Sheets of the connections page, from AdminConnectionDTO rows
 */
export const buildConnectionsReportSheets = ({ connections, stats, exportedAt = new Date() }) => {
  const statusLabels = Object.fromEntries(CONNECTION_STATUS_ROWS.map(({ key, label }) => [key, label]));

  return [
    statsSheet(
      [
        { label: 'Tổng số yêu cầu kết nối', value: stats?.total },
        ...CONNECTION_STATUS_ROWS.map(({ key, label }) => ({ label, value: stats?.[key] })),
      ],
      exportedAt
    ),
    {
      name: 'Danh sách kết nối',
      columns: [
        { header: 'Người gửi', key: 'requesterName', width: 24 },
        { header: 'Người nhận', key: 'recipientName', width: 24 },
        { header: 'Trạng thái', key: 'status', width: 18 },
        { header: 'Ngày gửi yêu cầu', key: 'createdAt', width: 20 },
        { header: 'Ngày kết nối', key: 'connectedAt', width: 20 },
      ],
      rows: connections.map((connection) => ({
        requesterName: connection.requester?.fullName || '',
        recipientName: connection.recipient?.fullName || '',
        status: statusLabels[connection.status] || connection.status,
        createdAt: formatDateTime(connection.createdAt),
        connectedAt: connection.connectedAt ? formatDateTime(connection.connectedAt) : '',
      })),
    },
  ];
};
