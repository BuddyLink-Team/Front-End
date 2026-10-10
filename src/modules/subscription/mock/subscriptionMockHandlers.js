import subscriptionMockService from './subscriptionMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

const { SUBSCRIPTION } = API_ENDPOINTS;

/**
 * Route handler definitions for the Subscription module
 * These handlers are consumed by the centralized Mock Server Adapter (src/mock/index.js)
 */
export const subscriptionMockHandlers = [
  {
    method: 'GET',
    pattern: SUBSCRIPTION.PLANS,
    handler: () => subscriptionMockService.getPlans(),
  },
  {
    method: 'GET',
    pattern: SUBSCRIPTION.MY_QUOTA,
    handler: () => subscriptionMockService.getMySubscription(),
  },
  {
    method: 'POST',
    pattern: SUBSCRIPTION.CHECKOUT,
    handler: ({ body, config }) =>
      subscriptionMockService.createCheckout(body, config?.headers?.['Idempotency-Key']),
  },
  {
    method: 'GET',
    pattern: SUBSCRIPTION.VERIFY_PAYMENT(':orderCode'),
    handler: ({ params }) => subscriptionMockService.verifyPayment(params.orderCode),
  },
  {
    method: 'GET',
    pattern: SUBSCRIPTION.HISTORY,
    handler: ({ query }) => subscriptionMockService.getPaymentHistory(query),
  },
];

export default subscriptionMockHandlers;
