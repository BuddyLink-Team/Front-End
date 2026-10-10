export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin/login',
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
  ADMIN: {
    DASHBOARD_STATS: '/admin/stats',
    USERS: '/admin/users',
  },
};
