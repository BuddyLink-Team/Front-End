import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/feedback/Modal';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { useReportInvestigation, useReportResolutionForm } from '../hooks/useReportInvestigation';
import { RelatedReportsPanel } from './reports/RelatedReportsPanel';
import { ReportAuditLog } from './reports/ReportAuditLog';
import { ReportContentPanel } from './reports/ReportContentPanel';
import { ReportDrawerFooter } from './reports/ReportDrawerFooter';
import { ReportDrawerHeader } from './reports/ReportDrawerHeader';
import { ReportedUserHistory } from './reports/ReportedUserHistory';
import { ReportPartyCards } from './reports/ReportPartyCards';
import { ReportReopenDialog } from './reports/ReportReopenDialog';
import { ReportClosedSummary, ReportResolutionForm } from './reports/ReportResolutionForm';
import { ReportSanctionPanel } from './reports/ReportSanctionPanel';
import { ReportTargetContext } from './reports/ReportTargetContext';

const DrawerSkeleton = () => (
  <div className="space-y-4" data-testid="report-detail-skeleton">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Investigation drawer of a report: context and proof, the reported user's history, sanctions and closing
 */
export const AdminReportInvestigationDrawer = ({
  open,
  onClose,
  report,
  isLoading,
  isActionLoading,
  onClaim,
  onTakeover,
  onUpdateSeverity,
  onApplyAction,
  onResolve,
  onReopen,
}) => {
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const {
    actionState,
    suspendDays,
    setSuspendDays,
    selectedRelatedIds,
    toggleRelatedReport,
    askSanction,
    cancelSanction,
    confirmSanction,
    sanctionConfirm,
  } = useReportInvestigation(report, open, onApplyAction);
  const resolution = useReportResolutionForm(report, selectedRelatedIds, onResolve);

  useEffect(() => {
    setIsReopenOpen(false);
  }, [report?.id, open]);

  const { isReviewing, isClosed, hasAccountSanction } = actionState;

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        placement="right"
        maxWidth="max-w-xl"
        title="Chi tiết báo cáo vi phạm"
        footer={
          !isLoading &&
          report && (
            <ReportDrawerFooter
              report={report}
              actionState={actionState}
              isActionLoading={isActionLoading}
              resolution={resolution}
              onClose={onClose}
              onClaim={onClaim}
              onTakeover={onTakeover}
              onAskReopen={() => setIsReopenOpen(true)}
            />
          )
        }
      >
        {isLoading || !report ? (
          <DrawerSkeleton />
        ) : (
          <div className="space-y-6">
            <ReportDrawerHeader
              report={report}
              actionState={actionState}
              isActionLoading={isActionLoading}
              onUpdateSeverity={onUpdateSeverity}
            />
            <ReportPartyCards reporter={report.reporter} reportedUser={report.reportedUser} />
            <ReportContentPanel report={report} />
            <ReportTargetContext report={report} />
            <ReportedUserHistory reportedUser={report.reportedUser} />
            {!isClosed && report.relatedOpenReports?.length > 0 && (
              <RelatedReportsPanel
                reports={report.relatedOpenReports}
                selectedIds={selectedRelatedIds}
                onToggle={toggleRelatedReport}
                canSelect={hasAccountSanction}
              />
            )}
            {isReviewing && (
              <ReportSanctionPanel
                targetType={report.targetType}
                actionState={actionState}
                suspendDays={suspendDays}
                onSuspendDaysChange={setSuspendDays}
                onAskSanction={askSanction}
                isActionLoading={isActionLoading}
              />
            )}
            <ReportAuditLog actions={report.actions} history={report.history} />
            {isClosed ? (
              <ReportClosedSummary report={report} />
            ) : (
              <ReportResolutionForm form={resolution.form} actionState={actionState} />
            )}
          </div>
        )}
      </Modal>

      {report && (
        <ReportReopenDialog
          report={report}
          isOpen={isReopenOpen}
          onClose={() => setIsReopenOpen(false)}
          onReopen={onReopen}
          isActionLoading={isActionLoading}
        />
      )}

      <ConfirmDialog
        open={Boolean(sanctionConfirm)}
        title={sanctionConfirm?.title}
        description={sanctionConfirm?.description}
        variant={sanctionConfirm?.variant}
        confirmLabel="Xác nhận thi hành"
        cancelLabel="Hủy bỏ"
        isLoading={isActionLoading}
        reason={{
          required: false,
          label: 'Ghi chú (không bắt buộc)',
          placeholder: 'Nhập ghi chú lý do kỷ luật...',
        }}
        onConfirm={confirmSanction}
        onCancel={cancelSanction}
      />
    </>
  );
};

export default AdminReportInvestigationDrawer;
