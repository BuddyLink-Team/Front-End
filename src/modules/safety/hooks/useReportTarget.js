import { useCallback, useState } from 'react';
import { REPORT_TARGET_TYPES } from '../constants/safety.constants';

const getSenderId = (message) =>
  message?.senderId?._id ||
  message?.senderId?.id ||
  message?.senderId ||
  message?.sender?.id ||
  message?.sender?._id;

/**
 * What the ReportModal reports (a parent, one of their messages or a playdate).
 * The modal is open while a target is set.
 */
export const useReportTarget = () => {
  const [reportTarget, setReportTarget] = useState(null);

  const reportUser = useCallback((reportedUserId, targetName) => {
    setReportTarget({ reportedUserId, targetType: REPORT_TARGET_TYPES.USER, targetName });
  }, []);

  const reportMessage = useCallback((message, fallbackName) => {
    setReportTarget({
      reportedUserId: getSenderId(message),
      targetType: REPORT_TARGET_TYPES.MESSAGE,
      targetMessageId: message?.id || message?._id,
      targetName: message?.sender?.fullName || fallbackName,
      targetSummary: message?.content,
    });
  }, []);

  // A playdate report is filed against its host (`host` in a chat, `hostParent` on the detail page)
  const reportPlaydate = useCallback((playdate, targetName) => {
    setReportTarget({
      reportedUserId: playdate?.host?.id || playdate?.hostParent?.id,
      targetType: REPORT_TARGET_TYPES.PLAYDATE,
      targetPlaydateId: playdate?.id,
      targetName,
      targetSummary: playdate?.activity || targetName,
    });
  }, []);

  const closeReport = useCallback(() => setReportTarget(null), []);

  return { reportTarget, reportUser, reportMessage, reportPlaydate, closeReport };
};

export default useReportTarget;
