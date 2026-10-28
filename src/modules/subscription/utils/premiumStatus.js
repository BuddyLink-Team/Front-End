import { PLAN_CODES } from '../constants/subscription.constants';

/**
 * Whether the parent has Premium benefits right now.
 * The stored flag (GET /subscriptions/my) or a paid active subscription (e.g. right after checkout)
 * counts, but never past its end date: the store can outlive the expiry while the app stays open.
 * @param {Object|null} subscription - state.subscription.subscription
 * @param {boolean} [isPremiumFlag] - state.subscription.isPremium
 * @returns {boolean}
 */
export const isPremiumActive = (subscription, isPremiumFlag = false) => {
  const hasPaidPlan =
    subscription?.status === 'active' && Boolean(subscription?.planCode) && subscription.planCode !== PLAN_CODES.FREE;
  const isExpired = Boolean(subscription?.endDate) && new Date(subscription.endDate) <= new Date();
  return (Boolean(isPremiumFlag) || hasPaidPlan) && !isExpired;
};

export default isPremiumActive;
