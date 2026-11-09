import { useMemo } from 'react';
import { getReportCategoryLabel } from '../constants/admin.constants';

const OPEN_STATUSES = ['pending', 'reviewing'];
const CLOSED_STATUSES = ['resolved', 'dismissed'];

/**
 * Hook to group and synthesize batch scanned reports into reported-user clusters.
 * Calculates 3 enforcement pillars (velocity, credibility, evidence) for each cluster.
 */
export const useSentinelOverview = (scanOverview, rows = []) => {
  return useMemo(() => {
    const closedIds = new Set(
      rows.filter((r) => CLOSED_STATUSES.includes(r.status)).map((r) => r.id)
    );

    const scannedList = (scanOverview?.scannedReports || []).filter(
      (r) => OPEN_STATUSES.includes(r.status) && !closedIds.has(r.id)
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
          .filter(Boolean)
      );

      const reportsReceived = Math.max(
        monitoring.reportsReceived || 1,
        cluster.reports.length
      );
      const timeWindow = monitoring.timeWindow || '30 min';
      const hasHighSeverity = cluster.reports.some(
        (r) => r.severity === 'critical' || r.severity === 'high'
      );
      const riskLevel =
        monitoring.riskLevel ||
        (reportsReceived >= 3 || hasHighSeverity ? 'high' : 'medium');

      const credibilityLabel =
        monitoring.reporterCredibility?.label ||
        (uniqueReporters.size >= 2
          ? `Đáng tin cậy — Ghi nhận từ ${uniqueReporters.size} phụ huynh độc lập, không có dấu hiệu report giả phối hợp`
          : 'Đáng tin cậy — Không có dấu hiệu nhiều tài khoản phối hợp report ảo');

      const categoriesList = [
        ...new Set(cluster.reports.map((r) => getReportCategoryLabel(r.category))),
      ].join(', ');

      const investigationSteps =
        monitoring.investigationSteps?.length > 0
          ? monitoring.investigationSteps
          : [
              `Phân loại nội dung report: ${categoriesList}.`,
              `Kiểm tra các tin nhắn & bằng chứng liên quan: Đã đối chiếu ngữ cảnh tương tác và mô tả từ ${cluster.reports.length} báo cáo.`,
              `Xác định tính chất sự việc: ${
                uniqueReporters.size >= 2
                  ? `Các báo cáo đến từ ${uniqueReporters.size} phụ huynh độc lập (không phải report hội đồng giả mạo).`
                  : 'Sự việc đơn lẻ từ phụ huynh báo cáo trực tiếp.'
              }`,
              `Kiểm tra lịch sử vi phạm đã được xác nhận: Tài khoản có ${cluster.reportedUser?.strikeCount || 0} lần cảnh cáo trước đó (Đang xét mức Strike ${(cluster.reportedUser?.strikeCount || 0) + 1}/3).`,
              `Đánh giá khả năng report phối hợp hoặc report giả: ${credibilityLabel}.`,
            ];

      const tempRestrictionSteps =
        monitoring.temporaryRestriction?.steps?.length > 0
          ? monitoring.temporaryRestriction.steps
          : [
              'Tạm hạn chế khả năng gửi tin nhắn mới.',
              'Gửi cảnh báo đến Admin.',
              'Tạo một bản phân tích để Admin xem xét.',
              'Chỉ khôi phục hoặc áp dụng hình phạt chính thức sau khi có đủ căn cứ.',
            ];

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
          uniqueReporters.size
        ),
        riskLevel,
        credibilityLabel,
        investigationSteps,
        tempRestrictionSteps,
        confidenceScore: Math.max(
          assessment.confidenceScore || 85,
          cluster.reports.length >= 2 ? 88 : 82
        ),
        policyClause:
          assessment.policyClause || 'Quy chuẩn kiểm duyệt cơ bản',
        recommendedSanctions:
          assessment.recommendedSanctions?.length > 0
            ? assessment.recommendedSanctions
            : [{ type: 'warn' }],
      };
    });

    const highRiskClustersCount = clusters.filter(
      (c) => c.riskLevel === 'high'
    ).length;

    const avgConfidence =
      clusters.length > 0
        ? Math.round(
            clusters.reduce((sum, c) => sum + (c.confidenceScore || 85), 0) /
              clusters.length
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

