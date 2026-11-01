import { z } from 'zod';
import { PLAN_FEATURE_FIELDS, PLAN_NAME_MAX_LENGTH, UNLIMITED_LIMIT } from '../constants/admin.constants';

// Number inputs give strings; an empty one is missing, not 0
const integerAtLeast = (min, message) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number({ required_error: message, invalid_type_error: message }).int(message).min(min, message)
  );

/**
 * Edit form of a plan, mirroring the PATCH /admin/plans/:id rules: name, limits (-1 = unlimited) and,
 * for a Premium plan, a price above 0 and the on-sale state. The Free plan keeps price 0 and stays on sale,
 * so those two fields are not sent for it.
 * @param {boolean} isFree
 */
export const getPlanFormSchema = (isFree) => {
  const base = {
    name: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên gói.')
      .max(PLAN_NAME_MAX_LENGTH, `Tên gói tối đa ${PLAN_NAME_MAX_LENGTH} ký tự.`),
    features: z.object(
      Object.fromEntries(
        PLAN_FEATURE_FIELDS.map(({ key }) => [key, integerAtLeast(UNLIMITED_LIMIT, 'Hạn mức phải là số nguyên ≥ 0.')])
      )
    ),
  };
  if (isFree) return z.object(base);
  return z.object({
    ...base,
    price: integerAtLeast(1, 'Giá gói Premium phải lớn hơn 0.'),
    isActive: z.boolean(),
  });
};
