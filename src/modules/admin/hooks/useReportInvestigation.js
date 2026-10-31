import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getReportSanctionConfirm,
  REPORT_ACCOUNT_SANCTIONS,
  REPORT_SUSPEND_DURATIONS,
} from '../constants/admin.constants';
import { reportNotesSchema, reportReopenSchema } from '../validation/reportValidation';

/**
 * What can be done on the open report right now: drives which buttons are shown or disabled.
 * @param {Object|null} report
 */
export const getReportActionState = (report) => {
  const status = report?.status;
  const appliedActions = new Set((report?.actions || []).map((action) => action.type));
  const context = report?.targetContext;
  const reportedUser = report?.reportedUser;

  return {
    isPending: status === 'pending',
    isReviewing: status === 'reviewing',
    isClosed: status === 'resolved' || status === 'dismissed',
    appliedActions,
    hasActions: appliedActions.size > 0,
    hasAccountSanction: REPORT_ACCOUNT_SANCTIONS.some((type) => appliedActions.has(type)),
    canWarn: !appliedActions.has('warn'),
    canDeleteMessage:
      !appliedActions.has('delete_message') && Boolean(context?.reportedMessage) && !context.reportedMessage.isDeleted,
    canCancelPlaydate: !appliedActions.has('cancel_playdate') && context?.playdate?.status === 'upcoming',
    canSuspend: !appliedActions.has('suspend') && reportedUser?.isActive !== false,
    canBan: !appliedActions.has('ban') && !reportedUser?.isBanned,
  };
};

/**
 * State of the investigation drawer: the sanction waiting for confirmation, the suspension length and the
 * related reports to close together. Starts over for each report.
 * @param {Object|null} report
 * @param {boolean} isOpen
 * @param {Function} onApplyAction - (id, { type, durationDays, note }) => Promise<boolean>
 */
export const useReportInvestigation = (report, isOpen, onApplyAction) => {
  const [pendingSanction, setPendingSanction] = useState(null);
  const [suspendDays, setSuspendDays] = useState(REPORT_SUSPEND_DURATIONS[0]);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState([]);

  const reportId = report?.id;
  useEffect(() => {
    setPendingSanction(null);
    setSuspendDays(REPORT_SUSPEND_DURATIONS[0]);
    setSelectedRelatedIds([]);
  }, [reportId, isOpen]);

  const actionState = useMemo(() => getReportActionState(report), [report]);

  // Related reports are only closed together with a suspension or a ban
  useEffect(() => {
    if (!actionState.hasAccountSanction) setSelectedRelatedIds([]);
  }, [actionState.hasAccountSanction]);

  const askSanction = useCallback(
    (type) => setPendingSanction({ type, durationDays: type === 'suspend' ? suspendDays : null }),
    [suspendDays]
  );

  const cancelSanction = useCallback(() => setPendingSanction(null), []);

  const confirmSanction = useCallback(
    async (note) => {
      if (!pendingSanction || !reportId) return;
      const isApplied = await onApplyAction(reportId, { ...pendingSanction, note: note || '' });
      if (isApplied) setPendingSanction(null);
    },
    [pendingSanction, reportId, onApplyAction]
  );

  const toggleRelatedReport = useCallback((id) => {
    setSelectedRelatedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }, []);

  return {
    actionState,
    suspendDays,
    setSuspendDays,
    selectedRelatedIds,
    toggleRelatedReport,
    askSanction,
    cancelSanction,
    confirmSanction,
    sanctionConfirm: pendingSanction ? getReportSanctionConfirm(pendingSanction.type, pendingSanction.durationDays) : null,
  };
};

/**
 * Notes form that closes a report. Each button submits its own outcome.
 * @param {Object|null} report
 * @param {string[]} selectedRelatedIds
 * @param {Function} onResolve - (id, payload) => Promise<boolean>
 */
export const useReportResolutionForm = (report, selectedRelatedIds, onResolve) => {
  const form = useForm({
    resolver: zodResolver(reportNotesSchema),
    defaultValues: { adminNotes: '' },
  });
  const { reset, handleSubmit } = form;

  useEffect(() => {
    reset({ adminNotes: '' });
  }, [report?.id, report?.status, reset]);

  const submitOutcome = (status, resolution) =>
    handleSubmit(({ adminNotes }) =>
      onResolve(report.id, {
        status,
        resolution,
        adminNotes,
        ...(selectedRelatedIds.length > 0 && status === 'resolved' ? { applyToRelatedReportIds: selectedRelatedIds } : {}),
      })
    );

  return {
    form,
    dismiss: submitOutcome('dismissed', 'dismissed'),
    markResolved: submitOutcome('resolved', 'action_taken'),
    resolveWithoutAction: submitOutcome('resolved', 'no_action'),
  };
};

/**
 * Reason form of the reopen dialog. Starts empty each time it opens.
 * @param {Object} report
 * @param {boolean} isOpen
 * @param {Function} onReopen - (id, note) => Promise<boolean>
 * @param {Function} onClose
 */
export const useReportReopenForm = (report, isOpen, onReopen, onClose) => {
  const form = useForm({
    resolver: zodResolver(reportReopenSchema),
    defaultValues: { note: '' },
  });
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (isOpen) reset({ note: '' });
  }, [isOpen, reset]);

  const submit = handleSubmit(async ({ note }) => {
    if (await onReopen(report.id, note)) onClose();
  });

  return { form, submit };
};
