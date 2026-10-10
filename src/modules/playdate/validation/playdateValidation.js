import { z } from 'zod';
import { getLocalDateString } from '../../../utils/formatters';
import { PLAYDATE_TIME_REGEX, hasPlaydateStarted } from '../utils/playdateTime';

export const createPlaydateSchema = z
  .object({
    hostChildId: z.string().min(1, 'Vui lòng chọn bé tham gia của bạn'),
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
    locationName: z.string().optional().default(''),
    locationAddress: z.string().optional().default(''),
    note: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Today is allowed only for a time that has not passed yet
    if (data.scheduledDate && PLAYDATE_TIME_REGEX.test(data.time) && hasPlaydateStarted(data.scheduledDate, data.time)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['time'],
        message: 'Giờ hẹn phải ở tương lai',
      });
    }
    if (!data.locationName?.trim() || !data.locationAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location'],
        message: 'Vui lòng nhập đầy đủ tên địa điểm và địa chỉ',
      });
    }
  });

export const rescheduleSchema = z.object({
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
});
