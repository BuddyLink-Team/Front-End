import { describe, it, expect } from 'vitest';
import { hostChildrenOf, hostChildNames } from '../../modules/playdate/utils/hostChildren';
import { pollOptionFromSlot, toPollPayload } from '../../modules/chat/utils/chatMessageUtils';
import { NOTIFICATION_META, NOTIFICATION_TYPES } from '../../modules/notification/constants/notification.constants';
import { AI_PLAN_STEPS, AI_STEPS } from '../../modules/ai-assistant/constants/ai-assistant.constants';

describe('BUD-49 planning helpers', () => {
  it('asks for the playmates before the time', () => {
    expect(AI_PLAN_STEPS.indexOf(AI_STEPS.PLAYMATES)).toBeLessThan(AI_PLAN_STEPS.indexOf(AI_STEPS.TIME));
  });

  it('names every child of the host, main child first', () => {
    expect(hostChildNames({ hostChild: { displayName: 'Na' }, hostChildren: [{ displayName: 'Na' }, { displayName: 'Bin' }] })).toBe('Na, Bin');
    // Older playdates and drafts only have the main child
    expect(hostChildNames({ hostChild: { displayName: 'Na' } })).toBe('Na');
    expect(hostChildrenOf({})).toEqual([]);
  });
});

describe('BUD-49 time polls', () => {
  it('keeps the date and time of a suggested slot in its poll option', () => {
    expect(pollOptionFromSlot({ date: '2099-11-07', time: '09:00' }, 120)).toEqual({
      label: 'T7 07/11 · 09:00 - 11:00',
      date: '2099-11-07',
      time: '09:00',
    });
  });

  it('drops empty options and closes the poll after 48 hours', () => {
    const now = new Date('2099-11-01T00:00:00.000Z');
    const payload = toPollPayload(
      {
        question: '  Giờ nào tiện?  ',
        options: [{ label: 'T7 07/11 · 09:00 - 11:00', date: '2099-11-07', time: '09:00' }, { label: '  ' }, { label: 'Chủ nhật chiều' }],
      },
      now,
    );
    expect(payload).toEqual({
      question: 'Giờ nào tiện?',
      options: [
        { id: 'opt_1', label: 'T7 07/11 · 09:00 - 11:00', date: '2099-11-07', time: '09:00' },
        { id: 'opt_2', label: 'Chủ nhật chiều', date: null, time: null },
      ],
      deadline: '2099-11-03T00:00:00.000Z',
    });
  });
});

describe('BUD-49 rebooking notification', () => {
  it('opens the prepared AI conversation', () => {
    const meta = NOTIFICATION_META[NOTIFICATION_TYPES.AI_SUGGESTION];
    expect(meta.getActionPath({ sessionId: 's-1' })).toBe('/ai-assistant?session=s-1');
    expect(meta.getActionPath({})).toBe('/ai-assistant');
  });
});
