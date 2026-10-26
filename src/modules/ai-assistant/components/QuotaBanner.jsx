import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Crown, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { UpgradeButton } from '../../../components/ui/UpgradeButton';
import { AI_LIMITS } from '../constants/aiAssistantConstants';

/**
 * AI conversations left this month (Free plan), and the session's own message cap.
 * Exhausted: the composer is disabled by the panel and an upgrade button is shown here.
 *
 * @param {Object} quota - useAIQuota()
 * @param {number|null} [messagesLeft] - Messages left in the open conversation
 * @param {boolean} [isSessionBilled] - The open conversation already used its unit (it keeps working)
 * @param {boolean} [compact] - Drawer variant
 */
export const QuotaBanner = ({ quota, messagesLeft = null, isSessionBilled = false, compact = false }) => {
  const navigate = useNavigate();
  const goUpgrade = () => navigate('/subscription');
  const isNearFull = messagesLeft !== null && messagesLeft <= AI_LIMITS.SESSION_NEAR_FULL;

  if (quota.isExhausted && !isSessionBilled) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-tertiary-border bg-tertiary-soft px-3 py-2">
        <p className="flex flex-1 items-start gap-1.5 text-xs text-tertiary-dark">
          <Crown className="w-4 h-4 shrink-0" />
          Bạn đã dùng hết {quota.limit} cuộc trò chuyện với Trợ lý AI tháng này.
        </p>
        <UpgradeButton size="sm" onClick={goUpgrade}>
          Nâng cấp Premium
        </UpgradeButton>
      </div>
    );
  }

  if (isNearFull) {
    return (
      <p className="flex items-center gap-1.5 rounded-xl bg-tertiary-soft px-3 py-2 text-xs text-tertiary-dark">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {messagesLeft === 0
          ? 'Cuộc trò chuyện đã đầy, hãy mở cuộc trò chuyện mới.'
          : `Cuộc trò chuyện sắp đầy (còn ${messagesLeft} tin).`}
      </p>
    );
  }

  if (quota.isUnlimited) {
    return compact ? null : (
      <p className="flex items-center gap-1.5 text-xs text-text-muted">
        <ShieldCheck className="w-4 h-4 text-primary" /> Premium · trò chuyện không giới hạn
      </p>
    );
  }

  if (quota.limit === null) return null;
  const usedPercent = Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100));

  return (
    <div className={cn('space-y-1.5', compact && 'flex items-center gap-3 space-y-0')}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-text-muted">
          Còn <span className="font-semibold text-on-surface">{quota.remaining}/{quota.limit}</span> cuộc trò chuyện AI tháng này
        </span>
        {!compact && (
          <button type="button" onClick={goUpgrade} className="font-semibold text-primary-dark hover:underline">
            Nâng gói
          </button>
        )}
      </div>
      <div
        className={cn('h-1.5 overflow-hidden rounded-full bg-surface-container', compact && 'flex-1')}
        role="progressbar"
        aria-label="Lượt trò chuyện AI đã dùng"
        aria-valuenow={quota.used}
        aria-valuemin={0}
        aria-valuemax={quota.limit}
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usedPercent}%` }} />
      </div>
    </div>
  );
};

QuotaBanner.propTypes = {
  quota: PropTypes.shape({
    isUnlimited: PropTypes.bool,
    isExhausted: PropTypes.bool,
    limit: PropTypes.number,
    used: PropTypes.number,
    remaining: PropTypes.number,
  }).isRequired,
  messagesLeft: PropTypes.number,
  isSessionBilled: PropTypes.bool,
  compact: PropTypes.bool,
};

export default QuotaBanner;
