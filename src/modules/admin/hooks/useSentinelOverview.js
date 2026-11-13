import { useMemo } from 'react';
import { buildSentinelView, pickClusterPrimaryReport } from '../utils/sentinelView';

const OPEN_STATUSES = ['pending', 'reviewing'];
const CLOSED_STATUSES = ['resolved', 'dismissed'];

/**
 * Hook to group batch scanned reports into reported-user clusters.
 * Each cluster is shown by the assessment of its primary report, with the same content as the report drawer
 * (buildSentinelView).
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
      const primaryReport = pickClusterPrimaryReport(cluster.reports);

      // Parents behind the open reports listed in this cluster (the header line)
      const openReporters = new Set(
        cluster.reports
          .map((r) => r.reporter?.id || r.reporter?.fullName)
          .filter(Boolean),
      );

      return {
        key: cluster.reportedUser?.id || primaryReport.id,
        reportedUser: cluster.reportedUser,
        primaryReport,
        reports: cluster.reports,
        openReportersCount: openReporters.size,
        // Same content as the drawer of the primary report; null when no report of the cluster is assessed
        view: buildSentinelView(primaryReport),
      };
    });

    const restrictedClustersCount = clusters.filter(
      (c) => c.view?.isRestrictionApplied,
    ).length;

    // Real model confidence of the assessed clusters only, never an invented score
    const assessed = clusters.filter((c) => c.view);
    const avgConfidence =
      assessed.length > 0
        ? Math.round(
            assessed.reduce((sum, c) => sum + c.view.confidence, 0) /
              assessed.length,
          )
        : 0;

    return {
      clusters,
      sourceReports,
      scannedAt,
      restrictedClustersCount,
      avgConfidence,
      autoResolvedCount,
    };
  }, [scanOverview, rows]);
};

export default useSentinelOverview;
