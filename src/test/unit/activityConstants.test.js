import { describe, it, expect } from 'vitest';
import {
  ACTIVITIES,
  ACTIVITY_CATEGORIES,
  ACTIVITY_GROUPS,
  getActivityCategory,
} from '../../constants/activity.constants';

describe('activity constants (single source of kids activities)', () => {
  it('has unique values and playdate titles, each in a known category', () => {
    expect(new Set(ACTIVITIES.map((a) => a.value)).size).toBe(ACTIVITIES.length);
    expect(new Set(ACTIVITIES.map((a) => a.playdateTitle)).size).toBe(ACTIVITIES.length);
    ACTIVITIES.forEach((a) => expect(Object.values(ACTIVITY_CATEGORIES)).toContain(a.category));
    expect(ACTIVITY_GROUPS.flatMap((g) => g.activities)).toHaveLength(ACTIVITIES.length);
  });

  it('finds the category of a catalog entry, then by keywords', () => {
    expect(getActivityCategory('Bơi lội & chơi nước cho các bé')).toBe(ACTIVITY_CATEGORIES.SPORTS);
    expect(getActivityCategory('Xếp hình Lego')).toBe(ACTIVITY_CATEGORIES.CREATIVE);
    expect(getActivityCategory('Đi dạo công viên cuối tuần')).toBe(ACTIVITY_CATEGORIES.OUTDOOR);
    expect(getActivityCategory('Gặp nhau uống trà sữa')).toBe(ACTIVITY_CATEGORIES.FUN);
  });
});
