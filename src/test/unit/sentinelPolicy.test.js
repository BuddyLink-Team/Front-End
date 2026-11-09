import { describe, it, expect } from 'vitest';
import {
  formatPolicyClause,
  formatTimeWindow,
  isSanctionOutsidePolicy,
  isTemporarilyRestricted,
  planSentinelCluster,
} from '../../modules/admin/constants/admin.constants';

const policy = {
  allowedActionTypes: ['delete_message', 'suspend'],
  standardActions: [{ type: 'delete_message' }, { type: 'suspend', durationDays: 7 }],
};

describe('isSanctionOutsidePolicy', () => {
  it('treats every sanction as standard without a policy (no Sentinel assessment)', () => {
    expect(isSanctionOutsidePolicy(null, 'ban')).toBe(false);
  });

  it('keeps sanctions of the matrix standard', () => {
    expect(isSanctionOutsidePolicy(policy, 'delete_message')).toBe(false);
    expect(isSanctionOutsidePolicy(policy, 'suspend', 7)).toBe(false);
  });

  it('flags a sanction out of the matrix', () => {
    expect(isSanctionOutsidePolicy(policy, 'ban')).toBe(true);
  });

  it('flags a suspension whose length differs from the standard one', () => {
    expect(isSanctionOutsidePolicy(policy, 'suspend', 30)).toBe(true);
  });
});

describe('isTemporarilyRestricted', () => {
  const withRestriction = (applied, status) => ({
    status,
    sentinelAssessment: { monitoring: { temporaryRestriction: { applied } } },
  });

  it('is true only for an open report whose restriction was really applied', () => {
    expect(isTemporarilyRestricted(withRestriction(true, 'reviewing'))).toBe(true);
    expect(isTemporarilyRestricted(withRestriction(false, 'pending'))).toBe(false);
    expect(isTemporarilyRestricted(withRestriction(true, 'resolved'))).toBe(false);
    expect(isTemporarilyRestricted({ status: 'pending', severity: 'critical' })).toBe(false);
  });
});

describe('Vietnamese Sentinel texts', () => {
  it('shows a policy clause in Vietnamese, also for assessments stored in English', () => {
    expect(formatPolicyClause('Rule 6.1: Repeated confirmed playdate abandonment without notice')).toBe(
      'Điều 6.1: Nhiều lần vắng mặt tại buổi hẹn đã xác nhận mà không báo trước'
    );
    expect(formatPolicyClause('Điều 2.1: Quấy rối, bắt nạt và giao tiếp thù địch')).toBe(
      'Điều 2.1: Quấy rối, bắt nạt và giao tiếp thù địch'
    );
    expect(formatPolicyClause('')).toBe('');
  });

  it('shows the monitoring window in minutes in Vietnamese', () => {
    expect(formatTimeWindow('30 min')).toBe('30 phút');
    expect(formatTimeWindow('30 phút')).toBe('30 phút');
    expect(formatTimeWindow(null)).toBe('30 phút');
  });
});

describe('planSentinelCluster', () => {
  const report = (id, verdict, extra = {}) => ({
    id,
    category: 'no_show',
    severity: 'low',
    createdAt: '2026-11-01T00:00:00.000Z',
    sentinelAssessment: verdict ? { verdict, recommendedSanctions: [{ type: 'warn' }] } : null,
    ...extra,
  });

  it('sanctions the violations once, dismisses the false reports, keeps the others for the admin', () => {
    const plan = planSentinelCluster([
      report('a', 'violation'),
      report('b', 'violation', { severity: 'high' }),
      report('c', 'no_violation'),
      report('d', 'unclear'),
      report('e', null),
      report('f', 'violation', { category: 'child_safety' }),
    ]);

    expect(plan.violationIds).toEqual(['a', 'b']);
    expect(plan.dismissIds).toEqual(['c']);
    expect(plan.manualCount).toBe(3);
    expect(plan.sanctions).toEqual([{ type: 'warn' }]);
    expect(plan.isActionable).toBe(true);
  });

  it('leaves a ban or a long suspension to the admin', () => {
    const heavy = report('a', 'violation');
    heavy.sentinelAssessment.recommendedSanctions = [{ type: 'suspend', durationDays: 14 }];

    const plan = planSentinelCluster([heavy]);
    expect(plan.violationIds).toEqual([]);
    expect(plan.manualCount).toBe(1);
    expect(plan.isActionable).toBe(false);
  });
});
