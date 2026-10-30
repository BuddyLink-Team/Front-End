import adminMockService from './adminMockService';
import adminSubscriptionMockService from './adminSubscriptionMockService';
import adminAnalyticsMockService from './adminAnalyticsMockService';

/**
 * Route handler definitions for Admin Playdates & Connections oversight, Subscription plans & revenue,
 * and Dashboard Analytics & Realtime Notifications.
 * Consumed by Central Mock Server Engine (src/mock/index.js).
 */
export const adminMockHandlers = [
  // Analytics
  {
    method: 'GET',
    pattern: '/admin/analytics',
    handler: ({ query }) => adminAnalyticsMockService.getAnalytics(query),
  },

  // Notifications (placed before /admin/notifications/:id)
  {
    method: 'GET',
    pattern: '/admin/notifications/unread-count',
    handler: () => adminAnalyticsMockService.getUnreadCount(),
  },
  {
    method: 'PATCH',
    pattern: '/admin/notifications/read-all',
    handler: ({ query }) => adminAnalyticsMockService.markAllAsRead(query?.category),
  },
  {
    method: 'PATCH',
    pattern: '/admin/notifications/:id/read',
    handler: ({ params }) => adminAnalyticsMockService.markAsRead(params.id),
  },
  {
    method: 'GET',
    pattern: '/admin/notifications',
    handler: ({ query }) => adminAnalyticsMockService.getNotifications(query),
  },

  // 1. Force-cancel playdate by admin (Must be placed before :id)
  {
    method: 'PATCH',
    pattern: '/admin/playdates/:id/cancel',
    handler: ({ params, body }) => adminMockService.cancelPlaydate(params.id, body),
  },
  // Platform-wide counts (before :id, which would take 'stats' as an ID)
  {
    method: 'GET',
    pattern: '/admin/playdates/stats',
    handler: () => adminMockService.getPlaydateStats(),
  },
  // 2. Playdate detail by ID
  {
    method: 'GET',
    pattern: '/admin/playdates/:id',
    handler: ({ params }) => adminMockService.getPlaydateDetail(params.id),
  },
  // 3. Paginated playdates list with filters & search
  {
    method: 'GET',
    pattern: '/admin/playdates',
    handler: ({ query }) => adminMockService.getPlaydates(query),
  },

  {
    method: 'GET',
    pattern: '/admin/connections/stats',
    handler: () => adminMockService.getConnectionStats(),
  },
  // 4. Single connection detail by ID
  {
    method: 'GET',
    pattern: '/admin/connections/:id',
    handler: ({ params }) => adminMockService.getConnectionDetail(params.id),
  },
  // 5. Soft-remove connection by admin
  {
    method: 'DELETE',
    pattern: '/admin/connections/:id',
    handler: ({ params, body }) => adminMockService.removeConnection(params.id, body),
  },
  // 6. Paginated connections list with filters & search
  {
    method: 'GET',
    pattern: '/admin/connections',
    handler: ({ query }) => adminMockService.getConnections(query),
  },

  // Subscription plans & revenue
  {
    method: 'GET',
    pattern: '/admin/plans',
    handler: () => adminSubscriptionMockService.getPlans(),
  },
  {
    method: 'GET',
    pattern: '/admin/plans/:id',
    handler: ({ params }) => adminSubscriptionMockService.getPlanDetail(params.id),
  },
  {
    method: 'PATCH',
    pattern: '/admin/plans/:id',
    handler: ({ params, body }) => adminSubscriptionMockService.updatePlan(params.id, body),
  },
  {
    method: 'GET',
    pattern: '/admin/subscriptions/:id',
    handler: ({ params }) => adminSubscriptionMockService.getSubscriptionDetail(params.id),
  },
  {
    method: 'GET',
    pattern: '/admin/subscriptions',
    handler: ({ query }) => adminSubscriptionMockService.getSubscriptions(query),
  },
  {
    method: 'GET',
    pattern: '/admin/transactions/:id',
    handler: ({ params }) => adminSubscriptionMockService.getTransactionDetail(params.id),
  },
  {
    method: 'GET',
    pattern: '/admin/transactions',
    handler: ({ query }) => adminSubscriptionMockService.getTransactions(query),
  },
  {
    method: 'GET',
    pattern: '/admin/revenue/summary',
    handler: ({ query }) => adminSubscriptionMockService.getRevenueSummary(query),
  },
];

export default adminMockHandlers;

