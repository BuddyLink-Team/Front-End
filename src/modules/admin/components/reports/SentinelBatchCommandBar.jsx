import React, { useMemo, useState } from 'react';
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
import { ICON_SIZE } from '../../../../constants/icon.constants';
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
  onApplySentinel,
}) => {
  const [imgError, setImgError] = useState(false);
  const [scanOverview, setScanOverview] = useState(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const isBusy = isBatchScanning;
  const hasScannedOverview = Boolean(scanOverview);

  const queueMetrics = useMemo(() => {
    const openRows = rows.filter(
      (r) => r.status === 'pending' || r.status === 'reviewing'
    );
    const assessedRows = openRows.filter((r) => Boolean(r.sentinelAssessment));
    const unassessedRows = openRows.filter((r) => !r.sentinelAssessment);
    const tempRestrictedRows = assessedRows.filter(
      (r) =>
        Boolean(r.sentinelAssessment?.autoShieldApplied) ||
        r.sentinelAssessment?.monitoring?.riskLevel === 'high' ||
        r.severity === 'critical' ||
        r.severity === 'high'
    );

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
      <div className="relative overflow-hidden rounded-2xl border border-[#7BAE7F]/45 bg-gradient-to-r from-[#EAF6EC] via-[#E1F2E4] to-[#EDF8EF] p-4 sm:p-5 shadow-xs">
        {/* Decorative animated background glow orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#7BAE7F]/20 blur-2xl animate-pulse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/3 -bottom-12 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl"
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Animated Bot Mascot + Sentinel Automated Enforcement System Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Bot Container */}
            <div className="relative flex shrink-0 items-center justify-center">
              {/* Outer pulsing radar ring */}
              <span
                className={`absolute inline-flex h-16 w-16 rounded-full bg-[#7BAE7F]/35 ${
                  isBusy ? 'animate-ping' : 'animate-pulse'
                }`}
              />
              {/* Spinning dashed orbital ring when active */}
              <span
                className={`absolute h-16 w-16 rounded-full border-2 border-dashed border-[#4E8C54]/60 ${
                  isBusy ? 'animate-spin' : ''
                }`}
              />

              {/* Floating Mascot Avatar */}
              <div
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-white shadow-md transition-transform duration-500"
                style={{
                  animation: 'sentinelFloat 3s ease-in-out infinite',
                }}
              >
                {!imgError ? (
                  <img
                    src={mascot}
                    alt="BuddyLink Sentinel Bot"
                    className="h-11 w-11 object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Bot size={28} className="text-[#4E8C54]" />
                )}

                {/* Live status dot */}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-2xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 relative" />
                </span>
              </div>
            </div>

            {/* Center Text & 3-Factor Automated Enforcement Capabilities */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4E8C54] px-2.5 py-0.5 text-label-xs font-bold text-white shadow-2xs">
                  <Sparkles
                    size={11}
                    className="animate-spin"
                    style={{ animationDuration: '6s' }}
                  />
                  AUTOMATED ENFORCEMENT SYSTEM
                </span>
                <h3 className="text-title-md font-bold text-[#1E3A23]">
                  AI Report Monitoring &amp; Điều tra Tổng hợp Đa chiều
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-label-xs font-semibold text-[#2E5E36] border border-[#7BAE7F]/40">
                  <Cpu size={12} />
                  {isBusy
                    ? 'Bot đang điều tra & tổng hợp...'
                    : 'AI Triage + Admin Confirm'}
                </span>
              </div>

              <p className="text-body-sm text-[#2F4F35] max-w-3xl">
                Thay vì phải mở thủ công từng dòng, bấm{' '}
                <strong>Quét &amp; Tổng hợp AI hàng loạt</strong> để AI gom nhóm theo đối tượng bị báo cáo, chấm{' '}
                <strong>3 yếu tố (Report velocity • Reporter credibility • Violation evidence)</strong> và bật ngay{' '}
                <strong>Báo cáo Tổng quan All Reports</strong> cho Admin xem &amp; Confirm.
              </p>

              {/* 3 Pillars + Live Queue Metrics Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-[#1E3A23] border border-[#7BAE7F]/35">
                  <Activity size={13} className="text-[#4E8C54]" />
                  1. Report velocity (Mật độ 30p)
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-[#1E3A23] border border-[#7BAE7F]/35">
                  <UserCheck size={13} className="text-[#4E8C54]" />
                  2. Reporter credibility (Chống report ảo)
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-label-xs font-semibold text-[#1E3A23] border border-[#7BAE7F]/35">
                  <FileSearch size={13} className="text-[#4E8C54]" />
                  3. Violation evidence (Đối chiếu tin nhắn)
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/15 px-2.5 py-1 text-label-xs font-bold text-emerald-900 border border-emerald-600/30">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  Đã tổng hợp AI: {queueMetrics.assessedCount}/
                  {queueMetrics.openOnPage} vụ đang mở
                </span>

                {scanOverview?.autoResolvedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-label-xs font-bold text-emerald-900 border border-emerald-300">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    AI đã tự đóng: {scanOverview.autoResolvedCount} vụ (Cảnh cáo / Đình chỉ ≤7d)
                  </span>
                )}

                {queueMetrics.tempRestrictedCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#FDECE6] px-2.5 py-1 text-label-xs font-bold text-[#B44B27] border border-[#F8CBBBE0]">
                    <ShieldAlert size={13} />
                    Temporary restriction (High risk):{' '}
                    {queueMetrics.tempRestrictedCount} chờ Admin duyệt
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
              className={`px-3.5 py-2.5 font-semibold transition-all ${
                hasScannedOverview
                  ? 'bg-white hover:bg-emerald-50 border-[#4E8C54] text-[#1E3A23] shadow-2xs'
                  : 'bg-white/60 border-border-default text-text-muted opacity-75 cursor-not-allowed'
              }`}
              leftIcon={
                hasScannedOverview ? (
                  <FileText size={ICON_SIZE.XS} className="text-[#4E8C54]" />
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
              className="bg-[#4E8C54] hover:bg-[#3F7644] text-white font-semibold shadow-xs px-4 py-2.5"
              leftIcon={<Radar size={ICON_SIZE.XS} />}
              onClick={handleRunScanAndOpenOverview}
            >
              Quét &amp; Tổng hợp AI hàng loạt
            </Button>
          </div>
        </div>

        {/* Keyframe style for smooth mascot bobbing animation */}
        <style>{`
          @keyframes sentinelFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(2deg); }
          }
        `}</style>
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
        onConfirmApplySentinel={onApplySentinel}
      />
    </>
  );
};

export default SentinelBatchCommandBar;
