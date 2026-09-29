import { z } from 'zod';
import dayjs from 'dayjs';

export const onboardingSchema = z.object({
  // Child details
  displayName: z
    .string()
    .min(2, 'Tên của bé phải có ít nhất 2 ký tự')
    .max(50, 'Tên của bé không được quá 50 ký tự'),
  dateOfBirth: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh của bé')
    .refine((date) => {
      const birth = dayjs(date);
      const now = dayjs();
      return birth.isValid() && birth.isBefore(now);
    }, 'Ngày sinh phải hợp lệ và trước thời điểm hiện tại'),
  gender: z.enum(['boy', 'girl', 'other'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính của bé' }),
  }),
  interests: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 sở thích cho bé'),
  favoriteActivities: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 hoạt động bé thích'),
  personality: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 nét tính cách nổi bật'),

  // Parent Matching Preferences
  preferredPlaydateDays: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 khoảng thời gian trong tuần'),
  preferredTimeSlots: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 khung giờ rảnh'),
  preferredLocations: z
    .array(z.string())
    .min(1, 'Vui lòng chọn ít nhất 1 địa điểm yêu thích'),
  maxDistanceKm: z
    .number()
    .min(1, 'Bán kính tìm kiếm tối thiểu 1km')
    .max(50, 'Bán kính tối đa 50km'),
  ageMin: z.number().min(0, 'Tuổi tối thiểu không được âm'),
  ageMax: z.number().max(18, 'Tuổi tối đa là 18'),

  // Location
  city: z.string().min(1, 'Vui lòng chọn hoặc nhập Tỉnh / Thành phố'),
  area: z.string().min(1, 'Vui lòng chọn hoặc nhập Quận / Huyện'),
  address: z.string().optional(),
}).refine((data) => data.ageMin <= data.ageMax, {
  message: 'Độ tuổi tối thiểu phải nhỏ hơn hoặc bằng độ tuổi tối đa',
  path: ['ageMax'],
});
