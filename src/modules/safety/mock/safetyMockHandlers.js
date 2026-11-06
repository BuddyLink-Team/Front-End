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
  // POST /chat/upload (Mock upload handler for chat & evidence attachments)
  {
    method: 'POST',
    pattern: '/chat/upload',
    handler: async () => {
      return {
        success: true,
        message: 'Attachment uploaded successfully',
        data: {
          mediaUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400',
          publicId: `mock-evidence-${Date.now()}`,
        },
      };
    },
  },
];

export default safetyMockHandlers;
