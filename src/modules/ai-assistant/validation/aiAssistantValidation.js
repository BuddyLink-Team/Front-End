import { z } from 'zod';
import { AI_STEPS } from '../constants/ai-assistant.constants';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MATCH_CRITERIA_LIMITS = Object.freeze({ AGE_MIN: 0, AGE_MAX: 18, DISTANCE_MIN_KM: 1, DISTANCE_MAX_KM: 50 });

// Number inputs give strings; an empty one is missing, not 0
const integerBetween = (min, max, message) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number({ required_error: message, invalid_type_error: message }).int(message).min(min, message).max(max, message),
  );

const requiredText = (min, message) => z.string({ required_error: message }).trim().min(min, message);

const timeSchema = z
  .object({
    date: z.string().regex(DATE_REGEX, 'Vui lòng chọn ngày.'),
    time: z.string().regex(TIME_REGEX, 'Vui lòng chọn giờ.'),
  })
  .superRefine((data, ctx) => {
    if (new Date(`${data.date}T${data.time}`) <= new Date()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['time'], message: 'Giờ hẹn phải ở tương lai.' });
    }
  });

// Friends' children picked in the search of the card
const playmateSearchSchema = z.object({
  playmates: z
    .array(z.object({ childId: z.string(), name: z.string() }))
    .min(1, 'Vui lòng chọn ít nhất một bạn.'),
});

// Open cards of older sessions have no search: names are typed
const playmateNamesSchema = z.object({ text: requiredText(1, 'Vui lòng nhập tên các bạn muốn mời.') });

const placeSchema = z.object({
  name: requiredText(1, 'Vui lòng chọn địa điểm.'),
  address: z.string().optional(),
  placeId: z.string().optional(),
  coordinates: z.any().optional(),
});

const MATCH_AGE_MESSAGE = `Độ tuổi từ ${MATCH_CRITERIA_LIMITS.AGE_MIN} đến ${MATCH_CRITERIA_LIMITS.AGE_MAX}.`;
const matchCriteriaSchema = z
  .object({
    childId: z.string().optional(),
    ageMin: integerBetween(MATCH_CRITERIA_LIMITS.AGE_MIN, MATCH_CRITERIA_LIMITS.AGE_MAX, MATCH_AGE_MESSAGE),
    ageMax: integerBetween(MATCH_CRITERIA_LIMITS.AGE_MIN, MATCH_CRITERIA_LIMITS.AGE_MAX, MATCH_AGE_MESSAGE),
    maxDistanceKm: integerBetween(
      MATCH_CRITERIA_LIMITS.DISTANCE_MIN_KM,
      MATCH_CRITERIA_LIMITS.DISTANCE_MAX_KM,
      `Khoảng cách từ ${MATCH_CRITERIA_LIMITS.DISTANCE_MIN_KM} đến ${MATCH_CRITERIA_LIMITS.DISTANCE_MAX_KM} km.`,
    ),
    interests: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.ageMin > data.ageMax) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ageMax'], message: 'Tuổi lớn nhất không nhỏ hơn tuổi nhỏ nhất.' });
    }
  });

const STEP_SCHEMAS = Object.freeze({
  [AI_STEPS.TIME]: timeSchema,
  [AI_STEPS.CHILD]: z.object({ text: requiredText(1, 'Vui lòng nhập tên bé.') }),
  [AI_STEPS.ACTIVITY]: z.object({ title: requiredText(2, 'Vui lòng nhập hoạt động.') }),
  [AI_STEPS.EXTRA]: z.object({ request: requiredText(2, 'Vui lòng nhập yêu cầu của bạn.') }),
  [AI_STEPS.PLACE]: placeSchema,
  [AI_STEPS.MATCH_CRITERIA]: matchCriteriaSchema,
});

// A step without an "other answer" (never shown with a form, kept as a guard)
const unsupportedSchema = z
  .any()
  .refine(() => false, { message: 'Bước này không nhận câu trả lời khác.', path: ['form'] });

/**
 * Schema of the "other answer" form of a choice card
 * @param {{ stepId: string, hostChildId?: string }} card
 * @returns {import('zod').ZodTypeAny}
 */
export const getCustomAnswerSchema = (card) => {
  if (card.stepId === AI_STEPS.PLAYMATES) return card.hostChildId ? playmateSearchSchema : playmateNamesSchema;
  return STEP_SCHEMAS[card.stepId] || unsupportedSchema;
};
