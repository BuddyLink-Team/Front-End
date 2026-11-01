import { INITIAL_MOCK_ADMIN_REPORTS } from './adminReportMockData';

const STORAGE_KEY = 'buddylink_mock_admin_reports_v1';
const MOCK_ADMIN = Object.freeze({ id: 'admin-mock', fullName: 'admin@buddylink.vn', email: 'admin@buddylink.vn' });
const SEVERITY_WEIGHTS = Object.freeze({ critical: 4, high: 3, medium: 2, low: 1 });
const OPEN_STATUSES = ['pending', 'reviewing'];
const CLOSED_STATUSES = ['resolved', 'dismissed'];
const HOUR_MS = 60 * 60 * 1000;
const OVERDUE_HOURS = Object.freeze({ critical: 2, other: 24 });

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const fail = (status, code, message) => {
  const error = new Error(message);
  error.response = { status, data: { success: false, message, error: { code } } };
  return error;
};

const isOverdue = (report) => {
  if (!OPEN_STATUSES.includes(report.status)) return false;
  const limit = report.severity === 'critical' ? OVERDUE_HOURS.critical : OVERDUE_HOURS.other;
  return Date.now() - new Date(report.createdAt).getTime() > limit * HOUR_MS;
};

const logEntry = (eventType, fromStatus, toStatus, note) => ({
  id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  eventType,
  fromStatus,
  toStatus,
  by: MOCK_ADMIN,
  at: new Date().toISOString(),
  note,
});

/**
 * Stateful mock of the admin report moderation API, kept in localStorage.
 * Follows the same rules as the API, with the same error codes.
 */
