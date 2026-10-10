import connectionMockService from './connectionMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { CONNECTION } = API_ENDPOINTS;

/**
 * Route handler definitions for the Connection module
 * These handlers are consumed by the centralized Mock Server Adapter (src/mock/index.js)
 */
export const connectionMockHandlers = [
  {
    method: 'GET',
    pattern: CONNECTION.BASE,
    handler: ({ query }) => connectionMockService.getConnections(query),
  },
  {
    method: 'PATCH',
    pattern: CONNECTION.ACCEPT(':id'),
    handler: ({ params }) => connectionMockService.accept(params.id),
  },
  {
    method: 'PATCH',
    pattern: CONNECTION.DECLINE(':id'),
    handler: ({ params }) => connectionMockService.decline(params.id),
  },
  {
    method: 'DELETE',
    pattern: CONNECTION.BY_ID(':id'),
    handler: ({ params }) => connectionMockService.remove(params.id),
  },
];

export default connectionMockHandlers;
