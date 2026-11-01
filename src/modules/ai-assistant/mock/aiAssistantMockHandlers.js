import aiAssistantMockService from './aiAssistantMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { AI_ASSISTANT } = API_ENDPOINTS;

export const aiAssistantMockHandlers = [
  {
    method: 'GET',
    pattern: AI_ASSISTANT.SESSIONS,
    handler: ({ query }) => aiAssistantMockService.listSessions(query),
  },
  {
    method: 'POST',
    pattern: AI_ASSISTANT.SESSIONS,
    handler: () => aiAssistantMockService.createSession(),
  },
  {
    method: 'GET',
    pattern: AI_ASSISTANT.SESSION(':id'),
    handler: ({ params }) => aiAssistantMockService.getSession(params.id),
  },
  {
    method: 'DELETE',
    pattern: AI_ASSISTANT.SESSION(':id'),
    handler: ({ params }) => aiAssistantMockService.deleteSession(params.id),
  },
  {
    method: 'POST',
    pattern: AI_ASSISTANT.MESSAGES(':id'),
    handler: ({ params, body }) => aiAssistantMockService.sendMessage(params.id, body),
  },
];

export default aiAssistantMockHandlers;
