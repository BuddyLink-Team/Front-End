export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  PARENT: {
    VERIFICATION: '/parents/verify',
  },
  CHILD: {
    BASE: '/children',
  },
  DISCOVERY: {
    MATCH: '/discovery/match',
    NEARBY: '/discovery/nearby',
  },
  PLAYDATE: {
    BASE: '/playdates',
  },
  CHAT: {
    CONVERSATIONS: '/chats/conversations',
    MESSAGES: '/chats/messages',
  },
  AI_ASSISTANT: {
    RECOMMEND: '/ai/recommendations',
    CHAT: '/ai/chat',
  },
  NOTIFICATION: {
    BASE: '/notifications',
  },
  SAFETY: {
    REPORT: '/safety/report',
    BLOCK: '/safety/block',
  },
  GAMIFICATION: {
    POINTS: '/gamification/points',
    BADGES: '/gamification/badges',
  },
  SUBSCRIPTION: {
    PLANS: '/subscriptions/plans',
    CHECKOUT: '/subscriptions/checkout',
  },
  RATING_FEEDBACK: {
    BASE: '/ratings',
  },
  ADMIN: {
    DASHBOARD_STATS: '/admin/stats',
    USERS: '/admin/users',
  },
};
