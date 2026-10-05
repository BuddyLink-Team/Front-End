import { z } from 'zod';
import dayjs from 'dayjs';

export const childSchema = z.object({
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
});

// Step 1 of onboarding: parent matching criteria & location
const criteriaBaseSchema = z.object({
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
  city: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Tỉnh / Thành phố'),
  area: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Quận / Huyện'),
  address: z.string().optional(),
});

const ageRangeRule = [
  (data) => data.ageMin <= data.ageMax,
  {
    message: 'Độ tuổi tối thiểu phải nhỏ hơn hoặc bằng độ tuổi tối đa',
    path: ['ageMax'],
  },
];

export const criteriaSchema = criteriaBaseSchema.refine(...ageRangeRule);

// Full onboarding payload (criteria + first child profile)
export const onboardingSchema = childSchema.merge(criteriaBaseSchema).refine(...ageRangeRule);

/**
 * Run a Zod schema and return the first error message per field ({} when valid)
 * @param {import('zod').ZodTypeAny} schema
 * @param {Object} data
 * @returns {Record<string, string>}
 */
export const getFieldErrors = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) return {};

  return result.error.errors.reduce((errors, issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
    return errors;
  }, {});
};
