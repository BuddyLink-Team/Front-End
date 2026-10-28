import adminMockService from './adminMockService';

/**
 * Route handler definitions for Admin Playdates & Connections oversight.
 * Consumed by Central Mock Server Engine (src/mock/index.js).
 */
export const adminMockHandlers = [
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
];

export default adminMockHandlers;
