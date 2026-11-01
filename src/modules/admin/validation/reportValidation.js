import { z } from 'zod';
import { REPORT_NOTES_MIN_LENGTH } from '../constants/admin.constants';

const longEnough = (message) => z.string().trim().min(REPORT_NOTES_MIN_LENGTH, message);

// Mirrors PATCH /admin/reports/:id/resolve: closing a report always needs notes
export const reportNotesSchema = z.object({
  adminNotes: longEnough(`Ghi chú xử lý phải có tối thiểu ${REPORT_NOTES_MIN_LENGTH} ký tự.`),
});

// Mirrors PATCH /admin/reports/:id/reopen
export const reportReopenSchema = z.object({
  note: longEnough(`Lý do mở lại phải có tối thiểu ${REPORT_NOTES_MIN_LENGTH} ký tự.`),
});
