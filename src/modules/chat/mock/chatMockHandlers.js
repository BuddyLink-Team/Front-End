import chatMockService from './chatMockService.js';
import { API_ENDPOINTS } from '../../../constants/api.constants.js';

export const chatMockHandlers = [
  {
    method: 'POST',
    pattern: `${API_ENDPOINTS.CHAT.CONVERSATIONS}/:conversationId/poll`,
    handler: ({ params, body }) => chatMockService.createPoll(params.conversationId, body),
  },
  {
    method: 'POST',
    pattern: '/chat/messages/:messageId/poll/vote',
    handler: ({ params, body }) => chatMockService.votePoll(params.messageId, body?.optionId),
  },
];

export default chatMockHandlers;

