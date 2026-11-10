import React from 'react';
import PropTypes from 'prop-types';
import { CalendarCheck2, AlertTriangle } from 'lucide-react';
import { Card, StatusChip } from '../../../components';
import { formatDate } from '../../../utils/formatters';
import { RELIABILITY_LEVEL_META } from '../constants/playdate.constants';

/**
 * Reliability of a parent: late leaves (less than 24h before the start) over the last 90 days.
 * Leaving after blocking someone in the playdate is a safety choice and is never counted.
 * @param {Object|null} reliability - GET /playdates/reliability/me, or activity.reliability of the admin user detail
 * @param {boolean} [isAdminView] - Worded for the admin instead of the parent themself
 */
export const ReliabilityCard = ({ reliability, isAdminView = false, className = '' }) => {
  if (!reliability) return null;

  const { level, lateLeaves, leaves, windowDays, lateLeaveHours, atRiskLateLeaves, totalLateLeaves, lastLateLeaveAt } =
    reliability;
  const meta = RELIABILITY_LEVEL_META[level] || RELIABILITY_LEVEL_META.good;
  const subject = isAdminView ? 'Phụ huynh này' : 'Bạn';

  const summary =
    lateLeaves > 0
      ? `${subject} đã rời sát giờ ${lateLeaves} buổi hẹn trong ${windowDays} ngày qua.`
      : `${subject} chưa rời buổi hẹn nào sát giờ trong ${windowDays} ngày qua.`;

  return (
    <Card className={`p-5 rounded-3xl border border-hairline bg-white shadow-sm space-y-3 text-left ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <CalendarCheck2 className="w-4 h-4 text-primary shrink-0" />
          Độ tin cậy khi hẹn chơi
        </h2>
        <StatusChip tone={meta.tone} label={meta.label} />
      </div>

      <p className="text-sm text-text-primary">{summary}</p>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-surface border border-hairline">
          <dt className="text-text-muted">Rời sát giờ ({windowDays} ngày)</dt>
          <dd className="text-base font-bold text-text-primary">{lateLeaves}</dd>
        </div>
        <div className="p-2.5 rounded-xl bg-surface border border-hairline">
          <dt className="text-text-muted">Tổng lần rời ({windowDays} ngày)</dt>
          <dd className="text-base font-bold text-text-primary">{leaves}</dd>
        </div>
      </dl>

      {isAdminView && (
        <p className="text-xs text-text-muted">
          Từ trước đến nay: {totalLateLeaves} lần rời sát giờ
          {lastLateLeaveAt ? `, gần nhất ngày ${formatDate(lastLateLeaveAt)}` : ''}.
        </p>
      )}

      {level === 'at_risk' && !isAdminView && (
        <p className="flex items-start gap-2 p-2.5 rounded-xl bg-error-container text-error text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Bạn hay rời buổi hẹn sát giờ. Các gia đình khác cần chuẩn bị trước, hãy rời sớm hơn nếu không thể tham gia nhé.
        </p>
      )}

      <p className="text-xs text-text-muted">
        Rời buổi hẹn khi còn dưới {lateLeaveHours} giờ là rời sát giờ. Từ {atRiskLateLeaves} lần trong {windowDays} ngày
        là &ldquo;hay rời sát giờ&rdquo;. Rời vì đã chặn một người trong buổi hẹn không bị tính.
      </p>
    </Card>
  );
};

ReliabilityCard.propTypes = {
  reliability: PropTypes.shape({
    level: PropTypes.string,
    lateLeaves: PropTypes.number,
    leaves: PropTypes.number,
    windowDays: PropTypes.number,
    lateLeaveHours: PropTypes.number,
    atRiskLateLeaves: PropTypes.number,
    totalLateLeaves: PropTypes.number,
    lastLateLeaveAt: PropTypes.string,
  }),
  isAdminView: PropTypes.bool,
  className: PropTypes.string,
};

export default ReliabilityCard;
