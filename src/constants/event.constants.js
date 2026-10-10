// Browser events shared between modules (window.dispatchEvent / addEventListener)
export const APP_EVENTS = Object.freeze({
  // A playdate rating was sent: achievements (streak, badges) may have changed
  PLAYDATE_RATING_SUBMITTED: 'playdate-rating-submitted',
  // The server rejected an action for the Free plan quota (detail: paywall reason), opens PaywallModal
  QUOTA_EXCEEDED: 'quota-exceeded',
});
