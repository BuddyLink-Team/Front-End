import { describe, it, expect } from 'vitest';
import { findScheduleConflicts, findNextFreeTime } from '../../modules/playdate/utils/scheduleConflicts';
import { getPlaydateStart } from '../../modules/playdate/utils/playdateTime';

const DATE = '2030-11-02';
// A few days before DATE: every time of that day can be booked
const BEFORE = new Date('2030-10-30T08:00:00');
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
  it('finds playdates overlapping or less than 30 minutes before / after', () => {
    const list = [busy('09:00', '11:00'), busy('15:00', '17:00')];
    expect(findScheduleConflicts(list, DATE, '10:00', 120)).toEqual([list[0]]);
    // Starts when / 15 minutes after the first one ends: too close
    expect(findScheduleConflicts(list, DATE, '11:00', 120)).toEqual([list[0]]);
    expect(findScheduleConflicts(list, DATE, '11:15', 60)).toEqual([list[0]]);
    // 11:30-12:30: 30 minutes after the first one
    expect(findScheduleConflicts(list, DATE, '11:30', 60)).toEqual([]);
    // 12:30-14:30 ends 30 minutes before the second one; 13:00-15:00 ends when it starts
    expect(findScheduleConflicts(list, DATE, '12:30', 120)).toEqual([]);
    expect(findScheduleConflicts(list, DATE, '13:00', 120)).toEqual([list[1]]);
  });

  it('checks nothing until the time is a valid HH:mm', () => {
    expect(findScheduleConflicts([busy('09:00', '11:00')], DATE, '', 120)).toEqual([]);
    expect(findScheduleConflicts([busy('09:00', '11:00')], '', '09:00', 120)).toEqual([]);
  });
});

describe('findNextFreeTime', () => {
  it('moves the start 30 minutes after the busy playdates until the whole duration is free', () => {
    const list = [busy('09:00', '11:00'), busy('14:00', '15:00')];
    // 10:00 -> 11:30, 11:30-13:30 ends 30 minutes before 14:00
    expect(findNextFreeTime(list, DATE, '10:00', 120, BEFORE)).toBe('11:30');
    // 11:30-14:00 is too close to 14:00 -> 15:30
    expect(findNextFreeTime(list, DATE, '10:00', 150, BEFORE)).toBe('15:30');
  });

  it('never offers a time less than 2 hours from now', () => {
    const list = [busy('09:00', '11:00')];
    // It is 11:07: 11:30 is free but too soon -> 13:10 (now + 2h, rounded up to 5 minutes)
    const now = getPlaydateStart(DATE, '11:07');
    expect(findNextFreeTime(list, DATE, '10:00', 60, now)).toBe('13:10');
    // Now + 2h falls inside a busy playdate: moved after it, with the gap
    const later = [busy('09:00', '11:00'), busy('13:00', '15:00')];
    expect(findNextFreeTime(later, DATE, '10:00', 60, now)).toBe('15:30');
    // Too late in the day once the 2 hours are added
    expect(findNextFreeTime(list, DATE, '10:00', 60, getPlaydateStart(DATE, '19:30'))).toBeNull();
  });

  it('offers nothing when the rest of the day is taken', () => {
    expect(findNextFreeTime([busy('18:00', '21:30')], DATE, '19:00', 120, BEFORE)).toBeNull();
  });
});
