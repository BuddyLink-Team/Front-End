import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  isSanctionOutsidePolicy,
  getReportSanctionConfirm,
  REPORT_ACCOUNT_SANCTIONS,
  REPORT_OVERRIDE_MIN_LENGTH,
  REPORT_SUSPEND_DURATIONS,
} from '../constants/admin.constants';
import {
  reportConclusionSchema,
  reportReopenSchema,
} from '../validation/reportValidation';

/**
 * What can be done on the open report right now: drives which buttons are shown or disabled.
 * @param {Object|null} report
 */
export const getReportActionState = (report) => {
  const status = report?.status;
  const appliedActions = new Set(
    (report?.actions || []).map((action) => action.type),
  );
  const context = report?.targetContext;
  const reportedUser = report?.reportedUser;

  return {
    isPending: status === 'pending',
    isReviewing: status === 'reviewing',
    isClosed: status === 'resolved' || status === 'dismissed',
    appliedActions,
    hasActions: appliedActions.size > 0,
    // A decision of the admin (or of an auto-resolve): provisional Auto-Shield actions are not
    hasOfficialActions: (report?.actions || []).some(
      (action) => !action.isProvisional,
    ),
    hasAccountSanction: REPORT_ACCOUNT_SANCTIONS.some((type) =>
      appliedActions.has(type),
    ),
    canWarn: !appliedActions.has('warn'),
    canDeleteMessage:
      !appliedActions.has('delete_message') &&
      Boolean(context?.reportedMessage) &&
      !context.reportedMessage.isDeleted,
    canCancelPlaydate:
      !appliedActions.has('cancel_playdate') &&
      context?.playdate?.status === 'upcoming',
    canSuspend:
      !appliedActions.has('suspend') && reportedUser?.isActive !== false,
    canBan: !appliedActions.has('ban') && !reportedUser?.isBanned,
  };
};

/**
 * State of the investigation drawer: the sanction waiting for confirmation, the suspension length and the
 * policy override. Starts over for each report.
 * @param {Object|null} report
 * @param {boolean} isOpen
 * @param {Function} onApplyAction - (id, { type, durationDays, note }) => Promise<boolean>
 */
export const useReportInvestigation = (report, isOpen, onApplyAction) => {
  const [pendingSanction, setPendingSanction] = useState(null);
  const [suspendDays, setSuspendDays] = useState(REPORT_SUSPEND_DURATIONS[0]);
  const [isPolicyOverride, setIsPolicyOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const reportId = report?.id;
  useEffect(() => {
    setPendingSanction(null);
    setSuspendDays(REPORT_SUSPEND_DURATIONS[0]);
    setIsPolicyOverride(false);
    setOverrideReason('');
  }, [reportId, isOpen]);

  const actionState = useMemo(() => getReportActionState(report), [report]);
  // Matrix computed by the backend once the report has a Sentinel assessment (null before)
  const policyGuidance = report?.policyGuidance || null;
  const isOverrideValid =
    isPolicyOverride &&
    overrideReason.trim().length >= REPORT_OVERRIDE_MIN_LENGTH;

  const askSanction = useCallback(
    (type) =>
      setPendingSanction({
        type,
        durationDays: type === 'suspend' ? suspendDays : null,
      }),
    [suspendDays],
  );

  const cancelSanction = useCallback(() => setPendingSanction(null), []);

  const confirmSanction = useCallback(
    async (note) => {
      if (!pendingSanction || !reportId) return;
      // Only a sanction really outside the matrix is sent (and audited) as a policy override
      const isOutsideStandard = isSanctionOutsidePolicy(
        policyGuidance,
        pendingSanction.type,
        pendingSanction.durationDays,
      );

      const isApplied = await onApplyAction(reportId, {
        ...pendingSanction,
        note: note || '',
        isPolicyOverride: isOutsideStandard,
        overrideReason: isOutsideStandard ? overrideReason.trim() : '',
      });
      if (isApplied) {
        setPendingSanction(null);
      }
    },
    [pendingSanction, reportId, onApplyAction, policyGuidance, overrideReason],
  );

  return {
    actionState,
    policyGuidance,
    isPolicyOverride,
    setIsPolicyOverride,
    overrideReason,
    setOverrideReason,
    isOverrideValid,
    suspendDays,
    setSuspendDays,
    askSanction,
    cancelSanction,
    confirmSanction,
    sanctionConfirm: pendingSanction
      ? getReportSanctionConfirm(
          pendingSanction.type,
          pendingSanction.durationDays,
        )
      : null,
  };
};

/**
 * Form of the conclusion dialog, the only place a report is closed.
 * - resolve: outcome (sanctions applied / violation but no sanction), notes prefilled with the AI draft,
 *   related reports closed together (only with a suspension or a ban)
 * - dismiss: the report shows no violation (false or duplicate), with the reason
 * Starts over each time it opens.
 * @param {Object|null} report
 * @param {'resolve'|'dismiss'|null} mode - null when closed
 * @param {Function} onResolve - (id, payload) => Promise<boolean>
 * @param {Function} onClose
 */
export const useReportConclusionForm = (report, mode, onResolve, onClose) => {
  const actionState = useMemo(() => getReportActionState(report), [report]);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState([]);
  const form = useForm({
    resolver: zodResolver(reportConclusionSchema),
    defaultValues: { adminNotes: '', outcome: 'no_action' },
  });
  const { reset, handleSubmit, watch } = form;

  useEffect(() => {
    if (!mode) return;
    setSelectedRelatedIds([]);
    // The AI draft goes where it belongs: a dismissal when the AI found no violation, a resolution otherwise
    const assessment = report?.sentinelAssessment;
    const isAiNoViolation = assessment?.verdict === 'no_violation';
    const draft = assessment?.draftNotes?.adminNote || '';
    reset({
      adminNotes: (mode === 'dismiss') === isAiNoViolation ? draft : '',
      // The outcome follows the sanctions: the other one is locked in the dialog
      outcome: actionState.hasOfficialActions ? 'action_taken' : 'no_action',
    });
  }, [mode, report, actionState.hasOfficialActions, reset]);

  const outcome = watch('outcome');
  // Related reports get the same suspension or ban: only offered for a resolution with one
  const canCloseRelated =
    mode === 'resolve' &&
    outcome === 'action_taken' &&
    actionState.hasAccountSanction;

  const toggleRelatedReport = useCallback((id) => {
    setSelectedRelatedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }, []);

  const submit = handleSubmit(async ({ adminNotes, outcome: chosen }) => {
    const isDismiss = mode === 'dismiss';
    const payload = {
      status: isDismiss ? 'dismissed' : 'resolved',
      resolution: isDismiss ? 'dismissed' : chosen,
      adminNotes,
      ...(canCloseRelated && selectedRelatedIds.length > 0
        ? { applyToRelatedReportIds: selectedRelatedIds }
        : {}),
    };
    if (await onResolve(report.id, payload)) onClose();
  });

  return {
    form,
    actionState,
    outcome,
    canCloseRelated,
    selectedRelatedIds,
    toggleRelatedReport,
    submit,
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
