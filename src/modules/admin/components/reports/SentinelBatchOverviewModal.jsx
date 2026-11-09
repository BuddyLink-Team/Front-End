import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { useSentinelOverview } from '../../hooks/useSentinelOverview';
import { SentinelClusterCard } from './SentinelClusterCard';

/**
 * Comprehensive AI Batch Overview Modal.
 * Displays all open reports grouped by target parent cluster, with 3-factor metrics and 1-click confirmation.
 */
export const SentinelBatchOverviewModal = ({
  open,
  onClose,
  scanOverview,
  rows = [],
  isBatchScanning = false,
  onRescan,
  onOpenReportDetail,
  onAskResolveCluster,
  isActionLoading = false,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const {
    clusters,
    sourceReports,
    scannedAt,
    highRiskClustersCount,
    avgConfidence,
    autoResolvedCount,
  } = useSentinelOverview(scanOverview, rows);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 sm:p-6">
      {/* Opaque Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-text-primary/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Solid Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-modal w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-hairline-strong bg-surface-container-lowest shadow-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-hairline-strong bg-primary-soft px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
              <ShieldCheck size={ICON_SIZE.MD} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-title-md font-bold text-text-primary">
                  Báo cáo tổng quan điều tra của Sentinel AI
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-label-xs font-bold text-white">
                  <Sparkles size={ICON_SIZE.XS} />
                  Đã đồng bộ AI
                </span>
              </div>
              <p className="text-label-sm text-text-muted mt-0.5">
                Cập nhật lần quét gần nhất:{' '}
                <strong>{formatDateTime(scannedAt)}</strong> • Tổng hợp toàn bộ
                hàng đợi theo 3 yếu tố (mật độ • độ tin cậy • bằng chứng)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isLoading={isBatchScanning}
              disabled={isBatchScanning}
              onClick={onRescan}
              leftIcon={
                <RefreshCw
                  size={ICON_SIZE.XS}
                  className={isBatchScanning ? 'animate-spin' : ''}
                />
              }
              className="bg-white hover:bg-primary-soft text-primary-dark font-semibold"
            >
              Quét cập nhật lại
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-on-surface-variant hover:bg-surface-muted hover:text-text-primary transition-colors border border-hairline-strong"
              aria-label="Đóng báo cáo tổng quan"
            >
              <X size={ICON_SIZE.SM} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-surface-container-low">
          {autoResolvedCount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-primary-border bg-primary-soft px-4 py-3 text-label-sm font-medium text-primary-ink shadow-2xs">
              <CheckCircle2
                size={ICON_SIZE.LG}
                className="text-primary-dark shrink-0"
              />
              <div>
                <strong>Sentinel AI tự xử lý:</strong> Đã tự động thi hành chế
                tài &amp; đóng <strong>{autoResolvedCount}</strong> vụ vi phạm
                nhẹ (Cảnh cáo / Đình chỉ ≤7 ngày) đạt chuẩn tin cậy. Dưới đây là
                các vụ việc cần Admin trực tiếp phán quyết.
              </div>
            </div>
          )}

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-hairline-strong bg-surface-container-lowest p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Tổng báo cáo đã quét</span>
                <FileSearch size={ICON_SIZE.MD} className="text-primary" />
              </div>
              <div className="mt-1.5 text-headline-md font-bold text-text-primary">
                {sourceReports.length} vụ việc
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đang mở chờ Admin phán quyết
              </p>
            </div>

            <div className="rounded-2xl border border-hairline-strong bg-surface-container-lowest p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Đối tượng bị báo cáo</span>
                <Users size={ICON_SIZE.MD} className="text-primary" />
              </div>
              <div className="mt-1.5 text-headline-md font-bold text-text-primary">
                {clusters.length} phụ huynh
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đã gom nhóm các báo cáo cùng một người
              </p>
            </div>

            <div className="rounded-2xl border border-error/20 bg-error-soft/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-bold text-error-dark uppercase">
                <span>Đang hạn chế nhắn tin</span>
                <ShieldAlert size={ICON_SIZE.MD} className="text-error-dark" />
              </div>
              <div className="mt-1.5 text-headline-md font-bold text-error-dark">
                {highRiskClustersCount} đối tượng
              </div>
              <p className="mt-0.5 text-label-xs text-error-dark/80">
                Mức rủi ro cao đang bị tạm hạn chế
              </p>
            </div>

            <div className="rounded-2xl border border-hairline-strong bg-surface-container-lowest p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Độ tự tin AI trung bình</span>
                <Zap size={ICON_SIZE.MD} className="text-primary-dark" />
              </div>
              <div className="mt-1.5 text-headline-md font-bold text-primary-dark">
                {avgConfidence}%
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đối chiếu Khung Kỷ Luật Quy Chuẩn
              </p>
            </div>
          </div>

          {clusters.length === 0 ? (
            <div className="rounded-2xl border border-hairline-strong bg-surface-container-lowest p-8 text-center">
              <CheckCircle2
                size={ICON_SIZE.XXXL}
                className="mx-auto text-primary-dark mb-2"
              />
              <h4 className="text-title-md font-bold text-text-primary">
                Không còn báo cáo vi phạm nào đang mở
              </h4>
              <p className="text-body-md text-text-muted mt-1">
                Toàn bộ các báo cáo trong hàng đợi đã được Admin xem xét và xử
                lý hoàn tất.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {clusters.map((cluster, idx) => (
                <SentinelClusterCard
                  key={cluster.key || idx}
                  cluster={cluster}
                  index={idx}
                  onOpenReportDetail={onOpenReportDetail}
                  onCloseModal={onClose}
                  onAskResolveCluster={onAskResolveCluster}
                  isActionLoading={isActionLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-hairline-strong bg-surface-container-lowest px-6 py-3.5">
          <p className="text-label-sm text-text-muted">
            <strong>Lưu ý:</strong> Báo cáo tổng quan này được cập nhật tự động
            mỗi khi Admin bấm{' '}
            <strong>&ldquo;Quét &amp; Tổng hợp AI hàng loạt&rdquo;</strong>.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng bảng tổng quan
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SentinelBatchOverviewModal;
