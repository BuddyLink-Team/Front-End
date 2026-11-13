import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  isSanctionOutsidePolicy,
  REPORT_OVERRIDE_MIN_LENGTH,
  REPORT_SUSPEND_DURATIONS,
} from '../constants/admin.constants';
import {
  reportNotesSchema,
  reportReopenSchema,
} from '../validation/reportValidation';
import { buildSentinelView } from '../utils/sentinelView';

const OPEN_STATUSES = ['pending', 'reviewing'];

/**
 * What can be done on the case right now: drives which buttons and sanctions are offered.
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
    isOpen: OPEN_STATUSES.includes(status),
    isClosed: status === 'resolved' || status === 'dismissed',
    appliedActions,
    // A decision of the admin (or of an auto-resolve): provisional Auto-Shield actions are not
    hasOfficialActions: (report?.actions || []).some(
      (action) => !action.isProvisional,
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
 * Sanctions the decision dialog offers for a case, in the order they run, each with why it cannot be
 * chosen when it cannot.
 * @param {Object} report
 * @returns {Array<{ type: string, disabledReason: string|null }>}
 */
export const getSanctionOptions = (report) => {
  const state = getReportActionState(report);
  const done = (type) => state.appliedActions.has(type);
  const options = [];
  if (report?.targetType === 'message') {
    options.push({
      type: 'delete_message',
      disabledReason: state.canDeleteMessage
        ? null
        : done('delete_message') || report.targetContext?.reportedMessage
          ? 'Tin nhắn đã được xóa'
          : 'Tin nhắn không còn tồn tại',
    });
  }
  if (report?.targetType === 'playdate') {
    options.push({
      type: 'cancel_playdate',
      disabledReason: state.canCancelPlaydate
        ? null
        : done('cancel_playdate')
          ? 'Cuộc hẹn đã được hủy'
          : 'Cuộc hẹn không còn mở để hủy',
    });
  }
  options.push(
    {
      type: 'warn',
      disabledReason: state.canWarn ? null : 'Đã cảnh cáo trong vụ việc này',
    },
    {
      type: 'suspend',
      disabledReason: state.canSuspend
        ? null
        : done('suspend')
          ? 'Đã đình chỉ trong vụ việc này'
          : 'Tài khoản đang bị khóa hoặc đình chỉ',
    },
    {
      type: 'ban',
      disabledReason: state.canBan ? null : 'Tài khoản đã bị khóa vĩnh viễn',
    },
  );
  return options;
};

// What the reporters read when nobody wrote a text for the decision (same as the backend)
export const REPORTER_NOTICE_DEFAULTS = Object.freeze({
  violation:
    'Báo cáo của bạn đã được xử lý theo Quy chuẩn Cộng đồng BuddyLink. Cảm ơn bạn đã chung tay bảo vệ an toàn cho các bé.',
  dismiss: 'Báo cáo của bạn đã được xem xét và lưu hồ sơ theo dõi.',
});

// From the heaviest: the one preselected when several are suggested
const SANCTION_WEIGHT = ['ban', 'suspend', 'warn', 'cancel_playdate', 'delete_message'];

/**
 * Form of the decision dialog, the only place a case is closed.
 * - violation: one form of sanction (preselected from the AI recommendation when it found a violation,
 *   otherwise from the sanction matrix) or none, the other open cases closed with it and the notes
 * - dismiss: no violation, with the reason
 * The parents read exactly the notices shown: the texts the AI wrote when its conclusion is the decision,
 * the generic ones otherwise. The AI draft of the notes is prefilled where it belongs.
 * Starts over each time the dialog opens.
 * @param {Object|null} report
 * @param {'violation'|'dismiss'|null} mode - null when closed
 * @param {Function} onDecide - (id, payload) => Promise<boolean>
 * @param {Function} onClose
 */
