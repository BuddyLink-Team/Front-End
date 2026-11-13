import React from 'react';
import { cn } from '../../../../utils/cn';
import { Eye, Sparkles } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import {
  getReportCategoryLabel,
  planSentinelCluster,
} from '../../constants/admin.constants';
import { ReportSeverityChip, ReportStatusChip } from './ReportChips';
import { SentinelMonitoringBlock } from './SentinelMonitoringBlock';
import { SENTINEL_RISK_BADGES } from '../../utils/sentinelView';

/**
 * Cluster card grouping reports filed against a single parent.
 * Includes cluster overview, SentinelMonitoringBlock, and nested report items.
 */
export const SentinelClusterCard = ({
  cluster,
  index,
  onOpenReportDetail,
  onCloseModal,
  onAskResolveCluster,
  isActionLoading = false,
}) => {
  // No badge for a cluster without any assessed report
  const riskBadge = cluster.view
    ? SENTINEL_RISK_BADGES[cluster.view.riskLevel] || SENTINEL_RISK_BADGES.low
    : null;
  // Nothing the quick handling can close (no violation or false report concluded by the AI)
  const plan = planSentinelCluster(cluster.reports);

  return (
    <div className="rounded-2xl border border-hairline-strong bg-surface-container-lowest p-5 shadow-xs space-y-4">
      {/* Reported Parent Cluster Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline-strong pb-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            src={cluster.reportedUser?.avatarUrl}
            alt={cluster.reportedUser?.fullName}
            size="md"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label-xs font-bold uppercase tracking-wider text-primary-dark bg-primary-soft px-2.5 py-0.5 rounded-md border border-primary/20">
                Cụm đối tượng #{index + 1}
              </span>
              <h4 className="text-title-md font-bold text-text-primary">
                {cluster.reportedUser?.fullName || 'Phụ huynh bị báo cáo'}
              </h4>
              {riskBadge && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold',
                    riskBadge.className,
                  )}
                >
                  {riskBadge.label}
                </span>
              )}
              {cluster.reportedUser?.strikeCount > 0 && (
                <span className="rounded-full bg-tertiary-soft border border-tertiary-border px-2.5 py-0.5 text-label-xs font-semibold text-tertiary-dark">
                  {cluster.reportedUser.strikeCount} lần cảnh cáo trước đó
                </span>
              )}
            </div>
            <p className="text-body-md text-text-muted mt-0.5">
              {cluster.reportedUser?.email || 'Tài khoản phụ huynh BuddyLink'} •
              Đang có{' '}
              <strong className="text-text-primary">
                {cluster.reports.length} báo cáo đang mở
              </strong>{' '}
              từ{' '}
              <strong className="text-text-primary">
                {cluster.openReportersCount} phụ huynh
              </strong>
            </p>
          </div>
        </div>

        {/* Opens the report in the drawer, where it is sanctioned and concluded */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onCloseModal?.();
              onOpenReportDetail(cluster.primaryReport.id);
            }}
            leftIcon={<Eye size={ICON_SIZE.XS} />}
          >
            Mở để xử lý
          </Button>
          {onAskResolveCluster && (
            <Button
              size="sm"
              variant="primary"
              disabled={isActionLoading || !plan.isActionable}
              title={
                plan.isActionable
                  ? undefined
                  : 'Không có báo cáo nào xử lý nhanh được: mở chi tiết để xử lý'
              }
              onClick={() => onAskResolveCluster(cluster)}
              leftIcon={<Sparkles size={ICON_SIZE.XS} />}
              className="font-semibold shadow-xs"
            >
              Xác nhận xử lý &amp; đóng cụm ({cluster.reports.length})
            </Button>
          )}
        </div>
      </div>

      {/* AI report monitoring block */}
      <SentinelMonitoringBlock cluster={cluster} />

      {/* Individual Reports List inside this Cluster */}
      <div className="space-y-2">
        <div className="text-label-xs font-bold uppercase tracking-wider text-text-muted">
          Danh sách {cluster.reports.length} báo cáo thành phần của đối tượng
          này:
        </div>
        <div className="divide-y divide-hairline-strong rounded-xl border border-hairline-strong bg-surface-container-low">
          {cluster.reports.map((rep) => (
            <div
              key={rep.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-surface-muted transition-colors"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ReportSeverityChip severity={rep.severity} />
                  <span className="text-body-md font-semibold text-text-primary">
                    {getReportCategoryLabel(rep.category)}
                  </span>
                  <span className="text-label-xs text-text-muted">
                    • Người báo cáo:{' '}
                    <strong className="text-on-surface-variant">
                      {rep.reporter?.fullName || 'Phụ huynh'}
                    </strong>
                  </span>
                  <span className="text-label-xs text-text-muted">
                    • {formatDateTime(rep.createdAt)}
                  </span>
                  <ReportStatusChip status={rep.status} />
                </div>
                {rep.sentinelAssessment?.summary && (
                  <p className="text-label-sm text-on-surface-variant line-clamp-1">
                    <strong>AI tóm tắt:</strong>{' '}
                    {rep.sentinelAssessment.summary.replace(/\n+/g, ' ')}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onCloseModal?.();
                  onOpenReportDetail(rep.id);
                }}
                leftIcon={<Eye size={ICON_SIZE.XS} />}
                className="shrink-0 text-primary-dark hover:bg-primary-soft"
              >
                Chi tiết
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentinelClusterCard;
