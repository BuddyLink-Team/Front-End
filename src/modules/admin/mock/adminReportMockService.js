import { INITIAL_MOCK_ADMIN_REPORTS } from './adminReportMockData';

const STORAGE_KEY = 'buddylink_mock_admin_reports_v1';
const MOCK_ADMIN = Object.freeze({
  id: 'admin-mock',
  fullName: 'admin@buddylink.vn',
  email: 'admin@buddylink.vn',
});
const SEVERITY_WEIGHTS = Object.freeze({
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
});
const OPEN_STATUSES = ['pending', 'reviewing'];
const CLOSED_STATUSES = ['resolved', 'dismissed'];
const HOUR_MS = 60 * 60 * 1000;
const OVERDUE_HOURS = Object.freeze({ critical: 2, other: 24 });

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const fail = (status, code, message) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { success: false, message, error: { code } },
  };
  return error;
};

const isOverdue = (report) => {
  if (!OPEN_STATUSES.includes(report.status)) return false;
  const limit =
    report.severity === 'critical'
      ? OVERDUE_HOURS.critical
      : OVERDUE_HOURS.other;
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
    if (typeof window === 'undefined')
      return structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? JSON.parse(stored)
        : structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    } catch {
      return structuredClone(INITIAL_MOCK_ADMIN_REPORTS);
    }
  }

  _saveReports(reports) {
    if (typeof window !== 'undefined')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
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

  // Mirrors the backend rule: 3 distinct parents, same category, within 7 days of the report
  _corroborationOf(report, reports) {
    const anchor = new Date(report.createdAt).getTime();
    const windowStart = anchor - 7 * 24 * HOUR_MS;
    const windowEnd = anchor + 7 * 24 * HOUR_MS;
    const reporterIds = new Set(
      reports
        .filter(
          (item) =>
            (item.id === report.id || OPEN_STATUSES.includes(item.status)) &&
            item.reportedUser.id === report.reportedUser.id &&
            item.category === report.category &&
            new Date(item.createdAt).getTime() >= windowStart &&
            new Date(item.createdAt).getTime() <= windowEnd,
        )
        .map((item) => item.reporter.id),
    );
    return {
      isCorroborated: reporterIds.size >= 3,
      reporterCount: reporterIds.size,
      requiredReporters: 3,
      incidentCount: reporterIds.size,
      windowDays: 7,
    };
  }

  _toDetail(report, reports) {
    const others = reports.filter(
      (item) =>
        item.id !== report.id &&
        item.reportedUser.id === report.reportedUser.id,
    );
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
          })),
        ),
      },
      policyGuidance: this._toPolicyGuidance(report),
      sentinelAssessment: this._toLiveAssessment(report, reports),
    };
  }

  // Like the backend: an open report shows rule numbers of now, a closed one keeps what was decided
  _toLiveAssessment(report, reports) {
    const assessment = report.sentinelAssessment;
    if (!assessment?.assessedAt || !OPEN_STATUSES.includes(report.status)) {
      return assessment || null;
    }
    const assessedAt = new Date(assessment.assessedAt).getTime();
    return {
      ...assessment,
      corroboration: this._corroborationOf(report, reports),
      newReportsSinceAssessment: reports.filter(
        (item) =>
          item.id !== report.id &&
          item.reportedUser.id === report.reportedUser.id &&
          OPEN_STATUSES.includes(item.status) &&
          new Date(item.createdAt).getTime() > assessedAt,
      ).length,
    };
  }

  // Simplified stand-in for the backend policy matrix (moderation-policy.rules.js)
  _toPolicyGuidance(report) {
    const assessment = report.sentinelAssessment;
    if (!assessment?.assessedAt) return null;
    const standardActions = assessment.recommendedSanctions || [];
    return {
      strikeCount: assessment.strikeCount || 1,
      strikeLevel: Math.min(3, assessment.strikeCount || 1),
      clause: assessment.policyClause || '',
      standardActions,
      allowedActionTypes: standardActions.map((action) => action.type),
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
      [
        reporter.fullName,
        reporter.email,
        reportedUser.fullName,
        reportedUser.email,
      ].some((text) => text.toLowerCase().includes(search));

    const items = this._getReports()
      .filter(
        (report) =>
          (!query.status || report.status === query.status) &&
          (!query.severity || report.severity === query.severity) &&
          (!query.category || report.category === query.category) &&
          (!query.targetType || report.targetType === query.targetType) &&
          (!query.assignedTo || report.assignedTo?.id === MOCK_ADMIN.id) &&
          (!query.fromDate ||
            report.createdAt.slice(0, 10) >= query.fromDate) &&
          (!query.toDate || report.createdAt.slice(0, 10) <= query.toDate) &&
          (!search || matchesSearch(report)),
      )
      .sort(
        (a, b) =>
          SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity] ||
          new Date(a.createdAt) - new Date(b.createdAt),
      )
      .map((report) => ({
        ...report,
        isOverdue: isOverdue(report),
        reportedMessageContent:
          report.targetContext?.reportedMessage?.content || null,
      }));

    return {
      success: true,
      data: {
        items: items.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: Math.ceil(items.length / limit),
        },
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
      (sum, report) =>
        sum +
        (new Date(report.resolvedAt) - new Date(report.createdAt)) / HOUR_MS,
      0,
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
          Object.keys(SEVERITY_WEIGHTS).map((severity) => [
            severity,
            countWith((report) => report.severity === severity),
          ]),
        ),
        resolvedThisWeek: countWith((report) => report.status === 'resolved'),
        overdue: countWith(isOverdue),
        criticalPending: countWith(
          (report) =>
            report.status === 'pending' && report.severity === 'critical',
        ),
        avgResolutionHours:
          closed.length > 0
            ? Number((totalHours / closed.length).toFixed(1))
            : 0,
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
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'Can only review open reports',
        );
      }
      const fromStatus = report.status;
      report.status = 'reviewing';
      report.assignedTo = MOCK_ADMIN;
      report.history.push(
        logEntry(action, fromStatus, 'reviewing', 'Tiếp nhận xử lý vụ việc'),
      );
    });
  }

  /**
   * PATCH /admin/reports/:id/severity
   */
  async updateReportSeverity(id, { severity }) {
    await delay();
    return this._update(id, (report) => {
      if (report.status !== 'reviewing') {
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'Can only change severity when reviewing',
        );
      }
      const note = `Đổi mức độ nghiêm trọng từ ${report.severity} sang ${severity}`;
      report.severity = severity;
      report.history.push(
        logEntry('severity_change', report.status, report.status, note),
      );
    });
  }

  /**
   * POST /admin/reports/:id/action
   */
  async applyReportAction(
    id,
    { type, durationDays, note, isPolicyOverride, overrideReason },
  ) {
    await delay();
    return this._update(id, (report, reports) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(
          409,
          'REPORT_ALREADY_CLOSED',
          'Cannot apply action on closed report',
        );
      }
      if (report.status !== 'reviewing') {
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'Start reviewing the report first',
        );
      }
      if (report.actions.some((action) => action.type === type)) {
        throw fail(
          409,
          'ACTION_ALREADY_APPLIED',
          'This action has already been applied',
        );
      }

      // If report has AI assessment, check policy compliance
      if (report.sentinelAssessment?.assessedAt) {
        const allowedTypes = (
          report.sentinelAssessment.recommendedSanctions || []
        ).map((s) => s.type);
        if (allowedTypes.length > 0 && !allowedTypes.includes(type)) {
          if (!isPolicyOverride) {
            throw fail(
              422,
              'POLICY_OVERRIDE_REQUIRED',
              'Chế tài này nằm ngoài khung quy chuẩn.',
            );
          }
          if (!overrideReason || overrideReason.trim().length < 20) {
            throw fail(
              422,
              'OVERRIDE_REASON_REQUIRED',
              'Lý do giải trình tối thiểu 20 ký tự.',
            );
          }
        }
      }

      // The account is the same on every report against this user
      const updateAccount = (change) =>
        reports
          .filter((item) => item.reportedUser.id === report.reportedUser.id)
          .forEach((item) => Object.assign(item.reportedUser, change));

      if (type === 'warn') {
        updateAccount({ strikeCount: report.reportedUser.strikeCount + 1 });
      } else if (type === 'suspend') {
        if (!report.reportedUser.isActive)
          throw fail(
            409,
            'ACTION_ALREADY_APPLIED',
            'This account is already locked',
          );
        const until = new Date(
          Date.now() + durationDays * 24 * HOUR_MS,
        ).toISOString();
        updateAccount({ isActive: false, suspensionUntil: until });
      } else if (type === 'ban') {
        if (report.reportedUser.isBanned)
          throw fail(409, 'ACTION_ALREADY_APPLIED', 'Already banned');
        updateAccount({
          isActive: false,
          isBanned: true,
          suspensionUntil: null,
        });
      } else if (type === 'delete_message') {
        const message = report.targetContext?.reportedMessage;
        if (!message)
          throw fail(
            404,
            'TARGET_NOT_FOUND',
            'The reported message no longer exists',
          );
        if (message.isDeleted)
          throw fail(
            409,
            'ACTION_ALREADY_APPLIED',
            'Message is already deleted',
          );
        message.isDeleted = true;
        const inChat = report.targetContext.surroundingMessages.find(
          (item) => item.id === message.id,
        );
        if (inChat) inChat.isDeleted = true;
      } else if (type === 'cancel_playdate') {
        const playdate = report.targetContext?.playdate;
        if (!playdate)
          throw fail(
            404,
            'TARGET_NOT_FOUND',
            'The reported playdate no longer exists',
          );
        if (playdate.status === 'cancelled')
          throw fail(
            409,
            'ACTION_ALREADY_APPLIED',
            'Playdate is already cancelled',
          );
        playdate.status = 'cancelled';
      }

      report.actions.push({
        id: `action-${Date.now()}`,
        type,
        params: {
          durationDays: type === 'suspend' ? durationDays : null,
          reason: note || '',
        },
        performedBy: MOCK_ADMIN,
        performedAt: new Date().toISOString(),
        note: note || '',
      });
      report.history.push(
        logEntry(
          'action_applied',
          report.status,
          report.status,
          note || `Đã thi hành chế tài: ${type}`,
        ),
      );
    });
  }

  /**
   * PATCH /admin/reports/:id/resolve
   */
  async resolveReport(
    id,
    { status, resolution, adminNotes, applyToRelatedReportIds = [] },
  ) {
    await delay();
    return this._update(id, (report, reports) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(409, 'REPORT_ALREADY_CLOSED', 'Report is already closed');
      }
      if (status === 'resolved' && report.status !== 'reviewing') {
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'A report must be reviewed before it is resolved',
        );
      }
      // Like the backend: the outcome matches the official (non provisional) sanctions
      const hasOfficialSanction = report.actions.some(
        (action) => !action.isProvisional,
      );
      if (resolution === 'action_taken' && !hasOfficialSanction) {
        throw fail(
          400,
          'ACTIONS_REQUIRED_FOR_RESOLVE',
          'action_taken requires at least one action',
        );
      }
      if (resolution !== 'action_taken' && hasOfficialSanction) {
        throw fail(
          400,
          'RESOLUTION_CONFLICTS_WITH_ACTIONS',
          'Sanctions were applied: only action_taken is possible',
        );
      }
      const accountSanctions = report.actions.filter((action) =>
        ['suspend', 'ban'].includes(action.type),
      );
      if (applyToRelatedReportIds.length > 0 && accountSanctions.length === 0) {
        throw fail(
          400,
          'RELATED_REPORTS_REQUIRE_SANCTION',
          'Related reports need a suspension or a ban',
        );
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
            OPEN_STATUSES.includes(item.status),
        )
        .forEach((related) => {
          related.actions.push(
            ...accountSanctions.map((action) => ({
              ...action,
              id: `${action.id}-${related.id}`,
            })),
          );
          close(
            related,
            `Đóng đồng loạt theo báo cáo ${report.id}: ${adminNotes}`,
          );
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
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'Only closed reports can be reopened',
        );
      }
      const fromStatus = report.status;
      Object.assign(report, {
        status: 'reviewing',
        resolution: null,
        adminNotes: '',
        resolvedBy: null,
        resolvedAt: null,
      });
      report.history.push(logEntry('reopen', fromStatus, 'reviewing', note));
    });
  }

  /**
   * POST /admin/reports/:id/sentinel-assess
   */
  async assessReportWithSentinel(id, { forceRefresh = false } = {}) {
    await delay();
    return this._update(id, (report, reports) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(
          400,
          'INVALID_STATUS_TRANSITION',
          'Cannot assess closed report',
        );
      }
      if (report.sentinelAssessment && !forceRefresh) {
        return;
      }
      const priorStrikes = report.reportedUser?.strikeCount || 0;
      const isCritical =
        report.severity === 'critical' || report.category === 'child_safety';
      const recommendedSanctions = isCritical
        ? [{ type: 'delete_message' }, { type: 'ban' }]
        : priorStrikes >= 2
          ? [{ type: 'suspend', durationDays: 7 }]
          : [{ type: 'warn' }];

      const corroboration = this._corroborationOf(report, reports);
      report.sentinelAssessment = {
        assessedAt: new Date().toISOString(),
        confidenceScore: 88,
        verdict: 'violation',
        violationType: report.category,
        summary: `Sentinel AI đã tổng hợp vụ việc: Phát hiện dấu hiệu vi phạm ${report.category}. Khuyến nghị xử lý dựa trên tiền sử ${priorStrikes} strike.`,
        recommendedSanctions,
        corroboration,
        autoResolveEligible:
          !isCritical && priorStrikes < 2 && corroboration.isCorroborated,
        isFallback: false,
        strikeCount: priorStrikes + 1,
        policyClause: isCritical
          ? 'Điều 1.1: Không khoan nhượng với vi phạm an toàn trẻ em'
          : 'Điều 7.1: Vi phạm chung Quy chuẩn Cộng đồng',
        monitoring: {
          reportsReceived: 1,
          timeWindow: '30 phút',
          riskLevel: isCritical ? 'high' : 'medium',
          uniqueReportersCount: 1,
          reporterCredibility: {
            score: 85,
            label: 'Đáng tin cậy — Tài khoản hoạt động bình thường',
          },
        },
      };
      report.history.push(
        logEntry(
          'sentinel_assessment',
          report.status,
          report.status,
          'Sentinel AI thẩm định vụ việc',
        ),
      );
    });
  }

  /**
   * POST /admin/reports/:id/sentinel-apply
   */
  async applySentinelRecommendation(id, { note = '' } = {}) {
    await delay();
    let applied = [];
    let notApplicable = [];
    const result = this._update(id, (report) => {
      if (CLOSED_STATUSES.includes(report.status)) {
        throw fail(409, 'REPORT_ALREADY_CLOSED', 'Report is already closed');
      }
      if (!report.sentinelAssessment) {
        throw fail(
          400,
          'NO_SENTINEL_ASSESSMENT',
          'No Sentinel assessment available for this report',
        );
      }
      // A no-show playdate is already over: cancelling it is not applicable (as in the backend)
      const isHeldPlaydate = report.category === 'no_show';
      const recommended = report.sentinelAssessment.recommendedSanctions || [];
      notApplicable = recommended
        .filter(
          (sanction) => sanction.type === 'cancel_playdate' && isHeldPlaydate,
        )
        .map((sanction) => ({
          type: sanction.type,
          reason: 'PLAYDATE_NOT_OPEN',
        }));
      const sanctions = recommended.filter(
        (sanction) =>
          !notApplicable.some((item) => item.type === sanction.type),
      );
      // Like the backend: only the missing sanctions, and the report stays open for the conclusion
      const missing = sanctions.filter(
        (sanction) => !report.actions.some((a) => a.type === sanction.type),
      );
      applied = missing.map((sanction) => sanction.type);
      missing.forEach((sanction) => {
        report.actions.push({
          id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: sanction.type,
          params: { durationDays: sanction.durationDays || null },
          performedBy: MOCK_ADMIN,
          performedAt: new Date().toISOString(),
          note: note || 'Áp dụng theo đề xuất của Sentinel AI',
        });
      });
      if (report.status === 'pending') {
        report.status = 'reviewing';
        report.assignedTo = MOCK_ADMIN;
      }
      report.history.push(
        logEntry(
          'action_applied',
          report.status,
          report.status,
          'Áp dụng chế tài theo đề xuất Sentinel AI',
        ),
      );
    });
    return {
      ...result,
      data: {
        ...result.data,
        sentinelApplyResult: { applied, failed: [], notApplicable },
      },
    };
  }

  /**
   * POST /admin/reports/sentinel-batch-scan
   */
  async batchScanSentinel() {
    await delay();
    const reports = this._getReports();
    let scannedCount = 0;
    let highConfidenceCount = 0;
    let autoResolvedCount = 0;

    reports.forEach((report) => {
      if (OPEN_STATUSES.includes(report.status) && !report.sentinelAssessment) {
        scannedCount += 1;
        highConfidenceCount += 1;
        report.sentinelAssessment = {
          assessedAt: new Date().toISOString(),
          confidenceScore: 85,
          verdict: 'violation',
          summary: 'Quét tự động hàng loạt từ Sentinel AI.',
          recommendedSanctions: [{ type: 'warn' }],
          corroboration: this._corroborationOf(report, reports),
          autoResolveEligible: this._corroborationOf(report, reports)
            .isCorroborated,
          isFallback: false,
          strikeCount: (report.reportedUser?.strikeCount || 0) + 1,
          policyClause: 'Điều 7.1: Vi phạm chung Quy chuẩn Cộng đồng',
          monitoring: {
            reportsReceived: 1,
            timeWindow: '30 phút',
            riskLevel: 'medium',
            uniqueReportersCount: 1,
          },
        };
      }
    });

    this._saveReports(reports);
    return {
      success: true,
      data: {
        scannedCount,
        highConfidenceCount,
        autoResolvedCount,
        scannedReports: reports.filter((r) => OPEN_STATUSES.includes(r.status)),
        scannedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * POST /admin/reports/sentinel-batch-apply
   */
  /**
   * POST /admin/reports/sentinel-cluster-resolve (simplified backend rules: the sanctions once on the
   * first violation report, the other violations closed with it, the false reports dismissed)
   */
  async resolveSentinelCluster({ reportIds = [], note = '' } = {}) {
    await delay();
    const reports = this._getReports();
    const cluster = reports.filter(
      (report) =>
        reportIds.includes(report.id) && OPEN_STATUSES.includes(report.status),
    );
    const result = {
      sanctionedReportId: null,
      applied: [],
      resolved: [],
      dismissed: [],
      skipped: [],
      failed: [],
    };
    const now = new Date().toISOString();
    const close = (report, status, resolution, notes) => {
      report.status = status;
      report.resolution = resolution;
      report.adminNotes = notes;
      report.resolvedBy = MOCK_ADMIN;
      report.resolvedAt = now;
      report.history.push(
        logEntry('status_change', 'reviewing', status, notes),
      );
    };

    cluster.forEach((report) => {
      const assessment = report.sentinelAssessment;
      const notes =
        note ||
        assessment?.draftNotes?.adminNote ||
        'Xử lý nhanh cụm theo Sentinel AI.';
      if (assessment?.verdict === 'no_violation') {
        close(report, 'dismissed', 'dismissed', notes);
        result.dismissed.push(report.id);
      } else if (
        assessment?.verdict === 'violation' &&
        report.category !== 'child_safety' &&
        report.severity !== 'critical'
      ) {
        const isFirst = !result.sanctionedReportId;
        (assessment.recommendedSanctions || []).forEach((sanction) => {
          report.actions.push({
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: sanction.type,
            params: { durationDays: sanction.durationDays || null },
            performedBy: MOCK_ADMIN,
            performedAt: now,
            note: isFirst ? notes : 'Xử lý chung cụm',
          });
          if (isFirst) result.applied.push(sanction.type);
        });
        if (isFirst) result.sanctionedReportId = report.id;
        close(report, 'resolved', 'action_taken', notes);
        result.resolved.push(report.id);
      } else {
        result.skipped.push({
          id: report.id,
          reason: 'Cần Admin xử lý trong chi tiết',
        });
      }
    });

    this._saveReports(reports);
    return { success: true, data: result };
  }

  async batchApplySentinel({ minConfidence = 80 } = {}) {
    await delay();
    const reports = this._getReports();
    let executedCount = 0;

    reports.forEach((report) => {
      if (
        OPEN_STATUSES.includes(report.status) &&
        report.sentinelAssessment &&
        (report.sentinelAssessment.confidenceScore || 0) >= minConfidence &&
        report.sentinelAssessment.autoResolveEligible
      ) {
        executedCount += 1;
        report.status = 'resolved';
        report.resolution = 'action_taken';
        report.adminNotes = `Tự động xử lý hàng loạt theo Sentinel AI (độ tự tin ${report.sentinelAssessment.confidenceScore}%).`;
        report.resolvedAt = new Date().toISOString();
        report.resolvedBy = {
          id: null,
          fullName: 'Sentinel AI',
          isSystem: true,
        };
      }
    });

    this._saveReports(reports);
    return {
      success: true,
      data: {
        executedCount,
        minConfidence,
      },
    };
  }
}

export const adminReportMockService = new AdminReportMockService();
export default adminReportMockService;
