import safetyMockService from './safetyMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { SAFETY } = API_ENDPOINTS;

export const safetyMockHandlers = [
  {
    method: 'GET',
    pattern: SAFETY.BLOCKED_USERS,
    handler: ({ query }) => safetyMockService.getBlockedUsers(query),
  },
  {
    method: 'POST',
    pattern: SAFETY.BLOCK,
    handler: ({ body }) => safetyMockService.blockUser(body),
  },
  {
    method: 'DELETE',
    pattern: SAFETY.UNBLOCK(':id'),
    handler: ({ params }) => safetyMockService.unblockUser(params.id),
  },
  {
    method: 'POST',
    pattern: SAFETY.REPORT_EVIDENCE,
    handler: () => safetyMockService.uploadEvidence(),
  },
  {
    method: 'POST',
    pattern: SAFETY.REPORTS,
    handler: ({ body }) => safetyMockService.createReport(body),
  },
];

export default safetyMockHandlers;
