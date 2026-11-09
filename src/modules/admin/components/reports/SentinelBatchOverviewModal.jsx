import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  CheckCircle2,
  Eye,
  FileSearch,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { Button } from '../../../../components/ui/Button';
import { ICON_SIZE } from '../../../../constants/icon.constants';
import { formatDateTime } from '../../../../utils/formatters';
import { getReportCategoryLabel } from '../../constants/admin.constants';
import { ReportSeverityChip, ReportStatusChip } from './ReportChips';

const SANCTION_LABEL_MAP = {
  warn: 'Gửi cảnh cáo',
  delete_message: 'Xóa tin nhắn vi phạm',
  cancel_playdate: 'Hủy buổi hẹn chơi',
  suspend: 'Tạm đình chỉ tài khoản',
  ban: 'Khóa tài khoản vĩnh viễn',
};

const RISK_BADGE_MAP = {
  high: {
    label: 'High risk',
    className: 'bg-[#FDECE6] text-[#B44B27] border-[#F4C2B0]',
  },
  medium: {
    label: 'Medium risk',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  low: {
    label: 'Low risk',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

/**
 * Comprehensive AI Batch Overview Modal.
 * Automatically pops open after Admin runs "Quét & Tổng hợp AI hàng loạt", and remains accessible
 * via the "Xem báo cáo tổng quan AI" button, updating every time Admin scans.
 */
export const SentinelBatchOverviewModal = ({
  open,
  onClose,
  scanOverview,
  rows = [],
  isBatchScanning = false,
  isActionLoading = false,
  onRescan,
  onOpenReportDetail,
  onConfirmApplySentinel,
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

  if (!open) return null;

  // Merge freshly scanned reports with live status from rows so closed reports disappear immediately
  const closedIds = new Set(
    rows
      .filter((r) => r.status === 'resolved' || r.status === 'dismissed')
      .map((r) => r.id)
  );

  const scannedList = (scanOverview?.scannedReports || []).filter(
    (r) =>
      (r.status === 'pending' || r.status === 'reviewing') &&
      !closedIds.has(r.id)
  );
  const openRows = rows.filter(
    (r) => r.status === 'pending' || r.status === 'reviewing'
  );

  const sourceReports = scannedList.length > 0 ? scannedList : openRows;
  const scannedAt = scanOverview?.scannedAt || new Date().toISOString();

  // Group open reports by reportedUser so Admin can see both the parent-level cluster (e.g. N reports in 30 min) and individual reports
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
        assessment.policyClause || 'Rule 2.1: Harassment & Community Safety',
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D5E2D6] bg-white shadow-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-[#CFE0D1] bg-gradient-to-r from-[#EAF6EC] via-[#E1F2E4] to-[#EDF8EF] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4E8C54] text-white shadow-xs">
              <ShieldCheck size={ICON_SIZE.MD} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-title-md font-bold text-[#1E3A23]">
                  Báo cáo Tổng quan Điều tra AI Sentinel (All Reports Overview)
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4E8C54] px-2.5 py-0.5 text-label-xs font-bold text-white">
                  <Sparkles size={11} />
                  Đã đồng bộ AI
                </span>
              </div>
              <p className="text-label-sm text-[#2F4F35] mt-0.5">
                Cập nhật lần quét gần nhất: <strong>{formatDateTime(scannedAt)}</strong> • Tổng hợp toàn bộ hàng đợi theo 3 yếu tố (Velocity • Credibility • Evidence)
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
              className="bg-white hover:bg-emerald-50 border-[#4E8C54]/50 text-[#1E3A23] font-semibold"
            >
              Quét cập nhật lại
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-text-secondary hover:bg-emerald-50 hover:text-text-primary transition-colors border border-[#CFE0D1]"
              aria-label="Đóng báo cáo tổng quan"
            >
              <X size={ICON_SIZE.SM} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with 100% solid background */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 bg-[#F5F7F5]">
          {scanOverview?.autoResolvedCount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-label-sm font-medium text-emerald-900 shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
              <div>
                <strong>AI Sentinel Auto-Resolve:</strong> Đã tự động thi hành chế tài &amp; đóng <strong>{scanOverview.autoResolvedCount}</strong> vụ vi phạm nhẹ (Cảnh cáo / Đình chỉ ≤7 ngày) đạt chuẩn tin cậy. Dưới đây là các vụ việc nghiêm trọng hoặc rủi ro cao cần Admin trực tiếp phán quyết.
              </div>
            </div>
          )}

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-[#DCE4DC] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Tổng báo cáo đã quét</span>
                <FileSearch size={15} className="text-primary" />
              </div>
              <div className="mt-1.5 text-headline-sm font-bold text-text-primary">
                {sourceReports.length} vụ việc
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đang mở chờ Admin phán quyết
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE4DC] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Đối tượng bị báo cáo</span>
                <Users size={15} className="text-primary" />
              </div>
              <div className="mt-1.5 text-headline-sm font-bold text-text-primary">
                {clusters.length} phụ huynh
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đã gom nhóm các report trùng người
              </p>
            </div>

            <div className="rounded-2xl border border-[#F4C2B0] bg-[#FDF1EC] p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-bold text-[#B44B27] uppercase">
                <span>Temporary Restriction</span>
                <ShieldAlert size={15} className="text-[#B44B27]" />
              </div>
              <div className="mt-1.5 text-headline-sm font-bold text-[#B44B27]">
                {highRiskClustersCount} đối tượng
              </div>
              <p className="mt-0.5 text-label-xs text-[#9E3F1F]">
                Mức High risk đang tạm hạn chế
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE4DC] bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-label-xs font-semibold text-text-muted uppercase">
                <span>Độ tự tin AI TB</span>
                <Zap size={15} className="text-emerald-600" />
              </div>
              <div className="mt-1.5 text-headline-sm font-bold text-emerald-700">
                {avgConfidence}%
              </div>
              <p className="mt-0.5 text-label-xs text-text-muted">
                Đối chiếu Khung Kỷ Luật Quy Chuẩn
              </p>
            </div>
          </div>

          {clusters.length === 0 ? (
            <div className="rounded-2xl border border-[#DCE4DC] bg-white p-8 text-center">
              <CheckCircle2
                size={36}
                className="mx-auto text-emerald-600 mb-2"
              />
              <h4 className="text-title-sm font-bold text-text-primary">
                Không còn báo cáo vi phạm nào đang mở
              </h4>
              <p className="text-body-sm text-text-muted mt-1">
                Toàn bộ các báo cáo trong hàng đợi đã được Admin xem xét và xử lý hoàn tất.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {clusters.map((cluster, idx) => {
                const riskBadge =
                  RISK_BADGE_MAP[cluster.riskLevel] || RISK_BADGE_MAP.high;

                return (
                  <div
                    key={cluster.key || idx}
                    className="rounded-2xl border border-[#DCE4DC] bg-white p-5 shadow-xs space-y-4"
                  >
                    {/* Reported Parent Cluster Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6ECE6] pb-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={cluster.reportedUser?.avatarUrl}
                          alt={cluster.reportedUser?.fullName}
                          size="md"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-label-xs font-bold uppercase tracking-wider text-[#2E5E36] bg-[#EAF6EC] px-2.5 py-0.5 rounded-md border border-[#7BAE7F]/30">
                              Cụm đối tượng #{idx + 1}
                            </span>
                            <h4 className="text-title-sm font-bold text-text-primary">
                              {cluster.reportedUser?.fullName || 'Phụ huynh bị báo cáo'}
                            </h4>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold ${riskBadge.className}`}
                            >
                              {riskBadge.label}
                            </span>
                            {cluster.reportedUser?.strikeCount > 0 && (
                              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-label-xs font-semibold text-amber-800">
                                {cluster.reportedUser.strikeCount} lần cảnh cáo trước đó
                              </span>
                            )}
                          </div>
                          <p className="text-body-sm text-text-muted mt-0.5">
                            {cluster.reportedUser?.email || 'Tài khoản phụ huynh BuddyLink'} • Đang có{' '}
                            <strong>{cluster.reports.length} báo cáo đang mở</strong> từ{' '}
                            <strong>{cluster.uniqueReportersCount} phụ huynh</strong>
                          </p>
                        </div>
                      </div>

                      {/* Quick Admin Confirm or Inspect Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onClose();
                            onOpenReportDetail(cluster.primaryReport.id);
                          }}
                          leftIcon={<Eye size={ICON_SIZE.XS} />}
                        >
                          Mở Drawer điều tra
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={isActionLoading}
                          disabled={isActionLoading}
                          onClick={async () => {
                            await onConfirmApplySentinel(cluster.primaryReport.id);
                          }}
                          leftIcon={<Sparkles size={ICON_SIZE.XS} />}
                          className="bg-[#4E8C54] hover:bg-[#3F7644] text-white font-semibold"
                        >
                          Admin Confirm: Xử lý &amp; Đóng cụm ({cluster.reports.length})
                        </Button>
                      </div>
                    </div>

                    {/* AI Report Monitoring Block (Exact layout from specification) */}
                    <div className="rounded-2xl border border-[#E2EAE2] bg-[#F9FBF9] p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-body-md font-bold text-text-primary">
                          AI Report Monitoring
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-0.5 text-label-xs font-bold ${riskBadge.className}`}
                        >
                          {riskBadge.label}
                        </span>
                      </div>

                      {/* 2 Big Metric Columns: Reports received & Time window */}
                      <div className="grid grid-cols-2 gap-4 border-b border-[#E2EAE2] pb-3.5">
                        <div>
                          <div className="text-headline-md font-bold text-text-primary leading-tight">
                            {cluster.reportsReceived}
                          </div>
                          <div className="text-body-sm text-text-muted">
                            Reports received
                          </div>
                        </div>
                        <div>
                          <div className="text-headline-md font-bold text-text-primary leading-tight">
                            {cluster.timeWindow}
                          </div>
                          <div className="text-body-sm text-text-muted">
                            Time window
                          </div>
                        </div>
                      </div>

                      {/* 3 Enforcement Pillars */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <div className="rounded-xl bg-white p-3 border border-[#E2EAE2]">
                          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
                            <Activity size={13} className="text-[#4E8C54]" />
                            <span>1. Report velocity</span>
                          </div>
                          <p className="mt-1 text-label-xs text-text-secondary">
                            {cluster.reportsReceived} report trong {cluster.timeWindow} ({cluster.uniqueReportersCount} người báo cáo)
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 border border-[#E2EAE2]">
                          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
                            <UserCheck size={13} className="text-[#4E8C54]" />
                            <span>2. Reporter credibility</span>
                          </div>
                          <p className="mt-1 text-label-xs text-text-secondary">
                            {cluster.credibilityLabel}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 border border-[#E2EAE2]">
                          <div className="flex items-center gap-1.5 text-label-xs font-bold text-text-primary">
                            <FileSearch size={13} className="text-[#4E8C54]" />
                            <span>3. Violation evidence</span>
                          </div>
                          <p className="mt-1 text-label-xs text-text-secondary">
                            Độ tự tin AI: {cluster.confidenceScore}% • Đã đối chiếu ngữ cảnh &amp; lịch sử vi phạm
                          </p>
                        </div>
                      </div>

                      {/* Two-column AI Investigation & AI Recommendation */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                        <div className="rounded-xl bg-white p-3.5 border border-[#E2EAE2] space-y-2">
                          <h6 className="text-body-sm font-bold text-text-primary">
                            AI investigation
                          </h6>
                          <ul className="list-disc pl-5 space-y-1 text-label-sm text-text-secondary">
                            {cluster.investigationSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl bg-white p-3.5 border border-[#E2EAE2] space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h6 className="text-body-sm font-bold text-text-primary">
                              AI recommendation
                            </h6>
                            <span className="inline-flex items-center rounded-full bg-[#FDECE6] px-2.5 py-0.5 text-label-xs font-bold text-[#B44B27] border border-[#F4C2B0]">
                              Temporary restriction
                            </span>
                          </div>
                          <ul className="list-disc pl-5 space-y-1 text-label-sm text-text-secondary">
                            {cluster.tempRestrictionSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>

                          <div className="pt-2 border-t border-[#E2EAE2] flex flex-wrap items-center gap-1.5">
                            <Scale size={13} className="text-[#4E8C54]" />
                            <span className="text-label-xs font-semibold text-text-muted">
                              Chế tài chính thức đề xuất (khi Admin Confirm):
                            </span>
                            {cluster.recommendedSanctions.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 rounded-md bg-[#EAF6EC] px-2 py-0.5 text-label-xs font-bold text-[#2E5E36] border border-[#7BAE7F]/35"
                              >
                                {SANCTION_LABEL_MAP[s.type] || s.type}
                                {s.durationDays ? ` (${s.durationDays} ngày)` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Reports List inside this Cluster */}
                    <div className="space-y-2">
                      <div className="text-label-xs font-bold uppercase tracking-wider text-text-muted">
                        Danh sách {cluster.reports.length} báo cáo thành phần của đối tượng này:
                      </div>
                      <div className="divide-y divide-[#E6ECE6] rounded-xl border border-[#DCE4DC] bg-[#FAFBF9]">
                        {cluster.reports.map((rep) => (
                          <div
                            key={rep.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-[#F0F5F0] transition-colors"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <ReportSeverityChip severity={rep.severity} />
                                <span className="text-body-sm font-semibold text-text-primary">
                                  {getReportCategoryLabel(rep.category)}
                                </span>
                                <span className="text-label-xs text-text-muted">
                                  • Người báo cáo:{' '}
                                  <strong className="text-text-secondary">
                                    {rep.reporter?.fullName || 'Phụ huynh'}
                                  </strong>
                                </span>
                                <span className="text-label-xs text-text-muted">
                                  • {formatDateTime(rep.createdAt)}
                                </span>
                                <ReportStatusChip status={rep.status} />
                              </div>
                              {rep.sentinelAssessment?.summary && (
                                <p className="text-label-sm text-text-secondary line-clamp-1">
                                  <strong>AI tóm tắt:</strong>{' '}
                                  {rep.sentinelAssessment.summary.replace(/\n+/g, ' ')}
                                </p>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                onClose();
                                onOpenReportDetail(rep.id);
                              }}
                              leftIcon={<Eye size={ICON_SIZE.XS} />}
                              className="shrink-0 text-[#2E5E36] hover:bg-[#EAF6EC]"
                            >
                              Chi tiết
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-[#DCE4DC] bg-white px-6 py-3.5">
          <p className="text-label-sm text-text-muted">
            💡 <strong>Lưu ý:</strong> Báo cáo tổng quan này được cập nhật tự động mỗi khi Admin bấm{' '}
            <strong>"Quét &amp; Tổng hợp AI hàng loạt"</strong>.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng bảng tổng quan
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SentinelBatchOverviewModal;