class AdminReportMockService {
  _getReports() {
    if (typeof window === 'undefined') return structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    } catch {
      return structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    }
  }

  _saveReports(reports) {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  resetFactoryData() {
    this._saveReports(structuredClone(INITIAL_MOCK_ADMIN_REPORTS));
  }

  // Every change goes through here: saves the report and answers with its new detail
  _update(id, change) {
    const reports = this._getReports();
    const report = reports.find((item) => item.id === id);
    if (!report) throw fail(404, 'REPORT_NOT_FOUND', 'Report not found');
    change(report, reports);
    report.updatedAt = new Date().toISOString();
    this._saveReports(reports);
    return { success: true, data: this._toDetail(report, reports) };
  }

  _toDetail(report, reports) {
    const others = reports.filter((item) => item.id !== report.id && item.reportedUser.id === report.reportedUser.id);
    return {
      ...report,
      isOverdue: isOverdue(report),
      relatedOpenReports: others
        .filter((item) => OPEN_STATUSES.includes(item.status))
        .map((item) => ({
          id: item.id,
          category: item.category,
          severity: item.severity,
          createdAt: item.createdAt,
          reporterName: item.reporter.fullName,
        })),
      reportedUser: {
        ...report.reportedUser,
        pastReports: others.map((item) => ({
          id: item.id,
          category: item.category,
          severity: item.severity,
          status: item.status,
          resolution: item.resolution,
          createdAt: item.createdAt,
          resolvedAt: item.resolvedAt,
        })),
        previousSanctions: others.flatMap((item) =>
          item.actions.map((action) => ({
            reportId: item.id,
            type: action.type,
            params: action.params,
            performedAt: action.performedAt,
            note: action.note,
          }))
        ),
      },
    };
  }

  /**
   * GET /admin/reports
   */
  async getReports(query = {}) {
    await delay();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = (query.search || '').trim().toLowerCase();
    const matchesSearch = ({ reporter, reportedUser }) =>
      [reporter.fullName, reporter.email, reportedUser.fullName, reportedUser.email].some((text) =>
        text.toLowerCase().includes(search)
      );

    const items = this._getReports()
      .filter((report) =>
        (!query.status || report.status === query.status) &&
        (!query.severity || report.severity === query.severity) &&
        (!query.category || report.category === query.category) &&
        (!query.targetType || report.targetType === query.targetType) &&
        (!query.assignedTo || report.assignedTo?.id === MOCK_ADMIN.id) &&
        (!query.fromDate || report.createdAt.slice(0, 10) >= query.fromDate) &&
        (!query.toDate || report.createdAt.slice(0, 10) <= query.toDate) &&
        (!search || matchesSearch(report))
      )
      .sort(
        (a, b) =>
          SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity] || new Date(a.createdAt) - new Date(b.createdAt)
      )
      .map((report) => ({
        ...report,
        isOverdue: isOverdue(report),
        reportedMessageContent: report.targetContext?.reportedMessage?.content || null,
      }));

    return {
      success: true,
      data: {
        items: items.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
      },
    };
  }

  /**
   * GET /admin/reports/stats
   */
  async getReportStats() {
    await delay();
    const reports = this._getReports();
    const countWith = (predicate) => reports.filter(predicate).length;
    const closed = reports.filter((report) => report.resolvedAt);
    const totalHours = closed.reduce(
      (sum, report) => sum + (new Date(report.resolvedAt) - new Date(report.createdAt)) / HOUR_MS,
      0
    );

    return {
      success: true,
      data: {
        total: reports.length,
        pending: countWith((report) => report.status === 'pending'),
        reviewing: countWith((report) => report.status === 'reviewing'),
        resolved: countWith((report) => report.status === 'resolved'),
        dismissed: countWith((report) => report.status === 'dismissed'),
        bySeverity: Object.fromEntries(
          Object.keys(SEVERITY_WEIGHTS).map((severity) => [severity, countWith((report) => report.severity === severity)])
        ),
        resolvedThisWeek: countWith((report) => report.status === 'resolved'),
        overdue: countWith(isOverdue),
        criticalPending: countWith((report) => report.status === 'pending' && report.severity === 'critical'),
        avgResolutionHours: closed.length > 0 ? Number((totalHours / closed.length).toFixed(1)) : 0,
      },
    };
  }

  /**
   * GET /admin/reports/:id
   */
  async getReportDetail(id) {
    await delay();
    const reports = this._getReports();
    const report = reports.find((item) => item.id === id);
    if (!report) throw fail(404, 'REPORT_NOT_FOUND', 'Report not found');
    return { success: true, data: this._toDetail(report, reports) };
  }

  /**
   * PATCH /admin/reports/:id/review
   */
  async reviewReport(id, { action }) {
    await delay();
    return this._update(id, (report) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(400, 'INVALID_STATUS_TRANSITION', 'Can only review open reports');
      }
      const fromStatus = report.status;
      report.status = 'reviewing';
      report.assignedTo = MOCK_ADMIN;
      report.history.push(logEntry(action, fromStatus, 'reviewing', 'Tiếp nhận xử lý vụ việc'));
    });
  }

  /**
   * PATCH /admin/reports/:id/severity
   */
  async updateReportSeverity(id, { severity }) {
    await delay();
    return this._update(id, (report) => {
      if (report.status !== 'reviewing') {
        throw fail(400, 'INVALID_STATUS_TRANSITION', 'Can only change severity when reviewing');
      }
      const note = `Đổi mức độ nghiêm trọng từ ${report.severity} sang ${severity}`;
      report.severity = severity;
      report.history.push(logEntry('severity_change', report.status, report.status, note));
    });
  }

  /**
   * POST /admin/reports/:id/action
   */
  async applyReportAction(id, { type, durationDays, note }) {
    await delay();
    return this._update(id, (report, reports) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(409, 'REPORT_ALREADY_CLOSED', 'Cannot apply action on closed report');
      }
      if (report.status !== 'reviewing') {
        throw fail(400, 'INVALID_STATUS_TRANSITION', 'Start reviewing the report first');
      }
      if (report.actions.some((action) => action.type === type)) {
        throw fail(409, 'ACTION_ALREADY_APPLIED', 'This action has already been applied');
      }

      // The account is the same on every report against this user
      const updateAccount = (change) =>
        reports
          .filter((item) => item.reportedUser.id === report.reportedUser.id)
          .forEach((item) => Object.assign(item.reportedUser, change));

      if (type === 'warn') {
        updateAccount({ strikeCount: report.reportedUser.strikeCount + 1 });
      } else if (type === 'suspend') {
        if (!report.reportedUser.isActive) throw fail(409, 'ACTION_ALREADY_APPLIED', 'This account is already locked');
        const until = new Date(Date.now() + durationDays * 24 * HOUR_MS).toISOString();
        updateAccount({ isActive: false, suspensionUntil: until });
      } else if (type === 'ban') {
        if (report.reportedUser.isBanned) throw fail(409, 'ACTION_ALREADY_APPLIED', 'Already banned');
        updateAccount({ isActive: false, isBanned: true, suspensionUntil: null });
      } else if (type === 'delete_message') {
        const message = report.targetContext?.reportedMessage;
        if (!message) throw fail(404, 'TARGET_NOT_FOUND', 'The reported message no longer exists');
        if (message.isDeleted) throw fail(409, 'ACTION_ALREADY_APPLIED', 'Message is already deleted');
        message.isDeleted = true;
        const inChat = report.targetContext.surroundingMessages.find((item) => item.id === message.id);
        if (inChat) inChat.isDeleted = true;
      } else if (type === 'cancel_playdate') {
        const playdate = report.targetContext?.playdate;
        if (!playdate) throw fail(404, 'TARGET_NOT_FOUND', 'The reported playdate no longer exists');
        if (playdate.status === 'cancelled') throw fail(409, 'ACTION_ALREADY_APPLIED', 'Playdate is already cancelled');
        playdate.status = 'cancelled';
      }

      report.actions.push({
        id: `action-${Date.now()}`,
        type,
        params: { durationDays: type === 'suspend' ? durationDays : null, reason: note || '' },
        performedBy: MOCK_ADMIN,
        performedAt: new Date().toISOString(),
        note: note || '',
      });
      report.history.push(logEntry('action_applied', report.status, report.status, note || `Đã thi hành chế tài: ${type}`));
    });
  }

  /**
   * PATCH /admin/reports/:id/resolve
   */
  async resolveReport(id, { status, resolution, adminNotes, applyToRelatedReportIds = [] }) {
    await delay();
    return this._update(id, (report, reports) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(409, 'REPORT_ALREADY_CLOSED', 'Report is already closed');
      }
      if (status === 'resolved' && report.status !== 'reviewing') {
        throw fail(400, 'INVALID_STATUS_TRANSITION', 'A report must be reviewed before it is resolved');
      }
      if (resolution === 'action_taken' && report.actions.length === 0) {
        throw fail(400, 'ACTIONS_REQUIRED_FOR_RESOLVE', 'action_taken requires at least one action');
      }
      const accountSanctions = report.actions.filter((action) => ['suspend', 'ban'].includes(action.type));
      if (applyToRelatedReportIds.length > 0 && accountSanctions.length === 0) {
        throw fail(400, 'RELATED_REPORTS_REQUIRE_SANCTION', 'Related reports need a suspension or a ban');
      }

      const close = (item, note) => {
        const fromStatus = item.status;
        Object.assign(item, {
          status,
          resolution,
          adminNotes,
          resolvedBy: MOCK_ADMIN,
          resolvedAt: new Date().toISOString(),
        });
        item.history.push(logEntry('status_change', fromStatus, status, note));
      };

      close(report, adminNotes);
      reports
        .filter(
          (item) =>
            applyToRelatedReportIds.includes(item.id) &&
            item.reportedUser.id === report.reportedUser.id &&
            OPEN_STATUSES.includes(item.status)
        )
        .forEach((related) => {
          related.actions.push(...accountSanctions.map((action) => ({ ...action, id: `${action.id}-${related.id}` })));
          close(related, `Đóng đồng loạt theo báo cáo ${report.id}: ${adminNotes}`);
        });
    });
  }

  /**
   * PATCH /admin/reports/:id/reopen
   */
  async reopenReport(id, { note }) {
    await delay();
    return this._update(id, (report) => {
      if (!CLOSED_STATUSES.includes(report.status)) {
        throw fail(400, 'INVALID_STATUS_TRANSITION', 'Only closed reports can be reopened');
      }
      const fromStatus = report.status;
      Object.assign(report, { status: 'reviewing', resolution: null, adminNotes: '', resolvedBy: null, resolvedAt: null });
      report.history.push(logEntry('reopen', fromStatus, 'reviewing', note));
    });
  }
}

export const adminReportMockService = new AdminReportMockService();
export default adminReportMockService;
