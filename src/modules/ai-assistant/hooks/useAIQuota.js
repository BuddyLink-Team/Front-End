import { useSelector } from 'react-redux';
import { useSubscriptionQuota } from '../../subscription/hooks/useSubscriptionQuota';
import { QUOTA_FEATURES } from '../../subscription/constants/subscription.constants';

/**
 * Monthly AI conversations of the parent: one unit per conversation, used by its first reply.
 * Numbers come from GET /subscriptions/my, then from the last message sent (fresher).
 * @returns {{ isPremium: boolean, isUnlimited: boolean, limit: number|null, used: number, remaining: number|null,
 *   isExhausted: boolean, isLoaded: boolean }}
 */
export const useAIQuota = () => {
  const { usage, isPremium, quotaInfo } = useSubscriptionQuota();
  const lastQuota = useSelector((state) => state.aiAssistant.quota);
  const planQuota = usage[QUOTA_FEATURES.AI_ASSISTANT] || {};

  const limit = isPremium ? -1 : (lastQuota?.limit ?? planQuota.limit ?? null);
  const isUnlimited = limit === -1;
  const used = lastQuota?.used ?? planQuota.used ?? 0;
  const remaining = isUnlimited || limit === null ? null : Math.max(0, limit - used);

  return {
    isPremium,
    isUnlimited,
    limit,
    used,
    remaining,
    isExhausted: remaining === 0,
    isLoaded: Boolean(quotaInfo || lastQuota),
  };
};

export default useAIQuota;
