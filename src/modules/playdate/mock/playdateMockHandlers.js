import playdateMockService from './playdateMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

/**
 * Route handler definitions for Playdate module
 * These handlers are consumed by the centralized Mock Server Adapter (src/mock/index.js)
 */
export const playdateMockHandlers = [
  // 1. Invitable friends list (Must be placed before :id parameter to prevent route collision)
  {
    method: 'GET',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/friends`,
    handler: () => playdateMockService.getFriends(),
  },

  // 2. Playdates list with tab filter and search
  {
    method: 'GET',
    pattern: API_ENDPOINTS.PLAYDATE.BASE,
    handler: ({ query }) => playdateMockService.getPlaydates(query),
  },

  // 3. Propose reschedule for playdate
  {
    method: 'POST',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/reschedule`,
    handler: ({ params, body }) => playdateMockService.createReschedule(params.id, body),
  },

  // 4. Vote on reschedule proposal
  {
    method: 'PUT',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/reschedule/vote`,
    handler: ({ params, body }) => playdateMockService.voteReschedule(params.id, body),
  },

  // 5. Get active reschedule request
  {
    method: 'GET',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/reschedule`,
    handler: ({ params }) => playdateMockService.getReschedule(params.id),
  },

  // 6. Host completes playdate
  {
    method: 'PATCH',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/complete`,
    handler: ({ params }) => playdateMockService.completePlaydate(params.id),
  },

  // 7. Host cancels playdate
  {
    method: 'PATCH',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/cancel`,
    handler: ({ params, body }) => playdateMockService.cancelPlaydate(params.id, body),
  },

  // 8. Participant responds to playdate (RSVP)
  {
    method: 'PUT',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id/respond`,
    handler: ({ params, body }) => playdateMockService.respondToPlaydate(params.id, body?.status),
  },

  // 9. Single playdate detail by ID
  {
    method: 'GET',
    pattern: `${API_ENDPOINTS.PLAYDATE.BASE}/:id`,
    handler: ({ params }) => playdateMockService.getPlaydateById(params.id),
  },

  // 10. Create new playdate
  {
    method: 'POST',
    pattern: API_ENDPOINTS.PLAYDATE.BASE,
    handler: ({ body }) => playdateMockService.createPlaydate(body),
  },

  // 11. Nearby child-friendly venues adapter (before :id)
  {
    method: 'GET',
    pattern: API_ENDPOINTS.PLACES.NEARBY,
    handler: ({ query }) => playdateMockService.getNearbyPlaces(query),
  },

  // 11b. Place details
  {
    method: 'GET',
    pattern: `${API_ENDPOINTS.PLACES.BASE}/:id`,
    handler: ({ params }) => playdateMockService.getPlaceById(params.id),
  },

  // 12. Host children list (for Create Playdate page child selection)
  {
    method: 'GET',
    pattern: API_ENDPOINTS.CHILD.BASE,
    handler: () => playdateMockService.getMyChildren(),
  },
];

export default playdateMockHandlers;
