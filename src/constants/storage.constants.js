export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'buddylink_access_token',
  REFRESH_TOKEN: 'buddylink_refresh_token',
  USER_INFO: 'buddylink_user',
  PARENT_INFO: 'buddylink_parent',
  REMEMBERED_EMAIL: 'buddylink_remembered_email',
  // Prefix + user id: badges / streak already celebrated on this device
  SEEN_ACHIEVEMENTS: 'buddylink_seen_achievements',
  // sessionStorage, prefix + plan code: Idempotency-Key of the pending PayOS checkout
  CHECKOUT_IDEMPOTENCY_PREFIX: 'buddylink_checkout_key_',
};