export const useReportDecisionForm = (report, mode, onDecide, onClose) => {
  const form = useForm({
    resolver: zodResolver(reportNotesSchema),
    defaultValues: { adminNotes: '' },
  });
  const { reset, handleSubmit } = form;
  // One form of sanction, or null for a violation without discipline
  const [sanction, setSanction] = useState(null);
  const [suspendDays, setSuspendDays] = useState(REPORT_SUSPEND_DURATIONS[0]);
  const [overrideReason, setOverrideReason] = useState('');
  const [alsoCloseIds, setAlsoCloseIds] = useState([]);
  const [offenderNotice, setOffenderNotice] = useState('');
  const [reporterNotice, setReporterNotice] = useState('');

  const options = useMemo(() => getSanctionOptions(report), [report]);
  const actionState = useMemo(() => getReportActionState(report), [report]);
  const policyGuidance = report?.policyGuidance || null;
  // What is preselected: the AI recommendation when it concluded a violation, the matrix otherwise
  const suggested = useMemo(() => {
    const view = buildSentinelView(report);
    return view?.isViolation
      ? view.recommendedSanctions
      : policyGuidance?.standardActions || [];
  }, [report, policyGuidance]);
  const suspendChoices = useMemo(() => {
    const days = suggested.find((item) => item.type === 'suspend')?.durationDays;
    return [...new Set([...REPORT_SUSPEND_DURATIONS, ...(days ? [days] : [])])].sort(
      (a, b) => a - b,
    );
  }, [suggested]);

  useEffect(() => {
    if (!mode) return;
    const assessment = report?.sentinelAssessment;
    const drafts = assessment?.draftNotes || {};
    // The AI wrote its texts for its own conclusion: they fit only when the decision is the same
    const isAiConclusion =
      (mode === 'violation' && assessment?.verdict === 'violation') ||
      (mode === 'dismiss' && assessment?.verdict === 'no_violation');
    reset({ adminNotes: isAiConclusion ? drafts.adminNote || '' : '' });

    const available = new Set(
      options.filter((option) => !option.disabledReason).map((option) => option.type),
    );
    const suggestedTypes = new Set(suggested.map((item) => item.type));
    setSanction(
      mode === 'violation'
        ? SANCTION_WEIGHT.find((type) => suggestedTypes.has(type) && available.has(type)) || null
        : null,
    );
    setSuspendDays(
      suggested.find((item) => item.type === 'suspend')?.durationDays ||
        REPORT_SUSPEND_DURATIONS[0],
    );
    setOverrideReason('');
    setAlsoCloseIds([]);
    setOffenderNotice(isAiConclusion && mode === 'violation' ? drafts.reportedUserNotice || '' : '');
    setReporterNotice(
      (isAiConclusion && drafts.reporterFeedback) || REPORTER_NOTICE_DEFAULTS[mode],
    );
    // Starts over when the dialog opens, not while the admin edits it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, report?.id]);

  const toggleAlsoClose = useCallback((id) => {
    setAlsoCloseIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }, []);

  // A sanction outside the matrix needs a policy override once the AI assessed the report
  const isOutsidePolicy = useCallback(
    (type) =>
      Boolean(report?.isPolicyEnforced) &&
      Boolean(type) &&
      isSanctionOutsidePolicy(
        policyGuidance,
        type,
        type === 'suspend' ? suspendDays : null,
      ),
    [report?.isPolicyEnforced, policyGuidance, suspendDays],
  );
  const needsOverride = isOutsidePolicy(sanction);
  const isOverrideValid =
    !needsOverride ||
    overrideReason.trim().length >= REPORT_OVERRIDE_MIN_LENGTH;

  const openReportCount =
    (report?.caseReports || []).filter((item) =>
      OPEN_STATUSES.includes(item.status),
    ).length || 1;
  const alsoClosed = (report?.otherOpenCases || []).filter((item) =>
    alsoCloseIds.includes(item.id),
  );
  const closingCount =
    openReportCount +
    alsoClosed.reduce((sum, item) => sum + (item.reportCount || 1), 0);

  const submit = handleSubmit(async ({ adminNotes }) => {
    if (mode === 'violation' && !isOverrideValid) return;
    const reporterText = reporterNotice.trim();
    const offenderText = offenderNotice.trim();
    const payload =
      mode === 'dismiss'
        ? {
            outcome: 'no_violation',
            notes: adminNotes,
            ...(reporterText ? { reporterNotice: reporterText } : {}),
          }
        : {
            outcome: 'violation',
            sanctions: sanction
              ? [
                  {
                    type: sanction,
                    ...(sanction === 'suspend' ? { durationDays: suspendDays } : {}),
                  },
                ]
              : [],
            notes: adminNotes,
            ...(sanction && offenderText ? { reportedUserNotice: offenderText } : {}),
            ...(reporterText ? { reporterNotice: reporterText } : {}),
            ...(needsOverride
              ? { isPolicyOverride: true, overrideReason: overrideReason.trim() }
              : {}),
            ...(alsoCloseIds.length > 0 ? { alsoCloseReportIds: alsoCloseIds } : {}),
          };
    if (await onDecide(report.id, payload)) onClose();
  });

  return {
    form,
    actionState,
    options,
    sanction,
    setSanction,
    suspendDays,
    setSuspendDays,
    suspendChoices,
    isOutsidePolicy,
    needsOverride,
    isOverrideValid,
    overrideReason,
    setOverrideReason,
    alsoCloseIds,
    toggleAlsoClose,
    closingCount,
    offenderNotice,
    setOffenderNotice,
    reporterNotice,
    setReporterNotice,
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
