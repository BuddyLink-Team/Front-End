import chatMockService from './chatMockService.js';
import { API_ENDPOINTS } from '../../../constants/api.constants.js';

export const chatMockHandlers = [
  // POST /chat/conversations/:conversationId/poll
  {
    method: 'POST',
    pattern: API_ENDPOINTS.CHAT.POLL(':conversationId'),
    handler: ({ params, body }) => chatMockService.createPoll(params.conversationId, body),
  },
  // POST /chat/messages/:messageId/poll/vote
  {
    method: 'POST',
    pattern: API_ENDPOINTS.CHAT.VOTE_POLL(':messageId'),
    handler: ({ params, body }) => chatMockService.votePoll(params.messageId, body?.optionId),
  },
];

export default chatMockHandlers;
