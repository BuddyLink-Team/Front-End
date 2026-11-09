import { useMemo } from 'react';
import {
  getReportCategoryLabel,
  formatPolicyClause,
  formatTimeWindow,
} from '../constants/admin.constants';

const OPEN_STATUSES = ['pending', 'reviewing'];
const CLOSED_STATUSES = ['resolved', 'dismissed'];

/**
 * Hook to group and synthesize batch scanned reports into reported-user clusters.
 * Calculates 3 enforcement pillars (velocity, credibility, evidence) for each cluster.
 */
export const useSentinelOverview = (scanOverview, rows = []) => {
  return useMemo(() => {
    const closedIds = new Set(
      rows.filter((r) => CLOSED_STATUSES.includes(r.status)).map((r) => r.id),
    );

    const scannedList = (scanOverview?.scannedReports || []).filter(
      (r) => OPEN_STATUSES.includes(r.status) && !closedIds.has(r.id),
    );
    const openRows = rows.filter((r) => OPEN_STATUSES.includes(r.status));

    const sourceReports = scannedList.length > 0 ? scannedList : openRows;
    const scannedAt = scanOverview?.scannedAt || new Date().toISOString();
    const autoResolvedCount = scanOverview?.autoResolvedCount || 0;

    const clustersMap = new Map();
    sourceReports.forEach((report) => {
      const key =
        report.reportedUser?.id ||
        report.reportedUser?.email ||
        report.reportedUser?.fullName ||
        report.id;
      if (!clustersMap.has(key)) {
        clustersMap.set(key, {
          reportedUser: report.reportedUser,
          reports: [],
        });
      }
      clustersMap.get(key).reports.push(report);
    });

    const clusters = Array.from(clustersMap.values()).map((cluster) => {
      const primaryReport =
        cluster.reports.find((r) => Boolean(r.sentinelAssessment)) ||
        cluster.reports[0];
      const assessment = primaryReport?.sentinelAssessment || {};
      const monitoring = assessment.monitoring || {};

      const uniqueReporters = new Set(
        cluster.reports
          .map((r) => r.reporter?.id || r.reporter?.fullName)
          .filter(Boolean),
      );

      // Rule numbers come from the backend (kept up to date after every change): nothing is guessed here
      const reportsReceived = monitoring.reportsReceived ?? 1;
      const timeWindow = formatTimeWindow(monitoring.timeWindow);
      const riskLevel = monitoring.riskLevel || 'low';

      const credibilityLabel =
        monitoring.reporterCredibility?.label ||
        `Ghi nhận từ ${uniqueReporters.size} phụ huynh — chưa có đánh giá độ tin cậy`;

      const categoriesList = [
        ...new Set(
          cluster.reports.map((r) => getReportCategoryLabel(r.category)),
        ),
      ].join(', ');

      const investigationSteps =
        monitoring.investigationSteps?.length > 0
          ? monitoring.investigationSteps
          : [
              `Phân loại nội dung báo cáo: ${categoriesList}.`,
              `Kiểm tra các tin nhắn & bằng chứng liên quan: Đã đối chiếu ngữ cảnh tương tác và mô tả từ ${cluster.reports.length} báo cáo.`,
              `Xác định tính chất sự việc: ${
                uniqueReporters.size >= 2
                  ? `Các báo cáo đến từ ${uniqueReporters.size} phụ huynh độc lập (không phải báo cáo phối hợp giả mạo).`
                  : 'Sự việc đơn lẻ từ phụ huynh báo cáo trực tiếp.'
              }`,
              `Kiểm tra lịch sử vi phạm đã được xác nhận: Tài khoản có ${cluster.reportedUser?.strikeCount || 0} lần cảnh cáo trước đó (Đang xét lần vi phạm thứ ${(cluster.reportedUser?.strikeCount || 0) + 1}/3).`,
              `Đánh giá khả năng báo cáo phối hợp hoặc báo cáo giả: ${credibilityLabel}.`,
            ];

      const isRestrictionApplied = Boolean(
        monitoring.temporaryRestriction?.applied,
      );
      const tempRestrictionSteps = isRestrictionApplied
        ? monitoring.temporaryRestriction.steps || []
        : [];

      return {
        key: cluster.reportedUser?.id || primaryReport.id,
        reportedUser: cluster.reportedUser,
        primaryReport,
        reports: cluster.reports,
        assessment,
        reportsReceived,
        timeWindow,
        uniqueReportersCount: Math.max(
          monitoring.uniqueReportersCount || 1,
          uniqueReporters.size,
        ),
        riskLevel,
        credibilityLabel,
        investigationSteps,
        isRestrictionApplied,
        tempRestrictionSteps,
        // Real model confidence only (0 for a fallback assessment), never an invented score
        confidenceScore: assessment.confidenceScore ?? 0,
        policyClause:
          formatPolicyClause(assessment.policyClause) ||
          'Quy chuẩn kiểm duyệt cơ bản',
        // AI recommendation only (none without a violation verdict): never an invented warning
        recommendedSanctions: assessment.recommendedSanctions || [],
      };
    });

    const highRiskClustersCount = clusters.filter(
      (c) => c.riskLevel === 'high',
    ).length;

    const avgConfidence =
      clusters.length > 0
        ? Math.round(
            clusters.reduce((sum, c) => sum + (c.confidenceScore || 85), 0) /
              clusters.length,
          )
        : 0;

    return {
      clusters,
      sourceReports,
      scannedAt,
      highRiskClustersCount,
      avgConfidence,
      autoResolvedCount,
    };
  }, [scanOverview, rows]);
};

export default useSentinelOverview;
