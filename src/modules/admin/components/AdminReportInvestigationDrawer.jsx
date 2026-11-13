import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ICON_SIZE } from '../../../constants/icon.constants';
import { getReportActionState } from '../hooks/useReportInvestigation';
import { CaseReportsList } from './reports/CaseReportsList';
import { ReportAuditLog } from './reports/ReportAuditLog';
import { ReportDecisionDialog } from './reports/ReportDecisionDialog';
import { ReportDrawerFooter } from './reports/ReportDrawerFooter';
import { ReportDrawerHeader } from './reports/ReportDrawerHeader';
import { ReportedUserCard } from './reports/ReportPartyCards';
import { ReportReopenDialog } from './reports/ReportReopenDialog';
import { ReportClosedSummary } from './reports/ReportResolutionForm';
import { ReportTargetContext } from './reports/ReportTargetContext';
import { SentinelCopilotCard } from './reports/SentinelCopilotCard';

const DrawerSkeleton = () => (
  <div className="space-y-4" data-testid="report-detail-skeleton">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Investigation drawer of a case, in the order a moderator works: what was reported, what each parent
 * reported, who the reported parent is, then the AI suggestion. The decision is taken from the footer,
 * in one step.
 */
export const AdminReportInvestigationDrawer = ({
  open,
  onClose,
  report,
  isLoading,
  isActionLoading,
  onUpdateSeverity,
  onDecide,
  onReopen,
  onAssessSentinel,
}) => {
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  // 'violation' | 'dismiss' while the decision dialog is open
  const [decisionMode, setDecisionMode] = useState(null);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const actionState = useMemo(() => getReportActionState(report), [report]);

  useEffect(() => {
    setIsReopenOpen(false);
    setDecisionMode(null);
    setIsLogOpen(false);
  }, [report?.id, open]);

  const { isClosed } = actionState;
  const logCount =
    (report?.actions?.length || 0) + (report?.history?.length || 0);

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        placement="right"
        maxWidth="max-w-xl"
        title="Chi tiết vụ việc"
        footer={
          !isLoading &&
          report && (
            <ReportDrawerFooter
              actionState={actionState}
              isActionLoading={isActionLoading}
              onAskDecision={setDecisionMode}
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
            {isClosed && <ReportClosedSummary report={report} />}
            <ReportTargetContext report={report} />
            <CaseReportsList report={report} />
            <ReportedUserCard report={report} />
            <SentinelCopilotCard
              report={report}
              isActionLoading={isActionLoading}
              onAssessSentinel={onAssessSentinel}
            />
            <section className="space-y-3">
              <button
                type="button"
                aria-expanded={isLogOpen}
                onClick={() => setIsLogOpen((isOpen) => !isOpen)}
                className="flex w-full items-center justify-between text-label-lg font-semibold text-text-muted hover:text-text-primary"
              >
                <span>Nhật ký xử lý ({logCount})</span>
                {isLogOpen ? (
                  <ChevronUp size={ICON_SIZE.SM} />
                ) : (
                  <ChevronDown size={ICON_SIZE.SM} />
                )}
              </button>
              {isLogOpen && (
                <ReportAuditLog
                  actions={report.actions}
                  history={report.history}
                />
              )}
            </section>
          </div>
        )}
      </Modal>

      {report && (
        <ReportDecisionDialog
          report={report}
          mode={decisionMode}
          onClose={() => setDecisionMode(null)}
          onDecide={onDecide}
          isActionLoading={isActionLoading}
        />
      )}

      {report && (
        <ReportReopenDialog
          report={report}
          isOpen={isReopenOpen}
          onClose={() => setIsReopenOpen(false)}
          onReopen={onReopen}
          isActionLoading={isActionLoading}
        />
      )}
    </>
  );
};

export default AdminReportInvestigationDrawer;
