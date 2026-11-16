import { z } from 'zod';
import { getLocalDateString } from '../../../utils/formatters';
import { PLAYDATE_TIME_REGEX, getPlaydateStartIssue, START_ISSUE_MESSAGES } from '../utils/playdateTime';

export const createPlaydateSchema = z
  .object({
    // Every own child who comes (at least one; the first one is the main child the playmates are ranked for)
    hostChildIds: z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 bé tham gia của bạn'),
    activity: z.string().trim().min(2, 'Vui lòng nhập tên hoạt động hoặc chọn từ gợi ý'),
    scheduledDate: z
      .string()
      .min(1, 'Vui lòng chọn ngày diễn ra')
      .refine((val) => {
        if (!val) return false;
        const today = getLocalDateString();
        return val >= today;
      }, 'Ngày hẹn không thể ở trong quá khứ'),
    time: z
      .string()
      .trim()
      .min(1, 'Vui lòng chọn giờ hẹn')
      .regex(PLAYDATE_TIME_REGEX, 'Giờ hẹn có dạng HH:mm, ví dụ 09:00'),
    durationMinutes: z.coerce.number().int().min(30).max(480),
    locationName: z.string().optional().default(''),
    locationAddress: z.string().optional().default(''),
    note: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Starts at least 2 hours from now and at most 30 days ahead (the API checks the same)
    const issue = data.scheduledDate && PLAYDATE_TIME_REGEX.test(data.time) ? getPlaydateStartIssue(data.scheduledDate, data.time) : null;
    if (issue) {
      const { field, message } = START_ISSUE_MESSAGES[issue];
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field === 'date' ? 'scheduledDate' : 'time'], message });
    }
    if (!data.locationName?.trim() || !data.locationAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location'],
        message: 'Vui lòng nhập đầy đủ tên địa điểm và địa chỉ',
      });
    }
  });

export const rescheduleSchema = z
  .object({
  newDate: z
    .string()
    .min(1, 'Vui lòng chọn ngày mới')
    .refine((val) => {
      if (!val) return false;
      const today = getLocalDateString();
      return val >= today;
    }, 'Ngày dời lịch phải ở thời điểm tương lai'),
  newStartTime: z
    .string()
    .trim()
    .min(1, 'Vui lòng chọn giờ hẹn mới')
    .regex(PLAYDATE_TIME_REGEX, 'Giờ hẹn có dạng HH:mm, ví dụ 09:00'),
  locationName: z.string().optional().default(''),
  locationAddress: z.string().optional().default(''),
  reason: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const issue = data.newDate && PLAYDATE_TIME_REGEX.test(data.newStartTime) ? getPlaydateStartIssue(data.newDate, data.newStartTime) : null;
    if (issue) {
      const { field, message } = START_ISSUE_MESSAGES[issue];
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field === 'date' ? 'newDate' : 'newStartTime'], message });
    }
  });
