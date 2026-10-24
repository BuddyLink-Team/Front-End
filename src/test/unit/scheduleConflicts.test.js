import { describe, it, expect } from 'vitest';
import { findScheduleConflicts, findNextFreeTime } from '../../modules/playdate/utils/scheduleConflicts';
import { getPlaydateStart } from '../../modules/playdate/utils/playdateTime';

const DATE = '2030-11-02';
// A busy interval the way GET /playdates/busy-times returns it
const busy = (start, end, extra = {}) => ({
  childName: 'Bé Bin',
  start,
  end,
  startsAt: getPlaydateStart(DATE, start).toISOString(),
  endsAt: getPlaydateStart(DATE, end).toISOString(),
  isOwnChild: true,
  ...extra,
});

describe('findScheduleConflicts', () => {
  it('finds overlapping playdates but not touching ones', () => {
    const list = [busy('09:00', '11:00'), busy('15:00', '17:00')];
    expect(findScheduleConflicts(list, DATE, '10:00', 120)).toEqual([list[0]]);
    // 11:00-13:00 starts when the first one ends
    expect(findScheduleConflicts(list, DATE, '11:00', 120)).toEqual([]);
    // 13:00-15:00 ends when the second one starts
    expect(findScheduleConflicts(list, DATE, '13:00', 120)).toEqual([]);
    expect(findScheduleConflicts(list, DATE, '14:00', 120)).toEqual([list[1]]);
  });

  it('checks nothing until the time is a valid HH:mm', () => {
    expect(findScheduleConflicts([busy('09:00', '11:00')], DATE, '', 120)).toEqual([]);
    expect(findScheduleConflicts([busy('09:00', '11:00')], '', '09:00', 120)).toEqual([]);
  });
});

describe('findNextFreeTime', () => {
  it('moves the start after the busy playdates until the whole duration is free', () => {
    const list = [busy('09:00', '11:00'), busy('12:00', '13:00')];
    // 10:00 -> 11:00 still clashes with 12:00 for 2 hours -> 13:00
    expect(findNextFreeTime(list, DATE, '10:00', 120)).toBe('13:00');
    expect(findNextFreeTime(list, DATE, '10:00', 60)).toBe('11:00');
  });

  it('offers nothing when the rest of the day is taken', () => {
    expect(findNextFreeTime([busy('18:00', '21:30')], DATE, '19:00', 120)).toBeNull();
  });
});
