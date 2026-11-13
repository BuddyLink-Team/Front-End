import {
  CLUSTER_SEVERITY_WEIGHTS,
  formatPolicyClause,
  formatTimeWindow,
  getReportCategoryLabel,
  getSentinelVerdict,
  planSentinelCluster,
  SENTINEL_VERDICT_DISPLAY,
} from '../constants/admin.constants';

export const SENTINEL_SANCTION_LABELS = Object.freeze({
  warn: 'Gửi cảnh cáo',
  delete_message: 'Xóa tin nhắn vi phạm',
  cancel_playdate: 'Hủy buổi hẹn chơi',
  suspend: 'Tạm đình chỉ tài khoản',
  ban: 'Khóa tài khoản vĩnh viễn',
});

export const SENTINEL_RISK_BADGES = Object.freeze({
  high: { label: 'Rủi ro cao', className: 'bg-error-soft text-error-dark border-error/20' },
  medium: { label: 'Rủi ro trung bình', className: 'bg-tertiary-soft text-tertiary-dark border-tertiary-border' },
  low: { label: 'Rủi ro thấp', className: 'bg-primary-soft text-primary-dark border-primary-border' },
});

const NO_SANCTION_REASONS = Object.freeze({
  no_violation: 'AI kết luận không có vi phạm nên không đề xuất chế tài.',
  unclear: 'AI chưa đủ căn cứ để đề xuất chế tài.',
  none: 'Bản phân tích này chưa có kết luận của AI.',
});

/**
 * Content of a Sentinel assessment as shown to the admin: the same wording, numbers and sanctions in the
 * report drawer and in the scan overview. Numbers come from the backend, nothing is guessed here.
 * @param {Object} report - Report with its `sentinelAssessment`
 * @returns {Object|null} null when the report has no assessment
 */
export const buildSentinelView = (report) => {
  const assessment = report?.sentinelAssessment;
  if (!assessment) return null;

  const monitoring = assessment.monitoring || {};
  const verdict = getSentinelVerdict(assessment);
  const isViolation = verdict === 'violation';
  const reportsReceived = monitoring.reportsReceived ?? 1;
  const timeWindow = formatTimeWindow(monitoring.timeWindow);
  const reportersCount = monitoring.uniqueReportersCount ?? reportsReceived;
  const strikeCount = assessment.strikeCount ?? 1;
  const credibilityLabel = monitoring.reporterCredibility?.label || 'Chưa có đánh giá độ tin cậy người báo cáo';
  const evidenceNotes = assessment.evidenceAnalysis?.notes || '';
  const isRestrictionApplied = Boolean(monitoring.temporaryRestriction?.applied);

  // Assessments stored without their steps: the same facts, written from the numbers above
  const investigationSteps = monitoring.investigationSteps?.length
    ? monitoring.investigationSteps
    : [
        `Phân loại nội dung báo cáo: danh mục "${getReportCategoryLabel(report.category)}"${assessment.violationType ? ` — ${assessment.violationType}` : ''}.`,
        ...(evidenceNotes ? [`Kiểm tra tin nhắn và bằng chứng liên quan: ${evidenceNotes}`] : []),
        `Mật độ báo cáo: ${reportsReceived} báo cáo từ ${reportersCount} phụ huynh trong ${timeWindow}.`,
        `Lịch sử vi phạm đã được xác nhận: đang xét lần vi phạm thứ ${strikeCount}.`,
        `Độ tin cậy người báo cáo: ${credibilityLabel}.`,
      ];

  return {
    assessment,
    verdict,
    verdictDisplay: SENTINEL_VERDICT_DISPLAY[verdict],
    isViolation,
    confidence: assessment.confidenceScore ?? 0,
    reportsReceived,
    timeWindow,
    reportersCount,
    riskLevel: monitoring.riskLevel || 'low',
    densityLabel: `${reportsReceived} báo cáo trong ${timeWindow} (${reportersCount} phụ huynh báo cáo)`,
    credibilityLabel,
    evidenceLabel: assessment.evidenceAnalysis?.isValid
      ? 'Bằng chứng tin nhắn / hình ảnh khớp với nội dung tố cáo'
      : 'Cần Admin kiểm tra thêm ngữ cảnh trực tiếp',
    evidenceNotes,
    corroboration: assessment.corroboration || null,
    corroborationLabel: assessment.corroboration
      ? `${assessment.corroboration.reporterCount}/${assessment.corroboration.requiredReporters} phụ huynh báo cáo trong ` +
        `${assessment.corroboration.windowDays} ngày — ` +
        (assessment.corroboration.isCorroborated ? 'đủ điều kiện để AI tự xử lý' : 'chưa đủ, AI không tự áp dụng chế tài')
      : '',
    investigationSteps,
    isRestrictionApplied,
    restrictionBadgeLabel: monitoring.temporaryRestriction?.badgeLabel || 'Đang hạn chế nhắn tin',
    restrictionSteps: isRestrictionApplied ? monitoring.temporaryRestriction.steps || [] : [],
    policyClause: formatPolicyClause(assessment.policyClause) || 'Quy chuẩn kiểm duyệt cơ bản',
    strikeCount,
    // The AI recommends sanctions only for a violation
    recommendedSanctions: isViolation ? assessment.recommendedSanctions || [] : [],
    noSanctionReason: isViolation
      ? ''
      : NO_SANCTION_REASONS[verdict === 'no_violation' ? 'no_violation' : assessment.verdict ? 'unclear' : 'none'],
    summary: assessment.summary || '',
  };
};

/**
 * The report a cluster is shown by: the one its quick handling applies the sanctions from
 * (planSentinelCluster), otherwise the most severe assessed report, otherwise the first one.
 * @param {Array<Object>} reports - Open reports against one parent
 * @returns {Object|undefined}
 */
export const pickClusterPrimaryReport = (reports = []) => {
  const { primaryId } = planSentinelCluster(reports);
  const planned = primaryId ? reports.find((report) => report.id === primaryId) : null;
  if (planned) return planned;
  const assessed = reports
    .filter((report) => Boolean(report.sentinelAssessment))
    .sort(
      (a, b) =>
        (CLUSTER_SEVERITY_WEIGHTS[b.severity] || 0) - (CLUSTER_SEVERITY_WEIGHTS[a.severity] || 0) ||
        new Date(a.createdAt) - new Date(b.createdAt),
    );
  return assessed[0] || reports[0];
};
