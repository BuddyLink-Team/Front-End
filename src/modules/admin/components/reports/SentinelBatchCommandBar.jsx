import React, { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Cpu,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import mascot from '../../../../assets/images/ai-mascot.png';
import { ConfirmDialog } from '../../../../components/feedback/ConfirmDialog';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';

const CONFIDENCE_OPTIONS = [
  { value: 70, label: 'Độ tự tin AI ≥ 70%' },
  { value: 80, label: 'Độ tự tin AI ≥ 80% (Khuyên dùng)' },
  { value: 90, label: 'Độ tự tin AI ≥ 90% (Nghiêm ngặt)' },
];

/**
 * Green animated Sentinel AI Command Center placed directly below the report stat cards.
 * Enables 1-Click Batch AI Scanning and Batch Auto-Execution for high-volume moderation queues.
 */
export const SentinelBatchCommandBar = ({
  rows = [],
  stats = {},
  isBatchScanning = false,
  isBatchApplying = false,
  onBatchScan,
  onBatchApply,
}) => {
  const [minConfidence, setMinConfidence] = useState(80);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isBusy = isBatchScanning || isBatchApplying;

  const queueMetrics = useMemo(() => {
    const openRows = rows.filter((r) => r.status === 'pending' || r.status === 'reviewing');
    const assessedRows = openRows.filter((r) => Boolean(r.sentinelAssessment));
    const unassessedRows = openRows.filter((r) => !r.sentinelAssessment);
    const highConfidenceRows = assessedRows.filter(
      (r) => (r.sentinelAssessment?.confidenceScore || 0) >= minConfidence
    );
    const autoShieldRows = assessedRows.filter((r) => Boolean(r.sentinelAssessment?.autoShieldApplied));

    const totalOpenInSystem = (stats?.pending || 0) + (stats?.reviewing || 0);

    return {
      totalOpenInSystem: totalOpenInSystem || openRows.length,
      openOnPage: openRows.length,
      assessedCount: assessedRows.length,
      unassessedCount: unassessedRows.length,
      highConfidenceCount: highConfidenceRows.length,
      autoShieldCount: autoShieldRows.length,
    };
  }, [rows, stats, minConfidence]);

  const handleConfirmBatchApply = async () => {
    setIsConfirmOpen(false);
    await onBatchApply(minConfidence);
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
          {/* Left: Animated Bot Mascot + Sentinel Command Info */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Bot Container */}
            <div className="relative flex shrink-0 items-center justify-center">
              {/* Outer pulsing radar ring */}
              <span
                className={`absolute inline-flex h-16 w-16 rounded-full bg-[#7BAE7F]/35 ${
                  isBusy ? 'animate-ping' : 'animate-pulse'
                }`}
              />
              {/* Spinning dashed orbital ring when active or slow pulse */}
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

            {/* Center Text & Autonomous Capabilities */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4E8C54] px-2.5 py-0.5 text-label-xs font-bold text-white shadow-2xs">
                  <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
                  BUDDYLINK SENTINEL AI
                </span>
                <h3 className="text-title-md font-bold text-[#1E3A23]">
                  Trung tâm Kiểm duyệt Tự hành &amp; Xử lý Hàng loạt
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-label-xs font-semibold text-[#2E5E36] border border-[#7BAE7F]/40">
                  <Cpu size={12} />
                  {isBusy ? 'Bot đang xử lý hàng đợi...' : 'Auto-Triage đang bật 24/7'}
                </span>
              </div>

              <p className="text-body-sm text-[#2F4F35] max-w-3xl">
                Giải quyết bài toán hàng trăm báo cáo cùng lúc: Tự động thẩm định ngầm ngay khi phụ huynh gửi báo cáo, tự động bật khiên{' '}
                <strong>Auto-Shield</strong> bảo vệ trẻ em và cho phép <strong>Thi hành chuẩn &amp; Đóng gộp hàng loạt chỉ với 1 cú click</strong>.
              </p>

              {/* Live Metrics Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/85 px-2.5 py-1 text-label-xs font-semibold text-[#1E3A23] border border-[#7BAE7F]/30">
                  <Radar size={13} className="text-[#4E8C54]" />
                  Đang mở: <strong>{queueMetrics.totalOpenInSystem}</strong> vụ việc
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/85 px-2.5 py-1 text-label-xs font-semibold text-[#1E3A23] border border-[#7BAE7F]/30">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Đã có AI thẩm định (trang này):{' '}
                  <strong>
                    {queueMetrics.assessedCount}/{queueMetrics.openOnPage}
                  </strong>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/15 px-2.5 py-1 text-label-xs font-bold text-emerald-900 border border-emerald-600/30">
                  <Zap size={13} className="text-emerald-700" />
                  Đủ chuẩn tự hành (≥ {minConfidence}%):{' '}
                  <strong>{queueMetrics.highConfidenceCount} báo cáo</strong>
                </span>

                {queueMetrics.autoShieldCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1 text-label-xs font-bold text-red-800 border border-red-500/30">
                    <ShieldCheck size={13} />
                    Auto-Shield Khẩn cấp: {queueMetrics.autoShieldCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Batch Action Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <select
              aria-label="Ngưỡng độ tự tin AI để xử lý hàng loạt"
              value={minConfidence}
              disabled={isBusy}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="h-9 rounded-xl border border-[#7BAE7F]/50 bg-white/95 px-3 text-label-xs font-semibold text-[#1E3A23] focus:outline-none focus:ring-2 focus:ring-[#7BAE7F]"
            >
              {CONFIDENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              isLoading={isBatchScanning}
              disabled={isBusy}
              className="bg-white/90 hover:bg-white border-[#4E8C54]/50 text-[#1E3A23] font-semibold"
              leftIcon={<Radar size={ICON_SIZE.XS} className="text-[#4E8C54]" />}
              onClick={onBatchScan}
            >
              Quét AI hàng loạt
            </Button>

            <Button
              size="sm"
              variant="primary"
              isLoading={isBatchApplying}
              disabled={isBusy}
              className="bg-[#4E8C54] hover:bg-[#3F7644] text-white font-semibold shadow-xs"
              leftIcon={<Zap size={ICON_SIZE.XS} />}
              onClick={() => setIsConfirmOpen(true)}
            >
              Thi hành &amp; Đóng hàng loạt ({queueMetrics.highConfidenceCount})
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

      <ConfirmDialog
        open={isConfirmOpen}
        title={`Xác nhận Thi hành & Đóng hàng loạt (AI Confidence ≥ ${minConfidence}%)`}
        description={`BuddyLink Sentinel sẽ tự động tiếp nhận (Claim), thi hành chế tài đúng Khung Kỷ Luật Quy Chuẩn, tự động đóng gộp các báo cáo trùng người bị tố cáo và chốt kết quả hoàn tất cho các báo cáo đang mở đạt độ tự tin ≥ ${minConfidence}%. Các báo cáo phức tạp (< ${minConfidence}%) sẽ được giữ lại để Admin xét duyệt thủ công.`}
        variant="primary"
        confirmLabel="Xác nhận chạy tự hành"
        cancelLabel="Hủy bỏ"
        isLoading={isBatchApplying}
        onConfirm={handleConfirmBatchApply}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};

export default SentinelBatchCommandBar;

