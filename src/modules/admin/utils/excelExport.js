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
  const overview = analytics.overview || analytics.summary || {};
  const filter = analytics.filter || {};
  const period =
    filter.fromDate && filter.toDate
      ? `${formatDate(filter.fromDate)} - ${formatDate(filter.toDate)}`
      : 'Toàn thời gian';

  const formatKpiChange = (kpi) => {
    if (!kpi) return '';
    if (kpi.changePercent === null || kpi.changePercent === undefined) return '—';
    return `${kpi.changePercent > 0 ? '+' : ''}${kpi.changePercent}%`;
  };

  const getKpiVal = (kpi, fallback = 0) => kpi?.value ?? kpi?.current ?? fallback;
  const getKpiPrev = (kpi, fallback = 0) => kpi?.previousValue ?? kpi?.previous ?? fallback;

  const totalParents = overview.totalParents || overview.parents;
  const newParents = overview.newParents || overview.parents;
  const activeUsers = overview.activeUsers;
  const totalChildren = overview.totalChildProfiles || overview.children;
  const totalPlaydates = overview.totalPlaydates || overview.playdates;
  const connections = overview.acceptedConnections || overview.connections;
  const subscriptions = overview.activePremiumSubscriptions || overview.subscriptions;
  const revenue = overview.totalRevenue || overview.revenue;
  const aiUsage = overview.aiUsage;

  const userGrowthRows = analytics.userGrowth?.timeline || analytics.charts?.userGrowth || [];
  const revenueTimelineRows = analytics.revenue?.timeline || analytics.charts?.revenue || [];
  const revenueMap = new Map(
    revenueTimelineRows.map((r) => [r.period || r.date, r])
  );

  const conversionRows = analytics.conversion?.funnel || analytics.charts?.conversionFunnel || [];
  const topUsersRows =
    analytics.aiUsage?.topParents ||
    analytics.aiUsage?.topUsers ||
    analytics.charts?.aiUsage?.topUsers ||
    [];
  const ageGroupRows = analytics.children?.byAgeGroup || analytics.charts?.childAgeGroups || [];

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
        {
          label: 'Tổng phụ huynh',
          value: getKpiVal(totalParents, overview.parents?.total || 0),
          previousValue: getKpiPrev(totalParents, overview.parents?.previous || 0),
          change: formatKpiChange(totalParents),
        },
        {
          label: 'Phụ huynh mới',
          value: getKpiVal(newParents),
          previousValue: getKpiPrev(newParents),
          change: formatKpiChange(newParents),
        },
        {
          label: 'Người dùng hoạt động',
          value: getKpiVal(activeUsers),
          previousValue: getKpiPrev(activeUsers),
          change: formatKpiChange(activeUsers),
        },
        {
          label: 'Tổng hồ sơ trẻ',
          value: getKpiVal(totalChildren, overview.children?.total || 0),
          previousValue: getKpiPrev(totalChildren, overview.children?.previous || 0),
          change: formatKpiChange(totalChildren),
        },
        {
          label: 'Buổi hẹn chơi (Playdates)',
          value: getKpiVal(totalPlaydates, overview.playdates?.total || 0),
          previousValue: getKpiPrev(totalPlaydates, overview.playdates?.previous || 0),
          change: formatKpiChange(totalPlaydates),
        },
        {
          label: 'Kết nối thành công',
          value: getKpiVal(connections, overview.connections?.accepted || 0),
          previousValue: getKpiPrev(connections, overview.connections?.previousAccepted || 0),
          change: formatKpiChange(connections),
        },
        {
          label: 'Thuê bao Premium hiệu lực',
          value: getKpiVal(subscriptions, overview.subscriptions?.active || 0),
          previousValue: getKpiPrev(subscriptions, overview.subscriptions?.previous || 0),
          change: formatKpiChange(subscriptions),
        },
        {
          label: 'Doanh thu',
          value: getKpiVal(revenue),
          previousValue: getKpiPrev(revenue),
          change: formatKpiChange(revenue),
          numFmt: MONEY_FORMAT,
        },
        {
          label: 'Lượt tương tác AI Assistant',
          value: getKpiVal(aiUsage, overview.aiUsage?.currentRequests || 0),
          previousValue: getKpiPrev(aiUsage, overview.aiUsage?.previousRequests || 0),
          change: formatKpiChange(aiUsage),
        },
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
      rows: userGrowthRows.map((growthRow) => {
        const periodKey = growthRow.period || growthRow.date;
        const revRow = revenueMap.get(periodKey);
        return {
          period: formatDate(periodKey),
          newParents: growthRow.newParents ?? growthRow.count ?? 0,
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
      rows: conversionRows.map((step) => ({
        label: step.label || step.step,
        count: step.count,
        dropRate:
          step.dropRate !== null && step.dropRate !== undefined ? `${step.dropRate}%` : '—',
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
      rows: topUsersRows.map((p) => ({
        fullName: p.fullName || p.name || 'Phụ huynh',
        email: p.email || 'N/A',
        requestCount: p.requestCount ?? p.requests ?? 0,
        tokens: p.tokens || 0,
      })),
    },
    {
      name: 'Độ tuổi trẻ em',
      columns: [
        { header: 'Nhóm tuổi', key: 'group', width: 22 },
        { header: 'Số lượng bé', key: 'count', width: 18 },
      ],
      rows: ageGroupRows.map((g) => ({
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
      rows: users.map((u) => {
        const isVerified =
          u.isVerifiedParent ??
          u.profile?.verification?.isVerifiedParent ??
          u.verification?.isVerifiedParent ??
          false;
        const userPlanCode = u.currentPlan?.planCode || u.subscription?.planCode;
        return {
          fullName: u.fullName || u.profile?.fullName || 'N/A',
          email: u.email || 'N/A',
          phone: u.phone || 'Chưa cập nhật',
          status: u.isActive ? 'Hoạt động' : 'Đã khóa',
          isVerified: isVerified ? 'Đã xác minh' : 'Chưa xác minh',
          plan: planName(userPlanCode),
          childrenCount: u.childrenCount ?? u.activeChildrenCount ?? 0,
          createdAt: formatDateTime(u.createdAt),
        };
      }),
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
      rows: children.map((c) => {
        const isPlanLocked = c.isPlanLocked ?? c.visibility === 'plan_locked';
        return {
          displayName: c.displayName || 'N/A',
          parentName: c.parentName || c.parent?.fullName || 'N/A',
          gender: genderMap[c.gender] || c.gender || 'N/A',
          dateOfBirth: c.dateOfBirth ? formatDate(c.dateOfBirth) : 'N/A',
          interests: Array.isArray(c.interests) ? c.interests.join(', ') : '',
          favoriteActivities: Array.isArray(c.favoriteActivities) ? c.favoriteActivities.join(', ') : '',
          status: c.isArchived ? 'Đã lưu trữ' : 'Đang hoạt động',
          isPlanLocked: isPlanLocked ? 'Bị khóa' : 'Mở',
          createdAt: formatDateTime(c.createdAt),
        };
      }),
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
      rows: playdates.map((p) => {
        const startTimeStr = p.time || p.startTime || '';
        return {
          activity: p.activity || p.title || 'N/A',
          hostName: p.host?.parent?.fullName || p.hostParent?.fullName || p.creator?.fullName || 'N/A',
          hostChild: p.host?.child?.displayName || p.hostChild?.displayName || 'N/A',
          location: p.location?.name || p.location?.address || 'N/A',
          scheduledDate: p.scheduledDate ? `${formatDate(p.scheduledDate)} ${startTimeStr}`.trim() : 'N/A',
          status: statusMap[p.status] || p.status || 'N/A',
          participantsCount:
            p.numberOfParticipants ??
            (Array.isArray(p.participants) ? p.participants.length : 0),
          createdAt: formatDateTime(p.createdAt),
        };
      }),
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
