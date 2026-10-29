export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    SEND_PHONE_OTP: '/auth/phone/send-otp',
    VERIFY_PHONE_OTP: '/auth/phone/verify-otp',
    VERIFY_FIREBASE_PHONE: '/auth/phone/verify-firebase',
    SEND_EMAIL_OTP: '/auth/email/send-otp',
    VERIFY_EMAIL_OTP: '/auth/email/verify-otp',
  },
  USER: {
    ME: '/user/me',
    UPDATE_ME: '/user/me',
    AVATAR: '/user/me/avatar',
    PASSWORD: '/user/me/password',
  },
  PARENT: {
    ME: '/parent/me',
    ONBOARDING_PREFERENCES: '/parent/preferences/onboarding',
  },
  CHILD: {
    BASE: '/children',
  },
  DISCOVERY: {
    BASE: '/discovery',
    SWIPE: '/discovery/swipe',
  },
  PLAYDATE: {
    BASE: '/playdates',
    PENDING_RATINGS: '/playdates/ratings/pending',
    RATINGS: (id) => `/playdates/${id}/ratings`,
  },
  PLACES: {
    BASE: '/places',
    NEARBY: '/places/nearby',
  },
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    PLAYDATE: '/chat/playdate',
    MESSAGES: '/chat/conversations',
    UPLOAD: '/chat/upload',
  },
  AI_ASSISTANT: {
    SESSIONS: '/ai-assistant/sessions',
    SESSION: (id) => `/ai-assistant/sessions/${id}`,
    MESSAGES: (id) => `/ai-assistant/sessions/${id}/messages`,
  },
  NOTIFICATION: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },
  CONNECTION: {
    // GET (?status=&direction=incoming|outgoing) / POST { recipientId }
    BASE: '/connections',
    BY_ID: (id) => `/connections/${id}`,
    ACCEPT: (id) => `/connections/${id}/accept`,
    DECLINE: (id) => `/connections/${id}/decline`,
  },
  SAFETY: {
    REPORTS: '/safety/reports',
    REPORT_EVIDENCE: '/safety/reports/evidence',
    BLOCK: '/safety/block',
    UNBLOCK: (id) => `/safety/unblock/${id}`,
    BLOCKED_USERS: '/safety/blocked-users',
  },
  GAMIFICATION: {
    // Streak + badges of the current parent
    ACHIEVEMENTS: '/gamification',
  },
  SUBSCRIPTION: {
    PLANS: '/subscriptions/plans',
    CHECKOUT: '/subscriptions/checkout',
    MY_QUOTA: '/subscriptions/my',
    VERIFY_PAYMENT: (orderCode) => `/subscriptions/payments/verify/${orderCode}`,
    HISTORY: '/subscriptions/payments/history',
  },
  RATING_FEEDBACK: {
    BASE: '/ratings',
  },
  // Admin portal build: VITE_API_URL already ends with /api/v1/admin, and AUTH/USER paths above
  // (login, refresh-token, logout, me, user/me) are served there too
  ADMIN: {
    DASHBOARD_STATS: '/stats',
    USERS: '/users',
    CHILDREN: '/children',
    PAYMENTS: '/payments',
    PLAYDATES: '/playdates',
    PLAYDATE_BY_ID: (id) => `/playdates/${id}`,
    CANCEL_PLAYDATE: (id) => `/playdates/${id}/cancel`,
    CONNECTIONS: '/connections',
    CONNECTION_BY_ID: (id) => `/connections/${id}`,
    PLANS: '/plans',
    PLAN_BY_ID: (id) => `/plans/${id}`,
    SUBSCRIPTIONS: '/subscriptions',
    SUBSCRIPTION_BY_ID: (id) => `/subscriptions/${id}`,
    TRANSACTIONS: '/transactions',
    TRANSACTION_BY_ID: (id) => `/transactions/${id}`,
    REVENUE_SUMMARY: '/revenue/summary',
    ANALYTICS: '/analytics',
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
    NOTIFICATIONS_READ: (id) => `/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: '/notifications/read-all',
  },
};
