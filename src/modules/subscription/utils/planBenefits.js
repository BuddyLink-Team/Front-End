import { PLAN_FEATURE_ROWS, UNLIMITED_LABEL } from '../constants/subscriptionConstants';

/**
 * Limit text of one plan feature: "Không giới hạn", "1 hồ sơ bé", "5 hồ sơ / ngày"...
 * @param {Object} row - PLAN_FEATURE_ROWS item
 * @param {number} limit - -1 = unlimited
 */
export const formatPlanLimit = (row, limit) => {
  if (limit === -1) return UNLIMITED_LABEL;
  return row.period ? `${limit} ${row.unit} / ${row.period}` : `${limit} ${row.unit}`;
};

/**
 * Benefits of a plan from its limits (plan.features of GET /subscriptions/plans).
 * Before the plans are loaded, Premium is unlimited and Free uses the documented defaults.
 * @param {Object} [features] - plan.features
 * @param {boolean} isPremiumPlan
 * @returns {Array<{ key: string, name: string, limit: number, text: string }>}
 */
export const getPlanBenefits = (features, isPremiumPlan) =>
  PLAN_FEATURE_ROWS.map((row) => {
    const limit = features?.[row.featureKey] ?? (isPremiumPlan ? -1 : row.freeDefault);
    return { key: row.key, name: row.name, limit, text: formatPlanLimit(row, limit) };
  });
