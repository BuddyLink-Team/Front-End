import { z } from 'zod';
import { getLocalDateString } from '../../../utils/formatters';

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
    time: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập khung giờ'),
    locationName: z.string().optional().default(''),
    locationAddress: z.string().optional().default(''),
    note: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
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
  newStartTime: z.string().trim().min(1, 'Vui lòng nhập hoặc chọn khung giờ mới'),
  locationName: z.string().optional().default(''),
  locationAddress: z.string().optional().default(''),
  reason: z.string().optional().default(''),
});
