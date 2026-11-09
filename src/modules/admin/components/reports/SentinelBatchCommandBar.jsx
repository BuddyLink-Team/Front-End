import React, { useMemo, useState } from 'react';
import { cn } from '../../../../utils/cn';
import {
  Activity,
  Bot,
  CheckCircle2,
  Cpu,
  FileSearch,
  FileText,
  Lock,
  Radar,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import mascot from '../../../../assets/images/ai-mascot.png';
import { Button } from '../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../components/feedback/ConfirmDialog';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import {
  isTemporarilyRestricted,
  planSentinelCluster,
  REPORT_ACTION_LABELS,
} from '../../constants/admin.constants';
import { SentinelBatchOverviewModal } from './SentinelBatchOverviewModal';

/**
 * Green animated Sentinel AI Command Center placed directly below the report stat cards.
 * Flow:
 * 1. Admin clicks "Quét & Tổng hợp AI hàng loạt" -> AI scans all open reports -> Overview Modal pops open automatically.
 * 2. Button "Xem báo cáo tổng quan AI" becomes available and updates every time Admin scans.
 */
export const SentinelBatchCommandBar = ({
  rows = [],
  stats = {},
  isBatchScanning = false,
  isActionLoading = false,
  onBatchScan,
  onOpenReportDetail,
  onResolveCluster,
}) => {
  const [imgError, setImgError] = useState(false);
  const [scanOverview, setScanOverview] = useState(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  // Cluster waiting for the confirmation of "Xác nhận xử lý & đóng cụm", with what will happen to it
  const [pendingCluster, setPendingCluster] = useState(null);

  const askResolveCluster = (cluster) =>
    setPendingCluster({ cluster, plan: planSentinelCluster(cluster.reports) });

  const confirmResolveCluster = async (note) => {
    if (!pendingCluster) return;
    const { plan, cluster } = pendingCluster;
    const result = await onResolveCluster(
      [...plan.violationIds, ...plan.dismissIds],
      note,
    );
    if (!result) return;
    // The overview keeps showing only what is still open
    const closedIds = new Set([
      ...(result.resolved || []),
      ...(result.dismissed || []),
    ]);
    setScanOverview((overview) =>
      overview
        ? {
            ...overview,
            scannedReports: (overview.scannedReports || []).filter(
              (report) => !closedIds.has(report.id),
            ),
          }
        : overview,
    );
    setPendingCluster(null);
    return cluster;
  };

  const describePlan = ({ plan, cluster }) => {
    const name = cluster.reportedUser?.fullName || 'phụ huynh này';
    const parts = [];
    if (plan.violationIds.length > 0) {
      const sanctions = plan.sanctions
        .map((s) =>
          s.durationDays
            ? `${REPORT_ACTION_LABELS[s.type] || s.type} ${s.durationDays} ngày`
            : REPORT_ACTION_LABELS[s.type] || s.type,
        )
        .join(', ');
      parts.push(
        `Áp dụng một lần cho ${name}: ${sanctions || 'không có chế tài'}, rồi đóng ${plan.violationIds.length} báo cáo vi phạm.`,
      );
    }
    if (plan.dismissIds.length > 0) {
      parts.push(
        `Bác bỏ ${plan.dismissIds.length} báo cáo AI kết luận không vi phạm.`,
      );
    }
    if (plan.manualCount > 0) {
      parts.push(
        `Giữ lại ${plan.manualCount} báo cáo cần bạn xử lý trong chi tiết (chưa rõ, an toàn trẻ em, mức nghiêm trọng hoặc chế tài nặng).`,
      );
    }
    return parts.join(' ');
  };

  const isBusy = isBatchScanning;
  const hasScannedOverview = Boolean(scanOverview);

  const queueMetrics = useMemo(() => {
    const openRows = rows.filter(
      (r) => r.status === 'pending' || r.status === 'reviewing',
    );
    const assessedRows = openRows.filter((r) => Boolean(r.sentinelAssessment));
    const unassessedRows = openRows.filter((r) => !r.sentinelAssessment);
    const tempRestrictedRows = assessedRows.filter(isTemporarilyRestricted);

    const totalOpenInSystem = (stats?.pending || 0) + (stats?.reviewing || 0);

    return {
      totalOpenInSystem: totalOpenInSystem || openRows.length,
      openOnPage: openRows.length,
      assessedCount: assessedRows.length,
      unassessedCount: unassessedRows.length,
      tempRestrictedCount: tempRestrictedRows.length,
    };
  }, [rows, stats]);

  const handleRunScanAndOpenOverview = async () => {
    const result = await onBatchScan();
    if (result) {
      setScanOverview({
        ...result,
        scannedAt: result.scannedAt || new Date().toISOString(),
      });
      setIsOverviewOpen(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-primary-soft p-4 sm:p-5 shadow-xs">
        {/* Decorative animated background glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl animate-pulse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/3 -bottom-12 h-32 w-32 rounded-full bg-primary-soft blur-2xl"
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Animated Bot Mascot + Sentinel Automated Enforcement System Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Bot Container */}
            <div className="relative flex shrink-0 items-center justify-center">
              {/* Outer pulsing radar ring */}
              <span
                className={cn(
                  'absolute inline-flex h-16 w-16 rounded-full bg-primary/30',
                  isBusy ? 'animate-ping' : 'animate-pulse',
                )}
              />
              {/* Spinning dashed orbital ring when active */}
              <span
                className={cn(
                  'absolute h-16 w-16 rounded-full border-2 border-dashed border-primary/60',
                  isBusy ? 'animate-spin' : '',
                )}
              />

              {/* Floating Mascot Avatar */}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-surface-container-lowest bg-surface-container-lowest shadow-md">
                {!imgError ? (
                  <img
                    src={mascot}
                    alt="Trợ lý Sentinel AI"
                    className="h-11 w-11 object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Bot size={ICON_SIZE.XXXL} className="text-primary-dark" />
                )}

                {/* Live status dot */}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-2xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-dark animate-ping absolute" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-dark relative" />
                </span>
              </div>
            </div>

            {/* Center Text & 3-Factor Automated Enforcement Capabilities */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-label-xs font-bold text-white shadow-2xs">
                  <Sparkles
                    size={ICON_SIZE.XS}
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                  HỆ THỐNG XỬ LÝ TỰ ĐỘNG
                </span>
                <h3 className="text-title-md font-bold text-text-primary">
                  Giám sát báo cáo &amp; Điều tra tổng hợp bằng AI
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-label-xs font-semibold text-primary-dark border border-primary/30">
                  <Cpu size={ICON_SIZE.XS} />
                  {isBusy
                    ? 'AI đang điều tra & tổng hợp...'
                    : 'AI phân loại + Admin xác nhận'}
                </span>
              </div>

              <p className="text-body-md text-on-surface-variant max-w-3xl">
                Thay vì phải mở thủ công từng dòng, bấm{' '}
                <strong>Quét &amp; Tổng hợp AI hàng loạt</strong> để AI gom nhóm
                theo đối tượng bị báo cáo, chấm{' '}
                <strong>
                  3 yếu tố (mật độ báo cáo • độ tin cậy người báo cáo • bằng
                  chứng vi phạm)
                </strong>{' '}
                và bật ngay <strong>Báo cáo tổng quan</strong> để Admin xem
                &amp; xác nhận.
              </p>

              {/* 3 Pillars + Live Queue Metrics Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-text-primary border border-primary/25">
                  <Activity size={ICON_SIZE.SM} className="text-primary-dark" />
                  1. Mật độ báo cáo (30 phút)
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-text-primary border border-primary/25">
                  <UserCheck
                    size={ICON_SIZE.SM}
                    className="text-primary-dark"
                  />
                  2. Độ tin cậy người báo cáo
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-text-primary border border-primary/25">
                  <FileSearch
                    size={ICON_SIZE.SM}
                    className="text-primary-dark"
                  />
                  3. Bằng chứng vi phạm
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1 text-label-xs font-bold text-primary-ink border border-primary-border">
                  <CheckCircle2
                    size={ICON_SIZE.SM}
                    className="text-primary-dark"
                  />
                  Đã tổng hợp AI: {queueMetrics.assessedCount}/
                  {queueMetrics.openOnPage} vụ đang mở
                </span>

                {scanOverview?.autoResolvedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2.5 py-1 text-label-xs font-bold text-primary-ink border border-primary-border">
                    <CheckCircle2
                      size={ICON_SIZE.SM}
                      className="text-primary-dark"
                    />
                    AI đã tự đóng: {scanOverview.autoResolvedCount} vụ (Cảnh cáo
                    / Đình chỉ ≤7d)
                  </span>
                )}

                {queueMetrics.tempRestrictedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-error-soft px-2.5 py-1 text-label-xs font-bold text-error-dark border border-error/20">
                    <ShieldAlert size={ICON_SIZE.SM} />
                    Đang hạn chế nhắn tin: {queueMetrics.tempRestrictedCount} vụ
                    chờ Admin xác nhận
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Batch AI Scan + View All Reports Overview Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={!hasScannedOverview || isBusy}
              title={
                hasScannedOverview
                  ? 'Mở xem lại Báo cáo Tổng quan AI của lần quét gần nhất'
                  : 'Vui lòng bấm "Quét & Tổng hợp AI hàng loạt" trước để tạo báo cáo tổng quan'
              }
              className={cn(
                'px-3.5 py-2.5 font-semibold transition-all',
                hasScannedOverview
                  ? 'bg-surface-container-lowest hover:bg-primary-soft border-primary/40 text-primary-dark shadow-2xs'
                  : 'bg-surface-container-low border-hairline-strong text-text-muted opacity-75 cursor-not-allowed',
              )}
              leftIcon={
                hasScannedOverview ? (
                  <FileText size={ICON_SIZE.XS} className="text-primary-dark" />
                ) : (
                  <Lock size={ICON_SIZE.XS} className="text-text-muted" />
                )
              }
              onClick={() => setIsOverviewOpen(true)}
            >
              Xem báo cáo tổng quan AI
            </Button>

            <Button
              size="sm"
              variant="primary"
              isLoading={isBatchScanning}
              disabled={isBusy}
              className="font-semibold shadow-xs px-4 py-2.5"
              leftIcon={<Radar size={ICON_SIZE.XS} />}
              onClick={handleRunScanAndOpenOverview}
            >
              Quét &amp; Tổng hợp AI hàng loạt
            </Button>
          </div>
        </div>
      </div>

      <SentinelBatchOverviewModal
        open={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        scanOverview={scanOverview}
        rows={rows}
        isBatchScanning={isBatchScanning}
        isActionLoading={isActionLoading}
        onRescan={handleRunScanAndOpenOverview}
        onOpenReportDetail={onOpenReportDetail}
        onAskResolveCluster={onResolveCluster ? askResolveCluster : undefined}
      />

      <ConfirmDialog
        open={Boolean(pendingCluster)}
        title="Xác nhận xử lý & đóng cụm"
        description={pendingCluster ? describePlan(pendingCluster) : ''}
        variant="danger"
        confirmLabel="Xác nhận xử lý"
        cancelLabel="Hủy bỏ"
        isLoading={isActionLoading}
        reason={{
          required: false,
          label: 'Ghi chú xử lý (lưu vào nhật ký)',
          placeholder: 'Để trống để dùng bản nháp của AI cho từng báo cáo...',
          maxLength: 500,
        }}
        onConfirm={confirmResolveCluster}
        onCancel={() => setPendingCluster(null)}
      />
    </>
  );
};

export default SentinelBatchCommandBar;
