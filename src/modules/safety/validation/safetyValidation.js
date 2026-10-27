import { z } from 'zod';
import { REPORT_FORM_MESSAGES, REPORT_LIMITS, SAFETY_ERROR_MESSAGES } from '../constants/safetyConstants';

/**
 * Report form (ReportModal). Same limits as the backend createReportValidation.
 */
export const reportSchema = z.object({
  category: z.string().min(1, SAFETY_ERROR_MESSAGES.CATEGORY_REQUIRED),
  description: z
    .string()
    .trim()
    .max(REPORT_LIMITS.MAX_DESCRIPTION_LENGTH, REPORT_FORM_MESSAGES.DESCRIPTION_TOO_LONG),
  evidenceUrls: z.array(z.string()).max(REPORT_LIMITS.MAX_EVIDENCE_URLS, REPORT_FORM_MESSAGES.EVIDENCE_LIMIT),
});

export default reportSchema;
