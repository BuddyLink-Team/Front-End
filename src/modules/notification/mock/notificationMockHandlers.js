import notificationMockService from './notificationMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { NOTIFICATION } = API_ENDPOINTS;

export const notificationMockHandlers = [
  {
    method: 'GET',
    pattern: NOTIFICATION.BASE,
    handler: ({ query }) => notificationMockService.getNotifications(query),
  },
  {
    method: 'GET',
    pattern: NOTIFICATION.UNREAD_COUNT,
    handler: () => notificationMockService.getUnreadCount(),
  },
  {
    method: 'PATCH',
    pattern: NOTIFICATION.READ_ALL,
    handler: () => notificationMockService.markAllAsRead(),
  },
  {
    method: 'PATCH',
    pattern: NOTIFICATION.READ(':id'),
    handler: ({ params }) => notificationMockService.markAsRead(params.id),
  },
];

export default notificationMockHandlers;
